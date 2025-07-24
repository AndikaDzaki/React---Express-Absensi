import { useState } from "react";
import { Menu, X } from "lucide-react";

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  SidebarComponent: React.ComponentType<{ onNavigate?: () => void }>;
  title?: string;
}

export default function ResponsiveSidebar({
  children,
  SidebarComponent,
  title = "E-Presensi",
}: ResponsiveSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigate = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden md:block h-full">
        <SidebarComponent />
      </div>

      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}>
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar container */}
        <div
          className={`absolute left-0 top-0 w-64 h-full bg-[#4cc3ff] text-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Scrollable sidebar content - with hidden scrollbar */}
          <div className="h-[calc(100%-3.5rem)] overflow-y-auto px-4 pb-6" style={{ scrollbarWidth: "none" }}>
            <div className="space-y-4" style={{ scrollbarWidth: "none" }}>
              <SidebarComponent onNavigate={handleNavigate} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden shadow-sm bg-white sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="w-6 h-6" /> {/* Placeholder */}
        </div>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
