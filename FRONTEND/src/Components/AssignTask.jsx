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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";

const AssignTask = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: null,
    points: "",
    category: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.dueDate || !formData.points) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Submitted Task:", formData);

    setSuccess(true);
    setFormData({
      title: "",
      description: "",
      dueDate: null,
      points: "",
      category: "",
    });
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
            "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')", // college vibe image
          backgroundSize: "cover",
          backgroundPosition: "center",
          p: 3,
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 600,
            width: "100%",
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.75)", // transparent glass effect
            backdropFilter: "blur(10px)", // adds frosted effect
            boxShadow: "none", // removed shadow
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            textAlign="center"
            sx={{ color: "primary.main", mb: 3 }}
          >
            Assign New Task
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Task Title"
                  value={formData.title}
                  onChange={handleChange("title")}
                  placeholder="e.g. Final Project Presentation"
                  variant="outlined"
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
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    color: "text.secondary",
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
                  }}
                >
                  Assign Task
                </Button>
              </Grid>
            </Grid>
          </form>

          <Snackbar
            open={success}
            autoHideDuration={3000}
            onClose={() => setSuccess(false)}
          >
            <Alert
              severity="success"
              variant="filled"
              onClose={() => setSuccess(false)}
            >
              Task assigned successfully!
            </Alert>
          </Snackbar>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default AssignTask;
