import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Event as CalendarIcon,
  Schedule as PendingIcon,
  CheckCircle as ConfirmedIcon,
  Today as TodayIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Assessment as AppraisalIcon,
  Description as TitlingIcon,
  Support as ConsultancyIcon,
  Visibility as ViewingIcon,
  Inbox as InboxIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import AppointmentCalendar from "../components/AppointmentCalendar";
import AppointmentDetailModal from "../components/AppointmentDetailModal";
import dayjs from "dayjs";

const SERVICE_ICONS = {
  APPRAISAL: <AppraisalIcon />,
  TITLING: <TitlingIcon />,
  CONSULTANCY: <ConsultancyIcon />,
  BROKERAGE_VIEWING: <ViewingIcon />,
};

const SERVICE_LABELS = {
  APPRAISAL: "Property Appraisal",
  TITLING: "Land Titling",
  CONSULTANCY: "Consultancy",
  BROKERAGE_VIEWING: "Property Viewing",
};

const StaffAppointments = () => {
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [pendingError, setPendingError] = useState(null);
  const [stats, setStats] = useState({
    requested: 0,
    confirmed: 0,
    todayCount: 0,
    weekCount: 0,
    newServiceRequests: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchPendingRequests();
    fetchServiceRequests();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const today = dayjs().startOf("day");
      const endOfWeek = dayjs().endOf("week");
      const todayStr = today.format("YYYY-MM-DD");

      // Fetch all appointments (no date filter) for pending/confirmed counts
      // and this week's appointments for today/week counts
      const [allRes, weekRes] = await Promise.all([
        client.get("/appointments"),
        client.get("/appointments", {
          params: {
            from: today.toISOString(),
            to: endOfWeek.toISOString(),
          },
        }),
      ]);

      const allAppointments = allRes.data;
      const weekAppointments = weekRes.data;

      setStats({
        // Count ALL pending requests regardless of date
        requested: allAppointments.filter((a) => a.status === "REQUESTED").length,
        // Count confirmed appointments scheduled for this week
        confirmed: weekAppointments.filter((a) => a.status === "CONFIRMED").length,
        // Appointments scheduled for today (confirmed or requested)
        todayCount: weekAppointments.filter(
          (a) =>
            dayjs(a.confirmedStartAt || a.requestedStartAt).format("YYYY-MM-DD") === todayStr &&
            ["REQUESTED", "CONFIRMED"].includes(a.status)
        ).length,
        // All appointments this week (active statuses only)
        weekCount: weekAppointments.filter(
          (a) => ["REQUESTED", "CONFIRMED"].includes(a.status)
        ).length,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchPendingRequests = async () => {
    setLoadingPending(true);
    setPendingError(null);
    try {
      const res = await client.get("/appointments", {
        params: { status: "REQUESTED" },
      });
      // Sort by most recent first
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPendingRequests(sorted);
    } catch (err) {
      console.error("Failed to fetch pending requests:", err);
      setPendingError(err.response?.data?.message || "Failed to load pending requests");
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      // Fetch all three service types in parallel
      const [appraisalRes, titlingRes, consultancyRes] = await Promise.all([
        client.get("/services/appraisal", { params: { status: "SUBMITTED" } }),
        client.get("/services/titling", { params: { status: "SUBMITTED" } }),
        client.get("/services/consultancy", { params: { status: "SUBMITTED" } }),
      ]);

      // Combine and tag each request with its service type
      const appraisals = (appraisalRes.data || []).map((r) => ({
        ...r,
        _serviceType: "APPRAISAL",
      }));
      const titlings = (titlingRes.data || []).map((r) => ({
        ...r,
        _serviceType: "TITLING",
      }));
      const consultancies = (consultancyRes.data || []).map((r) => ({
        ...r,
        _serviceType: "CONSULTANCY",
      }));

      // Combine and sort by most recent first
      const combined = [...appraisals, ...titlings, ...consultancies].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setServiceRequests(combined);
      // Update service requests count in stats
      setStats((prev) => ({ ...prev, newServiceRequests: combined.length }));
    } catch (err) {
      console.error("Failed to fetch service requests:", err);
    }
  };

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleAppointmentUpdate = (updatedAppointment) => {
    setSelectedAppointment(updatedAppointment);
    setRefreshKey((prev) => prev + 1);
    fetchStats();
    fetchPendingRequests();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <CalendarIcon color="primary" />
            <Typography variant="h4">Appointment Management</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            View, confirm, and manage all service appointments
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Card variant="outlined" sx={{ bgcolor: stats.newServiceRequests > 0 ? "primary.50" : undefined }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <InboxIcon sx={{ fontSize: 32, color: "primary.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {stats.newServiceRequests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New Submissions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <PendingIcon sx={{ fontSize: 32, color: "warning.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {stats.requested}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Appts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <ConfirmedIcon sx={{ fontSize: 32, color: "success.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.confirmed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confirmed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <TodayIcon sx={{ fontSize: 32, color: "info.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {stats.todayCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <CalendarIcon sx={{ fontSize: 32, color: "secondary.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {stats.weekCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* New Service Requests Section */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <InboxIcon color="primary" />
                <Typography variant="h6">
                  New Service Requests
                </Typography>
                {serviceRequests.length > 0 && (
                  <Chip
                    label={serviceRequests.length}
                    size="small"
                    color="primary"
                  />
                )}
              </Stack>
              {serviceRequests.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Submitted requests awaiting action
                </Typography>
              )}
            </Stack>

            <Divider />

            {serviceRequests.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <ConfirmedIcon sx={{ fontSize: 48, color: "success.light", mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No new service requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All service requests have been processed
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {serviceRequests.map((request, index) => (
                  <ListItem key={request._id} disablePadding divider={index < serviceRequests.length - 1}>
                    <ListItemButton
                      onClick={() => {
                        // Navigate to the appropriate service management page
                        const routes = {
                          APPRAISAL: `/staff/appraisals/${request._id}`,
                          TITLING: `/staff/titling/${request._id}`,
                          CONSULTANCY: `/staff/consultancy/${request._id}`,
                        };
                        window.location.href = routes[request._serviceType] || "/staff/appointments";
                      }}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon sx={{ color: "primary.main" }}>
                        {SERVICE_ICONS[request._serviceType] || <InboxIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {request.name}
                            </Typography>
                            <Chip
                              label={SERVICE_LABELS[request._serviceType] || request._serviceType}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                            <Chip
                              label="NEW"
                              size="small"
                              color="success"
                            />
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <TimeIcon sx={{ fontSize: 14 }} />
                              <Typography variant="body2" color="text.secondary">
                                Submitted: {dayjs(request.createdAt).format("MMM D, YYYY [at] h:mm A")}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <PersonIcon sx={{ fontSize: 14 }} />
                              <Typography variant="body2" color="text.secondary">
                                {request.email}
                              </Typography>
                            </Stack>
                            {request.propertyLocation && (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <LocationIcon sx={{ fontSize: 14 }} />
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                  {request.propertyLocation}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        }
                      />
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ ml: 2 }}
                      >
                        Review
                      </Button>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        </Paper>

        {/* Pending Appointment Requests Section */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <PendingIcon color="warning" />
                <Typography variant="h6">
                  Pending Appointment Requests
                </Typography>
                {pendingRequests.length > 0 && (
                  <Chip
                    label={pendingRequests.length}
                    size="small"
                    color="warning"
                  />
                )}
              </Stack>
              {pendingRequests.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Click to review and confirm
                </Typography>
              )}
            </Stack>

            <Divider />

            {loadingPending ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Loading pending requests...
                </Typography>
              </Box>
            ) : pendingError ? (
              <Alert severity="error" sx={{ my: 2 }}>
                {pendingError}
              </Alert>
            ) : pendingRequests.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <ConfirmedIcon sx={{ fontSize: 48, color: "success.light", mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No pending appointment requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All appointment requests have been processed
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {pendingRequests.map((appointment, index) => (
                  <ListItem key={appointment._id} disablePadding divider={index < pendingRequests.length - 1}>
                    <ListItemButton
                      onClick={() => handleSelectAppointment(appointment)}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon sx={{ color: "warning.main" }}>
                        {SERVICE_ICONS[appointment.serviceType] || <CalendarIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {appointment.clientName || appointment.email}
                            </Typography>
                            <Chip
                              label={SERVICE_LABELS[appointment.serviceType] || appointment.serviceType}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <TimeIcon sx={{ fontSize: 14 }} />
                              <Typography variant="body2" color="text.secondary">
                                Requested: {dayjs(appointment.requestedStartAt).format("MMM D, YYYY [at] h:mm A")}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <PersonIcon sx={{ fontSize: 14 }} />
                              <Typography variant="body2" color="text.secondary">
                                {appointment.email}
                              </Typography>
                            </Stack>
                          </Stack>
                        }
                      />
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        sx={{ ml: 2 }}
                      >
                        Review
                      </Button>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        </Paper>

        {/* Calendar */}
        <Paper sx={{ p: 3 }}>
          <AppointmentCalendar
            key={refreshKey}
            onSelectAppointment={handleSelectAppointment}
          />
        </Paper>

        {/* Detail Modal */}
        <AppointmentDetailModal
          open={modalOpen}
          onClose={handleCloseModal}
          appointment={selectedAppointment}
          onUpdate={handleAppointmentUpdate}
        />
      </Stack>
    </Container>
  );
};

export default StaffAppointments;
