import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  Divider,
  Container
} from "@mui/material";
import {
  QrCodeScanner,
  ContentCopy,
  CheckCircleOutline,
  Search,
  Refresh,
  Check,
  Store as StoreIcon,
  ReceiptLong,
  Assessment,
  History,
  Download,
  Close,
  Edit
} from "@mui/icons-material";

import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Tooltip as MuiTooltip } from "@mui/material"; // Alias to avoid conflict with Recharts if used
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

dayjs.extend(relativeTime);

// --- Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const StorePage = () => {
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const { isDark } = useTheme();

  // --- Logic State (Preserved) ---
  const [storeName, setStoreName] = useState(() => localStorage.getItem("storeName") || "");
  const [editingStore, setEditingStore] = useState(false);
  const [tempStoreName, setTempStoreName] = useState(storeName);

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [openQR, setOpenQR] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");

  const [loadingLogs, setLoadingLogs] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [scannerConstraints, setScannerConstraints] = useState({ facingMode: "environment" });
  const [scannerError, setScannerError] = useState(null);

  // --- Report State ---
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // --- Handlers (Preserved Logic) ---
  const handleScanError = (err) => {
    console.error("QR Scanner error:", err);
    setScannerError(err);
    if (err && (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError")) {
      if (scannerConstraints.facingMode === "user") {
        setSnack({ open: true, message: "No camera available.", severity: "error" });
        setOpenQR(false);
        return;
      }
      setSnack({ open: true, message: "Switching to front camera...", severity: "warning" });
      setScannerConstraints({ facingMode: "user" });
      return;
    }
    setSnack({ open: true, message: err.message || "Camera error", severity: "error" });
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setLogs([]);
    try {
      const res = await axios.get(`${baseurl}/api/coupons/logs`);
      setLogs(res.data || []);
      setSnack({ open: true, message: "Logs updated", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: "Failed to load logs", severity: "error" });
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchMonthlyReport = async (monthStr = reportMonth) => {
    const [year, month] = monthStr.split("-").map(Number);
    setLoadingMonthly(true);
    try {
      const res = await axios.get(`${baseurl}/api/coupons/monthly?year=${year}&month=${month}`);
      setMonthlyReport(res.data);
    } catch (err) {
      setSnack({ open: true, message: "Failed to load monthly report", severity: "error" });
    } finally {
      setLoadingMonthly(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchMonthlyReport();
  }, []);

  // Auto-refresh logic
  // Auto-refresh logic (Countdown)
  const [countdown, setCountdown] = useState(5);

  const handleRefresh = () => {
    setResult(null);
    setCode("");
    setError("");
    setVerifying(false);
    setCountdown(5); // Reset countdown
  };

  useEffect(() => {
    let interval;
    if (result && !confirmOpen) {
      setCountdown(5); // Ensure reset on new result
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleRefresh();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [result, confirmOpen]);

  const verifyCoupon = async (couponCode) => {
    if (!couponCode) return setSnack({ open: true, message: "Enter a coupon code", severity: "warning" });
    setVerifying(true);
    try {
      const res = await axios.get(`${baseurl}/api/coupons/verify/${couponCode}`);
      setResult(res.data.coupon);
      setError("");
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.message || "Invalid coupon");
    } finally {
      setVerifying(false);
    }
  };

  const extractCodeFromString = (input) => {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        const obj = Array.isArray(parsed) ? parsed[0] : parsed;
        if (!obj) return null;
        if (typeof obj === "string") return obj;
        if (obj.code) return obj.code;
        if (obj.coupon && obj.coupon.code) return obj.coupon.code;
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (typeof val === "string" && val.match(/CPN-|[A-Z0-9-]{6,}/i)) return val;
        }
      } catch { }
    }
    return null;
  };

  const acceptCoupon = async () => {
    if (!result?.code) return;
    if (!storeName.trim()) {
      setSnack({ open: true, message: "Please enter a store name first", severity: "warning" });
      return;
    }
    setAccepting(true);
    try {
      const res = await axios.post(`${baseurl}/api/coupons/use`, { code: result.code, storeName });
      setResult(res.data.coupon);
      setError("");
      setSnack({ open: true, message: `Coupon accepted!`, severity: "success" });
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || "Could not accept coupon");
      setSnack({ open: true, message: "Failed to accept", severity: "error" });
    } finally {
      setAccepting(false);
      setConfirmOpen(false);
    }
  };

  const handleSaveStore = () => {
    if (!tempStoreName.trim()) return setSnack({ open: true, message: "Name required", severity: "warning" });
    setStoreName(tempStoreName);
    localStorage.setItem("storeName", tempStoreName);
    setEditingStore(false);
    setSnack({ open: true, message: "Store name updated", severity: "success" });
  };

  const handleQRScan = (scanned) => {
    if (!scanned) return;
    const scannedCode = scanned[0]?.rawValue;
    if (scannedCode) {
      const extracted = extractCodeFromString(scannedCode) || scannedCode;
      setCode(extracted);
      verifyCoupon(extracted);
      setOpenQR(false);
    }
  };

  const acceptLogCoupon = async (couponCode) => {
    if (!storeName.trim()) return setSnack({ open: true, message: "Set store name first", severity: "warning" });
    try {
      await axios.post(`${baseurl}/api/coupons/use`, { code: couponCode, storeName });
      setSnack({ open: true, message: "Coupon accepted", severity: "success" });
      fetchLogs();
    } catch (err) {
      setSnack({ open: true, message: "Failed to accept", severity: "error" });
    }
  };

  const copyCode = async (text) => {
    try { await navigator.clipboard.writeText(text); setSnack({ open: true, message: "Copied!", severity: "success" }); } catch { }
  };

  // --- Downloads (PDF/CSV) ---
  const downloadMonthlyCSV = () => {
    // (Preserved logic)
    if (!monthlyReport?.logs?.length) return;
    const rows = monthlyReport.logs.map((l) => ({
      Store: l.usedByStore || "",
      User: l.userId?.fname ? `${l.userId.fname} ${l.userId.ename || ''}` : "",
      Reward: l.rewardName || "",
      Code: l.code || "",
      Points: l.pointsUsed || 0,
      UsedAt: l.usedAt ? new Date(l.usedAt).toLocaleString() : "",
    }));
    const header = Object.keys(rows[0]);
    const csv = [header.join(",")].concat(rows.map(r => header.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `monthly_receipt_${reportMonth}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const downloadMonthlyPDF = () => {
    if (!monthlyReport?.logs?.length) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    // ... (Preserve exact PDF generation logic found in original) ...
    // For brevity in this rewrite plan, assume complete PDF code block is re-inserted here.
    // START PRESERVED PDF CODE
    const margin = 14;
    const generatedAt = new Date().toLocaleString();
    const pointVal = monthlyReport?.totals?.pointValue ?? 0.15;
    const formatCurrency = (val) => `Rs. ${val.toFixed(2)}`;
    const centerX = pageWidth / 2;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text('SNS Store', centerX, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text('Nirmala college of arts and science / Campus Store', centerX, 26, { align: 'center' });
    doc.text('Kunnappily, Meloor, Chalakudy - 680307', centerX, 30, { align: 'center' });
    doc.text('Phone: +91-12345-67890', centerX, 34, { align: 'center' });
    const receiptNo = `R-${reportMonth.replace('-', '')}-${Date.now().toString().slice(-6)}`;
    doc.setFontSize(9);
    doc.text(`Receipt: ${receiptNo}`, pageWidth - margin, 20, { align: 'right' });
    doc.text(`Month: ${reportMonth}`, pageWidth - margin, 26, { align: 'right' });
    doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 32, { align: 'right' });
    doc.setLineWidth(0.6); doc.line(margin, 38, pageWidth - margin, 38);
    const columns = ['#', 'Date', 'Store', 'Code', 'Reward', 'Pts', 'INR'];
    const rows = monthlyReport.logs.map((l, idx) => {
      const inr = (l.pointsUsed || 0) * pointVal;
      const date = l.usedAt ? new Date(l.usedAt).toLocaleString() : '-';
      return [idx + 1, date, l.usedByStore || '-', l.code || '-', l.rewardName || '-', l.pointsUsed || 0, formatCurrency(inr)];
    });
    autoTable(doc, {
      head: [columns], body: rows, startY: 42, theme: 'striped', styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 245, 245], textColor: 20 },
      columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 }, 3: { cellWidth: 34 }, 4: { cellWidth: 40 }, 5: { cellWidth: 12 }, 6: { cellWidth: 22 } },
      didDrawPage: function (data) { const h = doc.internal.pageSize.getHeight(); doc.setDrawColor(200); doc.rect(margin - 2, 10, pageWidth - (margin - 2) * 2, h - 20); }
    });
    const finalY = doc.lastAutoTable?.finalY || 42;
    const totalBoxWidth = 80; const totalBoxX = pageWidth - margin - totalBoxWidth; const totalBoxY = finalY + 8;
    doc.setFillColor(250, 250, 250); doc.rect(totalBoxX, totalBoxY, totalBoxWidth, 24, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    const totalPoints = monthlyReport.totals?.totalPoints ?? 0;
    const totalINR = monthlyReport.totals?.totalINR ?? +(totalPoints * pointVal).toFixed(2);
    doc.text(`Items: ${monthlyReport.totals?.totalCount ?? 0}`, totalBoxX + 6, totalBoxY + 8);
    doc.text(`Points: ${totalPoints}`, totalBoxX + 6, totalBoxY + 13);
    doc.text(`Total: ${formatCurrency(totalINR)}`, totalBoxX + 6, totalBoxY + 20);
    const footerY = doc.internal.pageSize.getHeight() - 40; doc.setLineWidth(0.3); doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFontSize(10); doc.text('Thank you for your business!', centerX, footerY + 8, { align: 'center' });
    const signY = footerY + 20; doc.line(pageWidth - margin - 70, signY, pageWidth - margin, signY); doc.text('Authorized Signature', pageWidth - margin - 70, signY + 6);
    doc.save(`monthly_receipt_${reportMonth}.pdf`);
    // END PRESERVED PDF CODE
  };

  // --- Filtering ---
  const filteredLogs = logs.filter((l) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (l.userId?.fname || "").toLowerCase().includes(q) || (l.code || "").toLowerCase().includes(q) || (l.rewardName || "").toLowerCase().includes(q);
  });
  const filteredAndStatus = filteredLogs.filter(l => statusFilter === "all" ? true : statusFilter === "used" ? l.isUsed : !l.isUsed);

  // --- Render Helpers ---
  const glassStyle = {
    background: isDark ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: 4,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)"}`,
    boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(31, 38, 135, 0.1)"
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: isDark ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      color: isDark ? "#fff" : "#020617",
      pb: 8
    }}>
      {/* HEADER */}
      <Box sx={{
        py: 4, px: { xs: 2, md: 6 },
        background: isDark ? "rgba(15, 23, 42, 0.6)" : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ p: 1.5, borderRadius: 3, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)" }}>
              <StoreIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: "-0.5px", color: isDark ? 'white' : '#0f172a' }}>Store Portal</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ color: isDark ? 'text.secondary' : '#334155', fontWeight: 'bold' }}>Active Store:</Typography>
                <Chip
                  label={storeName || "Not Set"}
                  color={storeName ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: "bold" }}
                  onClick={() => { setTempStoreName(storeName); setEditingStore(true); }}
                />
              </Stack>
            </Box>
          </Stack>
          <Button
            startIcon={editingStore ? <Check /> : <Edit />}
            variant="outlined"
            sx={{ borderRadius: 3, borderWidth: 2, borderColor: isDark ? "rgba(255,255,255,0.2)" : "#4f46e5", color: isDark ? 'white' : '#4f46e5' }}
            onClick={() => {
              if (editingStore) handleSaveStore();
              else { setTempStoreName(storeName); setEditingStore(true); }
            }}
          >
            {editingStore ? "Save Changes" : "Edit Store Info"}
          </Button>
        </Stack>
      </Box>

      {/* EDIT OVERLAY */}
      <AnimatePresence>
        {editingStore && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Container maxWidth="md" sx={{ mt: 2 }}>
              <Paper sx={{ p: 3, ...glassStyle, border: '1px solid #6366f1' }}>
                <TextField
                  fullWidth label="Store Name"
                  value={tempStoreName}
                  onChange={(e) => setTempStoreName(e.target.value)}
                  helperText="This name will appear on all receipts and validation logs."
                />
              </Paper>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={4}>

          {/* LEFT: VERIFICATION */}
          <Grid item xs={12} md={4}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants}>
                <Paper sx={{ ...glassStyle, p: 0, overflow: 'hidden', height: '100%' }}>
                  <Box sx={{ p: 3, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? 'white' : '#0f172a' }}>Verify Coupon</Typography>
                    <Typography variant="body2" sx={{ color: isDark ? "text.secondary" : "#334155" }}>Scan QR or enter code manually</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="CPN-XXXX-XXXX"
                      value={code}
                      onChange={(e) => {
                        const v = e.target.value;
                        const extracted = extractCodeFromString(v) || v;
                        setCode(extracted);
                      }}
                      InputProps={{
                        sx: { borderRadius: 3, bgcolor: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc" },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setOpenQR(true)} color="primary" sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}>
                              <QrCodeScanner />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => verifyCoupon(code)}
                      disabled={!code || verifying}
                      sx={{ mt: 2, borderRadius: 3, py: 1.5, background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
                    >
                      {verifying ? <CircularProgress size={24} color="inherit" /> : "Verify Code"}
                    </Button>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>
                      </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                      {result && (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <Paper elevation={0} sx={{ mt: 3, p: 3, bgcolor: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9", borderRadius: 3, border: `1px solid ${result.isUsed ? '#ef4444' : '#22c55e'}`, position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
                              {result && !confirmOpen && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                  Refreshing in {countdown}s...
                                </Typography>
                              )}
                              <MuiTooltip title="Manual Refresh">
                                <IconButton size="small" onClick={handleRefresh}>
                                  <Refresh fontSize="small" />
                                </IconButton>
                              </MuiTooltip>
                            </Box>
                            <Stack alignItems="center" spacing={1} mb={2}>
                              {result.isUsed ? <Close sx={{ fontSize: 40, color: "#ef4444" }} /> : <CheckCircleOutline sx={{ fontSize: 40, color: "#22c55e" }} />}
                              <Typography variant="h6" fontWeight="bold" color={result.isUsed ? "error" : "success"}>
                                {result.isUsed ? "COUPON USED" : "VALID COUPON"}
                              </Typography>
                            </Stack>
                            <Stack spacing={1.5}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography sx={{ color: isDark ? "text.secondary" : "#1e293b", fontWeight: '500' }}>Reward:</Typography>
                                <Typography fontWeight="bold" sx={{ color: isDark ? 'white' : '#000000' }}>{result.rewardName}</Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography sx={{ color: isDark ? "text.secondary" : "#1e293b", fontWeight: '500' }}>Points:</Typography>
                                <Chip label={result.pointsUsed} size="small" sx={{ fontWeight: 'bold' }} />
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography sx={{ color: isDark ? "text.secondary" : "#1e293b", fontWeight: '500' }}>User:</Typography>
                                <Typography textAlign="right" fontWeight="bold" sx={{ color: isDark ? 'white' : '#000000' }}>{result.userId?.fname} {result.userId?.ename}</Typography>
                              </Box>
                              <Divider sx={{ my: 1 }} />
                              {!result.isUsed ? (
                                <Button
                                  fullWidth variant="contained" color="success"
                                  onClick={() => setConfirmOpen(true)}
                                  startIcon={<Check />}
                                >
                                  Accept & Redeem
                                </Button>
                              ) : (
                                <Typography variant="caption" color="error" textAlign="center">
                                  Used at {result.usedByStore} on {new Date(result.usedAt).toLocaleDateString()}
                                </Typography>
                              )}
                            </Stack>
                          </Paper>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                </Paper>
              </motion.div>
            </motion.div>
          </Grid>

          {/* RIGHT: LOGS */}
          <Grid item xs={12} md={8}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">

              {/* Monthly Stats Card */}
              <motion.div variants={itemVariants}>
                <Paper sx={{ ...glassStyle, mb: 3, p: 3, background: isDark ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" : "white" }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: "warning.main", borderRadius: 2, color: "white" }}><Assessment /></Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: isDark ? 'text.secondary' : '#334155', fontWeight: 'bold' }}>Monthly Report</Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TextField
                            type="month" size="small" variant="standard"
                            value={reportMonth}
                            onChange={(e) => setReportMonth(e.target.value)}
                            InputProps={{ disableUnderline: true, sx: { fontSize: '1.1rem', fontWeight: 'bold', color: isDark ? 'white' : '#000000' } }}
                          />
                          <IconButton size="small" onClick={() => fetchMonthlyReport()}><Refresh fontSize="small" /></IconButton>
                        </Stack>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                      <Box textAlign="center">
                        <Typography variant="h5" fontWeight="900" color="primary">{monthlyReport?.totals?.totalCount || 0}</Typography>
                        <Typography variant="caption" textTransform="uppercase" fontWeight="900" sx={{ color: isDark ? 'text.secondary' : '#334155' }}>Items</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h5" fontWeight="900" color="secondary">{monthlyReport?.totals?.totalPoints || 0}</Typography>
                        <Typography variant="caption" textTransform="uppercase" fontWeight="900" sx={{ color: isDark ? 'text.secondary' : '#334155' }}>Points</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button startIcon={<Download />} variant="outlined" size="small" onClick={downloadMonthlyCSV} disabled={!monthlyReport?.logs?.length}>CSV</Button>
                      <Button startIcon={<ReceiptLong />} variant="contained" size="small" onClick={downloadMonthlyPDF} disabled={!monthlyReport?.logs?.length}>PDF</Button>
                    </Stack>
                  </Stack>
                </Paper>
              </motion.div>

              {/* History Table */}
              <motion.div variants={itemVariants}>
                <Paper sx={{ ...glassStyle, p: 0, overflow: 'hidden' }}>
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(100,100,100,0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <History color="action" />
                      <Typography fontWeight="bold" sx={{ color: isDark ? 'white' : '#0f172a' }}>History</Typography>
                    </Box>
                    <TextField
                      placeholder="Search..."
                      size="small"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                        sx: { borderRadius: 3, bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)", fontSize: '0.9rem' }
                      }}
                    />
                  </Box>

                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow sx={{ '& th': { bgcolor: isDark ? "#1e293b" : "#f1f5f9", fontWeight: 'bold', color: isDark ? 'white' : '#000000' } }}>
                          <TableCell>User</TableCell>
                          <TableCell>Reward</TableCell>
                          <TableCell>Code</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAndStatus.map((log) => (
                          <TableRow key={log._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="700" sx={{ color: isDark ? 'white' : '#000000' }}>{log.userId?.fname}</Typography>
                              <Typography variant="caption" sx={{ color: isDark ? 'text.secondary' : '#475569', fontWeight: '500' }}>{dayjs(log.usedAt || log.redeemedAt).fromNow()}</Typography>
                            </TableCell>
                            <TableCell>{log.rewardName}</TableCell>
                            <TableCell>
                              <Chip label={log.code} size="small" variant="outlined" onClick={() => copyCode(log.code)} clickable icon={<ContentCopy fontSize="small" />} />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={log.isUsed ? "USED" : "PENDING"}
                                size="small"
                                color={log.isUsed ? "success" : "warning"}
                                variant={log.isUsed ? "filled" : "outlined"}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {!log.isUsed && (
                                <Button size="small" variant="contained" sx={{ borderRadius: 4, textTransform: "none" }} onClick={() => acceptLogCoupon(log.code)}>
                                  Accept
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredAndStatus.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">No logs found.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </motion.div>

            </motion.div>
          </Grid>

        </Grid>
      </Container>


      {/* --- DIALOGS --- */}
      <Dialog open={openQR} onClose={() => setOpenQR(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center', bgcolor: 'black' }}>
          <Scanner onScan={handleQRScan} onError={handleScanError} constraints={scannerConstraints} styles={{ width: "100%", height: "300px" }} />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Redemption</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Marking <strong>{result?.rewardName}</strong> as USED at <strong>{storeName}</strong>?
          </Alert>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="contained" color="success" onClick={acceptCoupon} disabled={accepting} startIcon={<Check />}>
              {accepting ? "Processing..." : "Confirm Accept"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>

    </Box>
  );
};

export default StorePage;
