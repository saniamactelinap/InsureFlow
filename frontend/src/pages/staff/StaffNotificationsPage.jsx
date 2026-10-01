import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  Clock,
  ExternalLink,
  AlertCircle,
  FileText,
  ShieldAlert,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";
import notificationService from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";

export const StaffNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'
  const [actionLoading, setActionLoading] = useState(false);

  const role = user?.role || "officer";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <StaffLayout pageTitle="Operational Notifications">
        <PageLoader message="Loading activity notices..." />
      </StaffLayout>
    );
  }

  return (
    <StaffLayout pageTitle="Activity Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Workflow Alerts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Audit activity, case updates, document submissions, and workflow assignments.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4 text-primary-600" />}
              onClick={handleMarkAllAsRead}
              loading={actionLoading}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              Retry
            </Button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Notices ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "unread"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "read"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {filter === "unread"
                ? "You have acknowledged all active system notifications."
                : "You currently have no recorded operational notifications."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const claimId = notif.claim?._id || notif.claim;
              const claimNumber = notif.claim?.claimNumber;

              return (
                <div
                  key={notif._id}
                  className={`p-4 rounded-xl border transition-all ${
                    notif.isRead
                      ? "bg-white border-slate-200/80 text-slate-700"
                      : "bg-blue-50/50 border-blue-200/80 text-slate-900 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.isRead
                            ? "bg-slate-100 text-slate-500"
                            : "bg-primary-100 text-primary-700"
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">
                            {notif.title || "Workflow Notification"}
                          </h4>
                          {!notif.isRead && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(notif.createdAt)}
                          </span>

                          {claimId && (
                            <Link
                              to={`/${role}/claims/${claimId}`}
                              className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-800"
                            >
                              <span>Claim #{claimNumber || "Dossier"}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffNotificationsPage;
