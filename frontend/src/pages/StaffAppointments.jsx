import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Event as CalendarIcon,
  Schedule as PendingIcon,
  CheckCircle as ConfirmedIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import AppointmentCalendar from "../components/AppointmentCalendar";
import AppointmentDetailModal from "../components/AppointmentDetailModal";
import dayjs from "dayjs";

const StaffAppointments = () => {
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState({
    requested: 0,
    confirmed: 0,
    todayCount: 0,
    weekCount: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = dayjs().startOf("day");
      const endOfWeek = dayjs().endOf("week");

      // Get all appointments for stats
      const res = await client.get("/appointments", {
        params: {
          from: today.toISOString(),
          to: endOfWeek.toISOString(),
        },
      });

      const appointments = res.data;
      const todayStr = today.format("YYYY-MM-DD");

      setStats({
        requested: appointments.filter((a) => a.status === "REQUESTED").length,
        confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
        todayCount: appointments.filter(
          (a) =>
            dayjs(a.confirmedStartAt || a.requestedStartAt).format("YYYY-MM-DD") === todayStr
        ).length,
        weekCount: appointments.length,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
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
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <PendingIcon sx={{ fontSize: 32, color: "warning.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {stats.requested}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
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

          <Grid size={{ xs: 6, sm: 3 }}>
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

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <CalendarIcon sx={{ fontSize: 32, color: "primary.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {stats.weekCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
