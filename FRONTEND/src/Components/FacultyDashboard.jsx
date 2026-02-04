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
    Menu,
    Stack,
    LinearProgress,
    Drawer,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import {
    Edit,
    Save,
    Cancel,
    PersonOff,
    Person,
    Dashboard as DashboardIcon,
    Star as StarIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    RateReview as RateReviewIcon,
    Visibility as VisibilityIcon,
    MoreVert,
    TrendingUp,
    Schedule,
    NotificationsActive,
    CheckCircle,
    Warning,
    Add,
    EmojiEvents,

    ListAlt as ListAltIcon,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    Fullscreen,
    Close,
    Campaign as CampaignIcon,
    Link as LinkIcon,
    CloudUpload,
    VolunteerActivism,
} from "@mui/icons-material";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Faculty Dashboard — Redesigned
const FacultyDashboard = () => {
    const { isDark } = useTheme();
    // Force dark aesthetic for dashboard content if user prefers, or just consistent dark theme
    const dashboardBg = isDark ? "#0f172a" : "#f1f5f9"; // Slate 900 vs Slate 100
    const cardBg = isDark ? "#1e293b" : "#ffffff"; // Slate 800 vs White
    const textPrimary = isDark ? "#f1f5f9" : "#0f172a"; // Slate 50 vs Slate 900
    const textSecondary = isDark ? "#94a3b8" : "#64748b"; // Slate 400 vs Slate 500
    const accentColor = "#818cf8"; // Indigo
    const successColor = "#4ade80"; // Green
    const warningColor = "#fbbf24"; // Amber
    const yellowAccent = "#fbbf24"; // Amber Accent

    const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");

    const [awardData, setAwardData] = useState({
        studentId: "",
        points: "",
        reason: "",
    });

    // Edit User State
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

    // Create/Edit Task dialog state
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [createTaskForm, setCreateTaskForm] = useState({
        title: "",
        description: "",
        dueDate: "",
        points: 10,
        category: "General",
        assignedYears: [],
        quiz: { questions: [], passingScore: 70 },
    });

    const [editTaskOpen, setEditTaskOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editTaskForm, setEditTaskForm] = useState({
        title: "",
        description: "",
        dueDate: "",
        points: 10,
        category: "General",
        assignedYears: [],
        quiz: { questions: [], passingScore: 70 },
    });

    const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // View All Students Dialog State
    const [viewAllStudentsOpen, setViewAllStudentsOpen] = useState(false);

    // Award Points Filter State
    const [awardTimeFilter, setAwardTimeFilter] = useState('All');
    const [chartTimeFilter, setChartTimeFilter] = useState('Week');
    const [chartOffset, setChartOffset] = useState(0);

    // Actions Menu State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [openChartDialog, setOpenChartDialog] = useState(false);

    // Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentChartFilter, setStudentChartFilter] = useState('Monthly'); // Daily, Weekly, Monthly, Yearly
    const [yearFilter, setYearFilter] = useState('All'); // NEW: Year Filter State

    // Derived options
    const yearOptions = Array.from(new Set([
        "All", "Year 1", "Year 2", "Year 3", "Year 4",
        ...(users || []).map((u) => u.yearClassDept).filter(Boolean),
    ]));

    // Submissions
    const [submissions, setSubmissions] = useState([]);
    const [subsLoading, setSubsLoading] = useState(false);
    const [viewSubOpen, setViewSubOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);

    // Banner Management State
    const [banners, setBanners] = useState([]);
    const [manageBannersOpen, setManageBannersOpen] = useState(false);
    const [bannerForm, setBannerForm] = useState({ title: '', description: '', templateId: 1, image: null, imageType: 'upload', imageUrl: '' });
    const [bannerImagePreview, setBannerImagePreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Volunteers
    const [volunteers, setVolunteers] = useState([]);
    const [volunteersLoading, setVolunteersLoading] = useState(false);


    // Data Loading
    useEffect(() => {
        fetchUsers();
        fetchTasks();
        fetchSubmissions();
        fetchVolunteers();
    }, [baseurl]);

    const fetchVolunteers = async () => {
        setVolunteersLoading(true);
        try {
            const res = await axios.get(`${baseurl}/api/volunteers/all`);
            setVolunteers(res.data || []);
        } catch (err) {
            console.error("Volunteers fetch error:", err);
        } finally {
            setVolunteersLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${baseurl}/api/users`);
            const activeUsers = res.data.filter(
                (u) => u.status !== "inactive" && !["admin", "faculty", "store"].includes(u.role)
            );
            setUsers(activeUsers);
            setUsers(activeUsers);
            // Initial filter set not needed as useEffect handles it, but good for safety
        } catch (err) {
            console.error("Users fetch error:", err);
            setError("Failed to load users");
        }
    };

    // Filter Logic Effect
    useEffect(() => {
        let result = users;

        // 1. Filter by Year
        if (yearFilter !== 'All') {
            result = result.filter(u => u.yearClassDept === yearFilter);
        }

        // 2. Filter by Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(u =>
                u.fname?.toLowerCase().includes(q) ||
                u.ename?.toLowerCase().includes(q) ||
                u.studentId?.toLowerCase().includes(q)
            );
        }

        setFiltered(result);
    }, [users, search, yearFilter]);

    const fetchTasks = async () => {
        setTasksLoading(true);
        try {
            const res = await axios.get(`${baseurl}/api/tasks`);
            setTasks(res.data || []);
        } catch (err) {
            console.error("Tasks fetch error:", err);
            setError("Failed to load tasks");
        } finally {
            setTasksLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        setSubsLoading(true);
        try {
            const res = await axios.get(`${baseurl}/api/submissions`);
            setSubmissions(res.data || []);
        } catch (err) {
            console.error("Submissions error:", err);
            setError("Failed to load submissions");
        } finally {
            setSubsLoading(false);
        }
    };

    const fetchBanners = async () => {
        try {
            const res = await axios.get(`${baseurl}/api/events/all`);
            setBanners(res.data || []);
        } catch (err) {
            console.error("Banners fetch error:", err);
        }
    };



    // --- Handlers (Keep logic, just reformatted) ---
    const handleOpenTask = async (task) => {
        setSelectedTask(task);
        setTaskDialogOpen(true);
        setCandidatesLoading(true);
        try {
            const res = await axios.get(`${baseurl}/api/tasks/${task._id}/candidates`);
            setCandidates(res.data || []);
        } catch (err) {
            setError("Failed to load candidates");
        } finally {
            setCandidatesLoading(false);
        }
    };

    const handleAwardForTask = async (candidate) => {
        if (!selectedTask) return;
        try {
            const res = await axios.post(`${baseurl}/api/tasks/${selectedTask._id}/award`, { userId: candidate._id });
            setSuccess("Awarded successfully");
            setCandidates((prev) => prev.map((c) => (c._id === candidate._id ? { ...c, awarded: true, points: res.data.user.points } : c)));
            setUsers((prev) => prev.map((u) => (u._id === candidate._id ? { ...u, points: res.data.user.points } : u)));
            setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? { ...t, awardedTo: [...(t.awardedTo || []), { user: candidate._id }] } : t)));
        } catch (err) {
            setError("Failed to award points");
        }
    };

    const handleApproveSubmission = async (submission) => {
        try {
            const res = await axios.put(`${baseurl}/api/submissions/${submission._id}/approve`, { adminComment: "" });
            setSuccess("Submission approved");
            setSubmissions((prev) => prev.map((p) => (p._id === submission._id ? { ...p, status: "accepted" } : p)));
            if (res.data.user) {
                setUsers((prev) => prev.map((u) => (u._id === res.data.user._id ? { ...u, points: res.data.user.points } : u)));
            }
        } catch (err) {
            setError("Failed to approve");
        }
    };

    const handleRejectSubmission = async (submission) => {
        try {
            await axios.put(`${baseurl}/api/submissions/${submission._id}/reject`, { adminComment: "" });
            setSuccess("Submission rejected");
            setSubmissions((prev) => prev.map((p) => (p._id === submission._id ? { ...p, status: "rejected" } : p)));
        } catch (err) {
            setError("Failed to reject");
        }
    };

    const handleAward = async () => {
        if (!awardData.studentId || !awardData.points) {
            setError("Please select a student and enter points.");
            return;
        }
        try {
            const res = await axios.post(`${baseurl}/api/award-points`, awardData);
            setSuccess(res.data.message);
            const updatedUsers = users.map((u) => u._id === awardData.studentId ? { ...u, points: u.points + parseInt(awardData.points) } : u);
            setUsers(updatedUsers);
            setFiltered(updatedUsers);
            setAwardData({ studentId: "", points: "", reason: "" });
        } catch (err) {
            setError("Failed to award points.");
        }
    };

    const handleQuickAward = (amount) => {
        if (!awardData.studentId) {
            setError("Select a student first");
            return;
        }
        setAwardData({ ...awardData, points: amount });
    };

    // Task Create/Edit Handlers remain similar but condensed
    const handleSaveTask = async (isEdit = false) => {
        const form = isEdit ? editTaskForm : createTaskForm;
        const setOpen = isEdit ? setEditTaskOpen : setCreateTaskOpen;

        // Validation
        if (!form.title) { setError("Title is required"); return; }
        if (!form.dueDate) { setError("Due Date is required"); return; }
        if (!form.points || form.points <= 0) { setError("Valid points are required"); return; }

        try {
            const payload = {
                ...form,
                dueDate: new Date(form.dueDate).toISOString(),
                assignedYears: Array.isArray(form.assignedYears) ? form.assignedYears.map(s => String(s).trim()).filter(Boolean) : [],
            };

            // Transform Quiz to match backend schema (questionText -> text, correctAnswer -> correctIndex)
            if (form.category === 'Quiz' && form.quiz && form.quiz.questions.length > 0) {
                payload.quiz = {
                    ...form.quiz,
                    questions: form.quiz.questions.map(q => ({
                        text: q.questionText,
                        options: q.options,
                        correctIndex: Number(q.correctAnswer) // ensure number
                    }))
                };
            }

            let res;
            if (isEdit) {
                res = await axios.put(`${baseurl}/api/tasks/${editingTask._id}`, payload);
                const tRes = await axios.get(`${baseurl}/api/tasks`); // simple refresh
                setTasks(tRes.data || []);
            } else {
                res = await axios.post(`${baseurl}/api/tasks/addtask`, payload);
                const tRes = await axios.get(`${baseurl}/api/tasks`);
                setTasks(tRes.data || []);
            }
            setSuccess(res.data.message || (isEdit ? "Task updated" : "Task created"));
            setOpen(false);
            // Reset forms...
        } catch (err) {
            setError(err.response?.data?.message || "Operation failed");
        }
    };

    // --- Quiz Handlers ---
    const handleAddQuestion = (isEdit = false) => {
        const setForm = isEdit ? setEditTaskForm : setCreateTaskForm;
        setForm(prev => ({
            ...prev,
            quiz: {
                ...prev.quiz,
                questions: [
                    ...prev.quiz.questions,
                    { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
                ]
            }
        }));
    };

    const handleRemoveQuestion = (index, isEdit = false) => {
        const setForm = isEdit ? setEditTaskForm : setCreateTaskForm;
        setForm(prev => {
            const newQuestions = [...prev.quiz.questions];
            newQuestions.splice(index, 1);
            return {
                ...prev,
                quiz: { ...prev.quiz, questions: newQuestions }
            };
        });
    };

    const handleQuestionChange = (index, field, value, isEdit = false) => {
        const setForm = isEdit ? setEditTaskForm : setCreateTaskForm;
        setForm(prev => {
            const newQuestions = [...prev.quiz.questions];
            newQuestions[index] = { ...newQuestions[index], [field]: value };
            return {
                ...prev,
                quiz: { ...prev.quiz, questions: newQuestions }
            };
        });
    };

    const handleOptionChange = (qIndex, oIndex, value, isEdit = false) => {
        const setForm = isEdit ? setEditTaskForm : setCreateTaskForm;
        setForm(prev => {
            const newQuestions = [...prev.quiz.questions];
            const newOptions = [...newQuestions[qIndex].options];
            newOptions[oIndex] = value;
            newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
            return {
                ...prev,
                quiz: { ...prev.quiz, questions: newQuestions }
            };
        });
    };

    const handleEditClick = (task) => {
        setEditingTask(task);

        // Transform backend quiz schema back to frontend form state
        const quizItems = task.quiz ? {
            ...task.quiz,
            questions: (task.quiz.questions || []).map(q => ({
                questionText: q.text,
                options: q.options,
                correctAnswer: q.correctIndex
            }))
        } : { questions: [], passingScore: 70 };

        setEditTaskForm({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
            points: task.points,
            category: task.category || "General", // Use category from backend
            assignedYears: task.assignedYears || [],
            quiz: quizItems
        });
        setEditTaskOpen(true);
    };

    // --- Derived Data for Dashboard Widgets ---
    const totalUsers = users.length;
    const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    const topStudents = [...users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5);
    const topStudent = topStudents.length > 0 ? topStudents[0] : null;

    // Process Submissions for Activity Timeline (Last 5)
    // Note: 'createdAt' is available in submission objects
    const recentActivity = submissions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(s => ({
            id: s._id,
            text: `${s.user?.fname || 'Student'} ${s.status === 'accepted' ? 'earned points for' : s.status === 'rejected' ? 'was rejected for' : 'submitted'} ${s.task?.title || 'a task'}`,
            time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
            type: 'submission'
        }));

    // Helper: Deterministic mock data for demo
    const getMockPoints = (dateObj) => {
        const seed = dateObj.getDate() + dateObj.getMonth() * 31 + dateObj.getFullYear() * 365;
        return Math.floor((Math.abs(Math.sin(seed)) * 80) + 10);
    };

    // Process Submissions for Points Analytics
    const chartData = React.useMemo(() => {
        let labels = [];
        let data = [];
        const offset = chartOffset;

        if (chartTimeFilter === 'Week') {
            // Last 7 Days + Offset
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - (i + (offset * 7)));
                labels.push(d);
            }
            data = labels.map(day => {
                const dayStr = day.toLocaleDateString();
                const realPoints = submissions
                    .filter(s => s.status === 'accepted' && new Date(s.createdAt).toLocaleDateString() === dayStr)
                    .reduce((sum, s) => sum + (s.task?.points || 0), 0);

                // Fallback to mock data if no real points, to show "previous data"
                const points = realPoints > 0 ? realPoints : getMockPoints(day);
                return { name: day.toLocaleDateString([], { weekday: 'short' }), points };
            });

        } else if (chartTimeFilter === 'Month') {
            // Last 30 Days + Offset
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - (i + (offset * 30)));
                labels.push(d);
            }
            data = labels.map(day => {
                const dayStr = day.toLocaleDateString();
                const realPoints = submissions
                    .filter(s => s.status === 'accepted' && new Date(s.createdAt).toLocaleDateString() === dayStr)
                    .reduce((sum, s) => sum + (s.task?.points || 0), 0);

                const points = realPoints > 0 ? realPoints : getMockPoints(day);
                return { name: day.toLocaleDateString([], { day: 'numeric', month: 'short' }), points };
            });

        } else {
            // Year - Last 12 Months + Offset
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - (i + (offset * 12)));
                labels.push(d);
            }
            data = labels.map(date => {
                const monthStr = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                const realPoints = submissions
                    .filter(s => {
                        if (s.status !== 'accepted') return false;
                        const sDate = new Date(s.createdAt);
                        return sDate.getMonth() === date.getMonth() && sDate.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, s) => sum + (s.task?.points || 0), 0);

                const points = realPoints > 0 ? realPoints : getMockPoints(date) * 4;
                return { name: date.toLocaleDateString([], { month: 'short' }), points };
            });
        }
        return data;
    }, [submissions, chartTimeFilter, chartOffset]);

    const getDateRangeLabel = () => {
        if (chartOffset === 0) return `Performance over the last ${chartTimeFilter === 'Week' ? '7 days' : chartTimeFilter === 'Month' ? '30 days' : '12 months'}`;

        let range = "";
        if (chartTimeFilter === 'Week') range = `${chartOffset} week${chartOffset > 1 ? 's' : ''} ago`;
        if (chartTimeFilter === 'Month') range = `${chartOffset} month${chartOffset > 1 ? 's' : ''} ago`;
        if (chartTimeFilter === 'Year') range = `${chartOffset} year${chartOffset > 1 ? 's' : ''} ago`;

        return `Performance: ${range}`;
    };

    // Points this week
    const pointsThisWeek = chartData.reduce((sum, d) => sum + d.points, 0);

    // Student Specific Chart Data
    const studentChartData = React.useMemo(() => {
        if (!selectedStudent) return [];

        let data = [];
        const now = new Date();

        if (studentChartFilter === 'Daily') {
            // Last 7 Days
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

                const realPoints = submissions
                    .filter(s => {
                        if (s.status !== 'accepted' || s.user?._id !== selectedStudent._id) return false;
                        const sDate = new Date(s.createdAt);
                        return sDate.getDate() === d.getDate() && sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear();
                    })
                    .reduce((sum, s) => sum + (s.task?.points || 0), 0);

                const points = realPoints > 0 ? realPoints : getMockPoints(d);

                data.push({ name: dayName, points, fullDate: d.toLocaleDateString() });
            }
        } else if (studentChartFilter === 'Weekly') {
            // Last 8 Weeks
            for (let i = 7; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - (i * 7));
                // Get start of week (approx for labeling)
                const weekLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                // We need to match submissions in this week window
                // This is a simplified "week bucket" logic
                const weekStart = new Date(d);
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(d);
                weekEnd.setDate(weekEnd.getDate() + 7);
                weekEnd.setHours(23, 59, 59, 999);

                const realPoints = submissions
                    .filter(s => {
                        if (s.status !== 'accepted' || s.user?._id !== selectedStudent._id) return false;
                        const sDate = new Date(s.createdAt);
                        // Very rough weekly check - ideally use strict week numbers or library
                        return sDate >= weekStart && sDate <= weekEnd;
                    })
                    .reduce((sum, s) => sum + (s.task?.points || 0), 0);

                const points = realPoints > 0 ? realPoints : getMockPoints(d) * 3; // Weekly points roughly 3x daily

                data.push({ name: weekLabel, points });
            }
        } else if (studentChartFilter === 'Monthly') {
            // Last 6 Months
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthStr = d.toLocaleString('default', { month: 'short' });

                const realPoints = submissions
                    .filter(s => {
                        if (s.status !== 'accepted' || s.user?._id !== selectedStudent._id) return false;
                        const sDate = new Date(s.createdAt);
                        return sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear();
                    })
                    .reduce((sum, s) => sum + (s.task?.points || 0), 0);

                const points = realPoints > 0 ? realPoints : getMockPoints(d) * 10; // Monthly points

                data.push({ name: monthStr, points });
            }
        } else if (studentChartFilter === 'Yearly') {
            // Last 4 Years
            for (let i = 3; i >= 0; i--) {
                const d = new Date();
                d.setFullYear(d.getFullYear() - i);
                const yearStr = d.getFullYear().toString();
                const realPoints = submissions
                    .filter(s => {
                        if (s.status !== 'accepted' || s.user?._id !== selectedStudent._id) return false;
                        const sDate = new Date(s.createdAt);
                        return sDate.getFullYear() === d.getFullYear();
                    })
                    .reduce((sum, s) => sum + (s.task?.points || 0), 0);

                const points = realPoints > 0 ? realPoints : getMockPoints(d) * 100; // Yearly points 

                data.push({ name: yearStr, points });
            }
        }

        return data;
    }, [selectedStudent, submissions, studentChartFilter]);

    // Student Stats
    const studentStats = React.useMemo(() => {
        if (!selectedStudent) return { rank: '-', tasks: 0, total: 0 };
        const rank = users.sort((a, b) => b.points - a.points).findIndex(u => u._id === selectedStudent._id) + 1;
        const tasks = submissions.filter(s => s.user?._id === selectedStudent._id && s.status === 'accepted').length;
        return { rank, tasks, total: selectedStudent.points || 0 };
    }, [selectedStudent, users, submissions]);


    // --- Styles & Aesthetics ---
    const glassCard = {
        background: isDark
            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
        borderRadius: 4,
        border: isDark ? `1px solid rgba(255,255,255,0.08)` : `1px solid rgba(0,0,0,0.05)`,
        backdropFilter: 'blur(20px)',
        boxShadow: isDark ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' : '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: isDark ? '0 12px 40px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(129, 140, 248, 0.2)' : '0 12px 24px 0 rgba(0, 0, 0, 0.1)',
        }
    };

    const gradientText = {
        background: `linear-gradient(45deg, ${accentColor}, #c084fc)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: "bold"
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: dashboardBg, minHeight: '100vh', color: textPrimary }}>
            {/* Sidebar - Collapsible on mobile, fixed width on desktop */}
            <Box sx={{
                width: { xs: 0, md: 250 },
                flexShrink: 0,
                bgcolor: cardBg,
                borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                display: { xs: 'none', md: 'block' }
            }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: accentColor, mb: 4, letterSpacing: 1 }}>
                        CAMPUS ADMIN
                    </Typography>
                    <List>
                        {[
                            { text: 'Dashboard', icon: <DashboardIcon />, id: 'top' },
                            { text: 'Award Points', icon: <StarIcon />, id: 'award-card' },
                            { text: 'Students List', icon: <PeopleIcon />, id: 'students-card' },
                            { text: 'Tasks', icon: <AssignmentIcon />, id: 'tasks-card' },
                            { text: 'Submissions', icon: <RateReviewIcon />, id: 'submissions-card' },
                            { text: 'Volunteers', icon: <VolunteerActivism />, id: 'volunteers-card' },
                            { text: 'View All Students', icon: <PeopleIcon />, action: () => setViewAllStudentsOpen(true) },
                            { text: 'Manage Banners', icon: <CampaignIcon />, action: () => { fetchBanners(); setManageBannersOpen(true); } }
                        ].map((item, index) => (
                            <ListItemButton
                                key={index}
                                onClick={item.action || (() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }))}
                                sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }}
                            >
                                <ListItemIcon sx={{ color: textSecondary, minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: textPrimary }} />
                            </ListItemButton>
                        ))
                        }
                    </List>

                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Typography variant="caption" fontWeight="bold" sx={{ color: textSecondary, mb: 2, display: 'block', letterSpacing: 1 }}>
                        CLASSES / YEARS
                    </Typography>
                    <List>
                        {yearOptions.map((year) => (
                            <ListItemButton
                                key={year}
                                onClick={() => {
                                    setYearFilter(year);
                                    document.getElementById('students-card')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.5,
                                    bgcolor: yearFilter === year ? accentColor : 'transparent',
                                    color: yearFilter === year ? '#fff' : textSecondary,
                                    '&:hover': { bgcolor: yearFilter === year ? accentColor : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), color: yearFilter === year ? '#fff' : textPrimary }
                                }}
                            >
                                <ListItemText primary={year} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                                {year !== 'All' && (
                                    <Chip
                                        label={users.filter(u => u.yearClassDept === year).length}
                                        size="small"
                                        sx={{
                                            height: 20, fontSize: 10, fontWeight: 'bold',
                                            bgcolor: yearFilter === year ? 'rgba(0,0,0,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                            color: 'inherit'
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto', height: '100vh' }} id="top">
                <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

                    {/* Header */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">Faculty Dashboard</Typography>
                            <Typography variant="body2" color={textSecondary}>Welcome back, Instructor</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <IconButton sx={{ color: textPrimary }}><NotificationsActive /></IconButton>
                            <Avatar src="/broken-image.jpg" sx={{ bgcolor: accentColor }} />
                        </Box>
                    </Box>

                    {/* Top Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ ...glassCard, minHeight: 160 }}>
                                <CardContent sx={{ position: 'relative', flexGrow: 1 }}>
                                    <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(96, 165, 250, 0.1)', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                        <PeopleIcon sx={{ color: '#60a5fa' }} />
                                    </Box>
                                    <Typography variant="body2" color={textSecondary} sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11, fontWeight: 600 }}>Total Students</Typography>
                                    <Typography variant="h3" fontWeight="bold" sx={{ color: textPrimary, mt: 0.5 }}>{totalUsers}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ ...glassCard, minHeight: 160 }}>
                                <CardContent sx={{ position: 'relative', flexGrow: 1 }}>
                                    <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(74, 222, 128, 0.1)', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                        <EmojiEvents sx={{ color: successColor }} />
                                    </Box>
                                    <Typography variant="body2" color={textSecondary} sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11, fontWeight: 600 }}>Points Awarded</Typography>
                                    <Typography variant="h3" fontWeight="bold" sx={{ color: textPrimary, mt: 0.5 }}>{totalPoints}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ ...glassCard, minHeight: 160, position: 'relative', overflow: 'hidden' }}>
                                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: `linear-gradient(90deg, ${accentColor}, #c084fc)` }} />
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1 }}>
                                    <Avatar src={topStudent?.profilePic ? `${baseurl}${topStudent.profilePic}` : undefined} sx={{ width: 72, height: 72, border: `3px solid ${accentColor}`, boxShadow: `0 0 20px ${accentColor}40` }}>{topStudent?.fname[0]}</Avatar>
                                    <Box>
                                        <Typography variant="overline" color={accentColor} fontWeight="bold">TOP PERFORMER</Typography>
                                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5, color: textPrimary }}>{topStudent?.fname || "None"}</Typography>
                                        <Chip label={`${topStudent?.points || 0} pts`} size="small" sx={{ bgcolor: accentColor, color: '#fff', fontWeight: 'bold', height: 24 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Middle Section: Dashboard Widgets */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>

                        {/* Left Column: Analytics & Quick Actions */}
                        <Grid item xs={12} lg={8}>
                            <Stack spacing={4}>

                                {/* System Overview */}
                                <Card sx={glassCard}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Grid container spacing={4} alignItems="center">
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="overline" color={textSecondary} fontWeight={600}>Active Users</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: successColor, boxShadow: `0 0 10px ${successColor}` }} />
                                                    <Typography variant="h5" fontWeight="bold">{users.length}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="overline" color={textSecondary} fontWeight={600}>Tasks Active</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f472b6', boxShadow: '0 0 10px #f472b6' }} />
                                                    <Typography variant="h5" fontWeight="bold">{tasks.length}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="overline" color={textSecondary} fontWeight={600}>Submissions</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: accentColor, boxShadow: `0 0 10px ${accentColor}` }} />
                                                    <Typography variant="h5" fontWeight="bold">{submissions.length}</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* Points Analytics Chart */}
                                <Card sx={glassCard}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="h6" sx={gradientText}>Points Analytics</Typography>
                                                    <IconButton size="small" onClick={() => setOpenChartDialog(true)} sx={{ color: textSecondary }}>
                                                        <Fullscreen fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="body2" color={textSecondary} sx={{ mt: 0.5 }}>
                                                    {getDateRangeLabel()}
                                                </Typography>
                                                {/* Filters */}
                                                <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1.5 }}>
                                                        <IconButton size="small" onClick={() => setChartOffset(prev => prev + 1)} sx={{ color: textSecondary, p: 0.5 }}>
                                                            <KeyboardArrowLeft />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => setChartOffset(prev => Math.max(0, prev - 1))} disabled={chartOffset === 0} sx={{ color: textSecondary, p: 0.5 }}>
                                                            <KeyboardArrowRight />
                                                        </IconButton>
                                                    </Box>
                                                    <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 0.5 }} />
                                                    {['Week', 'Month', 'Year'].map((filter) => (
                                                        <Box
                                                            key={filter}
                                                            onClick={() => { setChartTimeFilter(filter); setChartOffset(0); }}
                                                            sx={{
                                                                px: 1.5, py: 0.5, borderRadius: 1.5,
                                                                bgcolor: chartTimeFilter === filter ? accentColor : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                                                color: chartTimeFilter === filter ? '#fff' : textPrimary,
                                                                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                                                '&:hover': { bgcolor: chartTimeFilter === filter ? accentColor : 'rgba(255,255,255,0.1)', color: '#fff' }
                                                            }}
                                                        >
                                                            {filter}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h4" color={successColor} fontWeight="bold">+{pointsThisWeek}</Typography>
                                                <Typography variant="caption" color={textSecondary} sx={{ display: 'block', mt: 0.5 }}>
                                                    {chartOffset === 0 ? `THIS ${chartTimeFilter.toUpperCase()}` : `${chartOffset} ${chartTimeFilter.toUpperCase()} AGO`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ height: 250, width: '100%', ml: -2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textSecondary, fontSize: 12, fontWeight: 500 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: textSecondary, fontSize: 12 }} />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                                                        itemStyle={{ color: '#fff' }}
                                                    />
                                                    <Area type="monotone" dataKey="points" stroke={accentColor} strokeWidth={3} fillOpacity={1} fill="url(#colorPoints)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Fullscreen Chart Dialog */}
                                <Dialog
                                    open={openChartDialog}
                                    onClose={() => setOpenChartDialog(false)}
                                    maxWidth="lg"
                                    fullWidth
                                    PaperProps={{
                                        sx: {
                                            bgcolor: "#0f172a",
                                            backgroundImage: 'none',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 3
                                        }
                                    }}
                                >
                                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                                        <Box>
                                            Points Analytics
                                            <Typography variant="body2" color={textSecondary} sx={{ mt: 0.5, fontWeight: 'normal' }}>
                                                {getDateRangeLabel()}
                                            </Typography>
                                        </Box>
                                        <IconButton onClick={() => setOpenChartDialog(false)} sx={{ color: textSecondary }}>
                                            <Close />
                                        </IconButton>
                                    </DialogTitle>
                                    <DialogContent>
                                        <Box sx={{ height: 500, width: '100%', mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="colorPointsFull" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textSecondary, fontSize: 14, fontWeight: 500 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: textSecondary, fontSize: 14 }} />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                                                        itemStyle={{ color: '#fff' }}
                                                    />
                                                    <Area type="monotone" dataKey="points" stroke={accentColor} strokeWidth={3} fillOpacity={1} fill="url(#colorPointsFull)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </DialogContent>
                                </Dialog>

                                {/* Quick Award Points */}
                                <Card sx={glassCard} id="award-card">
                                    <CardContent sx={{ p: 3 }}>
                                        {/* Header */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" fontWeight="bold">Award Points</Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, p: 0.5, display: 'flex' }}>
                                                    {['All', 'Weekly', 'Monthly'].map((item) => (
                                                        <Box
                                                            key={item}
                                                            onClick={() => setAwardTimeFilter(item)}
                                                            sx={{
                                                                px: 1.5, py: 0.5, borderRadius: 1.5, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                                                                color: awardTimeFilter === item ? '#fff' : textSecondary,
                                                                bgcolor: awardTimeFilter === item ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': { color: '#fff', bgcolor: awardTimeFilter !== item ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)' }
                                                            }}
                                                        >
                                                            {item}
                                                        </Box>
                                                    ))}
                                                </Box>
                                                <IconButton size="small" sx={{ bgcolor: accentColor, borderRadius: 1.5, color: '#fff', '&:hover': { bgcolor: accentColor } }}>
                                                    <ListAltIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        {/* Inputs Row */}
                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                            <Grid item xs={16} md={16}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={users}
                                                    getOptionLabel={(option) => option.fname}
                                                    value={users.find((u) => u._id === awardData.studentId) || null}
                                                    onChange={(_, val) => setAwardData({ ...awardData, studentId: val?._id || "" })}
                                                    ListboxProps={{ sx: { maxHeight: 300 } }}
                                                    slotProps={{
                                                        paper: {
                                                            sx: {
                                                                width: '100%',
                                                                bgcolor: '#1e293b',
                                                                color: '#fff',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(255,255,255,0.1)'
                                                            }
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Select Student"
                                                            fullWidth
                                                            variant="outlined"
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    bgcolor: 'rgba(30, 41, 59, 0.5)',
                                                                    borderRadius: 1,
                                                                    width: '200px',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    '& fieldset': { border: 'none' }
                                                                },
                                                                '& .MuiOutlinedInput-input': {
                                                                    color: 'white',
                                                                    fontWeight: 'bold'
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    renderOption={(props, option) => (
                                                        <li {...props} style={{ backgroundColor: '#1e293b' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, width: '100px' }}>
                                                                <Avatar src={option.profilePic ? `${baseurl}${option.profilePic}` : undefined} sx={{ width: 24, height: 24 }} />
                                                                <Typography variant="body2">{option.fname} {option.ename}</Typography>
                                                            </Box>
                                                        </li>
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={2}>
                                                <TextField
                                                    placeholder="Points"
                                                    type="number"
                                                    variant="outlined"
                                                    fullWidth
                                                    value={awardData.points}
                                                    onChange={(e) => setAwardData({ ...awardData, points: e.target.value })}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            bgcolor: 'rgba(30, 41, 59, 0.5)',
                                                            borderRadius: 2,
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            '& fieldset': { border: 'none' }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>

                                        {/* Actions Row */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                            <Stack direction="row" spacing={1}>
                                                {[10, 20, 50, 100].map(amt => (
                                                    <Box
                                                        key={amt}
                                                        onClick={() => handleQuickAward(amt)}
                                                        sx={{
                                                            px: 1.5, py: 0.8, borderRadius: 2,
                                                            bgcolor: 'rgba(30, 41, 59, 0.8)',
                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                            color: textSecondary, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            '&:hover': { bgcolor: accentColor, color: '#fff', transform: 'translateY(-2px)' }
                                                        }}
                                                    >
                                                        +{amt}
                                                    </Box>
                                                ))}
                                            </Stack>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    bgcolor: accentColor,
                                                    px: 4, py: 1,
                                                    borderRadius: 2,
                                                    fontSize: 14,
                                                    fontWeight: 'bold',
                                                    textTransform: 'none',
                                                    '&:hover': { bgcolor: '#6366f1' }
                                                }}
                                                onClick={handleAward}
                                            >
                                                Award Points
                                            </Button>
                                        </Box>

                                        {/* Success Message Banner */}
                                        {success && (
                                            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(74, 222, 128, 0.1)', border: `1px solid ${successColor}40`, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <CheckCircle sx={{ color: successColor, fontSize: 20 }} />
                                                <Typography variant="body2" color="#fff" fontWeight={500}>{success}</Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>

                        {/* Right Column: Pending Actions & Timeline */}
                        <Grid item xs={12} lg={4}>
                            <Stack spacing={4}>

                                {/* Pending Actions */}
                                <Card sx={glassCard}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" sx={gradientText}>Pending Actions</Typography>
                                            {pendingSubmissions.length > 0 && <Chip label={pendingSubmissions.length} size="small" color="warning" sx={{ fontWeight: 'bold' }} />}
                                        </Box>

                                        {pendingSubmissions.length > 0 ? (
                                            <List disablePadding>
                                                {pendingSubmissions.slice(0, 3).map((sub, i) => (
                                                    <ListItem key={i} disablePadding sx={{ mb: 2 }}>
                                                        <Box sx={{
                                                            display: 'flex', gap: 2, alignItems: 'center', width: '100%',
                                                            p: 2, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                                            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                                                        }}>
                                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: warningColor, flexShrink: 0, boxShadow: `0 0 10px ${warningColor}` }} />
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="body2" fontWeight={600}>Review "{sub.task?.title}"</Typography>
                                                                <Typography variant="caption" color={textSecondary} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <Avatar src={sub.user?.profilePic ? `${baseurl}${sub.user.profilePic}` : undefined} sx={{ width: 16, height: 16 }} />
                                                                    {sub.user?.fname} • 10m ago
                                                                </Typography>
                                                            </Box>
                                                            <IconButton size="small" onClick={() => { setSelectedSub(sub); setViewSubOpen(true); }} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                                                <VisibilityIcon fontSize="small" sx={{ color: textSecondary }} />
                                                            </IconButton>
                                                        </Box>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, opacity: 0.5 }}>
                                                <CheckCircle sx={{ fontSize: 48, mb: 1, color: successColor }} />
                                                <Typography variant="body2">All caught up! No pending actions.</Typography>
                                            </Box>
                                        )}
                                        {pendingSubmissions.length > 3 && <Button size="small" fullWidth sx={{ mt: 1, color: accentColor }}>View All Pending</Button>}
                                    </CardContent>
                                </Card>

                                {/* Activity Timeline */}
                                <Card sx={glassCard}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h6" sx={{ ...gradientText, mb: 3 }}>Activity Timeline</Typography>
                                        <Box sx={{ position: 'relative', borderLeft: isDark ? `2px solid rgba(255,255,255,0.1)` : `2px solid rgba(0,0,0,0.1)`, pl: 4, ml: 1 }}>
                                            {recentActivity.map((act, i) => (
                                                <Box key={i} sx={{ mb: 3, position: 'relative' }}>
                                                    <Box sx={{
                                                        position: 'absolute', left: -38, top: 4,
                                                        width: 14, height: 14, borderRadius: '50%',
                                                        bgcolor: i === 0 ? accentColor : cardBg,
                                                        border: `2px solid ${i === 0 ? accentColor : 'rgba(255,255,255,0.3)'}`,
                                                        boxShadow: i === 0 ? `0 0 15px ${accentColor}` : 'none'
                                                    }} />
                                                    <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>{act.text}</Typography>
                                                    <Typography variant="caption" color={textSecondary} sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 1, py: 0.2, borderRadius: 1 }}>{act.time}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Mini Leaderboard */}
                                <Card sx={glassCard}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h6" sx={{ ...gradientText, mb: 3 }}>Top Performers</Typography>
                                        <List disablePadding>
                                            {topStudents.map((s, i) => (
                                                <ListItem key={s._id} disablePadding sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{
                                                            width: 24, height: 24, borderRadius: '50%',
                                                            bgcolor: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'rgba(255,255,255,0.1)',
                                                            color: i < 3 ? '#000' : textSecondary,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 'bold', fontSize: 12
                                                        }}>
                                                            {i + 1}
                                                        </Box>
                                                        <Avatar src={s.profilePic ? `${baseurl}${s.profilePic}` : undefined} sx={{ width: 32, height: 32, border: `1px solid rgba(255,255,255,0.2)` }} />
                                                        <Typography variant="body2" fontWeight={500}>{s.fname}</Typography>
                                                    </Box>
                                                    <Chip label={`${s.points} pts`} size="small" sx={{ bgcolor: i === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#fbbf24' : textSecondary, fontWeight: 600, border: 'none' }} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>

                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Expanded Sections (Students & Tasks) */}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card sx={glassCard} id="students-card">
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">Students Directory</Typography>
                                            {yearFilter !== 'All' && (
                                                <Chip
                                                    label={`Filtered by: ${yearFilter}`}
                                                    onDelete={() => setYearFilter('All')}
                                                    size="small"
                                                    sx={{ mt: 0.5, bgcolor: accentColor, color: '#fff' }}
                                                />
                                            )}
                                        </Box>
                                        <TextField
                                            placeholder="Search..."
                                            size="small"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', color: textPrimary } }}
                                        />
                                    </Box>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: textSecondary }}>Student</TableCell>
                                                    <TableCell sx={{ color: textSecondary }}>Year/Dept</TableCell>
                                                    <TableCell sx={{ color: textSecondary }}>Points</TableCell>
                                                    <TableCell sx={{ color: textSecondary }}>Status</TableCell>
                                                    <TableCell align="right" sx={{ color: textSecondary }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filtered.slice(0, 5).map(u => (
                                                    <TableRow key={u._id} sx={{ '& td': { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar src={u.profilePic ? `${baseurl}${u.profilePic}` : undefined} sx={{ width: 32, height: 32 }} />
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight="bold">{u.fname} {u.ename}</Typography>
                                                                    <Typography variant="caption" color={textSecondary}>{u.studentId}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ color: textPrimary }}>{u.yearClassDept || "--"}</TableCell>
                                                        <TableCell>
                                                            <Chip label={`${u.points} pts`} size="small" sx={{ bgcolor: 'rgba(74, 222, 128, 0.1)', color: successColor }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: u.status === 'active' ? successColor : 'grey' }} />
                                                                <Typography variant="body2" color={textSecondary}>{u.status}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: textSecondary }}
                                                                onClick={(e) => {
                                                                    setAnchorEl(e.currentTarget);
                                                                    setSelectedStudentForAction(u);
                                                                }}
                                                            >
                                                                <MoreVert fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Button fullWidth sx={{ mt: 2, color: textSecondary }} onClick={() => setViewAllStudentsOpen(true)}>View All Students</Button>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} id="tasks-card">
                            <Card sx={glassCard}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold">Active Tasks</Typography>
                                        <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: accentColor }} onClick={() => setCreateTaskOpen(true)}>Create Task</Button>
                                    </Box>
                                    <List>
                                        {tasks.slice(0, 5).map(t => (
                                            <ListItem key={t._id} sx={{ bgcolor: 'rgba(255,255,255,0.02)', mb: 1, borderRadius: 2 }}>
                                                <Box sx={{ width: '100%' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold">{t.title}</Typography>
                                                        <Chip label={`${t.points} pts`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: textPrimary, height: 20 }} />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" color={textSecondary}>Due: {new Date(t.dueDate).toLocaleDateString()}</Typography>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Chip label={`${(t.awardedTo || []).length} Awarded`} size="small" sx={{ fontSize: 10, height: 20, bgcolor: 'rgba(74, 222, 128, 0.1)', color: successColor }} />
                                                            <IconButton size="small" sx={{ p: 0.5, color: textSecondary }} onClick={() => handleOpenTask(t)}><AssignmentIcon fontSize="small" /></IconButton>
                                                            <IconButton size="small" sx={{ p: 0.5, color: textSecondary }} onClick={() => handleEditClick(t)}><Edit fontSize="small" /></IconButton>
                                                            <IconButton size="small" sx={{ p: 0.5, color: 'error.main' }} onClick={() => { setTaskToDelete(t); setDeleteTaskOpen(true); }}><Cancel fontSize="small" /></IconButton>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} id="volunteers-card">
                            <Card sx={glassCard}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold">Volunteer Applications</Typography>
                                    </Box>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: textSecondary }}>Name</TableCell>
                                                    <TableCell sx={{ color: textSecondary }}>Department</TableCell>
                                                    <TableCell sx={{ color: textSecondary }}>Year</TableCell>
                                                    <TableCell sx={{ color: textSecondary }}>Reason</TableCell>
                                                    <TableCell sx={{ color: textSecondary }}>Status</TableCell>
                                                    <TableCell align="right" sx={{ color: textSecondary }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {volunteers.map((vol) => (
                                                    <TableRow key={vol._id} sx={{ '& td': { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }}>
                                                        <TableCell>
                                                            <Typography fontWeight="500" sx={{ color: textPrimary }}>{vol.name}</Typography>
                                                            <Typography variant="caption" color={textSecondary}>{vol.studentId}</Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ color: textPrimary }}>{vol.department}</TableCell>
                                                        <TableCell sx={{ color: textPrimary }}>{vol.year}</TableCell>
                                                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: textPrimary }}>
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
                                                            <Typography color={textSecondary}>No volunteer applications found.</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                </Box>
            </Box>

            {/* Dialogs and Modals (reused functionality) */}
            <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: cardBg, color: textPrimary } }}>
                <DialogTitle>Manage Task</DialogTitle>
                <DialogContent>
                    {/* Candidate List reused from original... Simplified for brevity in this redesign view */}
                    <Typography color={textSecondary}>Select a student to award points for this task.</Typography>
                    <List>
                        {candidates.map(c => (
                            <ListItem key={c._id} secondaryAction={<Button size="small" disabled={c.awarded} onClick={() => handleAwardForTask(c)}>{c.awarded ? "Done" : "Award"}</Button>}>
                                <ListItemText primary={c.fname} secondary={`${c.points} pts`} secondaryTypographyProps={{ color: textSecondary }} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            {/* Create Task Dialog */}
            <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: cardBg, color: textPrimary } }}>
                <DialogTitle>Create Task</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Title" fullWidth value={createTaskForm.title} onChange={(e) => setCreateTaskForm({ ...createTaskForm, title: e.target.value })} sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }} />
                        <TextField label="Description" fullWidth multiline rows={3} value={createTaskForm.description} onChange={(e) => setCreateTaskForm({ ...createTaskForm, description: e.target.value })} sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }} />

                        <FormControl fullWidth>
                            <InputLabel sx={{ color: textSecondary }}>Category</InputLabel>
                            <Select
                                value={createTaskForm.category}
                                label="Category"
                                onChange={(e) => setCreateTaskForm({ ...createTaskForm, category: e.target.value })}
                                sx={{ color: textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' } }}
                            >
                                <MenuItem value="General">General Task</MenuItem>
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
                                    sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }}
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip label={option} size="small" {...getTagProps({ index })} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textPrimary }} />
                                ))
                            }
                        />

                        <TextField
                            label="Due Date"
                            type="datetime-local"
                            fullWidth
                            value={createTaskForm.dueDate}
                            onChange={(e) => setCreateTaskForm({ ...createTaskForm, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-input": { colorScheme: isDark ? "dark" : "light", color: textPrimary },
                                "& .MuiInputLabel-root": { color: textSecondary }
                            }}
                        />
                        <TextField label="Points" type="number" fullWidth value={createTaskForm.points} onChange={(e) => setCreateTaskForm({ ...createTaskForm, points: Number(e.target.value) })} sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }} />

                        {createTaskForm.category === 'Quiz' && (
                            <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Quiz Questions</Typography>
                                {createTaskForm.quiz.questions.map((q, qIndex) => (
                                    <Box key={qIndex} sx={{ mb: 4, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="subtitle2">Question {qIndex + 1}</Typography>
                                            <Button size="small" color="error" onClick={() => handleRemoveQuestion(qIndex, false)}>Remove</Button>
                                        </Box>
                                        <TextField
                                            label="Question Text"
                                            fullWidth
                                            value={q.questionText}
                                            onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value, false)}
                                            sx={{ mb: 2, '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }}
                                        />
                                        <Grid container spacing={2}>
                                            {q.options.map((opt, oIndex) => (
                                                <Grid item xs={6} key={oIndex}>
                                                    <TextField
                                                        label={`Option ${oIndex + 1}`}
                                                        fullWidth
                                                        size="small"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value, false)}
                                                        sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                        <FormControl fullWidth sx={{ mt: 2 }}>
                                            <InputLabel sx={{ color: textSecondary }}>Correct Answer</InputLabel>
                                            <Select
                                                value={q.correctAnswer}
                                                label="Correct Answer"
                                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value, false)}
                                                sx={{ color: textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                                            >
                                                {q.options.map((_, i) => (
                                                    <MenuItem key={i} value={i}>Option {i + 1}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                ))}
                                <Button startIcon={<Add />} onClick={() => handleAddQuestion(false)} sx={{ mt: 1 }}>Add Question</Button>
                            </Box>
                        )}

                        <Button variant="contained" onClick={() => handleSaveTask(false)} sx={{ bgcolor: accentColor }}>Create</Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Edit Task Dialog */}
            <Dialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: cardBg, color: textPrimary } }}>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Title" fullWidth value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }} />
                        <TextField label="Description" fullWidth multiline rows={3} value={editTaskForm.description} onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })} sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }} />

                        <FormControl fullWidth>
                            <InputLabel sx={{ color: textSecondary }}>Category</InputLabel>
                            <Select
                                value={editTaskForm.category}
                                label="Category"
                                onChange={(e) => setEditTaskForm({ ...editTaskForm, category: e.target.value })}
                                sx={{ color: textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' } }}
                            >
                                <MenuItem value="General">General Task</MenuItem>
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
                                    sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }}
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip label={option} size="small" {...getTagProps({ index })} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textPrimary }} />
                                ))
                            }
                        />

                        <TextField
                            label="Due Date"
                            type="datetime-local"
                            fullWidth
                            value={editTaskForm.dueDate}
                            onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-input": { colorScheme: isDark ? "dark" : "light", color: textPrimary },
                                "& .MuiInputLabel-root": { color: textSecondary }
                            }}
                        />
                        <TextField label="Points" type="number" fullWidth value={editTaskForm.points} onChange={(e) => setEditTaskForm({ ...editTaskForm, points: Number(e.target.value) })} sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }} />

                        {editTaskForm.category === 'Quiz' && (
                            <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Quiz Questions</Typography>
                                {editTaskForm.quiz.questions.map((q, qIndex) => (
                                    <Box key={qIndex} sx={{ mb: 4, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="subtitle2">Question {qIndex + 1}</Typography>
                                            <Button size="small" color="error" onClick={() => handleRemoveQuestion(qIndex, true)}>Remove</Button>
                                        </Box>
                                        <TextField
                                            label="Question Text"
                                            fullWidth
                                            value={q.questionText}
                                            onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value, true)}
                                            sx={{ mb: 2, '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }}
                                        />
                                        <Grid container spacing={2}>
                                            {q.options.map((opt, oIndex) => (
                                                <Grid item xs={6} key={oIndex}>
                                                    <TextField
                                                        label={`Option ${oIndex + 1}`}
                                                        fullWidth
                                                        size="small"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value, true)}
                                                        sx={{ '& .MuiInputBase-root': { color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                        <FormControl fullWidth sx={{ mt: 2 }}>
                                            <InputLabel sx={{ color: textSecondary }}>Correct Answer</InputLabel>
                                            <Select
                                                value={q.correctAnswer}
                                                label="Correct Answer"
                                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value, true)}
                                                sx={{ color: textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                                            >
                                                {q.options.map((_, i) => (
                                                    <MenuItem key={i} value={i}>Option {i + 1}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                ))}
                                <Button startIcon={<Add />} onClick={() => handleAddQuestion(true)} sx={{ mt: 1 }}>Add Question</Button>
                            </Box>
                        )}

                        <Button variant="contained" onClick={() => handleSaveTask(true)} sx={{ bgcolor: accentColor }}>Update</Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Delete Task Dialog */}
            <Dialog open={deleteTaskOpen} onClose={() => setDeleteTaskOpen(false)} PaperProps={{ sx: { bgcolor: cardBg, color: textPrimary } }}>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete "{taskToDelete?.title}"?</Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setDeleteTaskOpen(false)} color="inherit">Cancel</Button>
                        <Button onClick={async () => {
                            try {
                                await axios.delete(`${baseurl}/api/tasks/${taskToDelete._id}`);
                                setSuccess("Task deleted");
                                setTasks(prev => prev.filter(t => t._id !== taskToDelete._id));
                                setDeleteTaskOpen(false);
                            } catch (err) {
                                setError("Failed to delete task");
                            }
                        }} color="error" variant="contained">Delete</Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* View All Students Dialog */}
            <Dialog open={viewAllStudentsOpen} onClose={() => setViewAllStudentsOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: cardBg, color: textPrimary, borderRadius: 3, backdropFilter: 'blur(20px)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' } }}>
                <DialogTitle sx={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={gradientText}>All Students Directory</Typography>
                    <IconButton onClick={() => setViewAllStudentsOpen(false)} sx={{ color: textSecondary }}><Cancel /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                        <TextField
                            placeholder="Search students..."
                            fullWidth
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', color: textPrimary } }}
                            InputProps={{
                                startAdornment: <PeopleIcon sx={{ color: textSecondary, mr: 1, opacity: 0.5 }} />
                            }}
                        />
                    </Box>
                    <TableContainer sx={{ maxHeight: '70vh' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: cardBg, color: textSecondary, fontWeight: 600 }}>Student</TableCell>
                                    <TableCell sx={{ bgcolor: cardBg, color: textSecondary, fontWeight: 600 }}>Year/Dept</TableCell>
                                    <TableCell sx={{ bgcolor: cardBg, color: textSecondary, fontWeight: 600 }}>Points</TableCell>
                                    <TableCell sx={{ bgcolor: cardBg, color: textSecondary, fontWeight: 600 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ bgcolor: cardBg, color: textSecondary, fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map(u => (
                                    <TableRow key={u._id} hover sx={{ '& td': { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar src={u.profilePic ? `${baseurl}${u.profilePic}` : undefined} sx={{ width: 40, height: 40 }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">{u.fname} {u.ename}</Typography>
                                                    <Typography variant="caption" color={textSecondary}>{u.studentId}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: textPrimary }}>{u.yearClassDept || "--"}</TableCell>
                                        <TableCell>
                                            <Chip label={`${u.points} pts`} size="small" sx={{ bgcolor: 'rgba(74, 222, 128, 0.1)', color: successColor, fontWeight: 600 }} />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: u.status === 'active' ? successColor : 'grey', boxShadow: u.status === 'active' ? `0 0 8px ${successColor}` : 'none' }} />
                                                <Typography variant="body2" color={textSecondary} sx={{ textTransform: 'capitalize' }}>{u.status}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            {/* Actions can be added here if needed */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Typography color={textSecondary}>No students found matching your search.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: {
                        bgcolor: cardBg,
                        color: textPrimary,
                        backdropFilter: 'blur(20px)',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        width: 220
                    }
                }}
            >
                <MenuItem onClick={() => {
                    setAnchorEl(null);
                    setSelectedStudent(selectedStudentForAction);
                    setSidebarOpen(true);
                }} sx={{ gap: 1.5, fontSize: 14 }}>
                    <TrendingUp fontSize="small" sx={{ color: accentColor }} /> View Performance
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); setHistoryOpen(true); }} sx={{ gap: 1.5, fontSize: 14 }}>
                    <VisibilityIcon fontSize="small" sx={{ color: textSecondary }} /> View History
                </MenuItem>
            </Menu>

            {/* Student Details Sidebar */}
            <Drawer
                anchor="right"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', md: 450 },
                        bgcolor: dashboardBg,
                        color: textPrimary,
                        borderLeft: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
                    }
                }}
            >
                {selectedStudent && (
                    <Box sx={{ p: 0, height: '100%', overflowY: 'auto' }}>
                        {/* Header Banner */}
                        <Box sx={{
                            height: 120,
                            background: `linear-gradient(135deg, ${accentColor} 0%, #4f46e5 100%)`,
                            position: 'relative',
                            mb: 6
                        }}>
                            <IconButton
                                onClick={() => setSidebarOpen(false)}
                                sx={{ position: 'absolute', top: 10, right: 10, color: '#fff', bgcolor: 'rgba(0,0,0,0.2)' }}
                            >
                                <Close />
                            </IconButton>
                        </Box>

                        <Box sx={{ px: 4 }}>
                            {/* Profile Info */}
                            <Box sx={{ mt: -8, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                    src={selectedStudent.profilePic ? `${baseurl}${selectedStudent.profilePic}` : undefined}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        border: `4px solid ${dashboardBg}`,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                        bgcolor: cardBg
                                    }}
                                />
                                <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
                                    {selectedStudent.fname} {selectedStudent.ename}
                                </Typography>
                                <Typography variant="body2" color={textSecondary}>
                                    {selectedStudent.studentId} • {selectedStudent.yearClassDept || 'Student'}
                                </Typography>
                                <Chip
                                    label={selectedStudent.status}
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        bgcolor: selectedStudent.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.1)',
                                        color: selectedStudent.status === 'active' ? successColor : textSecondary
                                    }}
                                />
                            </Box>

                            {/* Stats Grid */}
                            {/* Stats Grid */}
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid item xs={4}>
                                    <Box sx={{
                                        p: 2, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                        textAlign: 'center', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                        <Typography variant="h6" fontWeight="bold" color={successColor}>{studentStats.total}</Typography>
                                        <Typography variant="caption" color={textSecondary}>Points</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{
                                        p: 2, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                        textAlign: 'center', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                        <Typography variant="h6" fontWeight="bold" color={isDark ? "#fff" : textPrimary}>#{studentStats.rank}</Typography>
                                        <Typography variant="caption" color={textSecondary}>Rank</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{
                                        p: 2, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                        textAlign: 'center', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                        <Typography variant="h6" fontWeight="bold" color={accentColor}>{studentStats.tasks}</Typography>
                                        <Typography variant="caption" color={textSecondary}>Tasks</Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Performance Graph */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">Points Growth</Typography>
                                <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2, p: 0.5, display: 'flex' }}>
                                    {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((f) => (
                                        <Box
                                            key={f}
                                            onClick={() => setStudentChartFilter(f)}
                                            sx={{
                                                px: 1, py: 0.5, borderRadius: 1.5, cursor: 'pointer', fontSize: 10, fontWeight: 600,
                                                color: studentChartFilter === f ? (isDark ? '#fff' : '#fff') : textSecondary,
                                                bgcolor: studentChartFilter === f ? accentColor : 'transparent',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {f}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                            <Box sx={{
                                height: 200, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 3, p: 2, mb: 4,
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={studentChartData}>
                                        <defs>
                                            <linearGradient id="colorStudentPoints" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textSecondary, fontSize: 10 }} />
                                        <RechartsTooltip cursor={{ opacity: 0.2 }} contentStyle={{ backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 8 }} itemStyle={{ color: textPrimary }} />
                                        <Area type="monotone" dataKey="points" stroke={accentColor} strokeWidth={2} fill="url(#colorStudentPoints)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>

                            {/* Recent Activity Mini List */}
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Recent History</Typography>
                            <List disablePadding>
                                {submissions
                                    .filter(s => s.user?._id === selectedStudent._id)
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .slice(0, 5)
                                    .map(s => (
                                        <ListItem key={s._id} disablePadding sx={{ mb: 2 }}>
                                            <Box sx={{
                                                width: '100%', display: 'flex', gap: 2, alignItems: 'center',
                                                p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                                            }}>
                                                <Box sx={{
                                                    width: 8, height: 8, borderRadius: '50%',
                                                    bgcolor: s.status === 'accepted' ? successColor : s.status === 'rejected' ? 'error.main' : warningColor
                                                }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={500}>{s.task?.title || 'Unknown Task'}</Typography>
                                                    <Typography variant="caption" color={textSecondary}>
                                                        {new Date(s.createdAt).toLocaleDateString()} • {s.status}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" fontWeight="bold" color={s.status === 'accepted' ? successColor : textSecondary}>
                                                    {s.status === 'accepted' ? `+${s.task?.points}` : '-'}
                                                </Typography>
                                            </Box>
                                        </ListItem>
                                    ))}
                                {submissions.filter(s => s.user?._id === selectedStudent._id).length === 0 && (
                                    <Typography variant="body2" color={textSecondary} sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                                        No recent activity found.
                                    </Typography>
                                )}
                            </List>

                            <Box sx={{ my: 4 }}>
                                <Button
                                    fullWidth variant="outlined"
                                    color="inherit"
                                    sx={{ borderRadius: 2, borderColor: 'rgba(255,255,255,0.1)' }}
                                    onClick={() => {
                                        setSidebarOpen(false);
                                        // Maybe open full history dialog for this student?
                                        setSelectedStudentForAction(selectedStudent);
                                        setHistoryOpen(true);
                                    }}
                                >
                                    View Full History
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Drawer>

            {/* Student History Dialog */}
            <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: cardBg, color: textPrimary, borderRadius: 3, backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={selectedStudentForAction?.profilePic ? `${baseurl}${selectedStudentForAction.profilePic}` : undefined} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">{selectedStudentForAction?.fname} History</Typography>
                            <Typography variant="caption" color={textSecondary}>Recent Activity Log</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => setHistoryOpen(false)} sx={{ color: textSecondary }}><Cancel /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ position: 'relative', borderLeft: `2px solid rgba(255,255,255,0.1)`, pl: 4, ml: 1, py: 1 }}>
                        {/* Dummy History for Demo - In real app, fetch this from backend */}
                        {[
                            { text: "Earned 50 pts for 'Quiz 1'", time: "2 hours ago", type: 'positive' },
                            { text: "Submitted 'Assignment 3'", time: "1 day ago", type: 'neutral' },
                            { text: "Earned 100 pts for 'Project'", time: "3 days ago", type: 'positive' }
                        ].map((act, i) => (
                            <Box key={i} sx={{ mb: 4, position: 'relative' }}>
                                <Box sx={{
                                    position: 'absolute', left: -38, top: 2,
                                    width: 12, height: 12, borderRadius: '50%',
                                    bgcolor: act.type === 'positive' ? successColor : accentColor,
                                    border: `2px solid ${cardBg}`
                                }} />
                                <Typography variant="body2" fontWeight={500}>{act.text}</Typography>
                                <Typography variant="caption" color={textSecondary}>{act.time}</Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Alerts */}
            <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity="success" onClose={() => setSuccess("")} variant="filled">{success}</Alert>
            </Snackbar>
            <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity="error" onClose={() => setError("")} variant="filled">{error}</Alert>
            </Snackbar>


            {/* Manage Banners Dialog - Redesigned */}
            <Dialog
                open={manageBannersOpen}
                onClose={() => setManageBannersOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.5)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        color: textPrimary
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                    pb: 2
                }}>
                    <Box>
                        <Typography variant="h5" fontWeight="900" sx={{ ...gradientText, letterSpacing: -0.5 }}>
                            Advertisement Banners
                        </Typography>
                        <Typography variant="body2" color={textSecondary}>
                            Manage promotional content visible to students
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setManageBannersOpen(false)} sx={{ color: textSecondary, '&:hover': { color: textPrimary, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        {/* Left Column: Create Form */}
                        <Grid item xs={12} md={5}>
                            <Card sx={{
                                height: '100%',
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                                borderRadius: 3,
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                                overflow: 'visible'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: accentColor }}>
                                            <Add fontSize="small" />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold">Create New Banner</Typography>
                                    </Box>

                                    <Stack spacing={3}>
                                        <TextField
                                            label="Campaign Title"
                                            fullWidth
                                            value={bannerForm.title}
                                            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                                    borderRadius: 2,
                                                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                                    '&:hover fieldset': { borderColor: accentColor },
                                                    '&.Mui-focused fieldset': { borderColor: accentColor }
                                                },
                                                '& .MuiInputLabel-root': { color: textSecondary },
                                                '& .MuiInputBase-input': { color: textPrimary }
                                            }}
                                        />

                                        <TextField
                                            label="Description"
                                            fullWidth
                                            multiline
                                            rows={3}
                                            value={bannerForm.description}
                                            onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                                    borderRadius: 2,
                                                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                                    '&:hover fieldset': { borderColor: accentColor },
                                                    '&.Mui-focused fieldset': { borderColor: accentColor }
                                                },
                                                '& .MuiInputLabel-root': { color: textSecondary },
                                                '& .MuiInputBase-input': { color: textPrimary }
                                            }}
                                        />

                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: textSecondary }}>Template Style</InputLabel>
                                            <Select
                                                value={bannerForm.templateId}
                                                label="Template Style"
                                                onChange={(e) => setBannerForm({ ...bannerForm, templateId: e.target.value })}
                                                sx={{
                                                    color: textPrimary,
                                                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                                    borderRadius: 2,
                                                    '.MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: accentColor },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accentColor }
                                                }}
                                            >
                                                <MenuItem value={1}>Template 1: Simple Centered</MenuItem>
                                                <MenuItem value={2}>Template 2: Split Image/Text</MenuItem>
                                                <MenuItem value={3}>Template 3: Full Background</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="caption" color={textSecondary} sx={{ fontWeight: 600 }}>BANNER IMAGE</Typography>
                                                <ToggleButtonGroup
                                                    value={bannerForm.imageType}
                                                    exclusive
                                                    onChange={(_, newVal) => {
                                                        if (newVal) setBannerForm({ ...bannerForm, imageType: newVal });
                                                    }}
                                                    size="small"
                                                    sx={{
                                                        height: 24,
                                                        '& .MuiToggleButton-root': {
                                                            fontSize: 10,
                                                            px: 1,
                                                            py: 0.5,
                                                            color: textSecondary,
                                                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                            '&.Mui-selected': {
                                                                bgcolor: accentColor,
                                                                color: '#fff',
                                                                '&:hover': { bgcolor: accentColor }
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <ToggleButton value="upload">Upload</ToggleButton>
                                                    <ToggleButton value="url">Link</ToggleButton>
                                                </ToggleButtonGroup>
                                            </Box>

                                            {bannerForm.imageType === 'upload' ? (
                                                <Button
                                                    component="label"
                                                    fullWidth
                                                    sx={{
                                                        height: 120,
                                                        border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                        borderRadius: 2,
                                                        color: textSecondary,
                                                        flexDirection: 'column',
                                                        bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                                        '&:hover': {
                                                            borderColor: accentColor,
                                                            bgcolor: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.05)',
                                                            color: accentColor
                                                        }
                                                    }}
                                                >
                                                    {bannerImagePreview ? (
                                                        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 1 }}>
                                                            <img src={bannerImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <Box sx={{
                                                                position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                opacity: 0, transition: 'opacity 0.2s', '&:hover': { opacity: 1 }
                                                            }}>
                                                                <Typography variant="caption" color="white" fontWeight="bold">Change Image</Typography>
                                                            </Box>
                                                        </Box>
                                                    ) : (
                                                        <>
                                                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', mb: 1 }}>
                                                                <CloudUpload />
                                                            </Box>
                                                            <Typography variant="body2">Click to upload image</Typography>
                                                            <Typography variant="caption" sx={{ opacity: 0.7 }}>SVG, PNG, JPG or GIF</Typography>
                                                        </>
                                                    )}
                                                    <input type="file" hidden accept="image/*" onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setBannerForm({ ...bannerForm, image: file });
                                                            setBannerImagePreview(URL.createObjectURL(file));
                                                        }
                                                    }} />
                                                </Button>
                                            ) : (
                                                <Box>
                                                    <TextField
                                                        placeholder="https://example.com/image.png"
                                                        fullWidth
                                                        size="small"
                                                        value={bannerForm.imageUrl}
                                                        onChange={(e) => {
                                                            setBannerForm({ ...bannerForm, imageUrl: e.target.value });
                                                            setBannerImagePreview(e.target.value);
                                                        }}
                                                        InputProps={{
                                                            startAdornment: <LinkIcon sx={{ color: textSecondary, mr: 1, fontSize: 20 }} />
                                                        }}
                                                        sx={{
                                                            mb: 2,
                                                            '& .MuiOutlinedInput-root': {
                                                                bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                                                borderRadius: 2,
                                                                '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                                                '&:hover fieldset': { borderColor: accentColor },
                                                                '&.Mui-focused fieldset': { borderColor: accentColor }
                                                            }
                                                        }}
                                                    />
                                                    {bannerForm.imageUrl && (
                                                        <Box sx={{
                                                            height: 120,
                                                            width: '100%',
                                                            borderRadius: 2,
                                                            overflow: 'hidden',
                                                            bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            <img
                                                                src={bannerForm.imageUrl}
                                                                alt="Preview"
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                                onLoad={(e) => { e.target.style.display = 'block'; }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                onClick={async () => {
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('title', bannerForm.title);
                                                        formData.append('description', bannerForm.description);
                                                        formData.append('templateId', bannerForm.templateId);

                                                        if (bannerForm.imageType === 'upload' && bannerForm.image) {
                                                            formData.append('image', bannerForm.image);
                                                        } else if (bannerForm.imageType === 'url' && bannerForm.imageUrl) {
                                                            formData.append('imageUrl', bannerForm.imageUrl);
                                                        }

                                                        if (isEditing) {
                                                            await axios.put(`${baseurl}/api/events/update/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                            setSuccess("Banner updated successfully");
                                                            setIsEditing(false);
                                                            setEditingId(null);
                                                        } else {
                                                            await axios.post(`${baseurl}/api/events/add`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                            setSuccess("Banner created successfully");
                                                        }

                                                        setBannerForm({ title: '', description: '', templateId: 1, image: null, imageType: 'upload', imageUrl: '' });
                                                        setBannerImagePreview(null);
                                                        fetchBanners();
                                                    } catch (err) {
                                                        setError(isEditing ? "Failed to update banner" : "Failed to create banner");
                                                    }
                                                }}
                                                sx={{
                                                    bgcolor: accentColor,
                                                    color: '#fff',
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    fontWeight: 'bold',
                                                    boxShadow: `0 8px 20px -4px ${accentColor}80`,
                                                    '&:hover': { bgcolor: '#6366f1', boxShadow: `0 12px 24px -4px ${accentColor}90` }
                                                }}
                                            >
                                                {isEditing ? "Update Campaign" : "Publish Campaign"}
                                            </Button>
                                            {isEditing && (
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditingId(null);
                                                        setBannerForm({ title: '', description: '', templateId: 1, image: null, imageType: 'upload', imageUrl: '' });
                                                        setBannerImagePreview(null);
                                                    }}
                                                    sx={{ borderRadius: 2, borderColor: textSecondary, color: textSecondary }}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right Column: Active Banners */}
                        <Grid item xs={12} md={7}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">Active Campaigns</Typography>
                                <Chip label={`${banners.length} Active`} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textSecondary, fontWeight: 600 }} />
                            </Box>

                            <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 1 }}>
                                <AnimatePresence>
                                    {banners.length === 0 ? (
                                        <Box sx={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            py: 8, opacity: 0.5, border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 3
                                        }}>
                                            <CampaignIcon sx={{ fontSize: 48, mb: 2, color: textSecondary }} />
                                            <Typography color={textSecondary} fontWeight="500">No active banners running</Typography>
                                            <Typography variant="caption" color={textSecondary}>Create one to get started</Typography>
                                        </Box>
                                    ) : (
                                        banners.map((b) => (
                                            <motion.div
                                                key={b._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Card sx={{
                                                    mb: 2,
                                                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                                                    borderRadius: 3,
                                                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: isDark ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 10px 20px -10px rgba(0,0,0,0.1)' }
                                                }}>
                                                    <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
                                                        {/* Thumbnail */}
                                                        <Box sx={{
                                                            width: 80, height: 80, borderRadius: 2, flexShrink: 0,
                                                            bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {b.imageUrl ? (
                                                                <img src={b.imageUrl.startsWith('http') ? b.imageUrl : `${baseurl}${b.imageUrl}`} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <CampaignIcon sx={{ color: textSecondary, opacity: 0.5 }} />
                                                            )}
                                                        </Box>

                                                        {/* Content */}
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                                <Typography variant="subtitle1" fontWeight="bold" noWrap>{b.title}</Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box sx={{
                                                                        width: 8, height: 8, borderRadius: '50%',
                                                                        bgcolor: b.isActive ? successColor : textSecondary,
                                                                        boxShadow: b.isActive ? `0 0 8px ${successColor}` : 'none'
                                                                    }} />
                                                                    <Typography variant="caption" fontWeight="600" color={b.isActive ? successColor : textSecondary}>
                                                                        {b.isActive ? 'LIVE' : 'INACTIVE'}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <Typography variant="body2" color={textSecondary} sx={{
                                                                mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4
                                                            }}>
                                                                {b.description}
                                                            </Typography>

                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <Chip label={`Template ${b.templateId}`} size="small" sx={{ height: 20, fontSize: 10, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: textSecondary }} />

                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <Tooltip title="Edit">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                setBannerForm({
                                                                                    title: b.title,
                                                                                    description: b.description,
                                                                                    templateId: b.templateId,
                                                                                    image: null,
                                                                                    imageType: b.imageUrl?.startsWith('http') ? 'url' : 'upload',
                                                                                    imageUrl: b.imageUrl?.startsWith('http') ? b.imageUrl : ''
                                                                                });
                                                                                setBannerImagePreview(b.imageUrl?.startsWith('http') ? b.imageUrl : `${baseurl}${b.imageUrl}`);
                                                                                setIsEditing(true);
                                                                                setEditingId(b._id);
                                                                            }}
                                                                            sx={{ color: yellowAccent, bgcolor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)', '&:hover': { bgcolor: 'rgba(251, 191, 36, 0.2)' } }}
                                                                        >
                                                                            <Edit fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title={b.isActive ? "Deactivate" : "Activate"}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={async () => {
                                                                                await axios.put(`${baseurl}/api/events/toggle/${b._id}`);
                                                                                fetchBanners();
                                                                            }}
                                                                            sx={{
                                                                                color: b.isActive ? warningColor : successColor,
                                                                                bgcolor: b.isActive ? 'rgba(251, 191, 36, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                                                                '&:hover': { bgcolor: b.isActive ? 'rgba(251, 191, 36, 0.2)' : 'rgba(74, 222, 128, 0.2)' }
                                                                            }}
                                                                        >
                                                                            {b.isActive ? <PersonOff fontSize="small" /> : <CheckCircle fontSize="small" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={async () => {
                                                                                await axios.delete(`${baseurl}/api/events/${b._id}`);
                                                                                fetchBanners();
                                                                            }}
                                                                            sx={{
                                                                                color: 'error.main',
                                                                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                                                            }}
                                                                        >
                                                                            <Cancel fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FacultyDashboard;
