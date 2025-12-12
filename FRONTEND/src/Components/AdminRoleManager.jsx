import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const AdminRoleManager = () => {
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const [users, setUsers] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/users`);
      setUsers(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user role
  const updateRole = async (id, newRole) => {
    try {
      const res = await axios.put(`${baseurl}/api/users/${id}/role`, {
        role: newRole,
      });
      setSuccess(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Role update failed");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold">
            Role Management
          </Typography>
          <Typography color="text.secondary">
            Assign roles to users (Admin / Store / User)
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Current Role</strong></TableCell>
                <TableCell><strong>Change Role</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.fname}</TableCell>
                  <TableCell>{u.ename}</TableCell>
                  <TableCell>
                    <strong>{u.role.toUpperCase()}</strong>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onChange={(e) => updateRole(u._id, e.target.value)}
                      size="small"
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="store">Store</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError("")}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRoleManager;
