import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon,
  Event as EventIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import client from "../api/client";

const SERVICE_LABELS = {
  APPRAISAL: "Appraisal",
  TITLING: "Titling",
  CONSULTANCY: "Consultancy",
  BROKERAGE_VIEWING: "Viewing",
};

const STATUS_COLORS = {
  REQUESTED: { bg: "#fef3c7", text: "#92400e", label: "Requested" },
  CONFIRMED: { bg: "#d1fae5", text: "#065f46", label: "Confirmed" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b", label: "Cancelled" },
  COMPLETED: { bg: "#dbeafe", text: "#1e40af", label: "Completed" },
  NO_SHOW: { bg: "#f3e8ff", text: "#6b21a8", label: "No Show" },
  CLOSED: { bg: "#e5e7eb", text: "#374151", label: "Closed" },
};

const SERVICE_COLORS = {
  APPRAISAL: "#0ea5e9",
  TITLING: "#10b981",
  CONSULTANCY: "#8b5cf6",
  BROKERAGE_VIEWING: "#f59e0b",
};

const AppointmentCalendar = ({ onSelectAppointment = () => {} }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("month"); // month or list

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const startOfMonth = currentDate.startOf("month").toISOString();
      const endOfMonth = currentDate.endOf("month").toISOString();

      const params = {
        from: startOfMonth,
        to: endOfMonth,
      };

      if (serviceFilter) params.serviceType = serviceFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await client.get("/appointments", { params });
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, serviceFilter, statusFilter]);

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const grouped = {};
    appointments.forEach((apt) => {
      const date = dayjs(apt.confirmedStartAt || apt.requestedStartAt).format("YYYY-MM-DD");
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(apt);
    });
    return grouped;
  }, [appointments]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const startOfCalendar = startOfMonth.startOf("week");
    const endOfCalendar = endOfMonth.endOf("week");

    const days = [];
    let day = startOfCalendar;

    while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, "day")) {
      days.push(day);
      day = day.add(1, "day");
    }

    return days;
  }, [currentDate]);

  const goToPreviousMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const goToNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const goToToday = () => setCurrentDate(dayjs());

  const renderCalendarDay = (day) => {
    const dateKey = day.format("YYYY-MM-DD");
    const dayAppointments = appointmentsByDay[dateKey] || [];
    const isCurrentMonth = day.month() === currentDate.month();
    const isToday = day.isSame(dayjs(), "day");

    return (
      <Paper
        key={dateKey}
        elevation={0}
        sx={{
          minHeight: 100,
          p: 0.5,
          bgcolor: isCurrentMonth ? "white" : "grey.50",
          border: "1px solid",
          borderColor: isToday ? "primary.main" : "grey.200",
          opacity: isCurrentMonth ? 1 : 0.6,
          cursor: dayAppointments.length ? "pointer" : "default",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: isToday ? "bold" : "normal",
            color: isToday ? "primary.main" : "text.secondary",
            display: "block",
            mb: 0.5,
          }}
        >
          {day.format("D")}
        </Typography>

        <Stack spacing={0.25}>
          {dayAppointments.slice(0, 3).map((apt) => (
            <Tooltip
              key={apt._id}
              title={`${apt.clientName} - ${SERVICE_LABELS[apt.serviceType]} (${apt.status})`}
              arrow
            >
              <Box
                onClick={() => onSelectAppointment(apt)}
                sx={{
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  bgcolor: STATUS_COLORS[apt.status]?.bg || "#f3f4f6",
                  borderLeft: `3px solid ${SERVICE_COLORS[apt.serviceType] || "#94a3b8"}`,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    color: STATUS_COLORS[apt.status]?.text || "#374151",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dayjs(apt.confirmedStartAt || apt.requestedStartAt).format("h:mm A")} - {apt.clientName.split(" ")[0]}
                </Typography>
              </Box>
            </Tooltip>
          ))}
          {dayAppointments.length > 3 && (
            <Typography
              variant="caption"
              sx={{ fontSize: "0.6rem", color: "text.secondary", pl: 0.5 }}
            >
              +{dayAppointments.length - 3} more
            </Typography>
          )}
        </Stack>
      </Paper>
    );
  };

  const renderListView = () => {
    const sortedAppointments = [...appointments].sort(
      (a, b) =>
        new Date(a.confirmedStartAt || a.requestedStartAt) -
        new Date(b.confirmedStartAt || b.requestedStartAt)
    );

    if (sortedAppointments.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <EventIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
          <Typography color="text.secondary">No appointments found for this month</Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={1}>
        {sortedAppointments.map((apt) => (
          <Card
            key={apt._id}
            variant="outlined"
            sx={{
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main" },
              borderLeft: `4px solid ${SERVICE_COLORS[apt.serviceType] || "#94a3b8"}`,
            }}
            onClick={() => onSelectAppointment(apt)}
          >
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {dayjs(apt.confirmedStartAt || apt.requestedStartAt).format("ddd, MMM D")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(apt.confirmedStartAt || apt.requestedStartAt).format("h:mm A")}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {apt.clientName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {apt.email}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Chip
                    label={SERVICE_LABELS[apt.serviceType]}
                    size="small"
                    sx={{
                      bgcolor: `${SERVICE_COLORS[apt.serviceType]}20`,
                      color: SERVICE_COLORS[apt.serviceType],
                      fontWeight: 500,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }} sx={{ textAlign: "right" }}>
                  <Chip
                    label={STATUS_COLORS[apt.status]?.label || apt.status}
                    size="small"
                    sx={{
                      bgcolor: STATUS_COLORS[apt.status]?.bg,
                      color: STATUS_COLORS[apt.status]?.text,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={goToPreviousMonth} size="small">
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 160, textAlign: "center" }}>
            {currentDate.format("MMMM YYYY")}
          </Typography>
          <IconButton onClick={goToNextMonth} size="small">
            <ChevronRight />
          </IconButton>
          <Button
            startIcon={<TodayIcon />}
            size="small"
            onClick={goToToday}
            sx={{ ml: 1 }}
          >
            Today
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Service</InputLabel>
            <Select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              label="Service"
            >
              <MenuItem value="">All Services</MenuItem>
              {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              {Object.entries(STATUS_COLORS).map(([value, config]) => (
                <MenuItem key={value} value={value}>
                  {config.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant={viewMode === "month" ? "contained" : "outlined"}
            size="small"
            onClick={() => setViewMode("month")}
          >
            Calendar
          </Button>
          <Button
            variant={viewMode === "list" ? "contained" : "outlined"}
            size="small"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </Stack>
      </Stack>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Calendar View */}
      {!loading && viewMode === "month" && (
        <Box>
          {/* Day headers */}
          <Grid container spacing={0.5} sx={{ mb: 0.5 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Grid size={12 / 7} key={day}>
                <Typography
                  variant="caption"
                  fontWeight="medium"
                  color="text.secondary"
                  textAlign="center"
                  display="block"
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar grid */}
          <Grid container spacing={0.5}>
            {calendarDays.map((day) => (
              <Grid size={12 / 7} key={day.format("YYYY-MM-DD")}>
                {renderCalendarDay(day)}
              </Grid>
            ))}
          </Grid>

          {/* Legend */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 2, flexWrap: "wrap", justifyContent: "center" }}
          >
            {Object.entries(SERVICE_COLORS).map(([service, color]) => (
              <Stack direction="row" alignItems="center" spacing={0.5} key={service}>
                <Box sx={{ width: 12, height: 12, bgcolor: color, borderRadius: 0.5 }} />
                <Typography variant="caption">{SERVICE_LABELS[service]}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {/* List View */}
      {!loading && viewMode === "list" && renderListView()}

      {/* Summary */}
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Showing {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} for{" "}
          {currentDate.format("MMMM YYYY")}
        </Typography>
      </Box>
    </Box>
  );
};

export default AppointmentCalendar;
