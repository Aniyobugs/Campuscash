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

dayjs.extend(relativeTime);

const StorePage = () => {
  const baseurl = import.meta.env.VITE_API_BASE_URL;

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
    setAccepting(true);
    try {
      const res = await axios.post(`${baseurl}/api/coupons/use`, {
        code: result.code,
        storeName: "SNS Store",
      });
      setResult(res.data.coupon);
      setError("");
      setSnack({ open: true, message: "Coupon accepted", severity: "success" });
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

  const totalCount = logs.length;
  const usedCount = logs.filter((l) => l.isUsed).length;
  const notUsedCount = logs.filter((l) => !l.isUsed).length;

  const filteredAndStatus = filteredLogs.filter((l) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "used") return l.isUsed;
    if (statusFilter === "notUsed") return !l.isUsed;
    return true;
  });

  // Accept coupon from a log (store action)
  const acceptLogCoupon = async (couponCode, storeName = "SNS Store") => {
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
      <Typography variant="h4" fontWeight="700" mb={3}>
        Store Coupon Verification
      </Typography>

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
            onError={(error) => console.error(error)}
            constraints={{ facingMode: "environment" }}
            styles={{ width: "100%" }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm accept dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Accept Coupon</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to accept this coupon for <strong>{result?.rewardName}</strong>?</Typography>
          <Stack direction="row" spacing={2} mt={2}>
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
