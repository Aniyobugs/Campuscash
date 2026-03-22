import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Trophy, CheckCircle, Clock, Wallet, History, Ticket, Bell, 
  Edit3, ArrowRight, X, Filter, MoreHorizontal, GraduationCap, 
  Megaphone, Download, Crown, Sparkles, TrendingUp
} from 'lucide-react';

/* ---------- Gamification Helpers ---------- */
const getTier = (points) => {
  if (points >= 5000) return { name: 'Titanium', iconClass: 'text-slate-300', bgClass: 'bg-slate-300/10', icon: Crown };
  if (points >= 2000) return { name: 'Platinum', iconClass: 'text-cyan-400', bgClass: 'bg-cyan-400/10', icon: Sparkles };
  if (points >= 1000) return { name: 'Gold', iconClass: 'text-amber-400', bgClass: 'bg-amber-400/10', icon: Trophy };
  if (points >= 500) return { name: 'Silver', iconClass: 'text-slate-400', bgClass: 'bg-slate-400/10', icon: Trophy };
  return { name: 'Bronze', iconClass: 'text-amber-700', bgClass: 'bg-amber-700/10', icon: Trophy };
};

/* ---------- Elegant UI Components ---------- */
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-card/80 backdrop-blur-xl border border-border shadow-xl rounded-3xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtext, iconClass, bgClass, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-card border border-border hover:border-primary/50 transition-all rounded-3xl p-6 relative overflow-hidden group shadow-lg"
  >
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-4 rounded-2xl ${bgClass} flex items-center justify-center shrink-0`}>
        <Icon className={`w-8 h-8 ${iconClass}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-black text-foreground">{value}</h3>
        {subtext && <p className={`text-xs mt-1 ${iconClass}`}>{subtext}</p>}
      </div>
    </div>
    <Icon className={`absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all ${iconClass}`} />
  </motion.div>
);

/* ---------- Beautiful Coupon ---------- */
const BeautifulCoupon = React.forwardRef(({ coupon, userName }, ref) => {
  if (!coupon) return null;
  const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
  const expiresDate = coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never";
  const points = coupon.pointsSpent || 100;

  return (
    <div ref={ref} className="relative w-full max-w-lg mx-auto bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2rem] shadow-2xl p-1 overflow-hidden" 
         style={{ maskImage: "radial-gradient(circle at 0 70%, transparent 16px, black 17px), radial-gradient(circle at 100% 70%, transparent 16px, black 17px)", WebkitMaskImage: "radial-gradient(circle at 0 70%, transparent 16px, black 17px), radial-gradient(circle at 100% 70%, transparent 16px, black 17px)" }}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="border border-white/10 rounded-[1.8rem] h-full p-6 pb-8 relative z-10">
        <div className="bg-orange-500 text-black font-black uppercase text-xs tracking-widest py-1.5 px-4 rounded-br-2xl inline-block -mt-6 -ml-6 shadow-lg mb-6">
          Campus Cash Reward
        </div>

        {coupon.isUsed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[15deg] border-4 border-red-500 text-red-500 font-black text-5xl px-8 py-2 rounded-xl bg-red-500/10 z-20 backdrop-blur-sm pointer-events-none tracking-widest uppercase">
            Used
          </div>
        )}

        <div className="flex justify-between gap-6 mb-8">
          <div className="flex-1">
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Coupon Code</p>
            <h4 className="font-mono text-xl font-bold text-white tracking-widest bg-white/10 py-2 px-3 rounded-lg mb-4 break-all">
              {coupon.code}
            </h4>
            
            <p className="text-slate-400 text-xs mt-4">Reward Unlocked</p>
            <h5 className="text-amber-400 font-black text-2xl leading-tight drop-shadow-md">
              {coupon.rewardName}
            </h5>
          </div>

          <div className="flex flex-col items-center justify-start">
             <div className="bg-white p-2 rounded-2xl shadow-xl">
               <QRCode value={JSON.stringify({ code: coupon.code, userId: coupon.userId })} size={90} />
             </div>
             <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-3">Scan at Counter</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-slate-400 text-sm">Issued to: <span className="text-white font-semibold">{userName || 'User'}</span></p>
          <p className="text-slate-400 text-sm">Points Used: <span className="text-pink-400 font-bold">{points}</span></p>
          <p className="text-slate-400 text-sm">Expires: <span className="text-white font-semibold">{expiresDate}</span></p>
        </div>

        <div className="mt-8 pt-6 border-t border-dashed border-slate-600/50">
          <p className="text-[10px] text-slate-500 italic leading-relaxed">
            * Valid for single use only. Present this digital pass at the designated campus store counter before expiration to claim your physical reward.
          </p>
        </div>
      </div>
    </div>
  );
});

/* ---------- Main Dashboard Component ---------- */
export default function Userdash() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  /* --- State --- */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeBanner, setActiveBanner] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  const [couponTab, setCouponTab] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  
  // Modals
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Forms
  const [form, setForm] = useState({ fullName: "", email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profilePic, setProfilePic] = useState(null);

  const [redeemPoints, setRedeemPoints] = useState(100);
  const [selectedReward, setSelectedReward] = useState("Free Coffee");
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Feedback
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const couponRef = useRef(null);

  /* --- Fetch Data --- */
  const fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      if (!storedUser) {
         navigate('/L');
         return;
      }

      const userRes = await axios.get(`${baseurl}/api/${storedUser.id}`);
      const user = userRes.data;

      const [tasksRes, couponsRes, allUsersRes, submissionsRes, bannerRes, notifRes] = await Promise.all([
        axios.get(`${baseurl}/api/tasks/active`, { params: { year: user.yearClassDept || "" } }),
        axios.get(`${baseurl}/api/users/${storedUser.id}/coupons`),
        axios.get(`${baseurl}/api/users`),
        axios.get(`${baseurl}/api/submissions/user/${storedUser.id}`),
        axios.get(`${baseurl}/api/events/active`).catch(() => ({ data: null })),
        axios.get(`${baseurl}/api/notifications/my`).catch(() => ({ data: [] }))
      ]);

      const usersList = allUsersRes.data || [];
      const fetchedTasks = tasksRes.data || [];
      const mySubmissions = submissionsRes.data || [];
      
      setActiveBanner(bannerRes.data);
      setNotifications(notifRes.data || []);

      const sortedUsers = [...usersList].sort((a, b) => (b.points || 0) - (a.points || 0));
      const myRank = sortedUsers.findIndex(u => u._id === user._id) + 1;

      const pendingCount = fetchedTasks.filter(t => {
        const hasSubmitted = mySubmissions.some(sub => (typeof sub.task === 'object' ? sub.task._id : sub.task) === t._id);
        const isAwarded = t.awardedTo && t.awardedTo.some(entry => entry.user === user._id);
        return !hasSubmitted && !isAwarded;
      }).length;

      setData({
        user: {
          id: user._id,
          name: user.fname || user.fullName || "Student",
          email: user.email,
          department: user.department || "General",
          year: (user.yearClassDept && user.yearClassDept !== user.department) ? user.yearClassDept : "Student",
          avatar: user.profilePic ? `${baseurl}${user.profilePic}` : null,
          rank: myRank,
        },
        progress: {
          points: user.points || 0,
          rank: myRank,
          streak: 6,
        },
        stats: {
          activeAssignments: fetchedTasks.length,
          pendingTasks: pendingCount
        }
      });

      setTasks(fetchedTasks);
      setCoupons(couponsRes.data || []);
      setAllUsers(usersList);

      setForm({
        fullName: user.fname || user.fullName || "",
        email: user.email || "",
        department: user.department || "",
        year: user.yearClassDept || "Year 1",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [baseurl]);

  /* --- Computed Data --- */
  const leaderboardTop = useMemo(() => {
    if (!allUsers.length || !data) return [];
    const sorted = [...allUsers].filter(u => u.role === 'user').sort((a, b) => (b.points || 0) - (a.points || 0));
    return sorted.slice(0, 3).map((u, i) => ({
      name: u._id === data.user.id ? "You" : (u.fname || "Student"),
      points: u.points || 0,
      rank: i + 1,
      isMe: u._id === data.user.id
    }));
  }, [allUsers, data]);

  const recentActivity = useMemo(() => {
    const activites = [];
    const uid = data?.user?.id;
    if (coupons) {
      coupons.forEach(c => activites.push({
        type: 'redeem', title: `Redeemed: ${c.rewardName}`, points: -(c.pointsSpent || 100), time: new Date(c.createdAt || Date.now()), icon: Wallet, colorClass: "text-amber-500 bg-amber-500/10"
      }));
    }
    if (tasks && uid) {
      tasks.forEach(t => {
        const awardEntry = t.awardedTo?.find(e => e.user === uid);
        if (awardEntry) activites.push({
          type: 'task', title: `Completed: ${t.title}`, points: `+${t.points}`, time: new Date(awardEntry.awardedAt || t.dueDate || Date.now()), icon: CheckCircle, colorClass: "text-emerald-500 bg-emerald-500/10"
        });
      });
    }
    if (activites.length === 0) return [{ type: "info", title: "Welcome to Campus Cash!", points: null, time: new Date(), icon: Trophy, colorClass: "text-primary bg-primary/10" }];
    
    return activites.sort((a, b) => b.time - a.time).slice(0, 10).map(a => {
      const diff = (new Date() - a.time) / 1000;
      let timeStr = a.time.toLocaleDateString();
      if (diff < 60) timeStr = "Just now";
      else if (diff < 3600) timeStr = `${Math.floor(diff / 60)}m ago`;
      else if (diff < 86400) timeStr = `${Math.floor(diff / 3600)}h ago`;
      else if (diff < 172800) timeStr = "Yesterday";
      return { ...a, timeStr };
    });
  }, [coupons, tasks, data]);

  // Generate Mock Chart Data from Activity
  const chartData = useMemo(() => {
    const dataPoints = [];
    let currentPoints = 0;
    // Walk through last 7 days back to front
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      // add random points between 10-50 for simulation, or realistically parse actual activity summing them up.
      const earned = Math.floor(Math.random() * 40) + 10; 
      currentPoints += earned;
      dataPoints.push({ name: dateStr, earned, total: currentPoints });
    }
    return dataPoints;
  }, [recentActivity]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const now = new Date();
      const expires = c.expiresAt ? new Date(c.expiresAt) : null;
      const isExpired = expires && expires < now;
      if (couponTab === 0) return true;
      if (couponTab === 1) return !c.isUsed && !isExpired;
      if (couponTab === 2) return c.isUsed;
      if (couponTab === 3) return !c.isUsed && !isExpired && (expires - now < 86400000 * 3);
      return true;
    });
  }, [coupons, couponTab]);

  /* --- Handlers --- */
  const handleRedeem = async () => {
    try {
      setRedeemLoading(true);
      await axios.post(`${baseurl}/api/users/${data.user.id}/redeem`, {
        rewardName: selectedReward, pointsToRedeem: redeemPoints
      });
      setSuccess("Reward Redeemed Successfully!");
      setRedeemOpen(false);
      fetchUserData();
    } catch (err) {
      setError(err.response?.data?.message || "Redemption failed");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("yearClassDept", form.year);
      formData.append("department", form.department);
      if (form.newPassword) formData.append("password", form.newPassword);
      if (profilePic) formData.append("profilePic", profilePic);

      await axios.put(`${baseurl}/api/users/${data.user.id}`, formData, { headers: { "Content-Type": "multipart/form-data" }});
      setSuccess("Profile updated successfully!");
      setProfileOpen(false);
      fetchUserData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleDownloadCoupon = async () => {
    if (!couponRef.current) return;
    try {
      const canvas = await html2canvas(couponRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `campuscash-${selectedCoupon?.code || "coupon"}.png`;
      link.click();
      setSuccess("Downloaded successfully!");
    } catch (err) {
      setError("Failed to download coupon");
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const tier = getTier(data.progress.points);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground pb-20 pt-8 font-sans selection:bg-primary/30">
      
      {/* HEADER SECTION */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group cursor-pointer" onClick={() => setProfileOpen(true)}>
              <div className="w-24 h-24 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted">
                {data.user.avatar ? (
                  <img src={data.user.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                   <span className="w-full h-full flex items-center justify-center text-3xl font-bold bg-primary text-primary-foreground">
                     {data.user.name[0]}
                   </span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Edit3 className="text-white w-6 h-6" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tight mb-2">
                Hello, {data.user.name.split(' ')[0]}! 
                <span className="ml-2 inline-block animate-wave">👋</span>
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <GraduationCap className="w-3.5 h-3.5" /> {data.user.year}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  <Ticket className="w-3.5 h-3.5" /> {data.user.department}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Trophy className="w-3.5 h-3.5" /> Rank #{data.progress.rank}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/tasks')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
               Find Tasks <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8">
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={CheckCircle} title="Active Assignments" value={data.stats.activeAssignments} iconClass="text-indigo-500" bgClass="bg-indigo-500/10" delay={0.1} />
          <StatCard icon={Clock} title="Pending Tasks" value={data.stats.pendingTasks} iconClass="text-amber-500" bgClass="bg-amber-500/10" delay={0.2} />
          <StatCard icon={tier.icon} title="Current Tier" value={tier.name} subtext={`${data.progress.points} Lifetime Points`} iconClass={tier.iconClass} bgClass={tier.bgClass} delay={0.3} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* MAIN COLUMN */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* GAMIFIED BALANCE CARD */}
            <GlassCard className="bg-gradient-to-br from-indigo-600 to-purple-800 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
              <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div>
                   <p className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                     <Wallet className="w-5 h-5" /> Current Balance
                   </p>
                   <div className="flex items-end gap-2 mb-6">
                     <span className="text-6xl md:text-7xl font-black tracking-tighter leading-none">{data.progress.points}</span>
                     <span className="text-2xl font-bold text-white/60 mb-1">pts</span>
                   </div>
                   <button 
                     onClick={() => setRedeemOpen(true)}
                     className="bg-white text-indigo-700 hover:bg-white/90 font-black px-8 py-3.5 rounded-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                   >
                     Redeem Now <Ticket className="w-5 h-5" />
                   </button>
                 </div>
                 
                 <div className="w-full md:w-64 bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Next Milestone</span>
                     <span className="text-xs font-bold text-amber-300">Free Coffee</span>
                   </div>
                   <div className="h-3 bg-black/40 rounded-full overflow-hidden mb-2">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${Math.floor(data.progress.points % 100)}%` }} 
                       transition={{ duration: 1, delay: 0.5 }}
                       className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
                     />
                   </div>
                   <div className="flex justify-between text-xs text-white/60 font-medium">
                     <span>{Math.floor(data.progress.points % 100)}% complete</span>
                     <span>100 pts</span>
                   </div>
                 </div>
              </div>
            </GlassCard>

            {/* CHARTS & ACTIVITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Activity Chart */}
              <GlassCard className="p-6 h-[400px] flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-black">Earning Trend</h3>
                </div>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: 'var(--color-foreground)', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="earned" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorEarned)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Recent Activity Feed */}
              <GlassCard className="flex flex-col h-[400px]">
                <div className="p-6 border-b border-border flex justify-between items-center bg-card/50">
                   <h3 className="text-lg font-black flex items-center gap-2">
                     <History className="w-5 h-5 text-primary" /> Activity
                   </h3>
                   <button onClick={() => setHistoryOpen(true)} className="text-xs font-bold text-primary hover:underline">View All</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {recentActivity.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.colorClass}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.timeStr}</p>
                      </div>
                      {item.points && (
                        <div className={`text-sm font-black whitespace-nowrap ${item.points.toString().includes('+') ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {item.points}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* MY COUPONS WALLET */}
            <div id="coupons-section" className="mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-2xl font-black flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-primary" /> My Rewards Wallet
                </h3>
                <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                  {['All', 'Active', 'Used', 'Expiring'].map((label, i) => (
                    <button 
                      key={label} onClick={() => setCouponTab(i)}
                      className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${couponTab === i ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <AnimatePresence>
                   {filteredCoupons.length > 0 ? filteredCoupons.map((c) => (
                     <motion.div 
                       key={c._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                       onClick={() => setSelectedCoupon(c)}
                       className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 cursor-pointer flex items-center gap-4 group transition-shadow hover:shadow-xl shadow-black/5"
                     >
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Ticket className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-foreground truncate">{c.rewardName}</h4>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">Code: {c.code}</p>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${c.isUsed ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/10 text-emerald-500'}`}>
                             {c.isUsed ? 'Used' : 'Active'}
                           </span>
                           <span className="text-[10px] text-muted-foreground mt-1">
                             {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                           </span>
                        </div>
                     </motion.div>
                   )) : (
                     <div className="col-span-1 md:col-span-2 py-12 text-center border-2 border-dashed border-border rounded-3xl">
                       <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                       <p className="text-muted-foreground font-medium">No coupons found in this category.</p>
                     </div>
                   )}
                 </AnimatePresence>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-8">
            
            {/* LEADERBOARD SNAPSHOT */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-black">Top Performers</h3>
              </div>
              <div className="space-y-3">
                {leaderboardTop.map((u, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border ${u.isMe ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-transparent'}`}>
                    <div className="w-8 flex justify-center">
                       <span className={`text-lg font-black ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                         #{u.rank}
                       </span>
                    </div>
                    <div className="flex-1 font-bold text-sm truncate">{u.name}</div>
                    <div className="font-black text-primary text-sm">{u.points}p</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* UPCOMING TASKS */}
            <GlassCard className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]" />
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-black">Due Soon</h3>
              </div>
              <div className="space-y-3 relative z-10">
                {tasks.filter(t => !t.awardedTo?.some(e => e.user === data.user.id)).slice(0, 3).length > 0 ? (
                  tasks.filter(t => !t.awardedTo?.some(e => e.user === data.user.id))
                    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0,3)
                    .map((task, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors border border-border">
                        <h4 className="font-bold text-sm mb-1 truncate">{task.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] uppercase font-black tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">{task.points} pts</span>
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                    <p className="text-sm font-bold">All caught up! 🎉</p>
                  </div>
                )}
              </div>
              <button onClick={() => navigate('/tasks')} className="w-full mt-4 py-3 bg-card border border-border hover:bg-muted rounded-xl font-bold text-sm transition-colors relative z-10">
                Browse All Tasks
              </button>
            </GlassCard>

            {/* ANNOUNCEMENTS */}
            {activeBanner && (
               <GlassCard className="p-1 border-primary/30">
                 <div onClick={() => navigate('/events')} className="bg-primary/10 hover:bg-primary/20 transition-colors p-5 rounded-[1.4rem] cursor-pointer flex gap-4 items-center">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Campus Event</p>
                      <h4 className="font-bold text-sm line-clamp-2">{activeBanner.title}</h4>
                    </div>
                 </div>
               </GlassCard>
            )}

          </div>
        </div>
      </div>

      {/* --- MODALS (Replaces MUI Dialogs) --- */}
      <AnimatePresence>
        
        {/* VIEW COUPON MODAL */}
        {selectedCoupon && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg"
            >
              <button onClick={() => setSelectedCoupon(null)} className="absolute -top-12 right-0 md:-right-12 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors">
                 <X className="w-6 h-6" />
              </button>
              <BeautifulCoupon ref={couponRef} coupon={selectedCoupon} userName={data.user.name} />
              <div className="flex justify-center mt-6">
                <button onClick={handleDownloadCoupon} className="bg-white text-black hover:bg-slate-200 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-xl">
                  <Download className="w-5 h-5" /> Save to Gallery
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* REDEEM REWARDS MODAL */}
        {redeemOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="w-full max-w-4xl bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              
              <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute w-[400px] h-[400px] border-[1px] border-white/20 rounded-full border-dashed" />
                <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity }} className="relative z-10 w-full max-w-[240px]">
                  <img src={selectedReward.includes("Voucher") ? "/canteen-voucher.png" : selectedReward.includes("Library") ? "/library-pass.png" : "/real-coffee.png"} alt="Reward" className="w-full drop-shadow-2xl rounded-2xl" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=500&fit=crop'; }} />
                </motion.div>
                <div className="relative z-10 mt-8 text-center text-white">
                  <p className="text-xs font-black tracking-widest uppercase opacity-80 mb-2">Available Balance</p>
                  <p className="text-4xl font-black">{data.progress.points} <span className="text-xl opacity-70">pts</span></p>
                </div>
              </div>

              <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-black tracking-tight">Redeem Rewards</h2>
                  <button onClick={() => setRedeemOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>
                
                <p className="text-muted-foreground mb-8">Select a reward below to instantly convert your points into a digital pass.</p>

                <div className="space-y-4 mb-8">
                  {[
                    { name: 'Free Coffee', pts: 100, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
                    { name: 'Canteen Voucher ₹50', pts: 150, icon: Wallet, color: 'text-emerald-500 bg-emerald-500/10' },
                    { name: 'Library Pass', pts: 200, icon: GraduationCap, color: 'text-purple-500 bg-purple-500/10' }
                  ].map(r => (
                    <div 
                      key={r.name} onClick={() => { setSelectedReward(r.name); setRedeemPoints(r.pts); }}
                      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedReward === r.name ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'}`}
                    >
                      <div className={`p-3 rounded-xl ${r.color}`}>
                        <r.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">{r.name}</h4>
                        <p className="text-sm font-medium text-muted-foreground">{r.pts} Points</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedReward === r.name ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                        {selectedReward === r.name && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto bg-muted/50 p-5 rounded-2xl border border-border flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">TOTAL COST</p>
                    <p className="text-2xl font-black text-primary">{redeemPoints} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">BALANCE AFTER</p>
                    <p className={`text-lg font-bold ${data.progress.points - redeemPoints < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {data.progress.points - redeemPoints} pts
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleRedeem} disabled={redeemLoading || data.progress.points < redeemPoints}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeemLoading ? 'Processing...' : 'Confirm Redemption'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {profileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-black">Edit Profile</h2>
                <button onClick={() => setProfileOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer mb-2">
                    <div className="w-24 h-24 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted">
                      {data.user.avatar ? (
                        <img src={data.user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                         <span className="w-full h-full flex items-center justify-center text-3xl font-bold bg-primary text-primary-foreground">
                           {data.user.name[0]}
                         </span>
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Edit3 className="text-white w-6 h-6" />
                      <input type="file" hidden accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Tap to change</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold mb-1 block">Full Name</label>
                    <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-1 block">Year</label>
                      <select className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" value={form.year} onChange={(e) => setForm({...form, year: e.target.value})}>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1 block">Department</label>
                      <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} placeholder="e.g. CSE" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Change Password</p>
                    <div className="space-y-4">
                      <input type="password" placeholder="New Password" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" value={form.newPassword} onChange={(e) => setForm({...form, newPassword: e.target.value})} />
                      <input type="password" placeholder="Confirm New Password" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border bg-muted/10 flex justify-end gap-3">
                <button onClick={() => setProfileOpen(false)} className="px-6 py-3 font-bold text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={handleProfileUpdate} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all">Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* FULL HISTORY MODAL */}
        {historyOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-black flex items-center gap-2"><History className="w-5 h-5 text-primary"/> Full Activity History</h2>
                <button onClick={() => setHistoryOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto p-2 min-h-[300px]">
                {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 border-b border-border/50 last:border-0 transition-colors">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.colorClass}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm md:text-base">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time.toLocaleString()}</p>
                    </div>
                    {item.points && (
                      <div className={`font-black whitespace-nowrap text-right ${item.points.toString().includes('+') ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {item.points} <span className="text-[10px] uppercase tracking-widest">pts</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                     <History className="w-12 h-12 mb-4 opacity-20" />
                     <p className="font-bold">No activity history yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      {/* SNACKBARS */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-6 right-6 z-[200] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3">
            <CheckCircle className="w-6 h-6" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-6 right-6 z-[200] bg-destructive text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3">
            <X className="w-6 h-6" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
