import * as client from "openid-client";
import { Strategy as ReplitStrategy, type VerifyFunction as ReplitVerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy, type Profile as GoogleProfile } from "passport-google-oauth20";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

type AuthMode = "local" | "google" | "replit";

const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const localUserId = "local-admin";
const adminEmailsEnvVar = "ADMIN_EMAILS";

function getModeFromEnv(value: string | undefined): AuthMode {
  if (value === "local" || value === "google" || value === "replit") {
    return value;
  }
  return "google";
}

export function getAuthMode(): AuthMode {
  return getModeFromEnv(process.env.AUTH_MODE);
}

function isLocalAuthMode(): boolean {
  return getAuthMode() === "local";
}

function isGoogleAuthMode(): boolean {
  return getAuthMode() === "google";
}

function isReplitAuthMode(): boolean {
  return getAuthMode() === "replit";
}

function getAdminEmails(): Set<string> {
  const raw = process.env[adminEmailsEnvVar] ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().has(email.toLowerCase());
}

function getLocalUser() {
  const now = new Date();
  return {
    id: localUserId,
    email: "local-admin@example.com",
    firstName: "Local",
    lastName: "Admin",
    profileImageUrl: null,
    isAdmin: true,
    createdAt: now,
    updatedAt: now,
  };
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function makeSessionUserFromClaims(
  claims: Record<string, unknown>,
  extras?: { accessToken?: string; refreshToken?: string; expiresAt?: number }
) {
  return {
    claims,
    access_token: extras?.accessToken,
    refresh_token: extras?.refreshToken,
    expires_at: extras?.expiresAt ?? Number.MAX_SAFE_INTEGER,
  };
}

async function upsertUser(claims: Record<string, unknown>, isAdmin: boolean) {
  const sub = typeof claims["sub"] === "string" ? claims["sub"] : null;
  if (!sub) {
    throw new Error("Missing subject id in auth claims");
  }

  await authStorage.upsertUser({
    id: sub,
    email: typeof claims["email"] === "string" ? claims["email"] : null,
    firstName: typeof claims["first_name"] === "string" ? claims["first_name"] : null,
    lastName: typeof claims["last_name"] === "string" ? claims["last_name"] : null,
    profileImageUrl: typeof claims["profile_image_url"] === "string" ? claims["profile_image_url"] : null,
    isAdmin,
  });
}

function assertCommonAuthConfig() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set when AUTH_MODE is not local");
  }
  if (getAdminEmails().size === 0) {
    throw new Error(`${adminEmailsEnvVar} must contain at least one admin email`);
  }
}

function assertGoogleAuthConfig() {
  assertCommonAuthConfig();

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID must be set when AUTH_MODE=google");
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET must be set when AUTH_MODE=google");
  }
  if (!process.env.GOOGLE_CALLBACK_URL) {
    throw new Error("GOOGLE_CALLBACK_URL must be set when AUTH_MODE=google");
  }
}

function assertReplitAuthConfig() {
  assertCommonAuthConfig();

  if (!process.env.REPL_ID) {
    throw new Error("REPL_ID must be set when AUTH_MODE=replit");
  }
}

function ensureGoogleStrategy() {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase() ?? null;
          if (!email) {
            done(null, false);
            return;
          }

          const firstName = profile.name?.givenName ?? null;
          const lastName = profile.name?.familyName ?? null;
          const profileImageUrl = profile.photos?.[0]?.value ?? null;
          const subject = `google:${profile.id}`;
          const isAdmin = isAdminEmail(email);

          await authStorage.upsertUser({
            id: subject,
            email,
            firstName,
            lastName,
            profileImageUrl,
            isAdmin,
          });

          if (!isAdmin) {
            done(null, false);
            return;
          }

          const user = makeSessionUserFromClaims({
            sub: subject,
            email,
            first_name: firstName,
            last_name: lastName,
            profile_image_url: profileImageUrl,
            is_admin: isAdmin,
          });
          done(null, user);
        } catch (error) {
          done(error as Error, false);
        }
      }
    )
  );
}

export function getSession() {
  const localMode = isLocalAuthMode();
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: localMode,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  if (!localMode && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set when AUTH_MODE is not local");
  }

  const isProd = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET ?? "local-dev-session-secret-change-me";

  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: sessionTtl,
    },
  });
}

function setupLocalRoutes(app: Express) {
  app.get("/api/login", (req: any, res) => {
    req.session.localUser = getLocalUser();
    res.redirect("/admin");
  });

  app.get("/api/callback", (_req, res) => {
    res.redirect("/admin");
  });

  app.get("/api/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

function setupGoogleRoutes(app: Express) {
  assertGoogleAuthConfig();
  ensureGoogleStrategy();

  app.get("/api/login", (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate("google", (err: unknown, user: Express.User | false | null) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(403).json({ message: "Forbidden: admin access required" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.redirect("/admin");
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req: any, res) => {
    req.logout(() => {
      req.session?.destroy(() => {
        res.redirect("/");
      });
    });
  });
}

async function setupReplitRoutes(app: Express) {
  assertReplitAuthConfig();

  const config = await getOidcConfig();
  const verify: ReplitVerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const claims = (tokens.claims() ?? {}) as Record<string, unknown>;
    if (typeof claims["sub"] !== "string") {
      verified(null, false);
      return;
    }

    const email = typeof claims["email"] === "string" ? claims["email"] : null;
    const isAdmin = isAdminEmail(email);
    await upsertUser(claims, isAdmin);

    if (!isAdmin) {
      verified(null, false);
      return;
    }

    const expiresAt = typeof claims["exp"] === "number" ? claims["exp"] : 0;
    const user = makeSessionUserFromClaims(claims, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    });
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      passport.use(
        new ReplitStrategy(
          {
            name: strategyName,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify
        )
      );
      registeredStrategies.add(strategyName);
    }
  };

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, (err: unknown, user: Express.User | false | null) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(403).json({ message: "Forbidden: admin access required" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.redirect("/admin");
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export async function setupAuth(app: Express) {
  if (process.env.NODE_ENV === "production" && isLocalAuthMode()) {
    throw new Error("AUTH_MODE=local is not allowed in production");
  }

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  if (isLocalAuthMode()) {
    setupLocalRoutes(app);
    return;
  }

  if (isGoogleAuthMode()) {
    setupGoogleRoutes(app);
    return;
  }

  await setupReplitRoutes(app);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (isLocalAuthMode()) {
    const localUser = (req as any).session?.localUser;
    if (!localUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = makeSessionUserFromClaims({
      sub: localUser.id,
      email: localUser.email,
      first_name: localUser.firstName,
      last_name: localUser.lastName,
      profile_image_url: localUser.profileImageUrl,
      is_admin: localUser.isAdmin,
    });
    return next();
  }

  const user = req.user as any;
  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!isReplitAuthMode()) {
    return next();
  }

  if (typeof user.expires_at !== "number") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    const claims = (tokenResponse.claims() ?? {}) as Record<string, unknown>;
    const expiresAt = typeof claims["exp"] === "number" ? claims["exp"] : user.expires_at;

    req.user = makeSessionUserFromClaims(claims, {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? refreshToken,
      expiresAt,
    }) as Express.User;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const isAdmin: RequestHandler = (req, res, next) => {
  isAuthenticated(req, res, async () => {
    try {
      if (isLocalAuthMode()) {
        const localUser = (req as any).session?.localUser;
        if (!localUser?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
        return next();
      }

      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await authStorage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  });
};
