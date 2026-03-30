import { lazy, Suspense, useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import type { SiteThemeMode } from "@shared/schema";
import { Toaster } from "@/components/ui/toaster";
import { PublicLayout } from "@/components/layout/PublicLayout";
import Home from "@/pages/Home";
const NotFound = lazy(() => import("@/pages/not-found"));

// Layouts
const AdminLayout = lazy(() =>
  import("@/components/layout/AdminLayout").then((module) => ({ default: module.AdminLayout }))
);

// Public Pages
const Catalog = lazy(() => import("@/pages/Catalog"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const About = lazy(() => import("@/pages/About"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const News = lazy(() => import("@/pages/News"));
const NewsDetail = lazy(() => import("@/pages/NewsDetail"));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminRequests = lazy(() => import("@/pages/admin/AdminRequests"));
const AdminNews = lazy(() => import("@/pages/admin/AdminNews"));
const AdminSlider = lazy(() => import("@/pages/admin/AdminSlider"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function applyThemeMode(mode: SiteThemeMode) {
  const root = document.documentElement;

  if (mode === "red") {
    root.style.setProperty("--primary", "0 79% 53%");
    root.style.setProperty("--ring", "0 79% 53%");
    return;
  }

  root.style.setProperty("--primary", "221 83% 53%");
  root.style.setProperty("--ring", "221 83% 53%");
}

function SiteThemeRuntime() {
  const [enabled, setEnabled] = useState(false);
  const { data } = useSiteSettings({ refetchInterval: 30_000, enabled });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("vladopt-theme-mode");
    if (stored === "red" || stored === "blue") {
      applyThemeMode(stored);
    }

    let timerId: number | null = null;
    let idleId: number | null = null;
    const enableFetch = () => setEnabled(true);
    const ric = (window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback;

    if (typeof ric === "function") {
      idleId = ric(enableFetch, { timeout: 2500 });
    } else {
      timerId = window.setTimeout(enableFetch, 1200);
    }

    return () => {
      if (timerId !== null) window.clearTimeout(timerId);
      if (idleId !== null && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
      }
    };
  }, []);

  useEffect(() => {
    const mode: SiteThemeMode = data?.themeMode === "red" ? "red" : "blue";
    applyThemeMode(mode);
    if (typeof window !== "undefined" && data?.themeMode) {
      window.localStorage.setItem("vladopt-theme-mode", data.themeMode);
    }
  }, [data?.themeMode]);

  return null;
}

function RouteScrollRuntime() {
  const [location] = useLocation();

  useEffect(() => {
    if (location === "/" || location === "/catalog") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/admin" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/products" component={() => <AdminLayout><AdminProducts /></AdminLayout>} />
      <Route path="/admin/categories" component={() => <AdminLayout><AdminCategories /></AdminLayout>} />
      <Route path="/admin/requests" component={() => <AdminLayout><AdminRequests /></AdminLayout>} />
      <Route path="/admin/news" component={() => <AdminLayout><AdminNews /></AdminLayout>} />
      <Route path="/admin/slider" component={() => <AdminLayout><AdminSlider /></AdminLayout>} />

      {/* Public Routes */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/catalog">
        <PublicLayout><Catalog /></PublicLayout>
      </Route>
      <Route path="/catalog/:id">
        <PublicLayout><ProductDetail /></PublicLayout>
      </Route>
      <Route path="/news">
        <PublicLayout><News /></PublicLayout>
      </Route>
      <Route path="/news/:id">
        <PublicLayout><NewsDetail /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/contacts">
        <PublicLayout><Contacts /></PublicLayout>
      </Route>

      {/* Fallback to 404 inside public layout */}
      <Route>
        <PublicLayout><NotFound /></PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteThemeRuntime />
      <RouteScrollRuntime />
      <Toaster />
      <Suspense fallback={<RouteFallback />}>
          <Router />
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
