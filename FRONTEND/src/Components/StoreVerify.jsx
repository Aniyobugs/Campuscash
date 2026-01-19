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
} from "@mui/material";
import {
  QrCodeScanner,
  ContentCopy,
  CheckCircleOutline,
  Search,
  Refresh,
  Check,
} from "@mui/icons-material";

import { Scanner } from "@yudiel/react-qr-scanner"; // React 19 compatible scanner
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Tooltip as MuiTooltip } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

dayjs.extend(relativeTime);

const StorePage = () => {
  const baseurl = import.meta.env.VITE_API_BASE_URL;

  // Store information
  const [storeName, setStoreName] = useState(() => {
    return localStorage.getItem("storeName") || "";
  });
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

  // Scanner constraints and error state — start by preferring the environment (rear) camera,
  // and fallback to user (front) camera when OverconstrainedError occurs.
  const [scannerConstraints, setScannerConstraints] = useState({ facingMode: "environment" });
  const [scannerError, setScannerError] = useState(null);

  const handleScanError = (err) => {
    console.error("QR Scanner error:", err);
    setScannerError(err);

    // If the requested constraint couldn't be satisfied, try a fallback once
    if (
      err &&
      (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError")
    ) {
      // If we already tried fallback, show a friendly message and close scanner
      if (scannerConstraints && scannerConstraints.facingMode === "user") {
        setSnack({ open: true, message: "No camera available or permission denied.", severity: "error" });
        setOpenQR(false);
        return;
      }

      // Try front camera as a fallback
      setSnack({ open: true, message: "Rear camera not available — switching to front camera.", severity: "warning" });
      setScannerConstraints({ facingMode: "user" });
      return;
    }

    // Generic error handling
    setSnack({ open: true, message: err.message || "Camera error", severity: "error" });
  };

  // Fetch coupon logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await axios.get(`${baseurl}/api/coupons/logs`);
      setLogs(res.data || []);
    } catch (err) {
      console.error("Log fetch error:", err);
      setSnack({ open: true, message: "Failed to load logs", severity: "error" });
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Load current month's receipt by default
    fetchMonthlyReport();
  }, []);

  // Verify coupon
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

  // Try to extract a coupon code from various QR payload shapes.
  // If input is JSON like {"code":"CPN-...","reward":"..."} we return the code.
  const extractCodeFromString = (input) => {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim();

    // Quick heuristic: if looks like JSON, try parse
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);

        // If parsed is an array, try first element
        const obj = Array.isArray(parsed) ? parsed[0] : parsed;

        if (!obj) return null;

        // Common shapes: { code: '...' } or { coupon: { code: '...' } }
        if (typeof obj === "string") return obj;
        if (obj.code) return obj.code;
        if (obj.coupon && obj.coupon.code) return obj.coupon.code;
        if (obj.data && obj.data.code) return obj.data.code;
        if (obj.payload && obj.payload.code) return obj.payload.code;

        // Some QR payloads use nested values or different keys; try to find first string-looking value that resembles a coupon code
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (typeof val === "string" && val.match(/CPN-|[A-Z0-9-]{6,}/i)) return val;
        }
      } catch {
        // ignore parse errors
      }
    }

    return null;
  };

  // Accept coupon
  const acceptCoupon = async () => {
    if (!result?.code) return;
    if (!storeName.trim()) {
      setSnack({ open: true, message: "Please enter a store name first", severity: "warning" });
      return;
    }
    setAccepting(true);
    try {
      const res = await axios.post(`${baseurl}/api/coupons/use`, {
        code: result.code,
        storeName: storeName,
      });
      setResult(res.data.coupon);
      setError("");
      setSnack({ open: true, message: `Coupon accepted at ${storeName}`, severity: "success" });
      fetchLogs();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not accept coupon");
      setSnack({ open: true, message: "Could not accept coupon", severity: "error" });
    } finally {
      setAccepting(false);
      setConfirmOpen(false);
    }
  };

  // Handle store name save
  const handleSaveStore = () => {
    if (!tempStoreName.trim()) {
      setSnack({ open: true, message: "Store name cannot be empty", severity: "warning" });
      return;
    }
    setStoreName(tempStoreName);
    localStorage.setItem("storeName", tempStoreName);
    setEditingStore(false);
    setSnack({ open: true, message: `Store name updated to: ${tempStoreName}`, severity: "success" });
  };

  // When QR code is scanned
  const handleQRScan = (scanned) => {
    if (!scanned) return;

    const scannedCode = scanned[0]?.rawValue;
    if (scannedCode) {
      // If scanner returns a JSON payload, extract the code field
      const extracted = extractCodeFromString(scannedCode) || scannedCode;
      setCode(extracted);
      verifyCoupon(extracted);
      setOpenQR(false); // close popup
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (!query) return true;
    return (
      (l.userId?.fname || "").toLowerCase().includes(query.toLowerCase()) ||
      (l.code || "").toLowerCase().includes(query.toLowerCase()) ||
      (l.rewardName || "").toLowerCase().includes(query.toLowerCase()) ||
      (l.usedByStore || "").toLowerCase().includes(query.toLowerCase())
    );
  });

  const [statusFilter, setStatusFilter] = useState("all");

  // Monthly receipt state: YYYY-MM (e.g., "2026-01")
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0,7));
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const totalCount = logs.length;
  const usedCount = logs.filter((l) => l.isUsed).length;
  const notUsedCount = logs.filter((l) => !l.isUsed).length;

  const fetchMonthlyReport = async (monthStr = reportMonth) => {
    const [year, month] = monthStr.split("-").map(Number);
    setLoadingMonthly(true);
    try {
      const res = await axios.get(`${baseurl}/api/coupons/monthly?year=${year}&month=${month}`);
      setMonthlyReport(res.data);
    } catch (err) {
      console.error("Monthly report fetch error:", err);
      setSnack({ open: true, message: "Failed to load monthly report", severity: "error" });
    } finally {
      setLoadingMonthly(false);
    }
  };

  const downloadMonthlyCSV = () => {
    if (!monthlyReport?.logs?.length) return;
    const rows = monthlyReport.logs.map((l) => ({
      Store: l.usedByStore || "",
      User: l.userId?.fname ? `${l.userId.fname}${l.userId.ename ? ` (${l.userId.ename})` : ""}` : "",
      Reward: l.rewardName || "",
      Code: l.code || "",
      Points: l.pointsUsed || 0,
      UsedAt: l.usedAt ? new Date(l.usedAt).toLocaleString() : "",
    }));

    const header = Object.keys(rows[0] || { Store: "", User: "", Reward: "", Code: "", Points: "", UsedAt: "" });
    const csv = [header.join(",")]
      .concat(
        rows.map((r) =>
          header.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""') }"`).join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly_receipt_${reportMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMonthlyPDF = () => {
    if (!monthlyReport?.logs?.length) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const generatedAt = new Date().toLocaleString();
    const pointVal = monthlyReport?.totals?.pointValue ?? 0.1;
    const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

    // Header - modern centered store header with small placeholder logo
    const centerX = pageWidth / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SNS Store', centerX, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nirmala college of arts and science / Campus Store', centerX, 26, { align: 'center' });
    doc.text('Kunnappily, Meloor, Chalakudy - 680307', centerX, 30, { align: 'center' });
    doc.text('Phone: +91-12345-67890', centerX, 34, { align: 'center' });

    // Receipt meta on the right
    const receiptNo = `R-${reportMonth.replace('-', '')}-${Date.now().toString().slice(-6)}`;
    doc.setFontSize(9);
    doc.text(`Receipt: ${receiptNo}`, pageWidth - margin, 20, { align: 'right' });
    doc.text(`Month: ${reportMonth}`, pageWidth - margin, 26, { align: 'right' });
    doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 32, { align: 'right' });

    // Horizontal separator
    doc.setLineWidth(0.6);
    doc.line(margin, 38, pageWidth - margin, 38);

    // Table: condensed modern layout (fewer columns for readability)
    const columns = ['#', 'Date', 'Store', 'Code', 'Reward', 'Pts', 'INR'];
    const rows = monthlyReport.logs.map((l, idx) => {
      const inr = (l.pointsUsed || 0) * pointVal;
      const date = l.usedAt ? new Date(l.usedAt).toLocaleString() : '-';
      return [
        idx + 1,
        date,
        l.usedByStore || '-',
        l.code || '-',
        l.rewardName || '-',
        l.pointsUsed || 0,
        currency.format(inr),
      ];
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 42,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 245, 245], textColor: 20 },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 34 },
        4: { cellWidth: 40 },
        5: { cellWidth: 12 },
        6: { cellWidth: 22 },
      },
      didDrawPage: function (data) {
        // draw a thin border around the receipt area
        const h = doc.internal.pageSize.getHeight();
        doc.setDrawColor(200);
        doc.rect(margin - 2, 10, pageWidth - (margin - 2) * 2, h - 20);
      }
    });

    const finalY = doc.lastAutoTable?.finalY || 42;

    // Totals box (right aligned)
    const totalBoxWidth = 80;
    const totalBoxX = pageWidth - margin - totalBoxWidth;
    const totalBoxY = finalY + 8;

    doc.setFillColor(250, 250, 250);
    doc.rect(totalBoxX, totalBoxY, totalBoxWidth, 24, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const totalPoints = monthlyReport.totals?.totalPoints ?? 0;
    const totalINR = monthlyReport.totals?.totalINR ?? +(totalPoints * pointVal).toFixed(2);

    doc.text(`Items: ${monthlyReport.totals?.totalCount ?? 0}`, totalBoxX + 6, totalBoxY + 8);
    doc.text(`Points: ${totalPoints}`, totalBoxX + 6, totalBoxY + 13);
    doc.text(`Total: ${currency.format(totalINR)}`, totalBoxX + 6, totalBoxY + 20);

    // By-store summary below totals
    if (monthlyReport.byStore?.length) {
      let byY = totalBoxY + 36;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('By Store:', margin, byY);
      doc.setFont('helvetica', 'normal');
      monthlyReport.byStore.forEach((s, i) => {
        const text = `${s.storeName}: ${s.count} items • ${s.totalPoints} pts • ${currency.format(s.totalINR)}`;
        doc.text(text, margin, byY + 6 + i * 6);
      });
    }

    // Footer and signature area
    const footerY = doc.internal.pageSize.getHeight() - 40;
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFontSize(10);
    doc.text('Thank you for your business!', centerX, footerY + 8, { align: 'center' });
    doc.setFontSize(9);
    doc.text('This is a computer generated receipt.', centerX, footerY + 14, { align: 'center' });

    // Signature line (right)
    const signY = footerY + 20;
    doc.line(pageWidth - margin - 70, signY, pageWidth - margin, signY);
    doc.text('Authorized Sign', pageWidth - margin - 70, signY + 6);

    doc.save(`monthly_receipt_${reportMonth}.pdf`);
  };

  const filteredAndStatus = filteredLogs.filter((l) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "used") return l.isUsed;
    if (statusFilter === "notUsed") return !l.isUsed;
    return true;
  });

  // Accept coupon from a log (store action)
  const acceptLogCoupon = async (couponCode) => {
    if (!storeName.trim()) {
      setSnack({ open: true, message: "Please set store name first", severity: "warning" });
      return;
    }
    try {
      await axios.post(`${baseurl}/api/coupons/use`, { code: couponCode, storeName });
      setSnack({ open: true, message: "Coupon accepted", severity: "success" });
      fetchLogs();
    } catch (err) {
      console.error("Accept from logs error", err);
      setSnack({ open: true, message: "Could not accept coupon", severity: "error" });
    }
  };

  const copyCode = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnack({ open: true, message: "Copied to clipboard", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Copy failed", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="700">
            Store Coupon Verification
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Store: <Chip label={storeName || "Not Set"} color={storeName ? "success" : "error"} size="small" />
          </Typography>
        </Box>
        <Button
          variant={editingStore ? "contained" : "outlined"}
          onClick={() => {
            if (editingStore) {
              handleSaveStore();
            } else {
              setTempStoreName(storeName);
              setEditingStore(true);
            }
          }}
        >
          {editingStore ? "Save Store" : "Change Store"}
        </Button>
      </Box>

      {editingStore && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "info.light" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Store Name"
              value={tempStoreName}
              onChange={(e) => setTempStoreName(e.target.value)}
              placeholder="e.g., SNS Store, Main Campus Store"
              fullWidth
              size="small"
            />
            <Button variant="outlined" onClick={() => setEditingStore(false)}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, height: "100%" }} elevation={3}>
            <Stack spacing={2}>
              <Typography variant="h6">Scan or Enter Coupon</Typography>

              <TextField
                label="Coupon code"
                value={code}
                onChange={(e) => {
                  const v = e.target.value;
                  // If pasted/typed value looks like JSON, try to extract code immediately
                  if (v.trim().startsWith("{") || v.trim().startsWith("[")) {
                    const extracted = extractCodeFromString(v);
                    setCode(extracted ?? v);
                  } else {
                    setCode(v);
                  }
                }}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <MuiTooltip title="Scan QR">
                        <IconButton onClick={() => setOpenQR(true)}>
                          <QrCodeScanner />
                        </IconButton>
                      </MuiTooltip>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={verifying ? <CircularProgress size={18} /> : <CheckCircleOutline />}
                  onClick={() => verifyCoupon(code)}
                  disabled={!code || verifying}
                  fullWidth
                >
                  Verify
                </Button>

                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchLogs} disabled={loadingLogs}>
                  Refresh
                </Button>
              </Stack>

              {error && <Alert severity="error">{error}</Alert>}

              {result && (
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>
                        {result.rewardName}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={result.isUsed ? "USED" : "AVAILABLE"} color={result.isUsed ? "error" : "success"} />
                        <IconButton onClick={() => copyCode(result.code)} size="small">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography variant="body2">Code: {result.code}</Typography>
                    <Typography variant="body2">Points: {result.pointsUsed}</Typography>
                    <Typography variant="body2">Expires: {new Date(result.expiresAt).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Redeemed By: {result.userId?.fname} ({result.userId?.ename})</Typography>
                    
                    <Box sx={{ p: 1, bgcolor: "info.lighter", borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Store to Accept At: <Chip label={storeName || "Not Set"} size="small" color={storeName ? "success" : "error"} />
                      </Typography>
                    </Box>

                    {result.isUsed ? (
                      <Alert severity="warning">Already used at {result.usedByStore} on {result.usedAt ? new Date(result.usedAt).toLocaleString() : "-"}</Alert>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={accepting ? <CircularProgress size={18} /> : <Check />}
                        onClick={() => setConfirmOpen(true)}
                        disabled={accepting}
                      >
                        Accept Coupon
                      </Button>
                    )}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2 }} elevation={0}>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2} mb={1}>
              <TextField
                placeholder="Search logs by user, code or reward"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <Button startIcon={<Refresh />} onClick={fetchLogs} disabled={loadingLogs}>
                {loadingLogs ? <CircularProgress size={18} /> : "Reload"}
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} mb={2} alignItems="center">
              <Chip label={`Total: ${totalCount}`} />
              <Chip label={`Used: ${usedCount}`} color="success" />
              <Chip label={`Not used: ${notUsedCount}`} color="warning" />
              <Stack direction="row" spacing={1} ml="auto">
                <Button variant={statusFilter === "all" ? "contained" : "outlined"} onClick={() => setStatusFilter("all")}>All</Button>
                <Button variant={statusFilter === "used" ? "contained" : "outlined"} onClick={() => setStatusFilter("used")}>Used</Button>
                <Button variant={statusFilter === "notUsed" ? "contained" : "outlined"} onClick={() => setStatusFilter("notUsed")}>Not used</Button>
              </Stack>
            </Stack>

            <Typography variant="h6" mb={1}>Coupon Usage Logs</Typography>

            {/* Monthly Receipt Panel */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <TextField
                  label="Receipt month"
                  type="month"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  size="small"
                  sx={{ width: 160 }}
                />
                <Button variant="contained" onClick={() => fetchMonthlyReport()} startIcon={loadingMonthly ? <CircularProgress size={16} /> : null}>
                  Get Receipt
                </Button>
                <Button variant="outlined" onClick={downloadMonthlyCSV} disabled={!monthlyReport?.logs?.length}>
                  Download CSV
                </Button>
                <Button variant="contained" onClick={downloadMonthlyPDF} disabled={!monthlyReport?.logs?.length}>
                  Download PDF
                </Button>
                <Stack ml="auto" spacing={1} direction="row">
                  <Typography variant="body2">Total Used: <strong>{monthlyReport?.totals?.totalCount ?? "-"}</strong></Typography>
                  <Typography variant="body2">Total Points: <strong>{monthlyReport?.totals?.totalPoints ?? "-"}</strong></Typography>
                </Stack>
              </Stack>

              {monthlyReport?.byStore?.length ? (
                <Box mt={2}>
                  <Typography variant="subtitle2">By Store</Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    {monthlyReport.byStore.map((s) => (
                      <Chip key={s.storeName} label={`${s.storeName}: ${s.count} (${s.totalPoints} pts)`} />
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </Paper>

            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Reward</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Redeemed</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Used At</TableCell>
                    <TableCell>Store</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredAndStatus.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell>
                        {log.userId?.fname} {log.userId?.ename ? `(${log.userId?.ename})` : ""}
                      </TableCell>
                      <TableCell>{log.rewardName}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>{log.code}</Typography>
                          <IconButton size="small" onClick={() => copyCode(log.code)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell>{log.redeemedAt ? new Date(log.redeemedAt).toLocaleString() : "-"}</TableCell>
                      <TableCell>{log.isUsed ? <Chip label="USED" color="success" /> : <Chip label="NOT USED" color="warning" />}</TableCell>
                      <TableCell>
                        {log.usedAt ? (
                          <MuiTooltip title={new Date(log.usedAt).toLocaleString()}>
                            <span>{dayjs(log.usedAt).fromNow()}</span>
                          </MuiTooltip>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {log.usedByStore ? (
                          <Button size="small" onClick={() => setQuery(log.usedByStore)}>{log.usedByStore}</Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {!log.isUsed ? (
                          <Button size="small" variant="contained" color="success" onClick={() => acceptLogCoupon(log.code)}>
                            Accept
                          </Button>
                        ) : (
                          <Typography variant="body2">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* QR SCANNER POPUP */}
      <Dialog open={openQR} onClose={() => setOpenQR(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Scan Coupon QR</DialogTitle>
        <DialogContent>
          <Scanner
            onScan={handleQRScan}
            onError={handleScanError}
            // Use current constraints (may switch to 'user' as a fallback)
            constraints={scannerConstraints}
            styles={{ width: "100%" }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm accept dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Coupon Redemption</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Reward:</Typography>
              <Typography variant="h6">{result?.rewardName}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Store Name:</Typography>
              <Typography variant="h6" color={storeName ? "success.main" : "error.main"}>
                {storeName || "Not Set"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">User:</Typography>
              <Typography variant="body2">{result?.userId?.fname} ({result?.userId?.ename})</Typography>
            </Box>
            <Alert severity="info">
              Accepting this coupon will mark it as used at {storeName || "the store"}.
            </Alert>
          </Stack>
          <Stack direction="row" spacing={2} mt={3}>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="contained" color="success" onClick={acceptCoupon} disabled={accepting} startIcon={accepting ? <CircularProgress size={14} /> : <Check />}>
              Yes, Accept
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StorePage;
