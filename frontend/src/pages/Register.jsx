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
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GoshenLogo from "../assets/Goshen_Realty_Logo.svg";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (form.email !== form.confirmEmail) {
      setError("Emails do not match");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Browse exclusive property listings",
    "Submit applications online",
    "Track your compliance progress",
    "Secure document management",
  ];

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
            radial-gradient(circle at 80% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)
          `,
        },
      }}
    >
      {/* Animated Background */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 350,
          height: 350,
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
          bottom: "10%",
          right: "5%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(245, 158, 11, 0.1))",
          filter: "blur(60px)",
          animation: "float2 10s ease-in-out infinite",
          "@keyframes float2": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(20px)" },
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Benefits */}
          <Grid item xs={12} md={5} sx={{ display: { xs: "none", md: "block" } }}>
            <Box sx={{ pr: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                Start Your Property Journey Today
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  mb: 4,
                  lineHeight: 1.7,
                }}
              >
                Join thousands of clients who trust Goshen Realty for their real estate needs in the Philippines.
              </Typography>

              <Stack spacing={2}>
                {benefits.map((benefit) => (
                  <Stack key={benefit} direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        background: "rgba(16, 185, 129, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircleIcon sx={{ color: "#10b981", fontSize: 20 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)" }}>
                      {benefit}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Right Side - Form */}
          <Grid item xs={12} md={7}>
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
                    justifyContent: "center",
                    textDecoration: "none",
                    mb: 2,
                  }}
                >
                  <img
                    src={GoshenLogo}
                    alt="Goshen Realty"
                    style={{
                      height: 80,
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                  Create your account
                </Typography>
                <Typography variant="body1" sx={{ color: "#64748b" }}>
                  Get started with your free account
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
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { background: "#f8fafc" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { background: "#f8fafc" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { background: "#f8fafc" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm Email"
                      type="email"
                      name="confirmEmail"
                      value={form.confirmEmail}
                      onChange={handleChange}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { background: "#f8fafc" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
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
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { background: "#f8fafc" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
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
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { background: "#f8fafc" } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={loading}
                      fullWidth
                      size="large"
                      endIcon={!loading && <ArrowForwardIcon />}
                      sx={{
                        py: 1.5,
                        mt: 1,
                        fontSize: "1rem",
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                          boxShadow: "0 12px 30px rgba(16, 185, 129, 0.4)",
                          transform: "translateY(-2px)",
                        },
                        "&:disabled": {
                          background: "#e2e8f0",
                        },
                      }}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Chip label="Already have an account?" size="small" sx={{ color: "#64748b" }} />
              </Divider>

              <Button
                component={Link}
                to="/login"
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
                Sign In Instead
              </Button>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  mt: 3,
                  color: "#94a3b8",
                }}
              >
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Register;
