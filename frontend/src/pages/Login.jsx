import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Stack,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
        py: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)
          `,
        },
      }}
    >
      {/* Animated Background */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.1))",
          filter: "blur(80px)",
          animation: "float 8s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-30px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          left: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1))",
          filter: "blur(60px)",
          animation: "float2 10s ease-in-out infinite",
          "@keyframes float2": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(20px)" },
          },
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.5,
                textDecoration: "none",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 14px rgba(14, 165, 233, 0.4)",
                }}
              >
                MR
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                MyRealtor
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
              Welcome back
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b" }}>
              Sign in to continue to your dashboard
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "#f8fafc",
                  },
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#64748b" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "#f8fafc",
                  },
                }}
              />

              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                fullWidth
                size="large"
                endIcon={!loading && <ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                  boxShadow: "0 8px 20px rgba(14, 165, 233, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                    boxShadow: "0 12px 30px rgba(14, 165, 233, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "#e2e8f0",
                  },
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 4 }}>
            <Chip label="New to MyRealtor?" size="small" sx={{ color: "#64748b" }} />
          </Divider>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              Create an account to start your property journey
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                borderWidth: 2,
                borderColor: "#0ea5e9",
                color: "#0ea5e9",
                fontWeight: 600,
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#0284c7",
                  background: "rgba(14, 165, 233, 0.05)",
                },
              }}
            >
              Create Account
            </Button>
          </Box>
        </Paper>

        {/* Features */}
        <Stack
          direction="row"
          spacing={4}
          justifyContent="center"
          sx={{ mt: 4, flexWrap: "wrap", gap: 2 }}
        >
          {["Secure Login", "24/7 Access", "Real-time Updates"].map((feature) => (
            <Stack key={feature} direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default Login;
