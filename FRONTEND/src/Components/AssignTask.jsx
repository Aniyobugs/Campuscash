import React, { useState } from 'react';
import {
  Box, TextField, Button, MenuItem, Typography, Snackbar, Alert, Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

const taskTypes = ['Assignment', 'Project', 'Workshop', 'Quiz', 'Seminar'];

const AssignTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: null,
    points: '',
    category: '',
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.dueDate || !formData.points || !formData.category) {
      alert('Please fill in all required fields.');
      return;
    }

    console.log('Submitted Task:', formData);

    // Reset form and show success message
    setSuccess(true);
    setFormData({
      title: '',
      description: '',
      dueDate: null,
      points: '',
      category: '',
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h5" gutterBottom>Assign New Task</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required fullWidth label="Task Title"
                value={formData.title}
                onChange={handleChange('title')}
                placeholder="e.g. Final Project Presentation"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                multiline rows={3} fullWidth label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="Optional task details..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(newDate) => setFormData({ ...formData, dueDate: newDate })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
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
                onChange={handleChange('points')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Task Category/Type"
                select
                required
                fullWidth
                value={formData.category}
                onChange={handleChange('category')}
              >
                {taskTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" fullWidth disabled>
                Upload Related File (Coming Soon)
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" fullWidth>
                Assign Task
              </Button>
            </Grid>
          </Grid>
        </form>

        <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Task assigned successfully!
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AssignTask;
