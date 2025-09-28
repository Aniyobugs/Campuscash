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
} from "@mui/material";
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

  // ✅ Fetch only active users
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

  // ✅ Search filter
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

  // ✅ Award points
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

  // ✅ Edit user
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

  // ✅ Toggle status (Deactivate removes from list, Activate adds back)
  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(`${baseurl}/api/users/${id}/status`);
      setSuccess(res.data.message);

      if (res.data.user.status === "inactive") {
        // remove from UI
        const updatedUsers = users.filter((u) => u._id !== id);
        setUsers(updatedUsers);
        setFiltered(updatedUsers);
      } else {
        // add back to UI
        const updatedUsers = [...users, res.data.user];
        setUsers(updatedUsers);
        setFiltered(updatedUsers);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // ✅ Stats only from active users
  const totalUsers = users.length;
  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
  const topStudent =
    users.length > 0 ? [...users].sort((a, b) => b.points - a.points)[0] : null;

  const statCardStyles = {
    bgcolor: "white",
    color: "primary.main",
    boxShadow: 4,
    borderRadius: 2,
    p: 2,
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
        sx={{ letterSpacing: 2, color: "primary.main" }}
      >
        Admin Dashboard
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* ✅ Stats */}
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={statCardStyles} elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Fade in timeout={600}>
                <Typography variant="h3">{totalUsers}</Typography>
              </Fade>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={statCardStyles} elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Points Distributed
              </Typography>
              <Fade in timeout={600}>
                <Typography variant="h3">{totalPoints}</Typography>
              </Fade>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={statCardStyles} elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Student
              </Typography>
              {topStudent ? (
                <Fade in timeout={600}>
                  <Box>
                    <Typography variant="h5">{topStudent.fname}</Typography>
                    <Typography color="primary">
                      {topStudent.points} pts
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                <Typography>No students yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ✅ Award Points Section */}
      <Card sx={{ mb: 5, bgcolor: "white", boxShadow: 6, borderRadius: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            color="secondary"
            sx={{ mb: 3 }}
          >
            Award Points
          </Typography>

          <Grid container spacing={2} alignItems="center">
            {/* Searchable Dropdown */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) =>
                  `${option.fname} (${option.studentId}) - ${
                    option.points || 0
                  } pts`
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
                    <span>{`${option.fname} (${option.studentId}) - ${
                      option.points || 0
                    } pts`}</span>
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

            {/* Points input */}
            <Grid item xs={12} md={2}>
              <TextField
                label="Points"
                type="number"
                fullWidth
                value={awardData.points}
                onChange={(e) =>
                  setAwardData({ ...awardData, points: e.target.value })
                }
              />
            </Grid>

            {/* Reason input */}
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

            {/* Award button */}
            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: "100%", fontWeight: "bold", borderRadius: 2 }}
                onClick={handleAward}
              >
                Award
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ✅ Students List */}
      <Card sx={{ bgcolor: "white", boxShadow: 4, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="secondary">
            Students List
          </Typography>
          <TextField
            label="Search"
            fullWidth
            sx={{ mb: 2 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Year/Class/Dept</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u._id} hover>
                      <TableCell>
                        <Avatar
                          src={
                            u.profilePic
                              ? `${baseurl}${u.profilePic}`
                              : "/default-avatar.png"
                          }
                          alt={u.fname}
                          sx={{ width: 40, height: 40 }}
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
                          />
                        ) : (
                          u.fname
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
                          />
                        ) : (
                          u.ename
                        )}
                      </TableCell>
                      <TableCell>{u.studentId}</TableCell>
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
                          />
                        ) : (
                          u.yearClassDept
                        )}
                      </TableCell>
                      <TableCell>{u.points}</TableCell>
                      <TableCell>{u.status || "active"}</TableCell>
                      <TableCell align="center">
                        {editingUserId === u._id ? (
                          <>
                            <Button
                              onClick={() => handleSave(u._id)}
                              variant="contained"
                              color="success"
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingUserId(null)}
                              variant="outlined"
                              color="error"
                              size="small"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(u)}
                              variant="outlined"
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleToggleStatus(u._id)}
                              variant="outlined"
                              color={u.status === "active" ? "error" : "success"}
                              size="small"
                            >
                              {u.status === "active"
                                ? "Deactivate"
                                : "Delete"}
                            </Button>
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

      {/* ✅ Alerts */}
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
