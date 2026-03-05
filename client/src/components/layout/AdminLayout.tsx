import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { LayoutDashboard, Package, Folders, InboxIcon, LogOut, ArrowLeft, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    { title: "Панель управления", url: "/admin", icon: LayoutDashboard },
    { title: "Товары", url: "/admin/products", icon: Package },
    { title: "Категории", url: "/admin/categories", icon: Folders },
    { title: "Заявки", url: "/admin/requests", icon: InboxIcon },
    { title: "Новости", url: "/admin/news", icon: Newspaper },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-900">
              <Package className="w-6 h-6 text-primary" />
              ВладОПТ Админ
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
                <Button variant="outline" className="w-full justify-start text-muted-foreground border-none" asChild>
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
          <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
