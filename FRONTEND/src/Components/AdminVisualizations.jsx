import React from 'react';
import { Box, Typography, Paper, Avatar, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// --- Pie Chart Component ---
// --- Pie Chart Component (Points) ---
export const PointsPieChart = ({ users = [], isDark }) => {
    if (!users || !Array.isArray(users) || users.length === 0) return <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: isDark ? "#1e293b" : "white" }}><Typography align="center" color="text.secondary">No Data Available</Typography></Paper>;

    // Force grouping by Year and filter for specific years
    const groupBy = 'yearClassDept';
    const label = 'By Year';

    // Aggregate points
    const dataMap = users.reduce((acc, user) => {
        if (!user) return acc;
        const key = user[groupBy];
        // Only include Year 1, Year 2, Year 3, Year 4
        if (['Year 1', 'Year 2', 'Year 3', 'Year 4'].includes(key)) {
            acc[key] = (acc[key] || 0) + (user.points || 0);
        }
        return acc;
    }, {});

    const data = Object.entries(dataMap)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#6366f1'];

    return (
        <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: isDark ? "#1e293b" : "white", boxShadow: isDark ? 4 : 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: isDark ? 'white' : '#0f172a' }}>Points Distribution ({label})</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: isDark ? '#334155' : '#fff', borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: isDark ? '#fff' : '#000' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: isDark ? '#fff' : '#0f172a' }} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

// --- Bar Chart Component (Student Count) ---
export const StudentBarChart = ({ users = [], isDark }) => {
    if (!users || !Array.isArray(users) || users.length === 0) return null;

    // Determine grouping key similar to Pie Chart
    const uniqueYears = new Set(users.map(u => u.yearClassDept).filter(Boolean));
    const uniqueDepts = new Set(users.map(u => u.department).filter(Boolean));
    const groupBy = (uniqueYears.size <= 1 && uniqueDepts.size > 1) ? 'department' : 'yearClassDept';
    const label = groupBy === 'department' ? 'Students by Department' : 'Students by Year';

    const dataMap = users.reduce((acc, user) => {
        const key = user[groupBy] || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const data = Object.entries(dataMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: isDark ? "#1e293b" : "white", boxShadow: isDark ? 4 : 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: isDark ? 'white' : '#0f172a' }}>{label}</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"} vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke={isDark ? "#94a3b8" : "#64748b"}
                            tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke={isDark ? "#94a3b8" : "#64748b"}
                            tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <RechartsTooltip
                            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ backgroundColor: isDark ? '#334155' : '#fff', borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: isDark ? '#fff' : '#000' }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

// --- Podium Component ---
export const TopPodium = ({ users = [], isDark }) => {
    if (!users || !Array.isArray(users) || users.length === 0) return <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: isDark ? "#1e293b" : "white" }}><Typography align="center" color="text.secondary">No Data Available</Typography></Paper>;

    const top3 = [...users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 3);

    // Reorder for Podium: 2nd, 1st, 3rd
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
        <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: isDark ? "#1e293b" : "white", boxShadow: isDark ? 4 : 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isDark ? 'white' : '#0f172a' }}>
                <EmojiEventsIcon sx={{ color: '#f59e0b' }} /> Top Students
            </Typography>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, pb: 2 }}>
                {podiumOrder.map((user, index) => {
                    const isFirst = user === top3[0];
                    const isSecond = user === top3[1];
                    const isThird = user === top3[2];

                    let height = isFirst ? 140 : isSecond ? 100 : 70;
                    let color = isFirst ? '#f59e0b' : isSecond ? '#94a3b8' : '#b45309'; // Gold, Silver, Bronze
                    let delay = isFirst ? 0.2 : isSecond ? 0 : 0.4;

                    return (
                        <Box key={user._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: delay + 0.3 }}
                            >
                                <Box sx={{ position: 'relative', mb: 1 }}>
                                    <Avatar
                                        src={user.profilePic ? `${import.meta.env.VITE_API_BASE_URL}${user.profilePic}` : undefined}
                                        sx={{
                                            width: isFirst ? 56 : 48,
                                            height: isFirst ? 56 : 48,
                                            border: `3px solid ${color}`,
                                            boxShadow: `0 0 15px ${color}40`
                                        }}
                                    />
                                    {isFirst && <Box sx={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)' }}>👑</Box>}
                                </Box>
                                <Typography variant="caption" fontWeight="bold" noWrap sx={{ maxWidth: '100%', display: 'block', textAlign: 'center', color: isDark ? 'white' : '#0f172a' }}>
                                    {user.fname}
                                </Typography>
                                <Typography variant="caption" color={isDark ? "text.secondary" : "#334155"} display="block" textAlign="center">
                                    {user.points} pts
                                </Typography>
                            </motion.div>

                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: height }}
                                transition={{ duration: 0.5, delay, type: "spring" }}
                                style={{
                                    width: '100%',
                                    background: `linear-gradient(to top, ${color}20, ${color}80)`,
                                    borderTopLeftRadius: 8,
                                    borderTopRightRadius: 8,
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    paddingBottom: 4
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                    {isFirst ? '1' : isSecond ? '2' : '3'}
                                </Typography>
                            </motion.div>
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
};
