import UserSidebar from "@/components/user-sidebar";
import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";
// import CardUser from "@/components/card-user";

export default function UserLayout() {
  return (
    <div className="flex">
      <UserSidebar />
      <div className="flex-1 p-4 bg-gray-50 min-h-screen">
        <Navbar />
        {/* <CardUser /> */}
        <Outlet />
      </div>
    </div>
  );
}
