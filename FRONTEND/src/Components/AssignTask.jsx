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
  Avatar,
  Stack,
  Chip,
  Autocomplete,
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
    assignedYears: [],
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
        assignedYears: formData.assignedYears || [],
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
        assignedYears: [],
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
          alignItems: "flex-start",
          minHeight: "100vh",
          py: 6,
          px: 2,
          background: "linear-gradient(180deg,#f7fbff 0%, #ffffff 100%)",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            maxWidth: 920,
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <Box sx={{ flex: 1, p: { xs: 3, sm: 5 } }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                <AssignmentIcon sx={{ fontSize: 28 }} />
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.3 }}>
                  Assign New Task
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and assign tasks with points and due dates.
                </Typography>
              </Box>
            </Stack>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={formData.category}
                    onChange={handleChange("category")}
                    placeholder="e.g. Assignment, Project, Lab..."
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]}
                    value={formData.assignedYears}
                    onChange={(e, value) => setFormData({ ...formData, assignedYears: value })}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Assign to Years (optional)" placeholder="Add or select years" />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <DatePicker
                    label="Due Date"
                    value={formData.dueDate}
                    onChange={(newDate) => setFormData({ ...formData, dueDate: newDate })}
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Points"
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

                <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    disabled
                    sx={{ ml: { md: 1 }, width: "100%", borderStyle: "dashed" }}
                  >
                    Upload (Soon)
                  </Button>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    sx={{
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "0 6px 18px rgba(25,118,210,0.12)",
                      transition: "transform 150ms ease",
                      '&:hover': { transform: "translateY(-2px)" },
                    }}
                  >
                    Assign Task
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box sx={{ width: { xs: 0, md: 340 }, display: { xs: "none", md: "block" }, bgcolor: "primary.light", color: "primary.contrastText" }}>
            <Box sx={{ p: 4 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Quick Tips
              </Typography>
              <Stack spacing={1} mb={2}>
                <Chip label="Give clear instructions" variant="filled" color="primary" />
                <Chip label="Set fair points" variant="outlined" />
                <Chip label="Use categories for filtering" variant="outlined" />
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                Tasks help students track progress. Use the points field to reward effort and due dates to keep timelines clear.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Feedback */}
        <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity="success" variant="filled" onClose={() => setSuccess(false)} sx={{ fontWeight: "bold" }}>
            Task assigned successfully!
          </Alert>
        </Snackbar>

        <Snackbar open={!!errorMsg} autoHideDuration={3000} onClose={() => setErrorMsg("")} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity="error" variant="filled" onClose={() => setErrorMsg("")} sx={{ fontWeight: "bold" }}>
            {errorMsg}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AssignTask;
