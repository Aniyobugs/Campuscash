import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import axios from "axios";

const ProfileUpdate = ({ userId: propUserId }) => {
  const { isDark } = useTheme();
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
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const userId = propUserId || user?.id || user?._id;

  useEffect(() => {
    if (!userId) {
      setError("No user logged in");
      return;
    }
  }, [userId]);

  // Fetch current user info
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${baseurl}/api/${userId}`)
      .then((res) => {
        const { fname, ename, profilePic } = res.data;
        setForm((prev) => ({
          ...prev,
          fullName: fname || "",
          email: ename || "",
        }));
        if (profilePic) setPreview(`${baseurl}${profilePic}`);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        setError("Failed to load profile");
      });
  }, [userId, baseurl]);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit update
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
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Update failed");
      setSuccess("");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark ? "linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%)" : "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 500,
          p: 4,
          bgcolor: isDark ? "#1e293b" : "white",
          borderRadius: 3,
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.15)",
          color: isDark ? "#ffffff" : "#212121",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          sx={{ textAlign: "center", color: isDark ? "#60a5fa" : "#1b3a57" }}
        >
          Update Profile
        </Typography>

        {/* Profile Picture */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Avatar
            src={preview}
            sx={{ width: 100, height: 100, border: "2px solid #1b3a57" }}
          />
        </Box>
        <Button variant="outlined" component="label" fullWidth>
          Upload Profile Picture
          <input type="file" hidden onChange={handleFileChange} />
        </Button>

        {/* Full Name */}
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          sx={{ mt: 3 }}
        />

        {/* Email */}
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          sx={{ mt: 3 }}
        />

        {/* Current Password */}
        <TextField
          fullWidth
          label="Current Password"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          sx={{ mt: 3 }}
        />

        {/* New Password */}
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
          sx={{
            mt: 4,
            backgroundColor: "#1b3a57",
            "&:hover": { backgroundColor: "#16314a" },
            py: 1.5,
          }}
          onClick={handleSubmit}
        >
          Save Changes
        </Button>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess("")}
        >
          <Alert severity="success" onClose={() => setSuccess("")}>
            {success}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
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
    </Box>
  );
};

export default ProfileUpdate;
