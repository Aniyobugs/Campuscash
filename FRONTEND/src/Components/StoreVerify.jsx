import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import { Scanner } from "@yudiel/react-qr-scanner"; // React 19 compatible scanner
import axios from "axios";

const StorePage = () => {
  const baseurl = import.meta.env.VITE_API_BASE_URL;

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [openQR, setOpenQR] = useState(false);

  const [logs, setLogs] = useState([]);

  // Fetch coupon logs
  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/coupons/logs`);
      setLogs(res.data);
    } catch (err) {
      console.error("Log fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Verify coupon
  const verifyCoupon = async (couponCode) => {
    try {
      const res = await axios.get(`${baseurl}/api/coupons/verify/${couponCode}`);
      setResult(res.data.coupon);
      setError("");
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.message || "Invalid coupon");
    }
  };

  // Accept coupon
  const acceptCoupon = async () => {
    try {
      const res = await axios.post(`${baseurl}/api/coupons/use`, {
        code,
        storeName: "SNS Store",
      });
      setResult(res.data.coupon);
      setError("");
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || "Could not accept coupon");
    }
  };

  // When QR code is scanned
  const handleQRScan = (scanned) => {
    if (!scanned) return;

    const scannedCode = scanned[0]?.rawValue;
    if (scannedCode) {
      setCode(scannedCode);
      verifyCoupon(scannedCode);
      setOpenQR(false); // close popup
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Store Coupon Verification
      </Typography>

      {/* COUPON VERIFICATION BOX */}
      <Card sx={{ width: 500, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Verify Coupon
          </Typography>

          <TextField
            label="Enter Coupon Code"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" fullWidth onClick={() => verifyCoupon(code)}>
            Verify
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setOpenQR(true)}
          >
            Scan QR Code
          </Button>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Result Box */}
          {result && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">{result.rewardName}</Typography>
              <Typography>Coupon Code: {result.code}</Typography>
              <Typography>Points Used: {result.pointsUsed}</Typography>
              <Typography>
                Expires: {new Date(result.expiresAt).toLocaleDateString()}
              </Typography>
              <Typography>
                Redeemed By: {result.userId?.fname} ({result.userId?.ename})
              </Typography>

              {result.isUsed ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Already used at {result.usedByStore} on{" "}
                  {new Date(result.usedAt).toLocaleString()}
                </Alert>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={acceptCoupon}
                >
                  ACCEPT COUPON
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

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

      {/* COUPON LOG TABLE */}
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Coupon Usage Logs
      </Typography>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Reward</strong></TableCell>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Redeemed</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Used At</strong></TableCell>
              <TableCell><strong>Store</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  {log.userId?.fname} ({log.userId?.ename})
                </TableCell>
                <TableCell>{log.rewardName}</TableCell>
                <TableCell>{log.code}</TableCell>
                <TableCell>
                  {new Date(log.redeemedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {log.isUsed ? (
                    <Chip label="USED" color="success" />
                  ) : (
                    <Chip label="NOT USED" color="warning" />
                  )}
                </TableCell>

                <TableCell>
                  {log.usedAt ? new Date(log.usedAt).toLocaleString() : "---"}
                </TableCell>
                <TableCell>{log.usedByStore || "---"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default StorePage;
