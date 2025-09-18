import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import axios from "axios";

const AwardPoints = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [points, setPoints] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const baseurl = import.meta.env.VITE_API_BASE_URL;

  // Fetch all users
  useEffect(() => {
    axios
      .get(`${baseurl}/api/all`)
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  const handleSubmit = () => {
    if (!selectedUser || !points) {
      setError("Please select a user and enter points");
      return;
    }

    axios
      .post(`${baseurl}/api/award/${selectedUser._id}`, { points: Number(points) })
      .then((res) => {
        setSuccess(true);
        setSelectedUser(null);
        setPoints("");
        // Update user's points locally
        setUsers((prev) =>
          prev.map((u) =>
            u._id === res.data.user._id ? { ...u, points: res.data.user.points } : u
          )
        );
      })
      .catch((err) => {
        console.error("Error awarding points:", err);
        setError("Failed to award points");
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: 3,
      }}
    >
      <Box
        sx={{
          width: 500,
          p: 5,
          bgcolor: "rgba(255, 255, 255, 0.6)",
          borderRadius: 3,
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          sx={{ textAlign: "center", color: "#1b3a57" }}
        >
          Award Points
        </Typography>

        <Autocomplete
          options={users}
          getOptionLabel={(option) =>
            `${option.studentId || ""} - ${option.fname} (${option.ename}) — ${option.points} pts`
          }
          value={selectedUser}
          onChange={(event, newValue) => setSelectedUser(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select User" fullWidth sx={{ mt: 3 }} />
          )}
        />

        {/* Show selected user's current points */}
        {selectedUser && (
          <TextField
            fullWidth
            label="Current Points"
            value={selectedUser.points || 0}
            InputProps={{ readOnly: true }}
            sx={{ mt: 2 }}
          />
        )}

        <TextField
          fullWidth
          label="Points to Award"
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          sx={{ mt: 2 }}
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
          Award Points
        </Button>

        {/* Success Snackbar */}
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Points awarded successfully!
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

export default AwardPoints;
