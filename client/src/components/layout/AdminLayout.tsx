import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, type CSSProperties } from "react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, Folders, InboxIcon, LogOut, ArrowLeft, Newspaper, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  const menuItems = [
    { title: "Панель управления", url: "/admin", icon: LayoutDashboard },
    { title: "Товары", url: "/admin/products", icon: Package },
    { title: "Категории", url: "/admin/categories", icon: Folders },
    { title: "Заявки", url: "/admin/requests", icon: InboxIcon },
    { title: "Слайдер", url: "/admin/slider", icon: Images },
    { title: "Новости", url: "/admin/news", icon: Newspaper },
  ];
  const currentPageTitle = menuItems.find((item) => item.url === location)?.title ?? "Панель управления";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    if (!user?.isAdmin) {
      toast({
        title: "Нет доступа",
        description: "У вашей учетной записи нет прав администратора.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [isLoading, isAuthenticated, user, toast]);

  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div
        className="flex h-dvh w-full bg-slate-50"
        style={
          {
            "--sidebar-background": "0 0% 100%",
            "--sidebar-foreground": "222 47% 11%",
            "--sidebar-accent": "221 83% 95%",
            "--sidebar-accent-foreground": "221 83% 45%",
            "--sidebar-border": "214 32% 90%",
          } as CSSProperties
        }
      >
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 font-display font-bold text-base sm:text-lg text-slate-900">
              <Package className="w-5 h-5 text-primary" />
              <span className="truncate">ВладОПТ Админ</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Управление</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-slate-200">
            <div className="flex flex-col gap-4">
              <div className="text-sm">
                <p className="font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-start text-muted-foreground border-slate-200" asChild>
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    На сайт
                  </Link>
                </Button>
                <Button variant="destructive" className="w-full justify-start border-none" onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-3 sm:px-4 shrink-0">
            <SidebarTrigger className="h-9 w-9 rounded-lg border border-slate-200" />
            <div className="ml-3 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{currentPageTitle}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-6">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
