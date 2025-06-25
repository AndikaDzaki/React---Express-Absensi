import { useState } from "react";
import { Menu, X } from "lucide-react";

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  SidebarComponent: React.ComponentType<{ onNavigate?: () => void }>;
  title?: string;
}

export default function ResponsiveSidebar({ children, SidebarComponent, title = "E-Presensi" }: ResponsiveSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigate = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:block h-full">
        <SidebarComponent />
      </div>

      <div className={`fixed inset-0 z-50 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
        <div className={`absolute left-0 top-0 w-60 h-full bg-white shadow-xl rounded-r-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex justify-end p-4">
            <button onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <SidebarComponent onNavigate={handleNavigate} />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 md:hidden shadow-sm bg-white sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="w-6 h-6" />
        </div>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
