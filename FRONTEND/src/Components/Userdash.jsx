// src/components/Userdash.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTheme as useMuiTheme } from "@mui/material/styles";
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
} from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import axios from "axios";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

/* ---------- Beautiful Coupon Component ---------- */
const BeautifulCoupon = React.forwardRef(({ coupon, userName, isDark }, ref) => {
  if (!coupon) return null;

  const expiresText = coupon.expiresAt
    ? new Date(coupon.expiresAt).toLocaleDateString()
    : "No expiry";

  const usedAtText =
    coupon.usedAt ? new Date(coupon.usedAt).toLocaleString() : null;

  const qrValue = JSON.stringify({
    code: coupon.code,
    reward: coupon.rewardName,
    userId: coupon.userId,
  });

  // Theme-aware colors
  const bgGradient = isDark
    ? "linear-gradient(135deg, #111827 0%, #1f2937 40%, #0f766e 100%)"
    : "linear-gradient(135deg, #e0f2fe 0%, #cffafe 40%, #99f6e4 100%)";
  const textColor = isDark ? "white" : "#0c4a3e";
  const textOpacity = isDark ? 0.9 : 0.85;
  const textOpacityDark = isDark ? 0.8 : 0.75;

  return (
    <Box
      ref={ref}
      sx={{
        mt: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 420 },
          background: bgGradient,
          color: textColor,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: isDark ? "0 18px 40px rgba(15,23,42,0.6)" : "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >

        {/* --- USED BANNER --- */}
        {coupon.isUsed && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: -40,
              transform: "rotate(45deg)",
              background: "#dc2626",
              color: "white",
              px: 6,
              py: 1,
              fontWeight: "bold",
              zIndex: 20,
              fontSize: "0.9rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
            }}
          >
            USED
          </Box>
        )}

        {/* perforated circles */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: -16,
            transform: "translateY(-50%)",
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: isDark ? "#f9fafb" : "#0f172a",
            opacity: isDark ? 1 : 0.8,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: -16,
            transform: "translateY(-50%)",
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: isDark ? "#f9fafb" : "#0f172a",
            opacity: isDark ? 1 : 0.8,
          }}
        />

        {/* subtle patternnn */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: isDark
              ? "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1px, transparent 0)"
              : "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)",
            backgroundSize: "14px 14px",
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />

        {/* top ribbon */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            px: 2,
            py: 0.5,
            background:
              "linear-gradient(90deg, rgba(251,191,36,0.95), rgba(249,115,22,0.95))",
            borderBottomRightRadius: 16,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#000" }}
          >
            Campus Cash Reward
          </Typography>
        </Box>

        {/* main body */}
        <Box sx={{ display: "flex", p: 3, gap: 2, position: "relative", zIndex: 1 }}>
          {/* left info */}
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography
              variant="overline"
              sx={{ opacity: textOpacityDark, letterSpacing: 2, color: textColor }}
            >
              COUPON CODE
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: 3,
                mt: 0.5,
                mb: 1,
                fontFamily: "monospace",
                color: textColor,
              }}
            >
              {coupon.code}
            </Typography>

            <Typography variant="body2" sx={{ opacity: textOpacity, mb: 0.5, color: textColor }}>
              Reward:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: textColor }}>
              {coupon.rewardName}
            </Typography>

            <Typography variant="body2" sx={{ opacity: textOpacity, color: textColor }}>
              Issued to:{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {userName || "Student"}
              </Box>
            </Typography>

            <Typography variant="body2" sx={{ opacity: textOpacityDark, color: textColor }}>
              Points used:{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {coupon.pointsUsed}
              </Box>
            </Typography>

            <Typography variant="body2" sx={{ opacity: textOpacityDark, mt: 0.5, color: textColor }}>
              Expires on:{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {expiresText}
              </Box>
            </Typography>

            {coupon.isUsed && (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? "#fca5a5" : "#dc2626", mt: 1, fontWeight: 600 }}
                >
                  Used At: {usedAtText}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: isDark ? "#fca5a5" : "#dc2626", fontWeight: 600 }}
                >
                  Used By: {coupon.usedBy || "Store"}
                </Typography>
              </>
            )}
          </Box>

          {/* QR */}
          <Box
            sx={{
              width: 120,
              minWidth: 120,
              bgcolor: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)",
              borderRadius: 3,
              p: 1.2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              border: isDark ? "1px solid rgba(148,163,184,0.6)" : "1px solid rgba(0,0,0,0.2)",
            }}
          >
            <Box sx={{ p: 1, bgcolor: "white", borderRadius: 2, mb: 1 }}>
              <QRCode
                value={qrValue}
                size={90}
                style={{ height: "90px", width: "90px" }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ textAlign: "center", fontSize: "0.65rem", opacity: 0.85, color: isDark ? "white" : "#0c4a3e" }}
            >
              Scan at counter
            </Typography>
          </Box>
        </Box>
        {/* dashed separator */}
        <Box
          sx={{
            position: "relative",
            px: 3,
            pb: 1.5,
            pt: 0.5,
          }}
        >
          <Box
            sx={{
              borderTop: "1px dashed rgba(148,163,184,0.7)",
              width: "100%",
              mb: 1,
            }}
          />
          <Typography
            variant="caption"
            sx={{ opacity: 0.7, fontSize: "0.7rem" }}
          >
            Terms: This coupon is valid once and must be shown at the campus
            store before expiry.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

/* ---------- Main Dashboard Component ---------- */
const Userdash = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [userId, setUserId] = useState(null);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [userYear, setUserYear] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false); // becomes true once user info is fetched

  // Submission UI
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState(null);
  const [submissionType, setSubmissionType] = useState('link');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // Quiz UI
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedQuizTask, setSelectedQuizTask] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  const handleSubmitSubmission = async () => {
    if (!selectedTaskToSubmit || !userId) return;
    try {
      setSubmissionLoading(true);
      const fd = new FormData();
      fd.append('type', submissionType);
      fd.append('userId', userId);
      if (submissionType === 'file' && submissionFile) fd.append('file', submissionFile);
      if (submissionType === 'link') fd.append('link', submissionLink);
      if (submissionType === 'text') fd.append('text', submissionText);

      const res = await axios.post(`${baseurl}/api/tasks/${selectedTaskToSubmit._id}/submit`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Submitted successfully');
      setError('');
      setSubmissionOpen(false);
      setSubmissionFile(null);
      setSubmissionLink('');
      setSubmissionText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const openQuiz = (t) => {
    setSelectedQuizTask(t);
    setQuizAnswers(Array(t.quiz?.questions?.length || 0).fill(null));
    setQuizOpen(true);
  };

  const submitQuiz = async () => {
    if (!selectedQuizTask || !userId) return;
    if (quizAnswers.some((a) => a === null || a === undefined)) {
      setError('Please answer all questions before submitting');
      return;
    }
    try {
      setQuizLoading(true);
      const payload = { type: 'quiz', userId, answers: quizAnswers };
      const res = await axios.post(`${baseurl}/api/tasks/${selectedQuizTask._id}/submit`, payload);
      const submission = res.data.submission;
      setSuccess(`You scored ${submission.score}% — ${submission.passed ? 'Passed' : 'Failed'}`);
      setError('');

      // If server returned updated user points, update local points display
      if (res.data.user) {
        const updated = res.data.user;
        setData((prev) => ({ ...prev, progress: { ...prev.progress, points: updated.points } }));
      }

      setQuizOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Quiz submission failed');
    } finally {
      setQuizLoading(false);
    }
  };

  // Redeem dialog
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState("Free Coffee");

  // Coupons
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [redeemPoints, setRedeemPoints] = useState(100);
  const couponRef = useRef(null);

  // Base URL
  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const rewardPointsMap = {
    "Free Coffee": 100,
    "Canteen Voucher ₹50": 150,
    "Library Pass": 200,
  };

  const getRemainingTime = (dueDateString) => {
    const now = new Date();
    const due = new Date(dueDateString);
    const diffMs = due - now;

    if (diffMs <= 0) return "Time over";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day(s) left`;
    if (diffHours > 0) return `${diffHours} hour(s) left`;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} min left`;
  };

  const isExpired = (coupon) =>
    coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

  /* ---------------- Fetch coupons ---------------- */
  const fetchCoupons = async (uid) => {
    try {
      const res = await axios.get(`${baseurl}/api/users/${uid}/coupons`);
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  /* ---------------- Fetch user & coupons ---------------- */
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    // If there is no logged-in user, still allow tasks to be fetched (global tasks)
    if (!storedUser) {
      console.debug("Userdash: no stored user found, proceeding to load tasks without year filter");
      setUserLoaded(true);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);

      axios
        .get(`${baseurl}/api/${parsedUser.id}`)
        .then((res) => {
          const user = res.data;
          // store user's year for task filtering
          if (user.yearClassDept) setUserYear(user.yearClassDept);
          setForm({
            fullName: user.fname || user.fullName || "",
            email: user.email || "",
            currentPassword: "",
            newPassword: "",
          });

          if (user.profilePic) setPreview(`${baseurl}${user.profilePic}`);

          setData({
            user: {
              name: user.fname || user.fullName,
              avatar: user.profilePic
                ? `${baseurl}${user.profilePic}`
                : "https://i.pravatar.cc/150?u=" + user._id,
            },
            progress: {
              points: user.points || 0,
              rank: 4,
              nextReward: {
                name: "Free Coffee",
                remaining: 100 - (user.points || 0),
                total: 1500,
              },
              streak: {
                days: 5,
                badge: "Taskmaster",
              },
            },
          });

          fetchCoupons(parsedUser.id);
          setUserLoaded(true);
        })
        .catch((err) => {
          console.error("User fetch failed:", err);
          // still allow tasks to fetch even if user fetch failed
          setUserLoaded(true);
        });
    } catch (parseErr) {
      console.error("Could not parse stored user:", parseErr);
      setUserLoaded(true);
    }
  }, [baseurl]);

  /* ---------------- Fetch Active Tasks ---------------- */
  const fetchActiveTasks = async () => {
    try {
      setTasksLoading(true);
      const params = userYear ? { year: userYear } : {};
      console.debug("fetchActiveTasks: calling /api/tasks/active", { params });
      const res = await axios.get(`${baseurl}/api/tasks/active`, { params });
      console.debug("fetchActiveTasks: response length", (res.data || []).length);
      const now = new Date();
      const activeOnly = (res.data || []).filter(
        (t) => new Date(t.dueDate) >= now
      );
      console.debug("fetchActiveTasks: activeOnly length", activeOnly.length);
      setTasks(activeOnly);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    // Wait for user info to be available before fetching tasks to avoid brief flicker
    if (!baseurl || !userLoaded) return;
    fetchActiveTasks();
    const interval = setInterval(fetchActiveTasks, 60 * 1000);
    return () => clearInterval(interval);
  }, [baseurl, userYear, userLoaded]);
  /* ---------------- Form Change ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- Profile Pic Change ---------------- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  /* ---------------- Save Profile ---------------- */
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      if (form.currentPassword)
        formData.append("currentPassword", form.currentPassword);
      if (form.newPassword) formData.append("newPassword", form.newPassword);
      if (profilePic) formData.append("profilePic", profilePic);

      const res = await axios.put(`${baseurl}/api/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.message);
      setError("");
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      setOpenDialog(false);

      const updatedUser = res.data.user;
      setData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          name: updatedUser.fullName || updatedUser.fname,
          avatar: updatedUser.profilePic
            ? `${baseurl}${updatedUser.profilePic}`
            : prev.user.avatar,
        },
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
      setSuccess("");
    }
  };

  /* ---------------- Redeem Points ---------------- */
  const handleRedeem = async () => {
    if (!userId) return;
    try {
      setRedeemLoading(true);
      const res = await axios.post(`${baseurl}/api/users/${userId}/redeem`, {
        rewardName: selectedReward,
        pointsToRedeem: redeemPoints,
      });
      // Support multiple response shapes from the API:
      // - { user, coupon, message }
      // - coupon object directly: { code, reward, userId, ... }
      const resp = res.data || {};
      const newCoupon = resp.coupon ?? (resp.code ? resp : null);
      const user = resp.user ?? null;
      const message = resp.message ?? null;

      // If user info present, update points
      if (user) {
        setData((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            points: user.points,
            nextReward: {
              ...prev.progress.nextReward,
              remaining: 100 - user.points,
            },
          },
        }));
      }

      if (newCoupon) {
        setCoupons((prev) => [newCoupon, ...prev]);
        setSelectedCoupon(newCoupon);
        // Show only coupon code in the success snackbar
        setSuccess(newCoupon.code ?? message ?? "Redeemed successfully!");
      } else {
        setSuccess(message ?? "Redeemed successfully!");
      }

      setError("");
      setRedeemOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Redemption failed");
      setSuccess("");
    } finally {
      setRedeemLoading(false);
    }
  };

  /* ---------------- Download TXT ---------------- */
  const handleDownloadCouponTxt = () => {
    if (!selectedCoupon) return;
    const c = selectedCoupon;

    const content = `Campus Cash Coupon
Coupon Code: ${c.code}
Reward: ${c.rewardName}
Points Used: ${c.pointsUsed}
Expires At: ${
      c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "N/A"
    }
User ID: ${c.userId}
Status: ${c.isUsed ? "USED" : "ACTIVE"}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coupon-${c.code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------- Download Image ---------------- */
  const downloadCouponImage = async () => {
    if (!couponRef.current || !selectedCoupon) return;
    const canvas = await html2canvas(couponRef.current, { scale: 2 });
    const image = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = image;
    a.download = `coupon-${selectedCoupon.code}.png`;
    a.click();
  };

  /* ---------------- Sync Coupon Status After Store Validation ---------------- */
  const _updateCouponStatus = async (couponCode) => {
    try {
      const res = await axios.get(`${baseurl}/api/coupons/status/${couponCode}`);

      if (res.data?.isUsed !== undefined) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.code === couponCode ? { ...c, isUsed: res.data.isUsed } : c
          )
        );

        if (selectedCoupon?.code === couponCode) {
          setSelectedCoupon((prev) => ({
            ...prev,
            isUsed: res.data.isUsed,
          }));
        }
      }
    } catch (error) {
      console.error("Error syncing coupon:", error);
    }
  };
  /* ----------------- UI START ----------------- */

  if (!data) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 4, bgcolor: "#f9f9ff", minHeight: "100vh" }}>

      {/* Profile Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar src={data.user.avatar} sx={{ width: 60, height: 60 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Welcome back, {data.user.name}!
          </Typography>
          <Typography color="green">
            You’ve earned {data.progress.points} points 🎉
          </Typography>
          <Typography variant="body2">
            Leaderboard Rank: #{data.progress.rank}
          </Typography>
          <Button variant="outlined" sx={{ mt: 1 }} onClick={() => setOpenDialog(true)}>
            Edit Profile
          </Button>
        </Box>
      </Box>


      {/* ---------------- POINTS CARD ---------------- */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">My Points</Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {data.progress.points} pts
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {data.progress.nextReward.remaining} pts to next reward ({data.progress.nextReward.name})
              </Typography>

              <LinearProgress
                variant="determinate"
                value={(data.progress.points / data.progress.nextReward.total) * 100}
                sx={{ mt: 2, height: 10, borderRadius: 5 }}
              />

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                disabled={data.progress.points < 100}
                onClick={() => {
                  setRedeemOpen(true);
                  setRedeemPoints(rewardPointsMap[selectedReward] || 100);
                }}
              >
                Redeem Points
              </Button>

              {data.progress.points < 100 && (
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  You need at least 100 points to redeem.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>


        {/* ------------------- STREAK CARD ------------------- */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Streak</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalFireDepartmentIcon color="error" />
                <Typography>{data.progress.streak.days}-day streak!</Typography>
              </Box>
              <Chip label={`Badge: ${data.progress.streak.badge}`} color="success" sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* ---------------- TASK LIST ---------------- */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Assigned Tasks
        </Typography>

        {tasksLoading && <LinearProgress sx={{ mb: 2 }} />}

        {!tasksLoading && tasks.length === 0 && (
          <Typography color="text.secondary">🎉 No active tasks right now.</Typography>
        )}

        <Grid container spacing={2}>
          {tasks.map((t) => (
            <Grid size={{ xs: 12, md: 6 }} key={t._id}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">{t.title}</Typography>

                    <Chip label={t.category || "General"} size="small" color="primary" variant="outlined" />
                  </Box>

                  {t.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                      {t.description}
                    </Typography>
                  )}

                  <Typography variant="body2">
                    <strong>Due:</strong> {new Date(t.dueDate).toLocaleString()}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Points:</strong> {t.points}
                  </Typography>

                  <Chip label={getRemainingTime(t.dueDate)} size="small" color="secondary" />

                  {/* Action Buttons */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {t.category === 'Quiz' ? (
                      <>
                        <Button variant="contained" size="small" onClick={() => openQuiz(t)}>Take Quiz</Button>
                        <Button variant="outlined" size="small" onClick={() => window.open(`/task-info/${t._id}`, '_blank')}>View</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="contained" size="small" onClick={() => {
                          setSelectedTaskToSubmit(t);
                          setSubmissionType('link');
                          setSubmissionOpen(true);
                        }}>
                          Submit
                        </Button>
                        <Button variant="outlined" size="small" onClick={() => window.open(`/task-info/${t._id}`, '_blank')}>View</Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Submission dialog */}
      <Dialog open={submissionOpen} onClose={() => setSubmissionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit work for task</DialogTitle>
        <DialogContent>
          {selectedTaskToSubmit && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{selectedTaskToSubmit.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedTaskToSubmit.description}</Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Submission Type</InputLabel>
                <Select
                  value={submissionType}
                  label="Submission Type"
                  onChange={(e) => setSubmissionType(e.target.value)}
                >
                  <MenuItem value="file">File Upload</MenuItem>
                  <MenuItem value="link">Link / URL</MenuItem>
                  <MenuItem value="text">Text / Comment</MenuItem>
                </Select>
              </FormControl>

              {submissionType === 'file' && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" component="label">Upload File
                    <input type="file" hidden onChange={(e) => setSubmissionFile(e.target.files[0])} />
                  </Button>
                  {submissionFile && <Typography variant="caption" sx={{ ml: 2 }}>{submissionFile.name}</Typography>}
                </Box>
              )}

              {submissionType === 'link' && (
                <TextField fullWidth label="Link (URL)" sx={{ mt: 2 }} value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} />
              )}

              {submissionType === 'text' && (
                <TextField fullWidth multiline rows={4} label="Comments" sx={{ mt: 2 }} value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} />
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setSubmissionOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmitSubmission} disabled={submissionLoading}>{submissionLoading ? 'Submitting...' : 'Submit'}</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>


      {/* Quiz dialog */}
      <Dialog open={quizOpen} onClose={() => setQuizOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Take Quiz</DialogTitle>
        <DialogContent>
          {selectedQuizTask && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{selectedQuizTask.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedQuizTask.description}</Typography>

              {selectedQuizTask.quiz?.questions?.map((q, idx) => (
                <Box key={idx} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">{idx + 1}. {q.text}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                    {q.options.map((opt, oi) => (
                      <Button key={oi} size="small" variant={quizAnswers[idx] === oi ? 'contained' : 'outlined'} sx={{ mb: 1, textTransform: 'none' }} onClick={() => setQuizAnswers(prev => { const arr = [...prev]; arr[idx] = oi; return arr; })}>{opt}</Button>
                    ))}
                  </Box>
                </Box>
              ))}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setQuizOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={submitQuiz} disabled={quizLoading}>{quizLoading ? 'Submitting...' : 'Submit Quiz'}</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>


      {/* ---------------- COUPON LIST ---------------- */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: isDark ? "#ffffff" : "#212121" }}>
          My Coupons
        </Typography>

        {coupons.length === 0 ? (
          <Typography color="text.secondary">You have not redeemed any coupons yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {coupons.map((c) => {
              const expired = isExpired(c);
              const used = c.isUsed;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c._id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      cursor: "pointer",
                      backgroundColor: isDark ? "#1e1e2e" : "#ffffff",
                      color: isDark ? "#ffffff" : "#212121",
                      border:
                        used ? "2px solid #fca5a5" :
                        expired ? "2px solid #fcd34d" :
                        "2px solid #86efac",
                      transition: "transform 0.2s, boxShadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: isDark ? "0 8px 24px rgba(100, 68, 230, 0.3)" : "0 8px 24px rgba(100, 68, 230, 0.15)",
                      }
                    }}
                    onClick={() => setSelectedCoupon(c)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ color: isDark ? "#ffffff" : "#212121" }}>
                          {c.rewardName}
                        </Typography>

                        <Chip
                          label={
                            used ? "USED" :
                            expired ? "EXPIRED" :
                            "ACTIVE"
                          }
                          size="small"
                          color={
                            used ? "error" :
                            expired ? "warning" :
                            "success"
                          }
                        />
                      </Box>

                      <Typography variant="body2" sx={{ mt: 1, color: isDark ? "#b0b0b0" : "#666666" }}>
                        Code: <strong style={{ color: isDark ? "#ffffff" : "#212121" }}>{c.code}</strong>
                      </Typography>

                      <Typography variant="body2" sx={{ color: isDark ? "#b0b0b0" : "#666666" }}>
                        Points: <strong style={{ color: isDark ? "#ffffff" : "#212121" }}>{c.pointsUsed}</strong>
                      </Typography>

                      {c.expiresAt && (
                        <Typography variant="body2" sx={{ mt: 1, color: isDark ? "#b0b0b0" : "#666666" }}>
                          Expiry: {new Date(c.expiresAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>


      {/* ---------------- SELECTED COUPON DISPLAY ---------------- */}
      {selectedCoupon && (
        <>
          <BeautifulCoupon
            ref={couponRef}
            coupon={selectedCoupon}
            userName={data.user.name}
            isDark={isDark}
          />

          <Box
            sx={{
              textAlign: "center",
              mt: 2,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button variant="outlined" onClick={handleDownloadCouponTxt}>
              Download (.txt)
            </Button>

            <Button variant="contained" color="success" onClick={downloadCouponImage}>
              Download (Image)
            </Button>
          </Box>
        </>
      )}


      {/* ---------------- PROFILE DIALOG ---------------- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" mb={2}>
            <Avatar src={preview || data.user.avatar} sx={{ width: 100, height: 100 }} />
          </Box>

          <Button variant="outlined" component="label" fullWidth>
            Upload Profile Picture
            <input type="file" hidden onChange={handleFileChange} />
          </Button>

          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            sx={{ mt: 3 }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            sx={{ mt: 3 }}
          />

          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            sx={{ mt: 3 }}
          />

          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            sx={{ mt: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 4, py: 1.5 }}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>


      {/* ---------------- REDEEM DIALOG ---------------- */}
      <Dialog open={redeemOpen} onClose={() => setRedeemOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Redeem Points</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You currently have <strong>{data.progress.points}</strong> points.
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Reward</InputLabel>
            <Select
              value={selectedReward}
              label="Reward"
              onChange={(e) => {
                const v = e.target.value;
                setSelectedReward(v);
                setRedeemPoints(rewardPointsMap[v]);
              }}
            >
              <MenuItem value="Free Coffee">Free Coffee (100 pts)</MenuItem>
              <MenuItem value="Canteen Voucher ₹50">Canteen Voucher ₹50 (150 pts)</MenuItem>
              <MenuItem value="Library Pass">Library Pass (200 pts)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Points to Redeem"
            value={redeemPoints}
            onChange={(e) => setRedeemPoints(Number(e.target.value))}
            sx={{ mt: 2 }}
            inputProps={{
              min: 50,
              max: data.progress.points,
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setRedeemOpen(false)}>Cancel</Button>

          <Button
            variant="contained"
            onClick={handleRedeem}
            disabled={redeemLoading || redeemPoints < 50}
          >
            {redeemLoading ? "Processing..." : "Redeem"}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ---------------- SNACKBARS ---------------- */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

    </Box>
  );
};

export default Userdash;
