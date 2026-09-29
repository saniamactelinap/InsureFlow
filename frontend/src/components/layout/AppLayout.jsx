import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  FileText,
  ClipboardList,
  FolderOpen,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";

export const AppLayout = ({ children, pageTitle = "Customer Portal" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count for badge
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
        // Silently handle if unauthenticated or network drop
      }
    };

    fetchUnread();
    // Refresh unread count on route changes or when tab regains focus
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
      name: "Dashboard",
      path: "/customer/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "My Policies",
      path: "/customer/policies",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "My Claims",
      path: "/customer/claims",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      name: "Documents",
      path: "/customer/documents",
      icon: <FolderOpen className="w-5 h-5" />,
    },
    {
      name: "Notifications",
      path: "/customer/notifications",
      icon: <Bell className="w-5 h-5" />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      name: "Profile",
      path: "/customer/profile",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-slate-900 text-slate-300 flex-col justify-between shrink-0 border-r border-slate-800 select-none">
        <div>
          {/* Logo / Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link to="/customer/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Insure<span className="text-primary-400">Flow</span>
              </span>
            </Link>
          </div>

          {/* Quick Submit CTA */}
          <div className="p-4">
            <Link
              to="/customer/claims/new"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all shadow-sm shadow-primary-600/30 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Claim</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-white border-l-4 border-primary-500 pl-2.5"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-800/50 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-primary-700/80 text-white flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Customer"}
              </p>
              <p className="text-[11px] text-slate-400 truncate capitalize">
                {user?.role || "Policyholder"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE HEADER & DRAWER ================= */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between px-4 h-16 border-b border-slate-800 sticky top-0 z-40">
        <Link to="/customer/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">
            Insure<span className="text-primary-400">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/customer/notifications"
            className="relative p-2 text-slate-400 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary-500 ring-2 ring-slate-900" />
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation drawer"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border-b border-slate-800 p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <Link
              to="/customer/claims/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-primary-600 text-white font-medium text-sm shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Claim</span>
            </Link>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-slate-800 text-white border-l-4 border-primary-500 pl-2"
                        : "text-slate-300 hover:bg-slate-800"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Logged in as <span className="font-semibold text-white">{user?.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium text-rose-400 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200/80 items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Portal</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="font-semibold text-slate-800">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Icon Button */}
            <Link
              to="/customer/notifications"
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile pill */}
            <Link
              to="/customer/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
              </div>
              <span className="font-semibold text-slate-700 max-w-[120px] truncate">
                {user?.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
