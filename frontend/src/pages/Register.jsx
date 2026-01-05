import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Button, Container, TextField, Typography, Alert, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Create an account
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required />
          <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <TextField label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </Button>
          <Typography variant="body2">
            Already registered? <Link to="/login">Login</Link>
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;

