import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAll = async () => {
    try {
      setActionLoading(true);
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setActionLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const getNotificationIcon = (title, type) => {
    const t = (title || "").toLowerCase();
    if (t.includes("approved") || t.includes("settled") || t.includes("verified")) {
      return (
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (t.includes("rejected")) {
      return (
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    if (t.includes("investigation") || t.includes("survey") || t.includes("review")) {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-600 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Important alerts, status changes, document verifications, and settlement notices.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAll}
              disabled={actionLoading}
              className="self-start sm:self-auto"
            >
              {actionLoading ? "Updating..." : "Mark All as Read"}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "unread"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "read"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-500 font-medium">Loading notifications...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center border-rose-200 bg-rose-50/50">
            <p className="text-sm text-rose-700 font-medium mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              Retry
            </Button>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {filter === "unread" ? "No unread notifications" : "You're all caught up!"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {filter === "unread"
                ? "You have acknowledged all active notifications."
                : "You will receive updates here whenever your claims, documents, or settlements advance."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => {
              const isUnread = !n.isRead;
              return (
                <div
                  key={n._id}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnread
                      ? "bg-primary-50/40 border-primary-200 shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(n.title, n.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkOne(n._id)}
                              className="text-xs text-slate-500 hover:text-primary-600 font-medium px-2 py-1 rounded hover:bg-white transition-colors"
                              title="Mark this notification as read"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 mt-2 leading-relaxed">{n.message}</p>

                      {/* Associated Claim Link if any */}
                      {n.claim && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <Link
                            to={`/customer/claims/${n.claim._id || n.claim}`}
                            className="font-medium text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                          >
                            <span>View Associated Claim</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
