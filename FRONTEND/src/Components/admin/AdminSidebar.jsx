import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, UserCog, CheckSquare, 
  FileText, Award, MessageSquare, HandHeart, LogOut, Settings, Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ activeTab, setActiveTab, setMobileOpen }) {
  const navigate = useNavigate();
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Students", icon: Users },
    { id: "faculty", label: "Faculty", icon: UserCog },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "submissions", label: "Submissions", icon: FileText },
    { id: "award", label: "Award Points", icon: Award },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "store", label: "Store Vouchers", icon: Store },
    { id: "volunteers", label: "Volunteers", icon: HandHeart },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  const handleNav = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <div className="flex flex-col h-full p-6 border-r border-border bg-card">
      <h2 className="text-2xl font-black mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent px-2">
        CampusAdmin
      </h2>
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 hide-scrollbar">
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all relative ${
                isActive 
                  ? "text-primary bg-primary/10 border-primary/20 border" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent border"
              }`}
            >
              <item.icon className="w-5 h-5 z-10" />
              <span className="z-10 relative">{item.label}</span>
              {isActive && (
                <motion.div layoutId="activeBox" className="absolute inset-0 bg-primary/5 rounded-xl border border-primary/10" />
              )}
            </button>
          );
        })}
      </nav>
      <button 
        onClick={() => navigate('/L')}
        className="flex items-center justify-center gap-3 px-4 py-3 mt-6 text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors font-bold w-full"
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </div>
  );
}
