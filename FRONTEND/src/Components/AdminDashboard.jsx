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
  DialogActions,
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
  Add as AddIcon,
  Close as CloseIcon,
  Visibility,
  VolunteerActivism as VolunteerIcon
} from "@mui/icons-material";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PointsPieChart, TopPodium, StudentBarChart } from './AdminVisualizations';

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
    <Typography variant="subtitle2" color={isDark ? "text.secondary" : "#000000"} fontWeight="bold" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h3" fontWeight="800" sx={{ color: color }}>
      {value}
    </Typography>
  </Card>
);

const AdminDashboard = () => {
  const { user: currentUser, updateUser } = useAuth();
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
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedRealDept, setSelectedRealDept] = useState("All");
  const [dashboardDept, setDashboardDept] = useState("All");
  const [dashboardYear, setDashboardYear] = useState("All");
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
  const [editUserForm, setEditUserForm] = useState({ fname: "", ename: "", yearClassDept: "", department: "", points: 0, studentId: "" });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Volunteer State
  const [volunteers, setVolunteers] = useState([]);


  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Helper to get minimum date-time (current local time)
  const getMinDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - (offset * 60 * 1000));
    return localNow.toISOString().slice(0, 16);
  };

  // --- Create Task Form State ---
  const [createTaskForm, setCreateTaskForm] = useState({
    title: "", description: "", points: 10, category: "General", dueDate: "",
    assignedYears: [],
    quiz: { questions: [], passingScore: 70 }
  });

  // --- Quiz Builder State ---
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.text || currentQuestion.options.some(o => !o)) {
      return setError("Please fill all question fields");
    }
    setCreateTaskForm(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [...prev.quiz.questions, currentQuestion]
      }
    }));
    setCurrentQuestion({ text: "", options: ["", "", "", ""], correctIndex: 0 });
  };

  const handleRemoveQuestion = (index) => {
    setCreateTaskForm(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const yearOptions = ['All', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];
  const departmentOptions = [
    'All',
    ...new Set([
      'Computer Science',
      'Commerce',
      'English',
      'Food Technologyy',
      'Multimedia',
      'Hotel Management',
      'Tourism Management',
      'Costume & Fashion Designing',
      'Management',
      'Languages',
      'Mathematics',
      ...(users || []).map(u => u.department).filter(Boolean)
    ])
  ];

  const deptShortForms = {
    'Computer Science': 'CS',
    'Commerce': 'B.Com',
    'English': 'BA English',
    'Food Technologyy': 'Food Tech',
    'Multimedia': 'Multimedia',
    'Hotel Management': 'BHM',
    'Tourism Management': 'BTTM',
    'Costume & Fashion Designing': 'Fashion',
    'Management': 'BBA',
    'Languages': 'BA Lang',
    'Mathematics': 'B.Sc Maths'
  };

  // --- Fetch Methods ---
  const fetchAllData = async () => {
    setLoading({ users: true, tasks: true, submissions: true, messages: true });
    try {
      const [uRes, tRes, sRes, mRes, vRes] = await Promise.all([
        axios.get(`${baseurl}/api/users`),
        axios.get(`${baseurl}/api/tasks`),
        axios.get(`${baseurl}/api/submissions`),
        axios.get(`${baseurl}/api/contact/all`),
        axios.get(`${baseurl}/api/volunteers/all`)
      ]);
      setUsers(uRes.data);
      setFilteredUsers(uRes.data);
      setTasks(tRes.data);
      setSubmissions(sRes.data);
      setMessages(mRes.data || []);
      setVolunteers(vRes.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading({ users: false, tasks: false, submissions: false, messages: false, volunteers: false });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(u => {
        const matchesSearch = (u.fname?.toLowerCase() || "").includes(search.toLowerCase()) || (u.studentId?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesYear = selectedDept === "All" || u.yearClassDept === selectedDept;
        const matchesDept = selectedRealDept === "All" || u.department === selectedRealDept;
        const isStudent = u.role === 'user';
        return matchesSearch && matchesYear && matchesDept && isStudent;
      })
    );
  }, [search, selectedDept, selectedRealDept, users]);

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

    // Auto-add pending question if user forgot to click "Add Question"
    let finalQuestions = [...createTaskForm.quiz.questions];
    if (finalQuestions.length === 0 && currentQuestion.text && currentQuestion.options.every(o => o)) {
      finalQuestions.push(currentQuestion);
    }

    // Validation: If Quiz mode is active or category is Quiz, require at least one question
    if ((showQuizBuilder || createTaskForm.category === 'Quiz') && finalQuestions.length === 0) {
      return setError("Please add at least one question for the Quiz.");
    }

    try {
      const payload = {
        ...createTaskForm,
        quiz: {
          ...createTaskForm.quiz,
          questions: finalQuestions
        },
        dueDate: new Date(createTaskForm.dueDate).toISOString(),
      };
      const res = await axios.post(`${baseurl}/api/tasks/addtask`, payload);
      setSuccess("Task created!");
      setTasks([...tasks, res.data.task || res.data]);
      setCreateTaskOpen(false);

      // Reset forms
      setCreateTaskForm({ title: '', description: '', dueDate: '', points: 10, category: 'General', assignedYears: [], quiz: { questions: [], passingScore: 70 } });
      setCurrentQuestion({ text: "", options: ["", "", "", ""], correctIndex: 0 });
      setShowQuizBuilder(false);

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

  const handleClearSubmissions = async () => {
    if (!window.confirm("Are you sure you want to delete ALL submissions? This cannot be undone.")) return;
    try {
      await axios.delete(`${baseurl}/api/submissions`);
      setSuccess("All submissions cleared");
      setSubmissions([]);
    } catch (err) { setError("Failed to clear submissions"); }
  };

  const handleClearMessages = async () => {
    if (!window.confirm("Are you sure you want to delete ALL messages? This cannot be undone.")) return;
    try {
      await axios.delete(`${baseurl}/api/contact/all`);
      setSuccess("All messages cleared");
      setMessages([]);
    } catch (err) { setError("Failed to clear messages"); }
  };

  const handleDownloadFile = async (url, filename) => {
    try {
      const response = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
      setError("Failed to download file");
    }
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title, description: task.description, dueDate: task.dueDate.slice(0, 16), points: task.points,
      category: task.category || 'General', assignedYears: task.assignedYears || [], quiz: task.quiz || { questions: [], passingScore: 70 },
    });
    setCurrentQuestion({ text: "", options: ["", "", "", ""], correctIndex: 0 }); // Reset question state
    setEditTaskOpen(true);
  };

  const handleAddQuestionToEdit = () => {
    if (!currentQuestion.text || currentQuestion.options.some(o => !o)) {
      return setError("Please fill all question fields");
    }
    setEditTaskForm(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [...(prev.quiz?.questions || []), currentQuestion]
      }
    }));
    setCurrentQuestion({ text: "", options: ["", "", "", ""], correctIndex: 0 });
  };

  const handleRemoveQuestionFromEdit = (index) => {
    setEditTaskForm(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const handleEditQuestion = (index) => {
    const q = editTaskForm.quiz.questions[index];
    setCurrentQuestion(q);
    handleRemoveQuestionFromEdit(index);
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

  const handleClearTasks = async () => {
    if (!window.confirm("Are you sure you want to delete ALL tasks? This cannot be undone.")) return;
    try {
      await axios.delete(`${baseurl}/api/tasks`);
      setSuccess("All tasks cleared");
      setTasks([]);
    } catch (err) { setError("Failed to clear tasks"); }
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setEditUserForm({
      fname: user.fname,
      ename: user.ename,
      yearClassDept: user.yearClassDept,
      department: user.department || "",
      points: user.points || 0,
      studentId: (user.studentId !== undefined && user.studentId !== null) ? user.studentId : ""
    });
    setEditUserOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const formData = new FormData();
      formData.append("fullName", editUserForm.fname);
      formData.append("email", editUserForm.ename);
      if (editUserForm.studentId) formData.append("studentId", editUserForm.studentId);
      formData.append("yearClassDept", editUserForm.yearClassDept);
      formData.append("department", editUserForm.department);
      formData.append("points", editUserForm.points);

      const res = await axios.put(`${baseurl}/api/users/${editingUser._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess("User updated successfully");

      // Update local state with the response from server
      const updatedUser = res.data.user;
      setUsers(prev => prev.map(u => u._id === editingUser._id ? updatedUser : u));

      // If admin edited themselves, update global auth state (Navbar)
      if (currentUser && (editingUser._id === currentUser.id || editingUser._id === currentUser._id)) {
        updateUser(updatedUser);
      }

      setEditUserOpen(false);
      // Refetch all data to ensure consistency
      setTimeout(() => fetchAllData(), 500);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update user");
    }
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
    { id: "faculty", label: "Faculty & Store", icon: <PeopleIcon /> },
    { id: "tasks", label: "Tasks", icon: <TaskIcon /> },
    { id: "submissions", label: "Submissions", icon: <SubmissionIcon /> },
    { id: "award", label: "Award Points", icon: <AwardIcon /> },
    { id: "messages", label: "Messages", icon: <MessageIcon /> },
    { id: "volunteers", label: "Volunteers", icon: <VolunteerIcon /> },
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
                color: isActive ? (isDark ? "#fff" : "#1e40af") : (isDark ? "#94a3b8" : "#334155"),
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
              <Typography fontWeight={isActive ? "700" : "500"} color="inherit" sx={{ position: "relative", zIndex: 1 }}>
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: isDark ? 'linear-gradient(-45deg, #0f172a 0%, #111827 100%)' : "#f8fafc" }}>
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
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280, bgcolor: isDark ? "#0f172a" : "#fff" },
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
          bgcolor: isDark ? "#0f172a" : "#fff",
          borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"}`,
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
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" fontWeight="bold">Dashboard Overview</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={dashboardYear}
                      onChange={(e) => setDashboardYear(e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "white", color: isDark ? '#e6eef8' : undefined }}
                    >
                      {yearOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt === 'All' ? 'All Years' : opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={dashboardDept}
                      onChange={(e) => setDashboardDept(e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "white", color: isDark ? '#e6eef8' : undefined }}
                    >
                      {departmentOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt === 'All' ? 'All Depts' : opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <DashboardStatCard
                    title="Total Students"
                    value={users.filter(u =>
                      u.role === 'user' &&
                      u.status === 'active' &&
                      (dashboardDept === 'All' || u.department === dashboardDept) &&
                      (dashboardYear === 'All' || u.yearClassDept === dashboardYear)
                    ).length}
                    icon={<PeopleIcon />}
                    color="#3b82f6"
                    isDark={isDark}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <DashboardStatCard
                    title="Points Awarded"
                    value={users.filter(u =>
                      u.role === 'user' &&
                      (dashboardDept === 'All' || u.department === dashboardDept) &&
                      (dashboardYear === 'All' || u.yearClassDept === dashboardYear)
                    ).reduce((a, b) => a + (b.points || 0), 0)}
                    icon={<AwardIcon />}
                    color="#f59e0b"
                    isDark={isDark}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <DashboardStatCard
                    title="Pending Submissions"
                    value={submissions.filter(s =>
                      s.status === 'pending' &&
                      (dashboardDept === 'All' || s.user?.department === dashboardDept) &&
                      (dashboardYear === 'All' || s.user?.yearClassDept === dashboardYear)
                    ).length}
                    icon={<SubmissionIcon />}
                    color="#ec4899"
                    isDark={isDark}
                  />
                </Grid>
              </Grid>


              {/* Visualizations */}
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <PointsPieChart
                    users={users.filter(u =>
                      u.status !== 'inactive' &&
                      u.role === 'user' &&
                      (dashboardDept === 'All' || u.department === dashboardDept) &&
                      (dashboardYear === 'All' || u.yearClassDept === dashboardYear)
                    )}
                    isDark={isDark}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <StudentBarChart
                    users={users.filter(u =>
                      u.status !== 'inactive' &&
                      u.role === 'user' &&
                      (dashboardDept === 'All' || u.department === dashboardDept) &&
                      (dashboardYear === 'All' || u.yearClassDept === dashboardYear)
                    )}
                    isDark={isDark}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <TopPodium
                    users={users.filter(u =>
                      u.role === 'user' &&
                      u.status !== 'inactive' &&
                      (dashboardDept === 'All' || u.department === dashboardDept) &&
                      (dashboardYear === 'All' || u.yearClassDept === dashboardYear)
                    )}
                    isDark={isDark}
                  />
                </Grid>
              </Grid>


            </motion.div>
          )}

          {activeTab === "volunteers" && (
            <motion.div key="volunteers" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" fontWeight="bold">Volunteer Applications</Typography>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, bgcolor: isDark ? '#1e293b' : undefined, color: isDark ? '#e6eef8' : undefined }}>
                <Table>
                  <TableHead sx={{ bgcolor: isDark ? "#0b1220" : "#f1f5f9" }}>
                    <TableRow>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Name</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Department</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Year</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Reason</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell align="right" sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Award Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteers.map((vol) => (
                      <TableRow key={vol._id} hover>
                        <TableCell>
                          <Typography fontWeight="500">{vol.name}</Typography>
                          <Typography variant="caption" color={isDark ? "text.secondary" : "#475569"}>{vol.email}</Typography>
                          <Typography variant="caption" display="block" color={isDark ? "text.secondary" : "#475569"}>{vol.studentId}</Typography>
                        </TableCell>
                        <TableCell>{vol.department}</TableCell>
                        <TableCell>{vol.year}</TableCell>
                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Tooltip title={vol.reason}>
                            <span>{vol.reason}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={vol.status}
                            size="small"
                            color={vol.status === 'approved' ? 'success' : vol.status === 'rejected' ? 'error' : 'warning'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {vol.status === 'pending' && (
                            <Box display="flex" justifyContent="flex-end" gap={1}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={async () => {
                                  try {
                                    await axios.put(`${baseurl}/api/volunteers/${vol._id}/status`, { status: 'approved' });
                                    setSuccess("Volunteer approved");
                                    setVolunteers(prev => prev.map(v => v._id === vol._id ? { ...v, status: 'approved' } : v));
                                  } catch (err) { setError("Failed to approve"); }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={async () => {
                                  try {
                                    await axios.put(`${baseurl}/api/volunteers/${vol._id}/status`, { status: 'rejected' });
                                    setSuccess("Volunteer rejected");
                                    setVolunteers(prev => prev.map(v => v._id === vol._id ? { ...v, status: 'rejected' } : v));
                                  } catch (err) { setError("Failed to reject"); }
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {volunteers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No volunteer applications found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>
          )}

          {activeTab === "faculty" && (
            <motion.div key="faculty" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" fontWeight="bold">Faculty & Store</Typography>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, bgcolor: isDark ? '#1e293b' : undefined, color: isDark ? '#e6eef8' : undefined }}>
                <Table>
                  <TableHead sx={{ bgcolor: isDark ? "#0b1220" : "#f1f5f9" }}>
                    <TableRow>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Name</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Department</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Role</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell align="right" sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users
                      .filter(u => ['admin', 'faculty', 'store'].includes(u.role))
                      .map((user) => (
                        <TableRow key={user._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar src={user.profilePic && `${baseurl}${user.profilePic}`} />
                              <Box>
                                <Typography fontWeight="500">{user.fname} {user.ename}</Typography>
                                <Typography variant="caption" color={isDark ? "text.secondary" : "#475569"}>{user.ename}</Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{user.department || user.yearClassDept || "N/A"}</Typography>
                          </TableCell>

                          <TableCell>
                            {user.role === 'admin' ? (
                              <Chip label="ADMIN" size="small" color="secondary" sx={{ fontWeight: 'bold' }} />
                            ) : user.role === 'faculty' ? (
                              <Chip label="Faculty" size="small" color="info" sx={{ fontWeight: 'bold' }} />
                            ) : user.role === 'store' ? (
                              <Chip label="Store" size="small" color="warning" sx={{ fontWeight: 'bold' }} />
                            ) : (
                              <Chip label="User" size="small" />
                            )}
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

          {activeTab === "users" && (
            <motion.div key="users" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" fontWeight="bold">Manage Students</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={selectedRealDept}
                      onChange={(e) => setSelectedRealDept(e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "white", color: isDark ? '#e6eef8' : undefined }}
                    >
                      {departmentOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt === 'All' ? 'All Depts' : opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "white", color: isDark ? '#e6eef8' : undefined }}
                    >
                      {yearOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 250, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "white", color: isDark ? '#e6eef8' : undefined }}
                  />
                </Box>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, bgcolor: isDark ? '#1e293b' : undefined, color: isDark ? '#e6eef8' : undefined }}>
                <Table>
                  <TableHead sx={{ bgcolor: isDark ? "#0b1220" : "#f1f5f9" }}>
                    <TableRow>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Name</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Email</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Dept</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Year</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Points</TableCell>
                      <TableCell sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell align="right" sx={{ color: isDark ? "#e6eef8" : "#0f172a", fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.slice(0, 50).map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar src={user.profilePic && `${baseurl}${user.profilePic}`} />
                            <Typography fontWeight="500">{user.fname}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.ename}</TableCell>
                        <TableCell>{deptShortForms[user.department] || user.department || "-"}</TableCell>
                        <TableCell>{user.yearClassDept || "-"}</TableCell>
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
                <Box>
                  {tasks.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleClearTasks}
                      sx={{ mr: 2 }}
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateTaskOpen(true)}
                    sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', borderRadius: 2 }}
                  >
                    New Task
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={3}>
                {tasks.map(task => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={task._id}>
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
                        <Typography variant="body2" color={isDark ? "text.secondary" : "#334155"} sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {task.description}
                        </Typography>
                        <Typography variant="caption" color={isDark ? "text.secondary" : "#475569"}>
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">Review Submissions</Typography>
                {submissions.length > 0 && (
                  <Button variant="outlined" color="error" onClick={handleClearSubmissions}>
                    Clear All
                  </Button>
                )}
              </Box>
              <Paper sx={{ borderRadius: 3, overflow: "hidden", bgcolor: isDark ? '#0f172a' : undefined, color: isDark ? '#e6eef8' : undefined }}>
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
                          {s.task?.category !== 'Quiz' && (
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => setSelectedSubmission(s)} sx={{ color: "info.main" }}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          )}
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
                        options={users.filter(u => u.role === 'user')}
                        getOptionLabel={(u) => u.fname}
                        onChange={(_, val) => setAwardData({ ...awardData, studentId: val?._id || "" })}
                        renderInput={(params) => <TextField {...params} label="Select Student" fullWidth />}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar src={option.profilePic && `${baseurl}${option.profilePic}`} sx={{ width: 24, height: 24 }} />
                              {option.fname}
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">Messages</Typography>
                {messages.length > 0 && (
                  <Button variant="outlined" color="error" onClick={handleClearMessages}>
                    Clear All
                  </Button>
                )}
              </Box>
              <Grid container spacing={3}>
                {messages.map((msg) => (
                  <Grid item xs={12} sm={6} md={4} key={msg._id}>
                    <Card sx={{
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: isDark ? '#1e293b' : undefined,
                      color: isDark ? '#e6eef8' : undefined,
                      boxShadow: isDark ? 4 : 2,
                      transition: 'transform 0.2s',
                      "&:hover": { transform: 'translateY(-4px)' }
                    }}>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Box>
                            <Typography fontWeight="bold" variant="h6" sx={{ lineHeight: 1.2 }}>{msg.firstName} {msg.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{msg.email}</Typography>
                          </Box>
                          <Chip label={new Date(msg.createdAt).toLocaleDateString()} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            color: isDark ? "rgba(255,255,255,0.7)" : "text.secondary"
                          }}
                        >
                          {msg.message}
                        </Typography>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedMessage(msg)}
                          sx={{ borderRadius: 2 }}
                        >
                          Read Message
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {messages.length === 0 && (
                <Box textAlign="center" py={8} color="text.secondary">
                  <Typography variant="h6">No messages yet</Typography>
                </Box>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </Box>

      {/* View Submission Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: isDark ? '#0f172a' : undefined, color: isDark ? '#e6eef8' : undefined, borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Submission Details
          <IconButton onClick={() => setSelectedSubmission(null)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSubmission && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Student</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Avatar src={selectedSubmission.user?.profilePic && `${baseurl}${selectedSubmission.user.profilePic}`} sx={{ width: 32, height: 32 }} />
                  <Box>
                    <Typography variant="body1" fontWeight="500">{selectedSubmission.user?.fname} {selectedSubmission.user?.ename}</Typography>
                    <Typography variant="caption" color="text.secondary">{selectedSubmission.user?.studentId}</Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Task</Typography>
                <Typography variant="body1" fontWeight="500">{selectedSubmission.task?.title}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Content</Typography>
                {selectedSubmission.type === 'link' ? (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'grey.50', borderRadius: 2 }}>
                    <a href={selectedSubmission.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', wordBreak: 'break-all' }}>{selectedSubmission.link}</a>
                  </Paper>
                ) : selectedSubmission.type === 'file' ? (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>File Attachment</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        href={`${baseurl}${selectedSubmission.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View File
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleDownloadFile(`${baseurl}${selectedSubmission.filePath}`, selectedSubmission.filePath.split('/').pop())}
                        color="primary"
                      >
                        Download File
                      </Button>
                    </Box>
                  </Paper>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'grey.50', borderRadius: 2, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedSubmission.text || (selectedSubmission.type === 'quiz' ? `Quiz Score: ${selectedSubmission.score}%` : 'No content')}
                    </Typography>
                  </Paper>
                )}
              </Box>
              <Box display="flex" gap={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Submitted At</Typography>
                  <Typography variant="body2">{new Date(selectedSubmission.createdAt).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedSubmission.status} color={selectedSubmission.status === 'pending' ? 'warning' : selectedSubmission.status === 'accepted' ? 'success' : 'error'} size="small" />
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {selectedSubmission?.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() => { handleRejectSubmission(selectedSubmission); setSelectedSubmission(null); }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => { handleApproveSubmission(selectedSubmission); setSelectedSubmission(null); }}
              >
                Accept
              </Button>
            </>
          )}
          <Button onClick={() => setSelectedSubmission(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: isDark ? '#0f172a' : undefined, color: isDark ? '#e6eef8' : undefined, borderRadius: 3 } }}
      >
        {selectedMessage && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Message Details</Typography>
              <IconButton onClick={() => setSelectedMessage(null)} size="small" sx={{ color: 'text.secondary' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">From</Typography>
                <Typography variant="h6">{selectedMessage.firstName} {selectedMessage.lastName}</Typography>
                <Typography variant="body2" color="primary">{selectedMessage.email}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography variant="body2">{new Date(selectedMessage.createdAt).toLocaleString()}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Message</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)", borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</Typography>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedMessage(null)} variant="outlined" color="inherit">Close</Button>
              <Button
                variant="contained"
                color="primary"
                href={`mailto:${selectedMessage.email}`}
              >
                Reply via Email
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: isDark ? '#0f172a' : undefined, color: isDark ? '#e6eef8' : undefined } }}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" fullWidth value={createTaskForm.title} onChange={e => setCreateTaskForm({ ...createTaskForm, title: e.target.value })} />
            <TextField label="Description" multiline rows={3} fullWidth value={createTaskForm.description} onChange={e => setCreateTaskForm({ ...createTaskForm, description: e.target.value })} />
            <TextField type="number" label="Points" fullWidth value={createTaskForm.points} onChange={e => setCreateTaskForm({ ...createTaskForm, points: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={createTaskForm.category}
                label="Category"
                onChange={(e) => {
                  const val = e.target.value;
                  setCreateTaskForm({ ...createTaskForm, category: val });
                  setShowQuizBuilder(val === 'Quiz');
                }}
              >
                <MenuItem value="General">Assignment</MenuItem>
                <MenuItem value="Quiz">Quiz</MenuItem>
              </Select>
            </FormControl>
            <Autocomplete
              multiple
              options={yearOptions}
              value={createTaskForm.assignedYears || []}
              onChange={(_, newValue) => setCreateTaskForm({ ...createTaskForm, assignedYears: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assigned To (Years)"
                  placeholder="Select years..."
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                  />
                ))
              }
            />
            <TextField
              type="datetime-local"
              fullWidth
              value={createTaskForm.dueDate}
              onChange={e => setCreateTaskForm({ ...createTaskForm, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getMinDateTime() }}
              sx={{
                "& .MuiInputBase-input": {
                  colorScheme: isDark ? "dark" : "light",
                },
                "& ::-webkit-calendar-picker-indicator": {
                  cursor: "pointer"
                }
              }}
            />

            {showQuizBuilder && (
              <Box sx={{ bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)", p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Passing Score (%)</Typography>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={createTaskForm.quiz.passingScore}
                  onChange={e => setCreateTaskForm({ ...createTaskForm, quiz: { ...createTaskForm.quiz, passingScore: Number(e.target.value) } })}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" gutterBottom>Add Question</Typography>
                <TextField
                  label="Question Text"
                  size="small"
                  fullWidth
                  value={currentQuestion.text}
                  onChange={e => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  sx={{ mb: 1 }}
                />

                {currentQuestion.options.map((opt, idx) => (
                  <Box key={idx} display="flex" gap={1} mb={1}>
                    <TextField
                      placeholder={`Option ${idx + 1}`}
                      size="small"
                      fullWidth
                      value={opt}
                      onChange={e => {
                        const newOpts = [...currentQuestion.options];
                        newOpts[idx] = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: newOpts });
                      }}
                    />
                    <Button
                      variant={currentQuestion.correctIndex === idx ? "contained" : "outlined"}
                      color={currentQuestion.correctIndex === idx ? "success" : "inherit"}
                      onClick={() => setCurrentQuestion({ ...currentQuestion, correctIndex: idx })}
                      sx={{ minWidth: 40 }}
                    >
                      {currentQuestion.correctIndex === idx ? "✓" : ""}
                    </Button>
                  </Box>
                ))}

                <Button variant="outlined" fullWidth onClick={handleAddQuestion} sx={{ mb: 2 }}>Add Question</Button>

                {createTaskForm.quiz.questions.length > 0 && (
                  <List dense sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
                    {createTaskForm.quiz.questions.map((q, i) => (
                      <ListItem key={i} secondaryAction={
                        <IconButton edge="end" size="small" onClick={() => handleRemoveQuestion(i)}><Cancel fontSize="small" /></IconButton>
                      }>
                        <ListItemText
                          primary={`Q${i + 1}: ${q.text}`}
                          secondary={`${q.options.length} options (Correct: ${q.options[q.correctIndex]})`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            <Button variant="contained" onClick={handleCreateTask}>Create</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: isDark ? '#0f172a' : undefined, color: isDark ? '#e6eef8' : undefined } }}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" fullWidth value={editTaskForm.title} onChange={e => setEditTaskForm({ ...editTaskForm, title: e.target.value })} />
            <TextField label="Description" multiline rows={3} fullWidth value={editTaskForm.description} onChange={e => setEditTaskForm({ ...editTaskForm, description: e.target.value })} />
            <TextField type="number" label="Points" fullWidth value={editTaskForm.points} onChange={e => setEditTaskForm({ ...editTaskForm, points: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editTaskForm.category === 'Quiz' ? 'Quiz' : 'General'}
                label="Category"
                onChange={(e) => {
                  setEditTaskForm({ ...editTaskForm, category: e.target.value });
                }}
              >
                <MenuItem value="General">Assignment</MenuItem>
                <MenuItem value="Quiz">Quiz</MenuItem>
              </Select>
            </FormControl>
            <Autocomplete
              multiple
              options={yearOptions}
              value={editTaskForm.assignedYears || []}
              onChange={(_, newValue) => setEditTaskForm({ ...editTaskForm, assignedYears: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assigned To (Years)"
                  placeholder="Select years..."
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                  />
                ))
              }
            />
            <TextField
              type="datetime-local"
              fullWidth
              value={editTaskForm.dueDate}
              onChange={e => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getMinDateTime() }}
            />

            {(editTaskForm.category === 'Quiz' || (editTaskForm.quiz && editTaskForm.quiz.questions.length > 0)) && (
              <Box sx={{ bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)", p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Passing Score (%)</Typography>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={editTaskForm.quiz.passingScore}
                  onChange={e => setEditTaskForm({ ...editTaskForm, quiz: { ...editTaskForm.quiz, passingScore: Number(e.target.value) } })}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" gutterBottom>Add / Update Question</Typography>
                <TextField
                  label="Question Text"
                  size="small"
                  fullWidth
                  value={currentQuestion.text}
                  onChange={e => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  sx={{ mb: 1 }}
                />

                {currentQuestion.options.map((opt, idx) => (
                  <Box key={idx} display="flex" gap={1} mb={1}>
                    <TextField
                      placeholder={`Option ${idx + 1}`}
                      size="small"
                      fullWidth
                      value={opt}
                      onChange={e => {
                        const newOpts = [...currentQuestion.options];
                        newOpts[idx] = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: newOpts });
                      }}
                    />
                    <Button
                      variant={currentQuestion.correctIndex === idx ? "contained" : "outlined"}
                      color={currentQuestion.correctIndex === idx ? "success" : "inherit"}
                      onClick={() => setCurrentQuestion({ ...currentQuestion, correctIndex: idx })}
                      sx={{ minWidth: 40 }}
                    >
                      {currentQuestion.correctIndex === idx ? "✓" : ""}
                    </Button>
                  </Box>
                ))}

                <Button variant="outlined" fullWidth onClick={handleAddQuestionToEdit} sx={{ mb: 2 }}>
                  Add Question
                </Button>

                {editTaskForm.quiz && editTaskForm.quiz.questions.length > 0 && (
                  <List dense sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
                    {editTaskForm.quiz.questions.map((q, i) => (
                      <ListItem key={i} secondaryAction={
                        <Box>
                          <IconButton edge="end" size="small" onClick={() => handleEditQuestion(i)} sx={{ mr: 1 }}><Edit fontSize="small" /></IconButton>
                          <IconButton edge="end" size="small" onClick={() => handleRemoveQuestionFromEdit(i)}><Cancel fontSize="small" /></IconButton>
                        </Box>
                      }>
                        <ListItemText
                          primary={`Q${i + 1}: ${q.text}`}
                          secondary={`${q.options.length} options (Correct: ${q.options[q.correctIndex]})`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
            <Button variant="contained" onClick={handleSaveEditedTask}>Save Changes</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <Dialog open={deleteTaskOpen} onClose={() => setDeleteTaskOpen(false)} PaperProps={{ sx: { bgcolor: isDark ? '#0f172a' : undefined, color: isDark ? '#e6eef8' : undefined } }}>
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
      <Dialog open={editUserOpen} onClose={() => setEditUserOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: isDark ? '#0f172a' : undefined, color: isDark ? '#e6eef8' : undefined } }}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" fullWidth value={editUserForm.fname} onChange={e => setEditUserForm({ ...editUserForm, fname: e.target.value })} />
            {editingUser?.role === 'user' && (
              <TextField label="Student ID" fullWidth value={editUserForm.studentId} onChange={e => setEditUserForm({ ...editUserForm, studentId: e.target.value })} />
            )}
            <TextField label="Email (Login ID)" fullWidth value={editUserForm.ename} onChange={e => setEditUserForm({ ...editUserForm, ename: e.target.value })} helperText="Warning: Changing this updates the user's login ID" />
            <TextField label="Year/Class/Dept" fullWidth value={editUserForm.yearClassDept} onChange={e => setEditUserForm({ ...editUserForm, yearClassDept: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={editUserForm.department}
                onChange={e => setEditUserForm({ ...editUserForm, department: e.target.value })}
              >
                {departmentOptions.filter(opt => opt !== 'All').map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {editingUser?.role === 'user' && (
              <TextField type="number" label="Total Points" fullWidth value={editUserForm.points} onChange={e => setEditUserForm({ ...editUserForm, points: Number(e.target.value) })} />
            )}
            <Button variant="contained" onClick={handleSaveUser}>Save User</Button>
          </Stack>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default AdminDashboard;
