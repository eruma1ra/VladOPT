import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import type { SiteThemeMode } from "@shared/schema";

const NotFound = lazy(() => import("@/pages/not-found"));

// Layouts
const PublicLayout = lazy(() =>
  import("@/components/layout/PublicLayout").then((module) => ({ default: module.PublicLayout }))
);
const AdminLayout = lazy(() =>
  import("@/components/layout/AdminLayout").then((module) => ({ default: module.AdminLayout }))
);

// Public Pages
const Home = lazy(() => import("@/pages/Home"));
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
  const { data } = useSiteSettings({ refetchInterval: 30_000 });

  useEffect(() => {
    const mode: SiteThemeMode = data?.themeMode === "red" ? "red" : "blue";
    applyThemeMode(mode);
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
        <TooltipProvider>
          <SiteThemeRuntime />
          <RouteScrollRuntime />
          <Toaster />
        <Suspense fallback={<RouteFallback />}>
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
