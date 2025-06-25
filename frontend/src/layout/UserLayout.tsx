import ResponsiveSidebar from "@/components/ResponsiveSidebar";
import UserSidebar from "@/components/user-sidebar";
import NavbarUser from "@/components/navbarUser";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function UserLayout() {
  return (
    <ResponsiveSidebar SidebarComponent={UserSidebar} title="Dashboard User">
      <NavbarUser />
      <Toaster richColors position="top-right" />
      <Outlet />
    </ResponsiveSidebar>
  );
}
