import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Home as HomeIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    listingRequests: 0,
    inquiries: 0,
    serviceRequests: 0,
    earnestMoney: 0,
  });

  const loadCounts = async () => {
    try {
      const [listingRes, inquiriesRes, servicesRes, emaRes] = await Promise.allSettled([
        client.get("/listing-requests"),
        client.get("/admin/inquiries?status=NEW"),
        client.get("/services/pending-count"),
        client.get("/earnest-money?status=PENDING_REVIEW"),
      ]);

      // Count only listing requests that are pending AND not yet published
      let pendingListingCount = 0;
      if (listingRes.status === "fulfilled" && Array.isArray(listingRes.value.data)) {
        pendingListingCount = listingRes.value.data.filter(
          (req) => req.status === "ATS_PENDING" && !req.publishedPropertyId
        ).length;
      }

      setCounts({
        listingRequests: pendingListingCount,
        inquiries: inquiriesRes.status === "fulfilled" ? (inquiriesRes.value.data?.length || inquiriesRes.value.data?.count || 0) : 0,
        serviceRequests: servicesRes.status === "fulfilled" ? (servicesRes.value.data?.count || 0) : 0,
        earnestMoney: emaRes.status === "fulfilled" ? (emaRes.value.data?.length || emaRes.value.data?.count || 0) : 0,
      });
    } catch {
      // Silently fail - counts are optional
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const quickActions = [
    {
      label: "Listing Requests",
      href: "/staff/listing-requests",
      desc: "ATS review & publish",
      icon: <DescriptionIcon />,
      color: "#1976d2",
      count: counts.listingRequests,
      countLabel: "pending",
    },
    {
      label: "Properties",
      href: "/properties",
      desc: "Lifecycle controls",
      icon: <HomeIcon />,
      color: "#2e7d32",
      count: 0,
    },
    {
      label: "Buyer Inquiries",
      href: "/admin/inquiries",
      desc: "Lead pipeline",
      icon: <PeopleIcon />,
      color: "#ed6c02",
      count: counts.inquiries,
      countLabel: "new",
    },
    {
      label: "Service Requests",
      href: "/staff/services",
      desc: "Appraisal, Titling, Consultancy",
      icon: <BuildIcon />,
      color: "#0288d1",
      count: counts.serviceRequests,
      countLabel: "pending",
    },
    {
      label: "Earnest Money",
      href: "/staff/earnest-money",
      desc: "EMA management",
      icon: <AccountBalanceIcon />,
      color: "#388e3c",
      count: counts.earnestMoney,
      countLabel: "pending",
    },
    {
      label: "Appraisal Reports",
      href: "/staff/appraisal-reports",
      desc: "Report generation",
      icon: <AssessmentIcon />,
      color: "#f57c00",
      count: 0,
    },
    {
      label: "Notifications",
      href: "/notifications",
      desc: "Recent alerts",
      icon: <NotificationsIcon />,
      color: "#d32f2f",
      count: 0,
    },
  ];

  const totalPending = counts.listingRequests + counts.inquiries + counts.serviceRequests + counts.earnestMoney;

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Welcome back, {user?.profile?.fullName?.split(" ")[0] || "Staff"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Here's what's happening with your transactions today.
              </Typography>
            </Box>
            <Paper sx={{ px: 2.5, py: 1.5, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AccessTimeIcon />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Pending Actions
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {totalPending}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Paper>

        {/* Quick Actions */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickActions.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  transition: "all 0.2s ease-in-out",
                  border: "1px solid",
                  borderColor: "grey.200",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                    borderColor: item.color,
                  },
                }}
                elevation={0}
              >
                <CardActionArea
                  onClick={() => navigate(item.href)}
                  sx={{ height: "100%", p: 2 }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Avatar
                        sx={{
                          bgcolor: `${item.color}15`,
                          color: item.color,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      {item.count > 0 && (
                        <Chip
                          label={`${item.count} ${item.countLabel || "new"}`}
                          size="small"
                          sx={{
                            bgcolor: "#ef5350",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 22,
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                              "0%": { opacity: 1 },
                              "50%": { opacity: 0.7 },
                              "100%": { opacity: 1 },
                            },
                          }}
                        />
                      )}
                    </Stack>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: item.color }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Open
                      </Typography>
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Stack>
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
};

export default StaffDashboard;
