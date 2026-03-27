import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLayoutSkeleton } from "@/components/loading-skeletons";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLayout() {
  const { loading } = useAdminAuth();

  if (loading) {
    return <AdminLayoutSkeleton />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border bg-card px-4">
            <SidebarTrigger className="mr-3" />
            <span className="font-bengali font-semibold text-foreground">eboi অ্যাডমিন প্যানেল</span>
          </header>
          <main className="flex-1 p-6 bg-background overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
