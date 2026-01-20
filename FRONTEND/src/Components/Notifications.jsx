import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Menu,
    MenuItem,
    IconButton,
    Badge,
    Typography,
    Box,
    Divider,
    Button,
    Avatar,
    CircularProgress
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // Ensure AuthContext provides token/headers if needed usually axios interceptor handles it
import { useTheme } from "../contexts/ThemeContext";

const NotificationItem = ({ note, markAsRead, isDark }) => {
    const isUnread = !note.isRead;

    const getIcon = () => {
        switch (note.type) {
            case 'success': return <CheckCircleOutlineIcon color="success" fontSize="small" />;
            case 'error': return <ErrorOutlineIcon color="error" fontSize="small" />;
            default: return <InfoOutlinedIcon color="info" fontSize="small" />;
        }
    };

    return (
        <MenuItem
            onClick={() => isUnread && markAsRead(note._id)}
            sx={{
                whiteSpace: 'normal',
                bgcolor: isUnread ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.05)') : 'transparent',
                borderLeft: isUnread ? '4px solid #3b82f6' : '4px solid transparent',
                py: 2,
                px: 2,
                alignItems: 'flex-start',
                gap: 2,
                mb: "1px" // divider effect
            }}
        >
            <Box sx={{ mt: 0.5 }}>{getIcon()}</Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color={isDark ? "white" : "text.primary"} fontWeight={isUnread ? 600 : 400}>
                    {note.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {new Date(note.createdAt).toLocaleString()}
                </Typography>
            </Box>
            {isUnread && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6', mt: 1 }} />
            )}
        </MenuItem>
    );
};

const Notifications = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isDark } = useTheme();
    // We assume specific axios config or baseurl is verified from other files. 
    // Assuming axios interceptor attaches token as seen in other tasks, or we might need headers manually.
    // Checking userRoute.js showing standard axios calls without explicit header passing usually implies global interceptor or it's handled.
    // BUT notificationRoute uses `verifyToken` which needs `Authorization: Bearer <token>`.
    // I will assume global interceptor exists or add it manually.
    // Safest is to get token from storage.
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            // Don't set loading on poll/background refresh, only initial
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

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
        // Refresh on open
        fetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
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
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    color: isDark ? '#ffffff' : '#212121',
                    mx: 1,
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <motion.div
                        animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                        transition={{
                            repeat: unreadCount > 0 ? Infinity : 0,
                            repeatDelay: 2,
                            duration: 0.5
                        }}
                    >
                        <NotificationsIcon />
                    </motion.div>
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 480, // Scrollable
                        mt: 1.5,
                        borderRadius: 3,
                        bgcolor: isDark ? '#1e293b' : '#ffffff',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color={isDark ? "white" : "text.primary"}>Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

                {loading && notifications.length === 0 ? (
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary" variant="body2">No notifications yet</Typography>
                    </Box>
                ) : (
                    notifications.map(note => (
                        <NotificationItem key={note._id} note={note} markAsRead={handleMarkAsRead} isDark={isDark} />
                    ))
                )}
            </Menu>
        </>
    );
};

export default Notifications;
