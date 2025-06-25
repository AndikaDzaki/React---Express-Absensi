import ResponsiveSidebar from "@/components/ResponsiveSidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function AdminLayout() {
  return (
    <ResponsiveSidebar SidebarComponent={AppSidebar} title="Dashboard Admin">
      <Navbar />
      <Toaster richColors position="top-right" />
      <Outlet />
    </ResponsiveSidebar>
  );
}
