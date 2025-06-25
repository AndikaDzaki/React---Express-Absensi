import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function AdminLayout() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-4 bg-gray-50 min-h-screen">
        <Navbar />
        <Toaster richColors position="top-right" />
        <Outlet />
      </div>
    </div>
  );
}
