
import React, { useState, useEffect, useRef } from "react";
import { useTheme as useMuiTheme } from "@mui/material/styles";
// import { useTheme } from "../contexts/ThemeContext"; // Using internal hook or context
import { useTheme } from "../contexts/ThemeContext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from "@mui/material";
import {
  LocalFireDepartment as StreakIcon,
  EmojiEvents as TrophyIcon,
  Assignment as AssignmentIcon,
  Timeline as PendingIcon,
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  LocalOffer as CouponIcon,
  Notifications as BellIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  LocalCafe as CoffeeIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  MoreHoriz as MoreIcon,
  School as SchoolIcon
} from "@mui/icons-material";

import axios from "axios";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

/* ---------- Utility / Helper Components ---------- */
const StatCard = ({ icon: Icon, title, value, subtext, color, isDark }) => (
  <Card sx={{
    borderRadius: 4,
    background: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
    backdropFilter: "blur(10px)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
    height: "100%",
    position: "relative",
    overflow: "hidden"
  }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
      <Box sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: color ? `${color}20` : "primary.light",
        color: color || "primary.main",
        display: "flex"
      }}>
        <Icon sx={{ fontSize: 28 }} />
      </Box>
      <Box position="relative" zIndex={1}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ color: isDark ? "#fff" : "#1e293b" }}>
          {value}
        </Typography>
        {subtext && <Typography variant="caption" color={color}>{subtext}</Typography>}
      </Box>
      {/* Decorative bg icon */}
      <Icon sx={{
        position: "absolute",
        right: -20,
        bottom: -20,
        fontSize: 140,
        opacity: isDark ? 0.15 : 0.1, // Increased opacity
        color: color || "primary.main", // Added color
        transform: "rotate(-15deg)",
        filter: "drop-shadow(0 0 10px rgba(0,0,0,0.1))"
      }} />
    </CardContent>
  </Card>
);

/* ---------- Beautiful Coupon Component (Preserved & Updated) ---------- */
const BeautifulCoupon = React.forwardRef(({ coupon, userName, isDark }, ref) => {
  if (!coupon) return null;
  const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

  // Format details
  const expiresDate = coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never";
  const issuedTo = userName || "User";
  const points = coupon.pointsSpent || 100;

  // Determine gradient background based on theme or force dark for "premium" feel as per image
  // The user requested "like this way" (referring to image), which is dark.
  const cardBg = "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)";

  return (
    <Box
      ref={ref}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 550, // Increased size
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #020617 100%)", // Richer dark gradient
        color: "white",
        borderRadius: 5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)", // Added subtle border
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        // Ticket Cutouts
        maskImage: "radial-gradient(circle at 0 71%, transparent 18px, black 19px), radial-gradient(circle at 100% 71%, transparent 18px, black 19px)",
        WebkitMaskImage: "radial-gradient(circle at 0 71%, transparent 18px, black 19px), radial-gradient(circle at 100% 71%, transparent 18px, black 19px)"
      }}
    >
      {/* Decorative Glow */}
      <Box sx={{
        position: 'absolute', top: -100, right: -100, width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Top Header Label */}
      <Box sx={{
        bgcolor: "#f97316",
        color: "#0f172a",
        py: 1,
        px: 4,
        borderBottomRightRadius: 24,
        width: "fit-content",
        mb: 3,
        boxShadow: "4px 4px 20px rgba(249, 115, 22, 0.2)"
      }}>
        <Typography variant="overline" fontWeight={900} letterSpacing={2} fontSize="0.85rem">CAMPUS CASH REWARD</Typography>
      </Box>

      {/* USED Stamp Overlay */}
      {coupon.isUsed && (
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          border: "8px double rgba(220, 38, 38, 0.8)",
          borderRadius: 2,
          px: 6,
          py: 2,
          color: "rgba(220, 38, 38, 1)",
          fontWeight: 900,
          fontSize: "4rem",
          zIndex: 20,
          pointerEvents: "none",
          letterSpacing: 6,
          textShadow: "0 0 20px rgba(0,0,0,0.5)",
          bgcolor: "rgba(0,0,0,0.1)"
        }}>
          USED
        </Box>
      )}

      {/* Content Body */}
      <Box sx={{ display: "flex", px: 5, mb: 3 }}>
        {/* Left Details */}
        <Box sx={{ flex: 1, mr: 4 }}>
          <Typography variant="caption" sx={{ color: "#94a3b8", letterSpacing: 2, display: "block", fontSize: "0.75rem", mb: 1, fontWeight: 600 }}>COUPON CODE</Typography>
          <Typography variant="h4" sx={{
            fontFamily: "'JetBrains Mono', monospace", // Monospace for code
            fontWeight: 700,
            color: "white",
            mb: 4,
            wordBreak: "break-word",
            letterSpacing: 1.5,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)"
          }}>
            {coupon.code}
          </Typography>

          <Box mb={3}>
            <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 0.5, fontSize: "0.9rem" }}>Reward Unlocked:</Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color: "#fbbf24", textShadow: "0 2px 10px rgba(251, 191, 36, 0.2)" }}>
              {coupon.rewardName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Issued to: <Box component="span" sx={{ color: "white", fontWeight: 600 }}>{issuedTo}</Box>
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Points Used: <Box component="span" sx={{ color: "#f472b6", fontWeight: 700 }}>{points}</Box>
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Valid Until: <Box component="span" sx={{ color: "white", fontWeight: 600 }}>{expiresDate}</Box>
            </Typography>
          </Box>
        </Box>

        {/* Right QR Code Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{
            p: 2,
            bgcolor: "white",
            borderRadius: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1.5,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
          }}>
            <QRCode value={JSON.stringify({ code: coupon.code, userId: coupon.userId })} size={110} />
          </Box>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 500, letterSpacing: 0.5 }}>Scan at Counter</Typography>
        </Box>
      </Box>

      {/* Dashed Divider */}
      <Box sx={{ px: 4, my: 3 }}>
        <Box sx={{ borderBottom: "2px dashed #475569", opacity: 0.5 }} />
      </Box>

      {/* Footer / Terms */}
      <Box sx={{ px: 5, pb: 4 }}>
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", lineHeight: 1.6, display: "block", fontStyle: "italic" }}>
          * Terms: This coupon is valid for a single use only. Convert this digital asset to physical reward at the designated campus store counter before the expiration date.
        </Typography>
      </Box>
    </Box>
  );
});

/* ---------- Main Dashboard ---------- */
const Userdash = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  /* --- State --- */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Store all users for leaderboard
  const [couponTab, setCouponTab] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Forms
  const [form, setForm] = useState({ fullName: "", email: "", currentPassword: "", newPassword: "" });
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
      if (!storedUser) return;

      // 1. Fetch User First to get department/year
      const userRes = await axios.get(`${baseurl}/api/${storedUser.id}`);
      const user = userRes.data;

      // 2. Fetch other data in parallel, using user info for filtering
      const [tasksRes, couponsRes, allUsersRes, submissionsRes] = await Promise.all([
        axios.get(`${baseurl}/api/tasks/active`, {
          params: { year: user.yearClassDept || "" }
        }),
        axios.get(`${baseurl}/api/users/${storedUser.id}/coupons`),
        axios.get(`${baseurl}/api/users`),
        axios.get(`${baseurl}/api/submissions/user/${storedUser.id}`)
      ]);

      const usersList = allUsersRes.data || [];
      const fetchedTasks = tasksRes.data || [];
      const mySubmissions = submissionsRes.data || [];

      // Calculate Rank
      const sortedUsers = [...usersList].sort((a, b) => (b.points || 0) - (a.points || 0));
      const myRank = sortedUsers.findIndex(u => u._id === user._id) + 1;

      // Calculate Pending Tasks
      // Task is pending if:
      // 1. It is active (fetchedTasks are active)
      // 2. I have NOT submitted it yet (check mySubmissions)
      // 3. I have NOT been awarded it (check awardedTo, though usually covered by submission, admin awards matter too)
      const pendingCount = fetchedTasks.filter(t => {
        // Check if I submitted this task
        const hasSubmitted = mySubmissions.some(sub =>
          (typeof sub.task === 'object' ? sub.task._id : sub.task) === t._id
        );

        // Check if I was awarded (admin manual award or quiz auto-award)
        const isAwarded = t.awardedTo && t.awardedTo.some(entry => entry.user === user._id);

        return !hasSubmitted && !isAwarded;
      }).length;

      setData({
        user: {
          id: user._id,
          name: user.fname || user.fullName,
          email: user.email,
          department: user.department || "General",
          year: user.yearClassDept || "Student",
          avatar: user.profilePic ? `${baseurl}${user.profilePic}` : null,
          rank: myRank,
        },
        progress: {
          points: user.points || 0,
          rank: myRank,
          streak: 6, // Mock for now
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
        newPassword: ""
      });

      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    if (location.state?.scrollTo === 'coupons') {
      const el = document.getElementById('coupons-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [baseurl, location]);

  /* --- Computed Data --- */

  // 1. Leaderboard Logic
  const leaderboardTop = React.useMemo(() => {
    if (!allUsers.length || !data) return [];
    // Sort all users by points desc
    const sorted = [...allUsers].filter(u => u.role === 'user').sort((a, b) => (b.points || 0) - (a.points || 0));

    // Take top 3
    let top3 = sorted.slice(0, 3).map((u, i) => ({
      name: u._id === data?.user?._id || u.fname === data?.user?.name ? "You" : u.fname,
      points: u.points || 0,
      rank: i + 1,
      isMe: u._id === JSON.parse(sessionStorage.getItem("user") || '{}').id
    }));

    // If I am not in top 3, show me as 4th entry or replacing 3rd? Design usually shows Top 3. 
    // Let's stick to standard Top 3 for the snapshot as requested.
    return top3;
  }, [allUsers, data]);


  // 2. Recent Activity Logic (Merging Coupons & Completed Tasks if available)
  /* --- Recent Activity Logic --- */
  const recentActivity = React.useMemo(() => {
    const activites = [];
    const uid = JSON.parse(sessionStorage.getItem("user"))?.id;

    // 1. Coupons (Redemptions)
    if (coupons) {
      coupons.forEach(c => {
        activites.push({
          type: 'redeem',
          title: `Redeemed: ${c.rewardName}`,
          points: -c.pointsSpent || null, // Assuming coupon has pointsSpent or we infer
          time: new Date(c.createdAt || Date.now()),
          icon: WalletIcon,
          color: "#a78bfa"
        });
      });
    }

    // 2. Completed Tasks
    if (tasks && uid) {
      tasks.forEach(t => {
        const awardEntry = t.awardedTo?.find(entry => entry.user === uid);
        if (awardEntry) {
          activites.push({
            type: 'task',
            title: `Completed: ${t.title}`,
            points: `+${t.points}`,
            time: new Date(awardEntry.awardedAt || t.dueDate || Date.now()),
            icon: CheckCircleIcon,
            color: "#4ade80"
          });
        }
      });
    }

    // 3. Fallback / Mock if empty (to clearly show it's working but empty)
    if (activites.length === 0) {
      return [
        { type: "info", title: "Welcome to Campus Cash!", points: null, time: new Date(), icon: TrophyIcon, color: "#fbbf24" }
      ];
    }

    // Sort by time descending
    return activites.sort((a, b) => b.time - a.time).slice(0, 10).map(a => {
      // Simple relative time formatter
      const diff = (new Date() - a.time) / 1000; // seconds
      let timeStr = a.time.toLocaleDateString();

      if (diff < 60) timeStr = "Just now";
      else if (diff < 3600) timeStr = `${Math.floor(diff / 60)}m ago`;
      else if (diff < 86400) timeStr = `${Math.floor(diff / 3600)}h ago`;
      else if (diff < 172800) timeStr = "Yesterday";

      return { ...a, time: timeStr };
    });

  }, [coupons, tasks]);


  /* --- Filter Coupons --- */
  const filteredCoupons = coupons.filter(c => {
    const now = new Date();
    const expires = c.expiresAt ? new Date(c.expiresAt) : null;
    const isExpired = expires && expires < now;

    if (couponTab === 0) return true;
    if (couponTab === 1) return !c.isUsed && !isExpired;
    if (couponTab === 2) return c.isUsed;
    if (couponTab === 3) return !c.isUsed && !isExpired && (expires - now < 86400000 * 3);
    return true;
  });

  // Handlers...
  const handleRedeem = async () => {
    try {
      setRedeemLoading(true);
      const user = JSON.parse(sessionStorage.getItem("user"));
      const res = await axios.post(`${baseurl}/api/users/${user.id}/redeem`, {
        rewardName: selectedReward,
        pointsToRedeem: redeemPoints
      });
      setSuccess("Redeemed successfully!");
      setRedeemOpen(false);
      fetchUserData();
    } catch (err) {
      setError(err.response?.data?.message || "Redemption failed");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      if (!storedUser) return;

      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("yearClassDept", form.year);
      formData.append("department", form.department);

      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        formData.append("password", form.newPassword);
      }

      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      await axios.put(`${baseurl}/api/users/${storedUser.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess("Profile updated successfully!");
      setProfileOpen(false);
      fetchUserData(); // Refresh data
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };
  const handleDownloadCoupon = async (format) => {
    if (!couponRef.current) return;
    try {
      const element = couponRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2, // Higher resolution
        useCORS: true // Handle external images if any
      });
      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `campus-cash-coupon-${selectedCoupon?.code || "reward"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Coupon downloaded successfully!");
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download coupon image");
    }
  };

  if (loading || !data) return <Box p={4}><LinearProgress /></Box>;

  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: isDark ? "#0f1115" : "#f8fafc",
      color: isDark ? "#fff" : "#1e293b",
      p: { xs: 2, md: 4 },
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* --- Header Section --- */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box display="flex" gap={2} alignItems="center">
          <Avatar
            src={data.user.avatar}
            sx={{
              width: 80, height: 80,
              border: "3px solid #6366f1",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
            }}
          />
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
              Welcome back, {data.user.name.split(' ')[0]}!
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Chip icon={<SchoolIcon sx={{ color: "#818cf8 !important" }} />} label={data.user.year} size="small" sx={{ bgcolor: "rgba(129, 140, 248, 0.1)", color: "#818cf8", borderColor: "rgba(129, 140, 248, 0.2)", border: 1 }} />
              <Chip icon={<SchoolIcon sx={{ color: "#f472b6 !important" }} />} label={data.user.department} size="small" sx={{ bgcolor: "rgba(244, 114, 182, 0.1)", color: "#f472b6", borderColor: "rgba(244, 114, 182, 0.2)", border: 1 }} />
              <Chip icon={<TrophyIcon sx={{ color: "#fbbf24 !important" }} />} label={`#${data.user.rank} Rank`} size="small" sx={{ bgcolor: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", borderColor: "rgba(251, 191, 36, 0.2)", border: 1 }} />
              <Chip icon={<CoffeeIcon sx={{ color: "#f472b6 !important" }} />} label={`${data.progress.points} Points`} size="small" sx={{ bgcolor: "rgba(244, 114, 182, 0.1)", color: "#f472b6", borderColor: "rgba(244, 114, 182, 0.2)", border: 1 }} />
              <Typography variant="caption" sx={{ cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }} onClick={() => setProfileOpen(true)}>Edit Profile</Typography>
            </Box>
          </Box>
        </Box>
        {/* Top Right Actions could go here */}
      </Box>

      {/* --- Stats Grid --- */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <div onClick={() => navigate('/tasks')} style={{ cursor: 'pointer', height: '100%' }}>
            <StatCard
              icon={AssignmentIcon}
              title="Assignments and Quiz Active"
              value={data.stats?.activeAssignments || 0}
              color="#6366f1"
              isDark={isDark}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <div onClick={() => navigate('/tasks')} style={{ cursor: 'pointer', height: '100%' }}>
            <StatCard
              icon={PendingIcon}
              title="Pending Tasks"
              value={data.stats?.pendingTasks || 0}
              color="#8b5cf6"
              isDark={isDark}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={TrophyIcon}
            title="Leaderboard Rank"
            value={`#${data.progress.rank}`}
            subtext={data.progress.rank <= 3 ? "Top 3!" : "Keep pushing!"}
            color="#fbbf24"
            isDark={isDark}
          />
        </Grid>
      </Grid>

      {/* --- Main Content Split --- */}
      <Grid container spacing={4}>
        {/* Left Column (Main) */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Balance Card */}
          <Card sx={{
            borderRadius: 5,
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "white",
            mb: 4,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.5)"
          }}>
            {/* Abstract shapes */}
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ position: 'absolute', bottom: -50, left: -20, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

            <CardContent sx={{ p: 4 }}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>Current Balance</Typography>
                  <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: "3rem", md: "4.5rem" }, lineHeight: 1 }}>
                    {data.progress.points}<span style={{ fontSize: "1.5rem", fontWeight: 400, opacity: 0.7, marginLeft: 8 }}>pts</span>
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setRedeemOpen(true)}
                    sx={{
                      mt: 3,
                      bgcolor: "white",
                      color: "#4f46e5",
                      fontWeight: "bold",
                      px: 4,
                      borderRadius: 2,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
                    }}
                  >
                    Redeem Points
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    p: 3,
                    borderRadius: 3,
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="caption" fontWeight={700}>Progress to Next Reward</Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CoffeeIcon fontSize="small" />
                        <Typography variant="caption">Free Coffee</Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.floor(data.progress.points % 100)}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: "rgba(0,0,0,0.2)",
                        "& .MuiLinearProgress-bar": { bgcolor: "#fbbf24" }
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        at {Math.floor((data.progress.points / 100) + 1) * 100} pts
                      </Typography>
                      <Typography variant="caption" sx={{ textAlign: "right", opacity: 0.8 }}>
                        {Math.floor(data.progress.points % 100)}% - almost there!
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Box mb={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>Recent Activity</Typography>
              <IconButton><FilterListIcon /></IconButton>
            </Box>
            <Card sx={{ bgcolor: isDark ? "#1e293b" : "white", borderRadius: 4, border: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.05)" : "transparent" }}>
              <List disablePadding>
                {recentActivity.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        <Box sx={{ p: 1, borderRadius: "50%", bgcolor: `${item.color}20`, color: item.color }}>
                          <item.icon />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography fontWeight={600} color={isDark ? "white" : "text.primary"}>{item.title}</Typography>}
                        secondary={item.points ? <Typography variant="caption" color="error">{item.points} pts</Typography> : null}
                      />

                    </ListItem>
                    {idx < recentActivity.length - 1 && <Divider component="li" variant="inset" />}
                  </React.Fragment>
                ))}
                <Box p={2} textAlign="center">
                  <Button size="small" onClick={() => setHistoryOpen(true)}>View Full History</Button>
                </Box>
              </List>
            </Card>
          </Box>

          {/* Coupons Section */}
          <Box id="coupons-section">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>My Coupons</Typography>
              <Tabs
                value={couponTab}
                onChange={(e, v) => setCouponTab(v)}
                textColor="inherit"
                indicatorColor="primary"
                sx={{ minHeight: 0, "& .MuiTab-root": { minHeight: 0, py: 1, fontSize: "0.85rem" } }}
              >
                <Tab label="All" />
                <Tab label="Active" />
                <Tab label="Used" />
                <Tab label="Expiring" />
              </Tabs>
            </Box>

            <Grid container spacing={2}>
              {filteredCoupons.length > 0 ? filteredCoupons.map((c) => (
                <Grid size={{ xs: 12, sm: 6 }} key={c._id}>
                  <Paper
                    elevation={0}
                    onClick={() => setSelectedCoupon(c)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: isDark ? "#1e293b" : "white",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { transform: "translateY(-2px)", borderColor: "primary.main" }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CoffeeIcon fontSize="small" sx={{ color: "primary.main" }} />
                        <Typography fontWeight={700}>{c.rewardName}</Typography>
                      </Box>
                      <Chip label={c.isUsed ? "USED" : "ACTIVE"} size="small" color={c.isUsed ? "default" : "success"} variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">Code: {c.code}</Typography>
                    <Typography variant="caption" color="text.secondary">Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</Typography>
                  </Paper>
                </Grid>
              )) : (
                <Grid size={{ xs: 12 }}>
                  <Box p={4} textAlign="center" color="text.secondary">
                    <Typography>No coupons found in this category.</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>

          {/* Leaderboard Snapshot */}
          <Card sx={{ mb: 4, borderRadius: 4, bgcolor: isDark ? "#1e293b" : "white", backgroundImage: "none" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <TrophyIcon color="warning" />
                <Typography variant="h6" fontWeight={700}>Leaderboard Snapshot</Typography>
              </Box>
              <List disablePadding>
                {leaderboardTop.map((u, i) => (
                  <ListItem key={i} sx={{
                    bgcolor: u.isMe ? (isDark ? "rgba(99, 102, 241, 0.1)" : "#eff6ff") : "transparent",
                    borderRadius: 2,
                    mb: 1
                  }}>
                    <Typography variant="h6" fontWeight={800} color="text.secondary" sx={{ width: 30 }}>#{u.rank}</Typography>
                    <ListItemText primary={u.name} primaryTypographyProps={{ fontWeight: u.isMe ? 700 : 400 }} />
                    <Typography fontWeight={700} color="primary.main">{u.points}p</Typography>
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>View Full Leaderboard</Button>
            </CardContent>
          </Card>

          {/* Upcoming Tasks - Replaces Achievements */}
          <Card sx={{ mb: 4, borderRadius: 4, bgcolor: isDark ? "#1e293b" : "white", backgroundImage: "none" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AssignmentIcon color="info" />
                <Typography variant="h6" fontWeight={700}>Upcoming Tasks</Typography>
              </Box>

              {tasks.filter(t => !t.awardedTo?.some(entry => entry.user === data.user.id)).slice(0, 3).length > 0 ? (
                <List disablePadding>
                  {tasks
                    .filter(t => !t.awardedTo?.some(entry => entry.user === data.user.id)) // Filter incomplete
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) // Sort by due date
                    .slice(0, 3) // Take top 3
                    .map((task, i) => (
                      <ListItem key={i} sx={{
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                        borderRadius: 2,
                        mb: 1,
                        py: 1
                      }}>
                        <ListItemText
                          primary={<Typography variant="subtitle2" fontWeight={600}>{task.title}</Typography>}
                          secondary={
                            <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                              <Chip label={`${task.points} pts`} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />
                              <Typography variant="caption" color="text.secondary">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Box textAlign="center" py={2} color="text.secondary">
                  <Typography variant="body2">No pending tasks! 🎉</Typography>
                </Box>
              )}

              <Button fullWidth variant="text" sx={{ mt: 2 }} onClick={() => navigate('/tasks')}>View All Tasks</Button>
            </CardContent>
          </Card>

          {/* Notifications (Mini) */}
          <Card sx={{ borderRadius: 4, bgcolor: isDark ? "#1e293b" : "white", backgroundImage: "none" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <BellIcon color="error" />
                <Typography variant="h6" fontWeight={700}>Notifications</Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: isDark ? "rgba(0,0,0,0.2)" : "#f1f5f9", borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", opacity: 0.7 }}>No new notifications</Typography>

              </Box>
            </CardContent>
          </Card>

          {/* Promo */}
          <Box mt={4} sx={{ p: 3, borderRadius: 4, background: "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)", textAlign: "center", color: "white" }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Campus Cash</Typography>
            <Typography variant="caption" display="block" sx={{ opacity: 0.7, mb: 2 }}>Where every achievement pays off.</Typography>
            <Button variant="outlined" color="inherit" size="small" sx={{ borderRadius: 20 }} onClick={() => navigate('/about')}>Learn More</Button>
          </Box>

        </Grid>
      </Grid>

      {/* --- Dialogs --- */}

      {/* Coupon Dialog */}
      <Dialog
        open={!!selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, bgcolor: "transparent", boxShadow: "none" }
        }}
      >
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setSelectedCoupon(null)}
            sx={{ position: "absolute", right: 0, top: -40, color: "white" }}
          >
            <CloseIcon />
          </IconButton>
          <BeautifulCoupon
            ref={couponRef}
            coupon={selectedCoupon}
            userName={data.user.name}
            isDark={isDark}
          />
          <Box display="flex" justifyContent="center" gap={2} mt={2}>
            <Button variant="contained" color="primary" onClick={() => handleDownloadCoupon('png')}>Download Image</Button>
          </Box>
        </Box>
      </Dialog>

      {/* Redeem Dialog */}
      {/* Redeem Dialog */}
      <Dialog
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 5, overflow: "hidden" } }}
      >
        <Grid container>
          {/* Left Side - Visual */}
          <Grid size={{ xs: 12, md: 5 }} sx={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            p: 4, position: "relative", overflow: "hidden", minHeight: { xs: 200, md: 400 }
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", opacity: 0.1 }}
            >
              <Box sx={{ width: 400, height: 400, borderRadius: "50%", border: "2px dashed white" }} />
            </motion.div>

            <motion.div
              animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ zIndex: 1, position: "relative", display: "flex", justifyContent: "center" }}
            >
              <img
                key={selectedReward} // Re-trigger animation on change if desired, or just swap src
                src={selectedReward.includes("Voucher") ? "/canteen-voucher.png" : selectedReward.includes("Library") ? "/library-pass.png" : selectedReward.includes("Self Redeem") ? "/self-redeem-coupon.jpg" : "/real-coffee.png"}
                alt="Reward Illustration"
                style={{ width: "100%", maxWidth: 320, filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.3))", borderRadius: "20px" }}
              />
            </motion.div>

            <Box sx={{ position: "absolute", bottom: 20, color: "white", opacity: 0.8, textAlign: "center", width: "100%" }}>
              <Typography variant="overline" fontWeight={700} sx={{ letterSpacing: 2 }}>PREMIUM REWARDS</Typography>
            </Box>
          </Grid>

          {/* Right Side - Form */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ p: { xs: 3, md: 5 }, bgcolor: isDark ? "#1e293b" : "#fff" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <DialogTitle sx={{ p: 0, fontSize: "1.75rem", fontWeight: 800 }}>Redeem Rewards</DialogTitle>
              <IconButton onClick={() => setRedeemOpen(false)}><CloseIcon /></IconButton>
            </Box>

            <DialogContent sx={{ p: 0, mt: 2, overflowY: "visible" }}> {/* overflow visible for shadows */}
              <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4 }}>
                Treat yourself! You've earned <b>{data.progress.points} points</b>. Select a reward below to redeem instantly.
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Select Reward</InputLabel>
                <Select
                  value={selectedReward}
                  label="Select Reward"
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedReward(val);
                    if (val === "Self Redeem Points Coupon") {
                      setRedeemPoints(0); // Allow user to type
                    } else {
                      const map = { "Free Coffee": 100, "Canteen Voucher ₹50": 150, "Library Pass": 200 };
                      setRedeemPoints(map[val] || 100);
                    }
                  }}
                  sx={{ borderRadius: 3, height: 60, mb: 2 }}
                >
                  <MenuItem value="Free Coffee">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "orange", width: 34, height: 34 }}><CoffeeIcon fontSize="small" /></Avatar>
                      <Box>
                        <Typography fontWeight={700} variant="body2">Free Coffee</Typography>
                        <Typography variant="caption" color="text.secondary">100 Points</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Canteen Voucher ₹50">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "green", width: 34, height: 34 }}><WalletIcon fontSize="small" /></Avatar>
                      <Box>
                        <Typography fontWeight={700} variant="body2">Canteen Voucher ₹50</Typography>
                        <Typography variant="caption" color="text.secondary">150 Points</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Library Pass">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "purple", width: 34, height: 34 }}><AssignmentIcon fontSize="small" /></Avatar>
                      <Box>
                        <Typography fontWeight={700} variant="body2">Library Pass</Typography>
                        <Typography variant="caption" color="text.secondary">200 Points</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Self Redeem Points Coupon">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "teal", width: 34, height: 34 }}><CouponIcon fontSize="small" /></Avatar>
                      <Box>
                        <Typography fontWeight={700} variant="body2">Self Redeem Points Coupon</Typography>
                        <Typography variant="caption" color="text.secondary">Custom Amount</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </Select>

                {selectedReward === "Self Redeem Points Coupon" && (
                  <TextField
                    autoFocus
                    label="Points to Redeem"
                    type="number"
                    fullWidth
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Number(e.target.value))}
                    helperText={`Max available: ${data.progress.points}`}
                    sx={{ mt: 1 }}
                  />
                )}
              </FormControl>

              <Box sx={{ mt: 4, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "grey.50", p: 3, borderRadius: 3, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px dashed", borderColor: "text.disabled" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">TOTAL COST</Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.main">{redeemPoints}<span style={{ fontSize: "1rem" }}>pts</span></Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary" display="block">BALANCE AFTER</Typography>
                  <Typography variant="h6" fontWeight={700} color={data.progress.points - redeemPoints < 0 ? "error" : "text.primary"}>
                    {data.progress.points - redeemPoints} pts
                  </Typography>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 0, mt: 4 }}>
              <Button onClick={() => setRedeemOpen(false)} size="large" color="inherit" sx={{ mr: 2 }}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleRedeem}
                disabled={redeemLoading || data.progress.points < redeemPoints}
                size="large"
                fullWidth
                sx={{ borderRadius: 2, height: 50, fontSize: "1rem", fontWeight: 700, boxShadow: "0 10px 20px -5px rgba(79, 70, 229, 0.4)" }}
              >
                {redeemLoading ? "Processing..." : "Confirm Redemption"}
              </Button>
            </DialogActions>
          </Grid>
        </Grid>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Profile
          <IconButton onClick={() => setProfileOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box position="relative">
              <Avatar
                src={profilePic ? URL.createObjectURL(profilePic) : data.user.avatar}
                sx={{ width: 100, height: 100, border: "4px solid white", boxShadow: 3 }}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" }
                }}
                component="label"
              >
                <input hidden type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} />
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ mt: 1, opacity: 0.7 }}>Tap icon to change photo</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Year / Class</InputLabel>
                <Select
                  label="Year / Class"
                  value={form.year || ""}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                >
                  <MenuItem value="Year 1">Year 1</MenuItem>
                  <MenuItem value="Year 2">Year 2</MenuItem>
                  <MenuItem value="Year 3">Year 3</MenuItem>
                  <MenuItem value="Year 4">Year 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. CSE, ECE"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">CHANGE PASSWORD</Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={form.confirmPassword || ""} // Added confirm password to local form state management (need to add to initial state if not there, or just handle here)
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProfileOpen(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (form.newPassword && form.newPassword !== form.confirmPassword) {
                setError("Passwords do not match");
                return;
              }
              handleProfileUpdate();
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>


      {/* History Dialog */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Full History
          <IconButton onClick={() => setHistoryOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List disablePadding>
            {recentActivity.map((item, idx) => (
              <React.Fragment key={idx}>
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <Box sx={{ p: 1, borderRadius: "50%", bgcolor: `${item.color}20`, color: item.color }}>
                      <item.icon />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography fontWeight={600} color={isDark ? "white" : "text.primary"}>{item.title}</Typography>}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">{item.time.toLocaleString()}</Typography>
                        {item.points && <Typography variant="caption" color={item.points.toString().includes('+') ? "success.main" : "error"}>{item.points} pts</Typography>}
                      </Box>
                    }
                  />
                </ListItem>
                {idx < recentActivity.length - 1 && <Divider component="li" variant="inset" />}
              </React.Fragment>
            ))}
            {recentActivity.length === 0 && <Box p={3} textAlign="center">No activity found.</Box>}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

    </Box >
  );
};

export default Userdash;
