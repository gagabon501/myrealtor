import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import client from "../api/client";

const roleOptions = ["public", "client", "staff", "admin"];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await client.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (id, role) => {
    setError(null);
    try {
      await client.put(`/users/${id}/role`, { role });
      setNotice("Role updated");
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Manage Users
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Admin-only view to review accounts and adjust roles.
      </Typography>

      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {users.map((user) => (
          <Card key={user._id} variant="outlined">
            <CardContent>
              <Typography variant="subtitle1">{user.email}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user.profile?.fullName || "No name"} • Joined {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Select
                  size="small"
                  value={user.role}
                  onChange={(e) => updateRole(user._id, e.target.value)}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
                <Button size="small" variant="outlined" onClick={() => updateRole(user._id, user.role)}>
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
        {!users.length && <Typography color="text.secondary">No users found.</Typography>}
      </Stack>
    </Container>
  );
};

export default ManageUsers;

