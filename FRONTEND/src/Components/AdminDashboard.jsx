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
  Stack,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  PersonOff,
  Person,
  Refresh,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as TaskIcon,
  RateReview as SubmissionIcon,
  EmojiEvents as AwardIcon,
  Message as MessageIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { useTheme } from "../contexts/ThemeContext";
// import { useAuth } from "../contexts/AuthContext"; // Ensure this exists if needed
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PointsPieChart, TopPodium } from './AdminVisualizations';

// --- Framer Motion Variants ---
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const DashboardStatCard = ({ title, value, icon, color, isDark }) => (
  <Card
    component={motion.div}
    whileHover={{ y: -5 }}
    sx={{
      p: 3,
      borderRadius: 4,
      background: isDark ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" : "white",
      boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.05)",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box sx={{ position: "absolute", top: -10, right: -10, opacity: 0.1, transform: "rotate(20deg)" }}>
      {React.cloneElement(icon, { sx: { fontSize: 100, color: color } })}
    </Box>
    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h3" fontWeight="800" sx={{ color: color }}>
      {value}
    </Typography>
  </Card>
);

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:900px)");

  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  // --- Layout State ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- Data State ---
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);

  // --- Loading States ---
  const [loading, setLoading] = useState({
    users: false,
    tasks: false,
    submissions: false,
    messages: false
  });

  // --- Action States (Forms, Dialogs) ---
  const [awardData, setAwardData] = useState({ studentId: "", points: "", reason: "" });
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null); // Keep for legacy or safety
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({ title: '', description: '', dueDate: '', points: 10, category: 'General', assignedYears: [], quiz: { questions: [], passingScore: 70 } });
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ fname: "", ename: "", yearClassDept: "", points: 0 });


  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // --- Create Task Form State ---
  const [createTaskForm, setCreateTaskForm] = useState({
    title: '', description: '', dueDate: '', points: 10, category: 'General', assignedYears: [], quiz: { questions: [], passingScore: 70 },
  });

  const yearOptions = Array.from(new Set(['All', 'Year 1', 'Year 2', 'Year 3', 'Year 4', ...(users || []).map((u) => u.yearClassDept).filter(Boolean)]));

  // --- Fetch Methods ---
  const fetchAllData = async () => {
    setLoading({ users: true, tasks: true, submissions: true, messages: true });
    try {
      const [uRes, tRes, sRes, mRes] = await Promise.all([
        axios.get(`${baseurl}/api/users`),
        axios.get(`${baseurl}/api/tasks`),
        axios.get(`${baseurl}/api/submissions`),
        axios.get(`${baseurl}/api/contact/all`)
      ]);
      setUsers(uRes.data);
      setFilteredUsers(uRes.data);
      setTasks(tRes.data);
      setSubmissions(sRes.data);
      setMessages(mRes.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading({ users: false, tasks: false, submissions: false, messages: false });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(u =>
        u.fname?.toLowerCase().includes(search.toLowerCase()) ||
        u.studentId?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  // --- Handlers (Award, Edit User, Task, Submission) ---
  const handleAward = async () => {
    if (!awardData.studentId || !awardData.points) return setError("Please select student and points");
    try {
      const res = await axios.post(`${baseurl}/api/award-points`, awardData);
      setSuccess(res.data.message);
      // Update local state by finding user and adding points
      const updatedUsers = users.map(u => u._id === awardData.studentId ? { ...u, points: (u.points || 0) + Number(awardData.points) } : u);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(u =>
        u.fname?.toLowerCase().includes(search.toLowerCase()) ||
        u.studentId?.toLowerCase().includes(search.toLowerCase())
      ));
      setAwardData({ studentId: "", points: "", reason: "" });
    } catch (err) { setError(err.response?.data?.message || "Award failed"); }
  };

  const handleCreateTask = async () => {
    if (!createTaskForm.title || !createTaskForm.points) return setError("Missing required fields");
    try {
      const payload = {
        ...createTaskForm,
        dueDate: new Date(createTaskForm.dueDate).toISOString(),
      };
      const res = await axios.post(`${baseurl}/api/tasks/addtask`, payload);
      setSuccess("Task created!");
      setTasks([...tasks, res.data.task || res.data]);
      setCreateTaskOpen(false);
      setCreateTaskForm({ title: '', description: '', dueDate: '', points: 10, category: 'General', assignedYears: [], quiz: { questions: [], passingScore: 70 } });
    } catch (err) { setError("Failed to create task"); }
  };

  const handleApproveSubmission = async (s) => {
    try {
      const res = await axios.put(`${baseurl}/api/submissions/${s._id}/approve`, { adminComment: '' });
      setSuccess("Submission accepted");
      setSubmissions(prev => prev.map(sub => sub._id === s._id ? { ...sub, status: 'accepted' } : sub));
      // update user points locally if returned
      if (res.data.user) {
        setUsers(prev => prev.map(u => u._id === res.data.user._id ? { ...u, points: res.data.user.points } : u));
      }
    } catch (err) { setError("Failed to accept"); }
  };

  const handleRejectSubmission = async (s) => {
    try {
      await axios.put(`${baseurl}/api/submissions/${s._id}/reject`, { adminComment: '' });
      setSuccess("Submission rejected");
      setSubmissions(prev => prev.map(sub => sub._id === s._id ? { ...sub, status: 'rejected' } : sub));
    } catch (err) { setError("Failed to reject"); }
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title, description: task.description, dueDate: task.dueDate.slice(0, 16), points: task.points,
      category: task.category || 'General', assignedYears: task.assignedYears || [], quiz: task.quiz || { questions: [], passingScore: 70 },
    });
    setEditTaskOpen(true);
  };

  const handleSaveEditedTask = async () => {
    if (!editingTask) return;
    try {
      const res = await axios.put(`${baseurl}/api/tasks/${editingTask._id}`, editTaskForm);
      setSuccess("Task updated");
      setTasks(prev => prev.map(t => t._id === editingTask._id ? res.data : t));
      setEditTaskOpen(false);
    } catch (err) { setError("Failed to update task"); }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await axios.delete(`${baseurl}/api/tasks/${taskToDelete._id}`);
      setSuccess("Task deleted");
      setTasks(prev => prev.filter(t => t._id !== taskToDelete._id));
      setDeleteTaskOpen(false);
    } catch (err) { setError("Failed to delete task"); }
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setEditUserForm({ fname: user.fname, ename: user.ename, yearClassDept: user.yearClassDept, points: user.points || 0 });
    setEditUserOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const res = await axios.put(`${baseurl}/api/users/${editingUser._id}`, editUserForm);
      setSuccess("User updated");
      setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, ...editUserForm } : u));
      setEditUserOpen(false);
    } catch (err) { setError("Failed to update user"); }
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await axios.put(`${baseurl}/api/users/${user._id}/status`);
      setSuccess(res.data.message);
      setUsers(prev => prev.map(u => u._id === user._id ? res.data.user : u));
    } catch (err) { setError("Failed to update status"); }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { id: "users", label: "Students", icon: <PeopleIcon /> },
    { id: "tasks", label: "Tasks", icon: <TaskIcon /> },
    { id: "submissions", label: "Submissions", icon: <SubmissionIcon /> },
    { id: "award", label: "Award Points", icon: <AwardIcon /> },
    { id: "messages", label: "Messages", icon: <MessageIcon /> },
  ];

  const SidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}>
      <Typography variant="h5" fontWeight="900" sx={{
        mb: 4,
        px: 2,
        background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        CampusAdmin
      </Typography>

      <Stack spacing={1} sx={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Box
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2,
                py: 1.5,
                borderRadius: 3,
                cursor: "pointer",
                color: isActive ? (isDark ? "#fff" : "#1e40af") : (isDark ? "#94a3b8" : "#64748b"),
                transition: "all 0.3s ease",
                "&:hover": { color: isDark ? "#fff" : "#1e40af" }
              }}
            >
              {isActive && (
                <Box
                  component={motion.div}
                  layoutId="activeBox"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 3,
                    bgcolor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",
                    border: `1px solid ${isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"}`,
                  }}
                />
              )}
              {item.icon}
              <Typography fontWeight={isActive ? "700" : "500"} sx={{ position: "relative", zIndex: 1 }}>
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={() => navigate('/L')}
        sx={{ borderRadius: 3, py: 1.5, mt: 2, border: '1px solid rgba(239, 68, 68, 0.3)' }}
      >
        Logout
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: isDark ? "#0f172a" : "#f8fafc" }}>
      {/* Messages / Alerts */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280, bgcolor: isDark ? "#1e293b" : "#fff" },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          bgcolor: isDark ? "#1e293b" : "#fff",
          borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
        }}
      >
        {SidebarContent}
      </Box>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - 280px)` } }}>
        <Box display={{ xs: "flex", md: "none" }} mb={2}>
          <IconButton onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
        </Box>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              {/* Stat Cards */}
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <DashboardStatCard title="Total Students" value={users.length} icon={<PeopleIcon />} color="#3b82f6" isDark={isDark} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DashboardStatCard title="Points Awarded" value={users.reduce((a, b) => a + (b.points || 0), 0)} icon={<AwardIcon />} color="#f59e0b" isDark={isDark} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DashboardStatCard title="Pending Submissions" value={submissions.filter(s => s.status === 'pending').length} icon={<SubmissionIcon />} color="#ec4899" isDark={isDark} />
                </Grid>
              </Grid>

              {/* Visualizations */}
              <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                  <PointsPieChart users={users} isDark={isDark} />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TopPodium users={users} isDark={isDark} />
                </Grid>
              </Grid>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div key="users" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" fontWeight="bold">Manage Students</Typography>
                <TextField
                  size="small"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: 300, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "white" }}
                />
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: isDark ? "#334155" : "#f1f5f9" }}>
                    <TableRow>
                      <TableCell sx={{ color: isDark ? "#fff" : "#475569", fontWeight: "bold" }}>Name</TableCell>
                      <TableCell sx={{ color: isDark ? "#fff" : "#475569", fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ color: isDark ? "#fff" : "#475569", fontWeight: "bold" }}>Points</TableCell>
                      <TableCell sx={{ color: isDark ? "#fff" : "#475569", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell align="right" sx={{ color: isDark ? "#fff" : "#475569", fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.slice(0, 50).map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar src={user.profilePic && `${baseurl}${user.profilePic}`} />
                            <Box>
                              <Typography fontWeight="500">{user.fname} {user.ename}</Typography>
                              <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.studentId}</TableCell>
                        <TableCell>
                          <Chip label={user.points} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status || "active"}
                            size="small"
                            color={user.status === "active" ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditUserClick(user)} sx={{ color: "primary.main" }}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                              <IconButton size="small" onClick={() => handleToggleStatus(user)} color={user.status === 'active' ? 'error' : 'success'}>
                                {user.status === 'active' ? <PersonOff fontSize="small" /> : <Person fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div key="tasks" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" fontWeight="bold">Active Tasks</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateTaskOpen(true)}
                  sx={{ bgcolor: "#3b82f6", borderRadius: 2 }}
                >
                  New Task
                </Button>
              </Box>
              <Grid container spacing={3}>
                {tasks.map(task => (
                  <Grid item xs={12} md={6} lg={4} key={task._id}>
                    <Card sx={{
                      borderRadius: 3,
                      bgcolor: isDark ? "#1e293b" : "white",
                      boxShadow: isDark ? 4 : 2,
                      height: "100%",
                      display: "flex", flexDirection: "column"
                    }}>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Chip label={task.category || "General"} size="small" sx={{ bgcolor: isDark ? "rgba(59, 130, 246, 0.2)" : "#e0f2fe", color: "#3b82f6" }} />
                          <Chip label={`${task.points} pts`} size="small" color="warning" />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>{task.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {task.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <Box sx={{ p: 2, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button size="small" variant="text" onClick={() => handleEditTaskClick(task)}>Edit</Button>
                        <Button size="small" variant="text" color="error" onClick={() => { setTaskToDelete(task); setDeleteTaskOpen(true); }}>Delete</Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {activeTab === "submissions" && (
            <motion.div key="submissions" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Typography variant="h5" fontWeight="bold" gutterBottom>Review Submissions</Typography>
              <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                <List>
                  {submissions.map((s, i) => (
                    <React.Fragment key={s._id}>
                      {i > 0 && <Divider />}
                      <ListItem sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: "flex-start", gap: 2, py: 2 }}>
                        <ListItemAvatar>
                          <Avatar src={s.user?.profilePic && `${baseurl}${s.user.profilePic}`} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography fontWeight="bold">
                              {s.task?.title || "Unknown Task"}
                              <span style={{ fontWeight: 400, opacity: 0.7, fontSize: "0.9em", marginLeft: 8 }}>by {s.user?.fname}</span>
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {s.type === 'link' && <a href={s.link} target="_blank" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{s.link}</a>}
                              {s.type === 'text' && <Typography variant="body2" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', p: 1, borderRadius: 1 }}>{s.text}</Typography>}
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>Submitted: {new Date(s.createdAt).toLocaleString()}</Typography>
                              <Chip label={s.status} size="small" sx={{ mt: 1 }} color={s.status === 'pending' ? 'warning' : s.status === 'accepted' ? 'success' : 'error'} />
                            </Box>
                          }
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={s.status !== 'pending'}
                            onClick={() => handleApproveSubmission(s)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            disabled={s.status !== 'pending'}
                            onClick={() => handleRejectSubmission(s)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                  {submissions.length === 0 && <Box p={3} textAlign="center">No submissions pending</Box>}
                </List>
              </Paper>
            </motion.div>
          )}

          {activeTab === "award" && (
            <motion.div key="award" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
                <Card sx={{ borderRadius: 4, boxShadow: 10, bgcolor: isDark ? "#1e293b" : "white" }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                      <Avatar sx={{ width: 80, height: 80, bgcolor: "warning.main", mb: 2 }}>
                        <AwardIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h4" fontWeight="bold">Award Points</Typography>
                      <Typography color="text.secondary">Recognize student achievements instantly</Typography>
                    </Box>

                    <Stack spacing={3}>
                      <Autocomplete
                        options={users}
                        getOptionLabel={(u) => `${u.fname} ${u.ename} (${u.studentId})`}
                        onChange={(_, val) => setAwardData({ ...awardData, studentId: val?._id || "" })}
                        renderInput={(params) => <TextField {...params} label="Select Student" fullWidth />}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar src={option.profilePic && `${baseurl}${option.profilePic}`} sx={{ width: 24, height: 24 }} />
                              {option.fname} {option.ename}
                            </Box>
                          </li>
                        )}
                      />
                      <TextField
                        label="Points Amount"
                        type="number"
                        fullWidth
                        value={awardData.points}
                        onChange={(e) => setAwardData({ ...awardData, points: e.target.value })}
                      />
                      <TextField
                        label="Reason / Note"
                        fullWidth
                        multiline
                        rows={2}
                        value={awardData.reason}
                        onChange={(e) => setAwardData({ ...awardData, reason: e.target.value })}
                      />
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleAward}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: "1.1rem",
                          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        }}
                      >
                        Send Points
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div key="messages" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Typography variant="h5" fontWeight="bold" gutterBottom>Messages</Typography>
              <Grid container spacing={2}>
                {messages.map((msg) => (
                  <Grid item xs={12} md={6} key={msg._id}>
                    <Card sx={{ borderRadius: 3, p: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography fontWeight="bold">{msg.firstName} {msg.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(msg.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>{msg.email}</Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                        <Typography variant="body2">{msg.message}</Typography>
                      </Paper>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

        </AnimatePresence>
      </Box>

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" fullWidth value={createTaskForm.title} onChange={e => setCreateTaskForm({ ...createTaskForm, title: e.target.value })} />
            <TextField label="Description" multiline rows={3} fullWidth value={createTaskForm.description} onChange={e => setCreateTaskForm({ ...createTaskForm, description: e.target.value })} />
            <TextField type="number" label="Points" fullWidth value={createTaskForm.points} onChange={e => setCreateTaskForm({ ...createTaskForm, points: e.target.value })} />
            <TextField type="datetime-local" fullWidth value={createTaskForm.dueDate} onChange={e => setCreateTaskForm({ ...createTaskForm, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" onClick={handleCreateTask}>Create</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" fullWidth value={editTaskForm.title} onChange={e => setEditTaskForm({ ...editTaskForm, title: e.target.value })} />
            <TextField label="Description" multiline rows={3} fullWidth value={editTaskForm.description} onChange={e => setEditTaskForm({ ...editTaskForm, description: e.target.value })} />
            <TextField type="number" label="Points" fullWidth value={editTaskForm.points} onChange={e => setEditTaskForm({ ...editTaskForm, points: e.target.value })} />
            <TextField type="datetime-local" fullWidth value={editTaskForm.dueDate} onChange={e => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" onClick={handleSaveEditedTask}>Save Changes</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <Dialog open={deleteTaskOpen} onClose={() => setDeleteTaskOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{taskToDelete?.title}</strong>?</Typography>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
          <Button onClick={() => setDeleteTaskOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteTask}>Delete</Button>
        </Box>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onClose={() => setEditUserOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="First Name" fullWidth value={editUserForm.fname} onChange={e => setEditUserForm({ ...editUserForm, fname: e.target.value })} />
            <TextField label="Last Name" fullWidth value={editUserForm.ename} onChange={e => setEditUserForm({ ...editUserForm, ename: e.target.value })} />
            <TextField label="Year/Class/Dept" fullWidth value={editUserForm.yearClassDept} onChange={e => setEditUserForm({ ...editUserForm, yearClassDept: e.target.value })} />
            <TextField type="number" label="Total Points" fullWidth value={editUserForm.points} onChange={e => setEditUserForm({ ...editUserForm, points: Number(e.target.value) })} />
            <Button variant="contained" onClick={handleSaveUser}>Save User</Button>
          </Stack>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default AdminDashboard;
