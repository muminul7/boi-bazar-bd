import { BookOpen, ShoppingCart, Tag, LayoutDashboard, LogOut, MessageSquare, Mail, Settings, Quote, MessageCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const items = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard },
  { title: "বই ম্যানেজমেন্ট", url: "/admin/books", icon: BookOpen },
  { title: "রিভিউ", url: "/admin/reviews", icon: MessageSquare },
  { title: "টেস্টিমোনিয়াল", url: "/admin/testimonials", icon: Quote },
  { title: "অর্ডার", url: "/admin/orders", icon: ShoppingCart },
  { title: "কুপন", url: "/admin/coupons", icon: Tag },
  { title: "সাবস্ক্রাইবার", url: "/admin/subscribers", icon: Mail },
  { title: "বার্তা", url: "/admin/messages", icon: MessageCircle },
  { title: "সেটিংস", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
              <BookOpen className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && <span className="font-bengali font-bold text-sidebar-foreground">Boi Bazar অ্যাডমিন</span>}
          </div>
        </div>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="font-bengali">মেনু</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="font-bengali">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent gap-2">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="font-bengali">লগআউট</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
