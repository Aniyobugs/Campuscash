import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  CircularProgress,
  Autocomplete,
  Avatar,
  Fade,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Save, Cancel, PersonOff, Person, Dashboard as DashboardIcon, Star as StarIcon, People as PeopleIcon, Assignment as AssignmentIcon, RateReview as RateReviewIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

// Faculty Dashboard — same functionality as Admin but without role editing/toggling and with different styling
const FacultyDashboard = () => {
  const { isDark } = useTheme();
  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [awardData, setAwardData] = useState({
    studentId: "",
    points: "",
    reason: "",
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    fname: "",
    ename: "",
    yearClassDept: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Task modal / candidates
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Create Task dialog state (copied from AdminDashboard)
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskForm, setCreateTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: 10,
    category: 'General',
    assignedYears: [],
    quiz: { questions: [], passingScore: 70 },
  });

  // Edit Task state
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: 10,
    category: 'General',
    assignedYears: [],
    quiz: { questions: [], passingScore: 70 },
  });

  // Delete Task confirmation
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // derive year options from existing users (plus common defaults)
  const yearOptions = Array.from(new Set([
    'All',
    'Year 1',
    'Year 2',
    'Year 3',
    'Year 4',
    ...(users || []).map((u) => u.yearClassDept).filter(Boolean),
  ]));

  // Submissions
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [viewSubOpen, setViewSubOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setSubsLoading(true);
      const res = await axios.get(`${baseurl}/api/submissions`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${baseurl}/api/users`)
      .then((res) => {
        const activeUsers = res.data.filter((u) => u.status !== "inactive" && !['admin', 'faculty', 'store'].includes(u.role));
        setUsers(activeUsers);
        setFiltered(activeUsers);
      })
      .catch((err) => {
        console.error("Users fetch error:", err.response?.data || err.message || err);
        setError(err.response?.data?.message || "Failed to load users");
      });

    // fetch tasks for faculty
    setTasksLoading(true);
    axios
      .get(`${baseurl}/api/tasks`)
      .then((res) => setTasks(res.data || []))
      .catch((err) => {
        console.error("Tasks fetch error:", err.response?.data || err.message || err);
        setError(err.response?.data?.message || "Failed to load tasks");
      })
      .finally(() => setTasksLoading(false));

    fetchSubmissions();
  }, [baseurl]);

  const handleOpenTask = async (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
    setCandidatesLoading(true);
    try {
      const res = await axios.get(`${baseurl}/api/tasks/${task._id}/candidates`);
      setCandidates(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleAwardForTask = async (candidate) => {
    if (!selectedTask) return;
    try {
      const res = await axios.post(`${baseurl}/api/tasks/${selectedTask._id}/award`, { userId: candidate._id });
      setSuccess(res.data.message || "Awarded successfully");
      setError("");

      // update candidate in local list
      setCandidates((prev) => prev.map((c) => (c._id === candidate._id ? { ...c, awarded: true, points: res.data.user.points } : c)));

      // update users list points
      setUsers((prev) => prev.map((u) => (u._id === candidate._id ? { ...u, points: res.data.user.points } : u)));

      // update tasks list awarded count
      setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? { ...t, awardedTo: [...(t.awardedTo || []), { user: candidate._id }] } : t)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to award points");
      setSuccess("");
    }
  };

  const handleApproveSubmission = async (submission) => {
    try {
      const res = await axios.put(`${baseurl}/api/submissions/${submission._id}/approve`, { adminComment: '' });
      setSuccess(res.data.message || 'Submission approved');
      setError('');
      // update submission in state
      setSubmissions((prev) => prev.map((p) => (p._id === submission._id ? { ...p, status: 'accepted' } : p)));
      // update user points locally
      if (res.data.user) {
        setUsers((prev) => prev.map((u) => (u._id === res.data.user._id ? { ...u, points: res.data.user.points } : u)));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectSubmission = async (submission) => {
    try {
      const res = await axios.put(`${baseurl}/api/submissions/${submission._id}/reject`, { adminComment: '' });
      setSuccess(res.data.message || 'Submission rejected');
      setError('');
      setSubmissions((prev) => prev.map((p) => (p._id === submission._id ? { ...p, status: 'rejected' } : p)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  useEffect(() => {
    setFiltered(
      users.filter(
        (u) =>
          u.fname?.toLowerCase().includes(search.toLowerCase()) ||
          u.ename?.toLowerCase().includes(search.toLowerCase()) ||
          (u.studentId && u.studentId.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [search, users]);

  const handleAward = async () => {
    if (!awardData.studentId || !awardData.points) {
      setError("Please select a student and enter points.");
      return;
    }
    try {
      const res = await axios.post(`${baseurl}/api/award-points`, awardData);
      setSuccess(res.data.message);
      setError("");
      const updatedUsers = users.map((u) =>
        u._id === awardData.studentId
          ? { ...u, points: u.points + parseInt(awardData.points) }
          : u
      );
      setUsers(updatedUsers);
      setFiltered(updatedUsers);
      setAwardData({ studentId: "", points: "", reason: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to award points.");
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setEditForm({
      fname: user.fname,
      ename: user.ename,
      yearClassDept: user.yearClassDept,
    });
  };

  const handleSave = async (id) => {
    try {
      const res = await axios.put(`${baseurl}/api/users/${id}`, editForm);
      setSuccess(res.data.message);
      const updatedUsers = users.map((u) =>
        u._id === id ? { ...u, ...editForm } : u
      );
      setUsers(updatedUsers);
      setFiltered(updatedUsers);
      setEditingUserId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(`${baseurl}/api/users/${id}/status`);
      setSuccess(res.data.message);

      if (res.data.user.status === "inactive") {
        const updatedUsers = users.filter((u) => u._id !== id);
        setUsers(updatedUsers);
        setFiltered(updatedUsers);
      } else {
        const updatedUsers = [...users, res.data.user];
        setUsers(updatedUsers);
        setFiltered(updatedUsers);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.slice(0, 16), // format for datetime-local
      points: task.points,
      category: task.category || 'General',
      assignedYears: task.assignedYears || [],
      quiz: task.quiz || { questions: [], passingScore: 70 },
    });
    setEditTaskOpen(true);
  };

  const handleSaveEditedTask = async () => {
    if (!editingTask || !editTaskForm.title) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const res = await axios.put(`${baseurl}/api/tasks/${editingTask._id}`, editTaskForm);
      setSuccess('Task updated successfully');
      setError('');
      setEditTaskOpen(false);
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      setSuccess('');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await axios.delete(`${baseurl}/api/tasks/${taskToDelete._id}`);
      setSuccess('Task deleted successfully');
      setError('');
      setDeleteTaskOpen(false);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      setTaskToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      setSuccess('');
    }
  };

  const totalUsers = users.length;
  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
  const topStudent =
    users.length > 0 ? [...users].sort((a, b) => b.points - a.points)[0] : null;

  // Faculty style uses green accents
  const statCardStyles = {
    bgcolor: isDark ? "#1e293b" : "#ffffff",
    color: isDark ? "#86efac" : "#1b5e20",
    boxShadow: 4,
    borderRadius: 3,
    p: 3,
    minHeight: 140,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: isDark ? "#0f172a" : "#f9fafb", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box sx={{
        width: 280,
        flexShrink: 0,
        display: { xs: 'none', lg: 'block' },
        background: isDark
          ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      }}>
        <Box sx={{ position: 'sticky', top: 80, p: 3 }}>
          <Typography variant="overline" sx={{ px: 2, mb: 3, display: 'block', color: 'text.secondary', fontWeight: '800', letterSpacing: '1.2px' }}>
            FACULTY MENU
          </Typography>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { text: 'Dashboard', icon: <DashboardIcon />, id: 'dashboard' },
              { text: 'Award Points', icon: <StarIcon />, id: 'award-points' },
              { text: 'Students List', icon: <PeopleIcon />, id: 'students-list' },
              { text: 'Tasks', icon: <AssignmentIcon />, id: 'tasks' },
              { text: 'Submissions', icon: <RateReviewIcon />, id: 'submissions' }
            ].map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => {
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(56, 142, 60, 0.15)' : 'rgba(27, 94, 32, 0.08)',
                    transform: 'translateX(5px)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: isDark ? "#86efac" : "#2e7d32", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: 600, fontFamily: '"Inter", sans-serif' } }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 5 }, maxWidth: 1200, mx: "auto", width: '100%', color: isDark ? "#ffffff" : "#212121" }}>
        <Typography id="dashboard" variant="h3" fontWeight="bold" mb={2} sx={{ color: isDark ? "#86efac" : "#1b5e20", textAlign: "center" }}>
          Faculty Dashboard
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {/* Stats */}
        <Grid container spacing={4} mb={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={statCardStyles} elevation={0} style={{ background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.8 }}>
                  Total Students
                </Typography>
                <Fade in timeout={600}>
                  <Typography variant="h2" sx={{ background: 'linear-gradient(45deg, #2e7d32, #66bb6a)', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                    {totalUsers}
                  </Typography>
                </Fade>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={statCardStyles} elevation={0} style={{ background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.8 }}>
                  Points Given
                </Typography>
                <Fade in timeout={600}>
                  <Typography variant="h2" sx={{ background: 'linear-gradient(45deg, #4caf50, #81c784)', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                    {totalPoints}
                  </Typography>
                </Fade>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={statCardStyles} elevation={0} style={{ background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.8 }}>
                  Top Student
                </Typography>
                {topStudent ? (
                  <Fade in timeout={600}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center", mt: 1 }}>
                      <Avatar
                        src={
                          topStudent.profilePic
                            ? `${baseurl}${topStudent.profilePic}`
                            : "/default-avatar.png"
                        }
                        alt={topStudent.fname}
                        sx={{ width: 64, height: 64, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid #4caf50' }}
                      />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="h5" fontWeight="bold">
                          {topStudent.fname}
                        </Typography>
                        <Chip
                          label={`${topStudent.points} pts`}

                          size="small"
                          sx={{ fontWeight: "bold", mt: 0.5, bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', borderRadius: 1 }}
                        />
                      </Box>
                    </Box>
                  </Fade>
                ) : (
                  <Typography>No students yet</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Award Points Section (same as admin) */}
        <Card id="award-points" sx={{ mb: 5, bgcolor: isDark ? "#1e293b" : "#ffffff", boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 4, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 3, fontWeight: "bold", letterSpacing: 1, color: isDark ? "#86efac" : "#1b5e20" }}
            >
              Award Points
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) =>
                    `${option.fname} (${option.studentId}) - ${option.points || 0} pts`
                  }
                  value={users.find((u) => u._id === awardData.studentId) || null}
                  onChange={(event, newValue) =>
                    setAwardData({ ...awardData, studentId: newValue?._id || "" })
                  }
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Avatar
                        src={
                          option.profilePic
                            ? `${baseurl}${option.profilePic}`
                            : "/default-avatar.png"
                        }
                        alt={option.fname}
                        sx={{ width: 30, height: 30 }}
                      />
                      <span>{`${option.fname} (${option.studentId}) - ${option.points || 0} pts`}</span>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Student" fullWidth />
                  )}
                  PaperComponent={({ children }) => (
                    <Paper
                      style={{ width: 350, maxHeight: 300, overflowY: "auto" }}
                    >
                      {children}
                    </Paper>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  label="Points"
                  type="number"
                  fullWidth
                  value={awardData.points}
                  onChange={(e) =>
                    setAwardData({ ...awardData, points: e.target.value })
                  }
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Reason"
                  fullWidth
                  value={awardData.reason}
                  onChange={(e) =>
                    setAwardData({ ...awardData, reason: e.target.value })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{
                    height: "100%",
                    fontWeight: "bold",
                    borderRadius: 2,
                    boxShadow: 2,
                    textTransform: "none",
                  }}
                  onClick={handleAward}
                >
                  Award
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Students List (faculty can't edit roles) */}
        <Card id="students-list" sx={{ bgcolor: isDark ? "#1e293b" : "white", boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 4, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              color="secondary"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              Students List
            </Typography>
            <TextField
              label="Search"
              fullWidth
              sx={{ mb: 2 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                sx: { bgcolor: isDark ? "#1e293b" : "#f5f5f5", borderRadius: 2, color: isDark ? "#ffffff" : "#212121" },
              }}
            />
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: isDark ? 'linear-gradient(90deg, #334155 0%, #1e293b 100%)' : 'linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)' }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Photo</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Student ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Year/Class/Dept</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Points</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary">No students found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u) => (
                      <TableRow key={u._id} hover sx={{ transition: "background 0.2s" }}>
                        <TableCell>
                          <Avatar
                            src={
                              u.profilePic
                                ? `${baseurl}${u.profilePic}`
                                : "/default-avatar.png"
                            }
                            alt={u.fname}
                            sx={{ width: 40, height: 40, boxShadow: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          {editingUserId === u._id ? (
                            <TextField
                              value={editForm.fname}
                              size="small"
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  fname: e.target.value,
                                })
                              }
                              sx={{ bgcolor: isDark ? "#1e293b" : "#f5f5f5", borderRadius: 1 }}
                            />
                          ) : (
                            <Typography fontWeight="bold">{u.fname}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === u._id ? (
                            <TextField
                              value={editForm.ename}
                              size="small"
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  ename: e.target.value,
                                })
                              }
                              sx={{ bgcolor: isDark ? "#1e293b" : "#f5f5f5", borderRadius: 1 }}
                            />
                          ) : (
                            <Typography>{u.ename}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.studentId}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          {editingUserId === u._id ? (
                            <TextField
                              value={editForm.yearClassDept}
                              size="small"
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  yearClassDept: e.target.value,
                                })
                              }
                              sx={{ bgcolor: isDark ? "#1e293b" : "#f5f5f5", borderRadius: 1 }}
                            />
                          ) : (
                            <Typography>{u.yearClassDept}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${u.points} pts`}
                            color="success"
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.status || "active"}
                            color={u.status === "active" ? "primary" : "default"}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {editingUserId === u._id ? (
                            <>
                              <Tooltip title="Save">
                                <IconButton
                                  onClick={() => handleSave(u._id)}
                                  color="success"
                                  sx={{ mr: 1 }}
                                >
                                  <Save />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton
                                  onClick={() => setEditingUserId(null)}
                                  color="error"
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => handleEdit(u)}
                                  color="primary"
                                  sx={{ mr: 1 }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={u.status === "active" ? "Deactivate" : "Activate"}>
                                <IconButton
                                  onClick={() => handleToggleStatus(u._id)}
                                  color={u.status === "active" ? "error" : "success"}
                                >
                                  {u.status === "active" ? <PersonOff /> : <Person />}
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Tasks List / Manage */}
        <Card id="tasks" sx={{ mt: 5, bgcolor: isDark ? "#1e293b" : "white", boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 4, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" gutterBottom color="secondary" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
                Tasks
              </Typography>
              <Button variant="contained" size="small" onClick={() => setCreateTaskOpen(true)}>Create Task</Button>
            </Box>

            {tasksLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: isDark ? 'linear-gradient(90deg, #334155 0%, #1e293b 100%)' : 'linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)' }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Points</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Due</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Years</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="center">Awarded</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">No tasks found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((t) => (
                        <TableRow key={t._id} hover>
                          <TableCell>{t.title}</TableCell>
                          <TableCell>{t.points}</TableCell>
                          <TableCell>{new Date(t.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{(t.assignedYears || []).join(", ") || "All"}</TableCell>
                          <TableCell align="center">{(t.awardedTo || []).length}</TableCell>
                          <TableCell align="center">
                            <Button variant="outlined" size="small" onClick={() => handleOpenTask(t)} sx={{ mr: 1 }}>
                              Manage
                            </Button>
                            <Tooltip title="Edit Task">
                              <IconButton size="small" onClick={() => handleEditTask(t)} color="primary">
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Task">
                              <IconButton size="small" onClick={() => { setTaskToDelete(t); setDeleteTaskOpen(true); }} color="error">
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manage Task</DialogTitle>
          <DialogContent>
            {selectedTask && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>{selectedTask.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedTask.description}</Typography>

                {candidatesLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}><CircularProgress size={28} /></Box>
                ) : (
                  <List>
                    {candidates.length === 0 ? (
                      <Typography color="text.secondary">No students match this task. Try using values like "Year 3", "3rd Year", or set "All" to target all students.</Typography>
                    ) : (
                      candidates.map((c) => (
                        <ListItem key={c._id} divider>
                          <ListItemAvatar>
                            <Avatar src={c.profilePic ? `${baseurl}${c.profilePic}` : "/default-avatar.png"} />
                          </ListItemAvatar>
                          <ListItemText primary={`${c.fname} (${c.studentId || "--"})`} secondary={`${c.yearClassDept || ""} • ${c.points || 0} pts`} />
                          <ListItemSecondaryAction>
                            <Button size="small" variant={c.awarded ? "outlined" : "contained"} disabled={c.awarded} onClick={() => handleAwardForTask(c)}>
                              {c.awarded ? "Awarded" : `Award ${selectedTask.points} pts`}
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    )}
                  </List>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Task Dialog (same as admin) */}
        <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Task</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', mt: 1 }}>
              <TextField label="Title" fullWidth value={createTaskForm.title} onChange={(e) => setCreateTaskForm({ ...createTaskForm, title: e.target.value })} />
              <TextField label="Description" fullWidth multiline rows={3} value={createTaskForm.description} onChange={(e) => setCreateTaskForm({ ...createTaskForm, description: e.target.value })} />
              <TextField label="Due Date" type="datetime-local" fullWidth value={createTaskForm.dueDate} onChange={(e) => setCreateTaskForm({ ...createTaskForm, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label="Points" type="number" fullWidth value={createTaskForm.points} onChange={(e) => setCreateTaskForm({ ...createTaskForm, points: Number(e.target.value) })} />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={createTaskForm.category} label="Category" onChange={(e) => setCreateTaskForm({ ...createTaskForm, category: e.target.value })}>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Quiz">Quiz</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                freeSolo
                options={yearOptions}
                value={createTaskForm.assignedYears}
                onChange={(e, val) => setCreateTaskForm({ ...createTaskForm, assignedYears: val })}
                renderInput={(params) => (
                  <TextField {...params} label="Assigned Years (select or add)" placeholder="Add or select..." fullWidth />
                )}
              />

              {createTaskForm.category === 'Quiz' && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Quiz Builder</Typography>
                  <TextField label="Passing Score (%)" type="number" value={createTaskForm.quiz.passingScore} onChange={(e) => setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, passingScore: Number(e.target.value) } })} sx={{ mt: 1 }} />

                  {createTaskForm.quiz.questions.map((q, qi) => (
                    <Card key={qi} sx={{ mt: 2, p: 2 }}>
                      <TextField fullWidth label={`Question ${qi + 1}`} value={q.text} onChange={(e) => {
                        const qs = [...createTaskForm.quiz.questions]; qs[qi].text = e.target.value; setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, questions: qs } });
                      }} />

                      <Box sx={{ mt: 1 }}>
                        {q.options.map((opt, oi) => (
                          <Box key={oi} sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                            <TextField fullWidth value={opt} onChange={(e) => {
                              const qs = [...createTaskForm.quiz.questions]; qs[qi].options[oi] = e.target.value; setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, questions: qs } });
                            }} />
                            <Button size="small" variant={q.correctIndex === oi ? 'contained' : 'outlined'} onClick={() => {
                              const qs = [...createTaskForm.quiz.questions]; qs[qi].correctIndex = oi; setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, questions: qs } });
                            }}>Mark Correct</Button>
                            <Button size="small" color="error" onClick={() => {
                              const qs = [...createTaskForm.quiz.questions]; qs[qi].options = qs[qi].options.filter((_, idx) => idx !== oi); if (qs[qi].correctIndex >= qs[qi].options.length) qs[qi].correctIndex = 0; setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, questions: qs } });
                            }}>Remove</Button>
                          </Box>
                        ))}

                        <Box sx={{ mt: 1 }}>
                          <Button size="small" onClick={() => {
                            const qs = [...createTaskForm.quiz.questions]; qs[qi].options.push(''); setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, questions: qs } });
                          }}>Add Option</Button>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        <Button size="small" color="error" onClick={() => {
                          const qs = createTaskForm.quiz.questions.filter((_, idx) => idx !== qi);
                          setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, questions: qs } });
                        }}>Remove Question</Button>
                      </Box>
                    </Card>
                  ))}

                  <Box sx={{ mt: 2 }}>
                    <Button onClick={() => {
                      const qs = createTaskForm.quiz.questions.concat([{ text: '', options: ['', ''], correctIndex: 0 }]);
                      setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, questions: qs } });
                    }}>Add Question</Button>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={async () => {
                  try {
                    const payload = {
                      title: createTaskForm.title,
                      description: createTaskForm.description,
                      dueDate: new Date(createTaskForm.dueDate).toISOString(),
                      points: createTaskForm.points,
                      category: createTaskForm.category,
                      assignedYears: Array.isArray(createTaskForm.assignedYears) ? createTaskForm.assignedYears.map(s => String(s).trim()).filter(Boolean) : [],
                    };
                    if (createTaskForm.category === 'Quiz') {
                      payload.quiz = createTaskForm.quiz;
                    }
                    const res = await axios.post(`${baseurl}/api/tasks/addtask`, payload);
                    setSuccess(res.data.message || 'Task created');
                    // refresh tasks
                    const tRes = await axios.get(`${baseurl}/api/tasks`);
                    setTasks(tRes.data || []);
                    setCreateTaskOpen(false);
                    setCreateTaskForm({ title: '', description: '', dueDate: '', points: 10, category: 'General', assignedYears: [], quiz: { questions: [], passingScore: 70 } });
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to create task');
                  }
                }}>Create</Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', mt: 1 }}>
              <TextField label="Title" fullWidth value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} />
              <TextField label="Description" fullWidth multiline rows={3} value={editTaskForm.description} onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })} />
              <TextField label="Due Date" type="datetime-local" fullWidth value={editTaskForm.dueDate} onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label="Points" type="number" fullWidth value={editTaskForm.points} onChange={(e) => setEditTaskForm({ ...editTaskForm, points: Number(e.target.value) })} />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={editTaskForm.category} label="Category" onChange={(e) => setEditTaskForm({ ...editTaskForm, category: e.target.value })}>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Quiz">Quiz</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                freeSolo
                options={yearOptions}
                value={editTaskForm.assignedYears}
                onChange={(e, val) => setEditTaskForm({ ...editTaskForm, assignedYears: val })}
                renderInput={(params) => (
                  <TextField {...params} label="Assigned Years (select or add)" placeholder="Add or select..." fullWidth />
                )}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button onClick={() => setEditTaskOpen(false)}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleSaveEditedTask}>Save Changes</Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Delete Task Confirmation Dialog */}
        <Dialog open={deleteTaskOpen} onClose={() => setDeleteTaskOpen(false)}>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the task "<strong>{taskToDelete?.title}</strong>"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
            <Button onClick={() => setDeleteTaskOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteTask}>Delete</Button>
          </Box>
        </Dialog>

        {/* View Submission Modal */}
        <Dialog open={viewSubOpen} onClose={() => setViewSubOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Submission Details</DialogTitle>
          <DialogContent dividers>
            {selectedSub && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Task</Typography>
                <Typography variant="h6" gutterBottom>{selectedSub.task?.title}</Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Student</Typography>
                <Typography variant="body1" gutterBottom>{selectedSub.user?.fname} ({selectedSub.user?.studentId})</Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Submitted Content</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
                  {selectedSub.type === 'text' && <Typography style={{ whiteSpace: 'pre-wrap' }}>{selectedSub.text}</Typography>}
                  {selectedSub.type === 'link' && <a href={selectedSub.link} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{selectedSub.link}</a>}
                  {selectedSub.type === 'file' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Preview if image */}
                      {['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => selectedSub.filePath?.toLowerCase().endsWith(ext)) && (
                        <img
                          src={`${baseurl}${selectedSub.filePath}`}
                          alt="Submission Preview"
                          style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8, border: '1px solid #ccc' }}
                        />
                      )}
                      {/* Preview if PDF */}
                      {selectedSub.filePath?.toLowerCase().endsWith('.pdf') && (
                        <iframe
                          src={`${baseurl}${selectedSub.filePath}`}
                          title="PDF Preview"
                          style={{ width: '100%', height: 400, border: 'none' }}
                        />
                      )}
                      <Button variant="outlined" component="a" href={`${baseurl}${selectedSub.filePath}`} target="_blank" startIcon={<AssignmentIcon />}>
                        Download File
                      </Button>
                    </Box>
                  )}
                  {selectedSub.type === 'quiz' && (
                    <Box>
                      <Typography variant="h4" color={selectedSub.passed ? 'success.main' : 'error.main'}>{selectedSub.score}%</Typography>
                      <Typography variant="caption">{selectedSub.passed ? 'PASSED' : 'FAILED'}</Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
          </DialogContent>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setViewSubOpen(false)}>Close</Button>
          </Box>
        </Dialog>

        <Card id="submissions" sx={{ mt: 5, bgcolor: isDark ? "#1e293b" : "white", boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 4, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
              Submissions
            </Typography>

            {subsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : submissions.length === 0 ? (
              <Typography color="text.secondary">No submissions yet.</Typography>
            ) : (
              <List>
                {submissions.map((s) => (
                  <ListItem key={s._id} divider>
                    <ListItemAvatar>
                      <Avatar src={s.user?.profilePic ? `${baseurl}${s.user.profilePic}` : '/default-avatar.png'} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={s.task?.title || '—'}
                      secondary={<>
                        <Typography component="span" variant="body2" color="text.primary">{s.user?.fname || 'Student'}</Typography>
                        <Typography component="span" variant="caption" sx={{ ml: 1 }}>{new Date(s.createdAt).toLocaleString()}</Typography>
                        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                          {s.type === 'text' ? (
                            s.text
                          ) : s.type === 'link' ? (
                            <a href={s.link} target="_blank" rel="noreferrer">{s.link}</a>
                          ) : s.type === 'file' && s.filePath ? (
                            <a href={`${baseurl}${s.filePath}`} target="_blank" rel="noreferrer">Download</a>
                          ) : s.type === 'quiz' ? (
                            <>
                              <strong>Score:</strong> {s.score}% • {s.passed ? 'Passed' : 'Failed'}
                            </>
                          ) : null}
                        </Typography>
                      </>}
                    />

                    <ListItemSecondaryAction>
                      <Chip label={s.status} color={s.status === 'pending' ? 'warning' : s.status === 'accepted' ? 'success' : 'default'} sx={{ mr: 1 }} />
                      <Tooltip title="View Submission">
                        <IconButton onClick={() => { setSelectedSub(s); setViewSubOpen(true); }} color="primary" sx={{ mr: 1 }}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleApproveSubmission(s)} disabled={s.status === 'accepted'}>Accept & Award</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleRejectSubmission(s)} disabled={s.status === 'rejected'}>Reject</Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity="success" onClose={() => setSuccess("")} variant="filled">
            {success}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity="error" onClose={() => setError("")} variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default FacultyDashboard;
