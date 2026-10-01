import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  ClipboardList,
  FolderOpen,
  CheckSquare,
  FileCheck,
  IndianRupee,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";

export const StaffLayout = ({ children, pageTitle = "Staff Operations" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = user?.role || "officer";

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

  // Role-aware navigation definitions
  const getNavItems = () => {
    switch (role) {
      case "surveyor":
        return [
          {
            name: "Field Dashboard",
            path: "/surveyor/dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
          },
          {
            name: "Assigned Claims",
            path: "/surveyor/claims",
            icon: <ClipboardList className="w-5 h-5" />,
          },
          {
            name: "Survey Reports",
            path: "/surveyor/surveys",
            icon: <FileCheck className="w-5 h-5" />,
          },
          {
            name: "Notifications",
            path: "/surveyor/notifications",
            icon: <Bell className="w-5 h-5" />,
            badge: unreadCount > 0 ? unreadCount : null,
          },
          {
            name: "My Profile",
            path: "/surveyor/profile",
            icon: <User className="w-5 h-5" />,
          },
        ];

      case "manager":
        return [
          {
            name: "Executive Dashboard",
            path: "/manager/dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
          },
          {
            name: "Approval Queue",
            path: "/manager/approvals",
            icon: <CheckSquare className="w-5 h-5" />,
          },
          {
            name: "All Claims",
            path: "/manager/claims",
            icon: <ClipboardList className="w-5 h-5" />,
          },
          {
            name: "Survey Records",
            path: "/manager/surveys",
            icon: <FileCheck className="w-5 h-5" />,
          },
          {
            name: "Settlements",
            path: "/manager/settlements",
            icon: <IndianRupee className="w-5 h-5" />,
          },
          {
            name: "Notifications",
            path: "/manager/notifications",
            icon: <Bell className="w-5 h-5" />,
            badge: unreadCount > 0 ? unreadCount : null,
          },
          {
            name: "My Profile",
            path: "/manager/profile",
            icon: <User className="w-5 h-5" />,
          },
        ];

      case "officer":
      default:
        return [
          {
            name: "Operations Dashboard",
            path: "/officer/dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
          },
          {
            name: "Claims Processing",
            path: "/officer/claims",
            icon: <ClipboardList className="w-5 h-5" />,
          },
          {
            name: "Document Queue",
            path: "/officer/documents",
            icon: <FolderOpen className="w-5 h-5" />,
          },
          {
            name: "Survey Reports",
            path: "/officer/surveys",
            icon: <FileCheck className="w-5 h-5" />,
          },
          {
            name: "Settlements",
            path: "/officer/settlements",
            icon: <IndianRupee className="w-5 h-5" />,
          },
          {
            name: "Notifications",
            path: "/officer/notifications",
            icon: <Bell className="w-5 h-5" />,
            badge: unreadCount > 0 ? unreadCount : null,
          },
          {
            name: "My Profile",
            path: "/officer/profile",
            icon: <User className="w-5 h-5" />,
          },
        ];
    }
  };

  const navItems = getNavItems();

  const getPortalLabel = () => {
    switch (role) {
      case "officer":
        return "Claims Officer Portal";
      case "surveyor":
        return "Surveyor Field Portal";
      case "manager":
        return "Management & Approval Portal";
      default:
        return "Staff Operations Portal";
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case "manager":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "surveyor":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "officer":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const defaultDashboardPath = `/${role}/dashboard`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-slate-950 text-slate-300 flex-col justify-between shrink-0 border-r border-slate-800 select-none">
        <div>
          {/* Logo / Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link to={defaultDashboardPath} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white leading-none">
                  Insure<span className="text-primary-400">Flow</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                  Operations
                </span>
              </div>
            </Link>
          </div>

          {/* Role Identifier Banner */}
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                System Role
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${getRoleBadgeColor()}`}
              >
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1 truncate">
              {getPortalLabel()}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-white border-l-4 border-primary-500 pl-2.5"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-600 text-white">
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
            <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
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
                <Link to={defaultDashboardPath} className="hover:text-primary-600">
                  Operations
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="capitalize">{role}</span>
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
              to={`/${role}/notifications`}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Staff Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-600 ring-2 ring-white"></span>
              )}
            </Link>

            {/* Role Chip */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-700">{user?.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleBadgeColor()}`}
              >
                {role}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-950 text-slate-300 border-b border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">{user?.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleBadgeColor()}`}
              >
                {role}
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
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-600 text-white">
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

export default StaffLayout;
