import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

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

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
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
        <Toaster />
        <Suspense fallback={<RouteFallback />}>
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
