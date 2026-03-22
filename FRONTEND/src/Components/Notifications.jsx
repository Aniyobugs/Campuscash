import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const NotificationItem = ({ note, markAsRead }) => {
    const isUnread = !note.isRead;

    const getIcon = () => {
        switch (note.type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <button
            onClick={() => isUnread && markAsRead(note._id)}
            className={`w-full text-left flex items-start gap-3 p-4 border-b border-border transition-colors ${
                isUnread ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : 'hover:bg-accent border-l-4 border-l-transparent'
            }`}
        >
            <div className="mt-0.5 shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm ${isUnread ? 'font-semibold' : 'font-normal'} text-foreground overflow-hidden text-ellipsis`}>
                    {note.message}
                </p>
                <span className="text-xs text-muted-foreground block mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                </span>
            </div>
            {isUnread && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            )}
        </button>
    );
};

const Notifications = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isDark } = useTheme();
    const dropdownRef = useRef(null);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            if (notifications.length === 0) setLoading(true);
            const res = await axios.get(`${baseurl}/api/notifications/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error("Fetch notifs error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleToggle = () => {
        if (!isOpen) fetchNotifications();
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${baseurl}/api/notifications/read/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) { console.error(err); }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.put(`${baseurl}/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full text-foreground hover:bg-accent transition-colors mt-1"
                aria-label="Notifications"
            >
                <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{
                        repeat: unreadCount > 0 ? Infinity : 0,
                        repeatDelay: 2,
                        duration: 0.5
                    }}
                >
                    <Bell className="w-5 h-5" />
                </motion.div>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-background rounded-xl shadow-lg border border-border overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 flex items-center justify-between border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllRead} 
                                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[min(480px,80vh)] overflow-y-auto overscroll-contain">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 flex justify-center items-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map(note => (
                                    <NotificationItem key={note._id} note={note} markAsRead={handleMarkAsRead} />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notifications;
