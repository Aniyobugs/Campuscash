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
} from "@mui/material";
import { Edit, Save, Cancel, PersonOff, Person } from "@mui/icons-material";
import axios from "axios";

const AdminDashboard = () => {
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
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Create Task dialog state
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

  // derive year options from existing users (plus some common defaults)
  const yearOptions = Array.from(new Set([
    'All',
    'Year 1',
    'Year 2',
    'Year 3',
    'Year 4',
    'Year 5',
    ...(users || []).map((u) => u.yearClassDept).filter(Boolean),
  ]));

  // Submissions
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

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
    fetchSubmissions();
  }, []);

  useEffect(() => {
    axios
      .get(`${baseurl}/api/users`)
      .then((res) => {
        // include all users except those explicitly marked 'inactive'
        const activeUsers = res.data.filter((u) => u.status !== "inactive");
        setUsers(activeUsers);
        setFiltered(activeUsers);
      })
      .catch((err) => {
        console.error("Users fetch error:", err.response?.data || err.message || err);
        setError(err.response?.data?.message || "Failed to load users");
      });

    // fetch tasks for admin
    setTasksLoading(true);
    axios
      .get(`${baseurl}/api/tasks`)
      .then((res) => setTasks(res.data || []))
      .catch((err) => {
        console.error("Tasks fetch error:", err.response?.data || err.message || err);
        setError(err.response?.data?.message || "Failed to load tasks");
      })
      .finally(() => setTasksLoading(false));
  }, [baseurl]);

  useEffect(() => {
    setFiltered(
      users.filter(
        (u) =>
          u.fname?.toLowerCase().includes(search.toLowerCase()) ||
          u.ename?.toLowerCase().includes(search.toLowerCase()) ||
          (u.studentId &&
            u.studentId.toLowerCase().includes(search.toLowerCase()))
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

  const handleOpenTask = async (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
    setCandidatesLoading(true);
    try {
      const res = await axios.get(`${baseurl}/api/tasks/${task._id}/candidates`);
      setCandidates(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load candidates");
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

  const statCardStyles = {
    bgcolor: "white",
    color: "primary.main",
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
    <Box
      sx={{
        p: { xs: 2, md: 5 },
        bgcolor: "background.default",
        minHeight: "100vh",
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        mb={2}
        sx={{
          letterSpacing: 2,
          color: "primary.main",
          textAlign: "center",
          textShadow: "0 2px 8px #e3e3e3",
        }}
      >
        Admin CampusCash
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* Stats */}
      <Grid container spacing={4} mb={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={statCardStyles} elevation={6}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Fade in timeout={600}>
                <Typography variant="h2" color="primary">
                  {totalUsers}
                </Typography>
              </Fade>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={statCardStyles} elevation={6}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Points Distributed
              </Typography>
              <Fade in timeout={600}>
                <Typography variant="h2" color="secondary">
                  {totalPoints}
                </Typography>
              </Fade>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={statCardStyles} elevation={6}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Top Student
              </Typography>
              {topStudent ? (
                <Fade in timeout={600}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                    <Avatar
                      src={
                        topStudent.profilePic
                          ? `${baseurl}${topStudent.profilePic}`
                          : "/default-avatar.png"
                      }
                      alt={topStudent.fname}
                      sx={{ width: 48, height: 48, boxShadow: 2 }}
                    />
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {topStudent.fname}
                      </Typography>
                      <Chip
                        label={`${topStudent.points} pts`}
                        color="success"
                        size="small"
                        sx={{ fontWeight: "bold", mt: 1 }}
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

      {/* Award Points Section */}
      <Card sx={{ mb: 5, bgcolor: "white", boxShadow: 8, borderRadius: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            color="secondary"
            sx={{ mb: 3, fontWeight: "bold", letterSpacing: 1 }}
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
                color="primary"
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

      {/* Students List */}
      <Card sx={{ bgcolor: "white", boxShadow: 6, borderRadius: 3 }}>
        <CardContent>
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
              sx: { bgcolor: "#f5f5f5", borderRadius: 2 },
            }}
          />
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.light" }}>
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
                            sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
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
                            sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
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
                            sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}
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

              {/* Submissions */}
              <Card sx={{ mt: 4, bgcolor: "white", boxShadow: 6, borderRadius: 3 }}>
                <CardContent>
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
                            <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleApproveSubmission(s)} disabled={s.status === 'accepted'}>Accept & Award</Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => handleRejectSubmission(s)} disabled={s.status === 'rejected'}>Reject</Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>

              {/* Tasks List / Manage */}
              <Card sx={{ mt: 4, bgcolor: "white", boxShadow: 6, borderRadius: 3 }}>
                <CardContent>
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
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "primary.light" }}>
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

              {/* Create Task Dialog */}
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

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess("")}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
