import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#6366f1'];

export const PointsPieChart = ({ users = [], isDark }) => {
    if (!users || !Array.isArray(users) || users.length === 0) 
        return <div className="p-6 rounded-[2rem] h-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground">No Data Available</div>;

    const dataMap = users.reduce((acc, user) => {
        if (!user) return acc;
        const key = user['yearClassDept'];
        if (['Year 1', 'Year 2', 'Year 3', 'Year 4'].includes(key)) {
            acc[key] = (acc[key] || 0) + (user.points || 0);
        }
        return acc;
    }, {});

    const data = Object.entries(dataMap)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    return (
        <div className="p-6 rounded-[2rem] h-full bg-card border border-border shadow-md transition-all hover:shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-foreground">Points Distribution (By Year)</h3>
            <div className="w-full h-[300px]">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                            itemStyle={{ color: 'var(--color-foreground)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--color-foreground)' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const StudentBarChart = ({ users = [], isDark }) => {
    if (!users || !Array.isArray(users) || users.length === 0) return null;

    const dataMap = users.reduce((acc, user) => {
        const key = user['yearClassDept'];
        if (['Year 1', 'Year 2', 'Year 3', 'Year 4'].includes(key)) acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const data = Object.entries(dataMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="p-6 rounded-[2rem] h-full bg-card border border-border shadow-md transition-all hover:shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-foreground">Students by Year</h3>
            <div className="w-full h-[300px]">
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--color-muted-foreground)" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                            cursor={{ fill: 'var(--color-muted)' }}
                            contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                            itemStyle={{ color: 'var(--color-foreground)' }}
                        />
                        <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const TopPodium = ({ users = [], isDark }) => {
    if (!users || !Array.isArray(users) || users.length === 0) return <div className="p-6 rounded-[2rem] h-full bg-card border border-border shadow-md text-center text-muted-foreground">No Data Available</div>;

    const top3 = [...users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 3);
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
        <div className="p-6 rounded-[2rem] h-full bg-card border border-border shadow-md flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                <Trophy className="text-amber-500 w-5 h-5" /> Top Students
            </h3>
            <div className="flex-1 flex items-end justify-center gap-4 pb-4">
                {podiumOrder.map((user, index) => {
                    const isFirst = user === top3[0];
                    const isSecond = user === top3[1];
                    const isThird = user === top3[2];

                    let height = isFirst ? 140 : isSecond ? 100 : 70;
                    let color = isFirst ? '#f59e0b' : isSecond ? '#94a3b8' : '#b45309';
                    let delay = isFirst ? 0.2 : isSecond ? 0 : 0.4;

                    return (
                        <div key={user._id} className="flex flex-col items-center w-[30%]">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + 0.3 }} className="flex flex-col items-center">
                                <div className="relative mb-2">
                                    <div 
                                        className="rounded-full bg-muted flex items-center justify-center overflow-hidden"
                                        style={{ width: isFirst ? 56 : 48, height: isFirst ? 56 : 48, border: `3px solid ${color}`, boxShadow: `0 0 15px ${color}40` }}
                                    >
                                        {user.profilePic ? <img src={`${import.meta.env.VITE_API_BASE_URL}${user.profilePic}`} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-xl font-bold">{user.fname[0]}</div>}
                                    </div>
                                    {isFirst && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</div>}
                                </div>
                                <span className="text-sm font-bold text-foreground truncate max-w-full block text-center">{user.fname}</span>
                                <span className="text-xs text-muted-foreground block text-center mb-2">{user.points} pts</span>
                            </motion.div>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: height }}
                                transition={{ duration: 0.5, delay, type: "spring" }}
                                style={{ width: '100%', background: `linear-gradient(to top, ${color}20, ${color}80)`, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                                className="flex items-end justify-center pb-2"
                            >
                                <span className="text-white font-black text-xl drop-shadow-md">
                                    {isFirst ? '1' : isSecond ? '2' : '3'}
                                </span>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
