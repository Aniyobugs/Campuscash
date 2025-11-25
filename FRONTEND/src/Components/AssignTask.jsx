// src/components/AssignTask.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Grid,
  Paper,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";

const AssignTask = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: null,
    points: "",
    category: "",
  });

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.dueDate || !formData.points) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate.toISOString(),
        points: Number(formData.points),
        category: formData.category || "General",
      };

      await axios.post(`${baseurl}/api/tasks/addtask`, payload);

      setSuccess(true);
      setErrorMsg("");

      setFormData({
        title: "",
        description: "",
        dueDate: null,
        points: "",
        category: "",
      });
    } catch (err) {
      console.error("Error assigning task:", err);
      const msg =
        err?.response?.data?.message ||
        "Something went wrong while assigning the task.";
      setErrorMsg(msg);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundImage:
            "linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%), url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            maxWidth: 500,
            width: "100%",
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                color: "primary.main",
                letterSpacing: 1,
                mb: 1,
              }}
            >
              Assign New Task
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and assign a new task to your students.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Task Title"
                  value={formData.title}
                  onChange={handleChange("title")}
                  placeholder="e.g. Final Project Presentation"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleChange("description")}
                  placeholder="Optional task details..."
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={handleChange("category")}
                  placeholder="e.g. Assignment, Project, Quiz..."
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate}
                  onChange={(newDate) =>
                    setFormData({ ...formData, dueDate: newDate })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: "outlined",
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon color="action" />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Points Awarded"
                  type="number"
                  required
                  fullWidth
                  inputProps={{ min: 1 }}
                  value={formData.points}
                  onChange={handleChange("points")}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmojiEventsIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                  startIcon={<UploadFileIcon />}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    color: "text.secondary",
                    borderStyle: "dashed",
                  }}
                >
                  Upload Related File (Coming Soon)
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  sx={{
                    py: 1.3,
                    fontWeight: "bold",
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  Assign Task
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* Success Snackbar */}
          <Snackbar
            open={success}
            autoHideDuration={3000}
            onClose={() => setSuccess(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity="success"
              variant="filled"
              onClose={() => setSuccess(false)}
              sx={{ fontWeight: "bold" }}
            >
              Task assigned successfully!
            </Alert>
          </Snackbar>

          {/* Error Snackbar */}
          <Snackbar
            open={!!errorMsg}
            autoHideDuration={3000}
            onClose={() => setErrorMsg("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity="error"
              variant="filled"
              onClose={() => setErrorMsg("")}
              sx={{ fontWeight: "bold" }}
            >
              {errorMsg}
            </Alert>
          </Snackbar>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default AssignTask;
