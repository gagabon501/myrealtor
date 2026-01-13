import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VerifiedIcon from "@mui/icons-material/Verified";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DescriptionIcon from "@mui/icons-material/Description";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const Home = () => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const features = [
    {
      icon: <HomeWorkIcon sx={{ fontSize: 32, color: "#0ea5e9" }} />,
      title: "Curated Listings",
      description: "Browse verified properties across the Philippines with detailed insights",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 32, color: "#10b981" }} />,
      title: "Secure Transactions",
      description: "End-to-end encrypted document handling and payment processing",
    },
    {
      icon: <AccountBalanceIcon sx={{ fontSize: 32, color: "#6366f1" }} />,
      title: "Compliance Ready",
      description: "Built-in DHSUD, LRA, and NHA regulatory workflow tracking",
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 32, color: "#f59e0b" }} />,
      title: "Expert Support",
      description: "Professional guidance from licensed real estate practitioners",
    },
  ];

  const stats = [
    { value: "500+", label: "Listed Properties" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "24/7", label: "Support Available" },
    { value: "100%", label: "Compliance Rate" },
  ];

  const steps = [
    {
      num: "01",
      title: "Browse & Discover",
      desc: "Search properties by location, price range, type, and amenities",
      icon: <LocationOnIcon />,
    },
    {
      num: "02",
      title: "Apply Online",
      desc: "Submit your application with required documents securely",
      icon: <DescriptionIcon />,
    },
    {
      num: "03",
      title: "Track Progress",
      desc: "Monitor compliance steps, approvals, and regulatory submissions",
      icon: <TrendingUpIcon />,
    },
    {
      num: "04",
      title: "Close & Transfer",
      desc: "Complete payments and receive ownership transfer documentation",
      icon: <VerifiedIcon />,
    },
  ];

  return (
    <Box sx={{ overflow: "hidden" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.08) 0%, transparent 40%)
            `,
          },
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.1))",
            filter: "blur(80px)",
            animation: "float 8s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
              "50%": { transform: "translateY(-30px) rotate(5deg)" },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "20%",
            left: "10%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1))",
            filter: "blur(60px)",
            animation: "float2 10s ease-in-out infinite",
            "@keyframes float2": {
              "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
              "50%": { transform: "translateY(20px) rotate(-5deg)" },
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 8, md: 0 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  opacity: animateIn ? 1 : 0,
                  transform: animateIn ? "translateY(0)" : "translateY(40px)",
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <Chip
                  label="Philippine Real Estate Platform"
                  sx={{
                    mb: 3,
                    background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))",
                    border: "1px solid rgba(14, 165, 233, 0.3)",
                    color: "#38bdf8",
                    fontWeight: 600,
                    px: 1,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.1,
                    mb: 3,
                    "& span": {
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #f59e0b 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    },
                  }}
                >
                  Find Your <span>Dream Property</span> in the Philippines
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 400,
                    lineHeight: 1.7,
                    mb: 4,
                    maxWidth: 500,
                  }}
                >
                  Seamless property discovery, secure applications, compliance tracking, and ownership transfer - all in one platform.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mb: 5 }}
                >
                  <Button
                    variant="contained"
                    component={Link}
                    to="/properties"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1rem",
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                      boxShadow: "0 8px 30px rgba(14, 165, 233, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                        boxShadow: "0 12px 40px rgba(14, 165, 233, 0.5)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Explore Properties
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/services"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1rem",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "#fff",
                      "&:hover": {
                        borderColor: "#0ea5e9",
                        background: "rgba(14, 165, 233, 0.1)",
                      },
                    }}
                  >
                    Our Services
                  </Button>
                </Stack>

                {/* Trust Badges */}
                <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ gap: 2 }}>
                  {["DHSUD Compliant", "Licensed Brokers", "Secure Platform"].map((badge) => (
                    <Stack key={badge} direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        {badge}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  opacity: animateIn ? 1 : 0,
                  transform: animateIn ? "translateX(0)" : "translateX(40px)",
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
                }}
              >
                {/* Feature Card */}
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 4,
                    overflow: "visible",
                    position: "relative",
                    "&:hover": {
                      transform: "none",
                      boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>
                      How It Works
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 3 }}>
                      Your Journey to Property Ownership
                    </Typography>

                    <Stack spacing={2.5}>
                      {steps.map((step, index) => (
                        <Box
                          key={step.num}
                          sx={{
                            display: "flex",
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            background: index === 0
                              ? "linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.1))"
                              : "rgba(255, 255, 255, 0.03)",
                            border: index === 0
                              ? "1px solid rgba(14, 165, 233, 0.3)"
                              : "1px solid rgba(255, 255, 255, 0.05)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.1))",
                              border: "1px solid rgba(14, 165, 233, 0.3)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              background: index === 0
                                ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                                : "rgba(255, 255, 255, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            {step.icon}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600, mb: 0.5 }}>
                              {step.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                              {step.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Floating Stats Card */}
                <Paper
                  sx={{
                    position: "absolute",
                    bottom: -80,
                    left: -50,
                    p: 2.5,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                    display: { xs: "none", lg: "block" },
                    zIndex: 10,
                  }}
                >
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: "#0ea5e9" }}>
                        500+
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Properties
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: "#10b981" }}>
                        98%
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Satisfied
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: "#fff" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Chip
              label="Why Choose Us"
              sx={{
                mb: 2,
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(99, 102, 241, 0.1))",
                color: "#0ea5e9",
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "2.75rem" },
                fontWeight: 800,
                mb: 2,
                color: "#0f172a",
              }}
            >
              The Smarter Way to Buy Property
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.7,
              }}
            >
              We combine technology with expert guidance to make your property buying journey smooth, secure, and transparent.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Card
                  sx={{
                    height: "100%",
                    p: 1,
                    background: "#fff",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#0ea5e9",
                      boxShadow: "0 20px 40px rgba(14, 165, 233, 0.1)",
                      "& .feature-icon": {
                        transform: "scale(1.1)",
                      },
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      className="feature-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2.5,
                        transition: "transform 0.3s ease",
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#0f172a" }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: "#f8fafc" }}>
        <Container maxWidth="md">
          <Card
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: "center",
              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              border: "none",
              borderRadius: 4,
              boxShadow: "0 25px 50px rgba(14, 165, 233, 0.3)",
              "&:hover": {
                transform: "none",
              },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                fontWeight: 800,
                color: "#fff",
                mb: 2,
              }}
            >
              Ready to Find Your Dream Home?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.85)",
                mb: 4,
                maxWidth: 500,
                mx: "auto",
                lineHeight: 1.7,
              }}
            >
              Join thousands of satisfied clients who found their perfect property through MyRealtor PH.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                component={Link}
                to="/register"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  background: "#fff",
                  color: "#0ea5e9",
                  fontWeight: 700,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  "&:hover": {
                    background: "#f8fafc",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/properties"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#fff",
                  "&:hover": {
                    borderColor: "#fff",
                    background: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Browse Properties
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          background: "#0f172a",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                }}
              >
                MR
              </Box>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                MyRealtor Philippines
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
              © {new Date().getFullYear()} Gilberto Gabon. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              {["Privacy", "Terms", "Contact"].map((link) => (
                <Typography
                  key={link}
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    "&:hover": { color: "#0ea5e9" },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
