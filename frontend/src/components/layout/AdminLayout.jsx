import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  FolderOpen,
  FileCheck,
  CheckSquare,
  IndianRupee,
  Bell,
  UserCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";

export const AdminLayout = ({ children, pageTitle = "System Administration" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const notifs = await notificationService.getNotifications();
        if (isMounted) {
          const count = notifs.filter((n) => !n.isRead).length;
          setUnreadCount(count);
        }
      } catch (err) {
        // Silently handle
      }
    };

    fetchUnread();
    window.addEventListener("focus", fetchUnread);
    return () => {
      isMounted = false;
      window.removeEventListener("focus", fetchUnread);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "System Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Policy Registry",
      path: "/admin/policies",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Claims Master",
      path: "/admin/claims",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      name: "Document Oversight",
      path: "/admin/documents",
      icon: <FolderOpen className="w-5 h-5" />,
    },
    {
      name: "Survey Inspection Records",
      path: "/admin/surveys",
      icon: <FileCheck className="w-5 h-5" />,
    },
    {
      name: "Manager Approvals",
      path: "/admin/approvals",
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      name: "Settlement Operations",
      path: "/admin/settlements",
      icon: <IndianRupee className="w-5 h-5" />,
    },
    {
      name: "Audit Notifications",
      path: "/admin/notifications",
      icon: <Bell className="w-5 h-5" />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      name: "Admin Profile",
      path: "/admin/profile",
      icon: <UserCheck className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-slate-950 text-slate-300 flex-col justify-between shrink-0 border-r border-slate-800 select-none">
        <div>
          {/* Logo / Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white leading-none">
                  Insure<span className="text-rose-400">Flow</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-rose-300 font-semibold mt-0.5">
                  Administration
                </span>
              </div>
            </Link>
          </div>

          {/* Role Identifier Banner */}
          <div className="px-4 py-3 bg-slate-900/70 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                System Role
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase border bg-rose-950/80 text-rose-300 border-rose-800">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1 truncate">
              Central Administration Console
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-3 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-white border-l-4 border-rose-500 pl-2.5 shadow-xs"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-rose-700 text-white flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Administrator"}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || "admin@insureflow.com"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation drawer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb & Title */}
            <div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                <Link to="/admin/dashboard" className="hover:text-rose-600">
                  Administration
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="capitalize">System Oversight</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Shortcut */}
            <Link
              to="/admin/notifications"
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="System Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
              )}
            </Link>

            {/* Admin Badge */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-700">{user?.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-rose-50 text-rose-700 border-rose-200">
                System Admin
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-950 text-slate-300 border-b border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">{user?.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-rose-950 text-rose-300 border-rose-800">
                ADMIN
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-900/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
