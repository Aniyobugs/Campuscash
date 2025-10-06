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
  Autocomplete,
  Avatar,
  Fade,
  Divider,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Edit, Save, Cancel, PersonOff, Person } from "@mui/icons-material";
import axios from "axios";

const AdminDashboard = () => {
  const baseurl = import.meta.env.VITE_API_BASE_URL;

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

  useEffect(() => {
    axios
      .get(`${baseurl}/api/users`)
      .then((res) => {
        const activeUsers = res.data.filter((u) => u.status !== "inactive");
        setUsers(activeUsers);
        setFiltered(activeUsers);
      })
      .catch((err) => console.error(err));
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
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={2}>
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
            <Grid item xs={12} md={3}>
              <TextField
                label="Reason"
                fullWidth
                value={awardData.reason}
                onChange={(e) =>
                  setAwardData({ ...awardData, reason: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={1}>
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
  );
};

export default AdminDashboard;
