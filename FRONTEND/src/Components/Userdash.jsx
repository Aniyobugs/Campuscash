import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import axios from "axios";

const Userdash = () => {
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
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);

      axios
        .get(`${baseurl}/api/${parsedUser.id}`)
        .then((res) => {
          const user = res.data;
          setForm({
            fullName: user.fname || "",
            email: user.email || "",
            currentPassword: "",
            newPassword: "",
          });
          if (user.profilePic) setPreview(`${baseurl}${user.profilePic}`);
          setData({
            user: {
              name: user.fname,
              avatar: user.profilePic
                ? `${baseurl}${user.profilePic}`
                : "https://i.pravatar.cc/150?u=" + user._id,
            },
            progress: {
              points: user.points,
              rank: 4,
              nextReward: {
                name: "Free Coffee",
                remaining: 100 - user.points,
                total: 1500,
              },
              streak: {
                days: 5,
                badge: "Taskmaster",
              },
            },
          });
        })
        .catch((err) => console.error(err));
    }
  }, [baseurl]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      if (form.currentPassword) formData.append("currentPassword", form.currentPassword);
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
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Update failed");
      setSuccess("");
    }
  };

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
          <Button
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => setOpenDialog(true)}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Points Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">My Points</Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {data.progress.points} pts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.progress.nextReward.remaining} pts to next reward (
                {data.progress.nextReward.name})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(data.progress.points / data.progress.nextReward.total) * 100}
                sx={{ mt: 2, height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Streak Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Streak</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalFireDepartmentIcon color="error" />
                <Typography>{data.progress.streak.days}-day streak!</Typography>
              </Box>
              <Chip
                label={`Badge: ${data.progress.streak.badge}`}
                color="success"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profile Update Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Avatar
              src={preview || data.user.avatar}
              sx={{ width: 100, height: 100, border: "2px solid #1b3a57" }}
            />
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
            label="Email Address"
            name="email"
            type="email"
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
            sx={{ mt: 4, backgroundColor: "#1b3a57", "&:hover": { backgroundColor: "#16314a" }, py: 1.5 }}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Userdash;
