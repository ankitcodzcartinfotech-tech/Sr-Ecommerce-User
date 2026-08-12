"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteBulkNotifications
} from "@/Api/AllApi";
import { initSocket, getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import { playNotification, playOrder, playMessage, playSuccess } from "@/utils/notificationSound";

function showDesktopNotification(title, options, link = null, router = null) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    try {
        const settingsStr = localStorage.getItem('notificationSettings');
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            if (!settings.desktopEnabled) return;
        }
    } catch(e) {}

    if (Notification.permission === 'granted') {
        const notif = new Notification(title, options);
        if (link && router) {
            notif.onclick = () => {
                window.focus();
                router.push(link);
                notif.close();
            };
        }
    }
}

function getIconForType(type) {
    const icons = {
        ORDER_PLACED: "🛍️",
        ORDER_CONFIRMED: "✅",
        ORDER_PACKED: "📦",
        ORDER_SHIPPED: "🚚",
        ORDER_OUT_FOR_DELIVERY: "📍",
        ORDER_DELIVERED: "🎁",
        ORDER_CANCELLED: "❌",
        ORDER_RETURNED: "🔄",
        REFUND_PROCESSED: "💸",
        WELCOME: "👋",
        PROFILE_COMPLETED: "📝",
        PASSWORD_CHANGED: "🔐",
        EMAIL_VERIFIED: "📧",
        PHONE_VERIFIED: "📱",
        BACK_IN_STOCK: "🔔",
        PRICE_DROPPED: "💰",
        NEW_PRODUCT: "🆕",
        LIMITED_STOCK: "⚠️",
        RESTOCKED: "📦",
        FLASH_SALE: "⚡",
        COUPON_AVAILABLE: "🎁",
        SPECIAL_DISCOUNT: "✨",
        FESTIVAL_SALE: "🎉",
        FREE_SHIPPING: "🚀",
        ADMIN_NEW_ORDER: "🛍️",
        ADMIN_LOW_STOCK: "⚠️",
        ADMIN_NEW_USER: "👤",
        ADMIN_CONTACT_FORM: "📧",
        ADMIN_RETURN_REQUEST: "🔄",
        ADMIN_REFUND_REQUEST: "💸",
        SYSTEM: "🔔"
    };
    return icons[type] || "📢";
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const dropdownRef = useRef(null);
    const router = useRouter();

    // Load notifications
    const loadNotifications = async (showLoader = false) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
        if (!token) return; // not logged in — skip silently
        
        if (showLoader) setLoading(true);
        try {
            const data = await getNotifications({ limit: 30 });
            setNotifications(data?.notifications || []);
            setUnreadCount(data?.unreadCount || 0);
        } catch (err) {
            // Silently fail — notifications are non-critical
            if (process.env.NODE_ENV === 'development') {
                console.warn("[Notifications] Could not load:", err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Initialize socket connection when component mounts
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
        if (!token) return;

        // Request desktop notification permissions
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }

        const socket = initSocket(token);
        if (!socket) return; // socket unavailable — notifications still work via REST

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocketConnected(true);

        // Define named listeners to avoid removing ALL listeners on unmount
        const onNotificationNew = (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Map notification type to specific sounds
            if (notification.type === 'ORDER_DELIVERED') {
                playSuccess();
            } else if (notification.type === 'ORDER_SHIPPED') {
                playMessage();
            } else if (notification.type && notification.type.startsWith('ORDER_')) {
                playOrder();
            } else {
                playNotification();
            }

            toast(notification.message || 'New notification received', {
                type: notification.type === 'ORDER_CANCELLED' ? 'error' : 'info'
            });
            showDesktopNotification(notification.title || 'New Notification', { body: notification.message, icon: '/favicon.ico' }, notification.link, router);
        };

        const onNotificationReadConfirmed = (notificationId) => {
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        };

        const onNotificationAllRead = () => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        };

        const onNotificationDeleted = (notificationId) => {
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        };

        // Attach listeners
        socket.on('notification:new', onNotificationNew);
        socket.on('notification:read_confirmed', onNotificationReadConfirmed);
        socket.on('notification:all_read', onNotificationAllRead);
        socket.on('notification:deleted', onNotificationDeleted);

        return () => {
            // Cleanup listeners on unmount using specific function references
            const s = getSocket();
            if (s) {
                s.off('notification:new', onNotificationNew);
                s.off('notification:read_confirmed', onNotificationReadConfirmed);
                s.off('notification:all_read', onNotificationAllRead);
                s.off('notification:deleted', onNotificationDeleted);
            }
        };
    }, []);

    // Load notifications on mount
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotifications(false);
    }, []);

    // Refresh notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadNotifications(true);
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkRead = async (notificationId) => {
        try {
            const socket = getSocket();
            if (socket) {
                socket.emit('notification:read', notificationId);
            }
            
            // Also call API for redundancy
            await markNotificationRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const socket = getSocket();
            if (socket) {
                socket.emit('notification:read_all');
            }
            
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleDelete = async (notificationId, e) => {
        e.stopPropagation();
        
        try {
            const socket = getSocket();
            if (socket) {
                socket.emit('notification:delete', notificationId);
            }
            
            await deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            
            const wasUnread = notifications.find(n => n._id === notificationId)?.isRead === false;
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkRead(notification._id);
        }
        
        if (notification.link) {
            router.push(notification.link);
        }
        setIsOpen(false);
    };

    const toggleSelection = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === notifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map(n => n._id));
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        
        setIsDeletingBulk(true);
        try {
            await deleteBulkNotifications(selectedIds);
            
            // Calculate how many unread we are deleting to fix the count
            const unreadDeleted = notifications.filter(
                n => selectedIds.includes(n._id) && !n.isRead
            ).length;

            setNotifications(prev => prev.filter(n => !selectedIds.includes(n._id)));
            if (unreadDeleted > 0) {
                setUnreadCount(prev => Math.max(0, prev - unreadDeleted));
            }
            setSelectedIds([]);
            toast.success(`${selectedIds.length} notification(s) deleted`);
        } catch (err) {
            console.error("Failed to bulk delete:", err);
            toast.error("Failed to delete notifications");
        } finally {
            setIsDeletingBulk(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <style>{`
                .notif-scroll::-webkit-scrollbar {
                    width: 14px;
                }
                .notif-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .notif-scroll::-webkit-scrollbar-thumb {
                    background-color: #a8a29e;
                    border-radius: 10px;
                    border: 4px solid #ffffff;
                }
                .notif-scroll::-webkit-scrollbar-thumb:hover {
                    background-color: #78716c;
                }
                .notif-scroll::-webkit-scrollbar-button:single-button {
                    display: block;
                    background-color: transparent;
                    height: 16px;
                    width: 14px;
                    background-repeat: no-repeat;
                    background-position: center;
                }
                .notif-scroll::-webkit-scrollbar-button:single-button:vertical:decrement {
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a8a29e'><path d='M12 8l8 8H4z'/></svg>");
                }
                .notif-scroll::-webkit-scrollbar-button:single-button:vertical:increment {
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a8a29e'><path d='M12 16l-8-8h16z'/></svg>");
                }
            `}</style>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-stone-900/8 bg-white/70 text-stone-700 transition-all hover:text-(--gold) hover:bg-stone-100 active:bg-stone-200 cursor-pointer"
                aria-label="Notifications"
            >
                <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full z-50 sm:mt-2 sm:w-[420px] rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 bg-linear-to-r from-amber-50 to-white">
                            <div className="flex items-center gap-2">
                                <h3 className="font-serif text-xl font-semibold text-stone-900">Notifications</h3>
                                {socketConnected && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live notifications active" />
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                                    >
                                        {selectedIds.length === notifications.length ? "Deselect All" : "Select All"}
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-(--gold) hover:text-amber-700 transition-colors cursor-pointer"
                                    >
                                        <Check size={14} />
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[65vh] overflow-y-auto notif-scroll">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-(--gold)" />
                                    <p className="text-sm text-stone-500">Loading notifications...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                                        <span className="text-3xl">🔔</span>
                                    </div>
                                    <p className="text-base font-semibold text-stone-700">No notifications yet</p>
                                    <p className="mt-2 text-sm text-stone-400 max-w-xs">
                                        We&apos;ll notify you about your orders and special offers!
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-stone-50 ${
                                                !notification.isRead ? "bg-amber-50/60 border-l-4 border-(--gold)" : "border-l-4 border-transparent"
                                            } ${selectedIds.includes(notification._id) ? "bg-stone-50" : ""}`}
                                        >
                                            {/* Checkbox */}
                                            <div 
                                                className="mt-3 flex shrink-0 cursor-pointer"
                                                onClick={(e) => toggleSelection(notification._id, e)}
                                            >
                                                <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                                                    selectedIds.includes(notification._id) ? "bg-(--gold) border-(--gold) text-white" : "border-stone-300 bg-white hover:border-(--gold)"
                                                }`}>
                                                    {selectedIds.includes(notification._id) && <Check size={12} strokeWidth={3} />}
                                                </div>
                                            </div>

                                            {/* Icon */}
                                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-lg">
                                                {getIconForType(notification.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-stone-900 leading-tight">
                                                            {notification.title}
                                                        </p>
                                                        <p className="mt-1 text-sm leading-relaxed text-stone-600">
                                                            {notification.message}
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex shrink-0 gap-1.5">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkRead(notification._id);
                                                                }}
                                                                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-all cursor-pointer"
                                                                aria-label="Mark as read"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(notification._id, e)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-rose-100 hover:text-rose-500 transition-all cursor-pointer"
                                                            aria-label="Delete notification"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="mt-1.5 text-xs text-stone-400">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-stone-100 px-6 py-4 bg-stone-50 flex gap-2">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeletingBulk}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-all disabled:opacity-50 cursor-not-allowed"
                                >
                                    {isDeletingBulk ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    Delete ({selectedIds.length})
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white border border-stone-200 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500 hover:bg-stone-100 hover:text-stone-700 hover:border-stone-300 transition-all cursor-pointer"
                            >
                                Close
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
