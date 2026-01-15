import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Event as CalendarIcon,
  Schedule as TimeIcon,
  CheckCircle as SuccessIcon,
  Google as GoogleIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import client, { apiBase } from "../api/client";
import { useAuth } from "../context/AuthContext";

const SERVICE_LABELS = {
  APPRAISAL: "Property Appraisal",
  TITLING: "Land Titling / Title Transfer",
  CONSULTANCY: "Real Estate Consultancy",
  BROKERAGE_VIEWING: "Property Viewing",
};

const TIME_SLOTS = [
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
];

const AppointmentBookingWidget = ({
  serviceType,
  serviceRequestId = null,
  onBooked = () => {},
  minDate = dayjs(),
  maxDate = dayjs().add(60, "day"),
  title = "Book an Appointment",
  showServiceSelect = false,
}) => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState(serviceType || "");
  const [clientName, setClientName] = useState(user?.profile?.fullName || user?.email?.split("@")[0] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.profile?.phone || "");
  const [notes, setNotes] = useState("");

  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Pre-fill from user profile when user changes
  useEffect(() => {
    if (user) {
      if (!clientName) setClientName(user.profile?.fullName || user.email?.split("@")[0] || "");
      if (!email) setEmail(user.email || "");
      if (!phone) setPhone(user.profile?.phone || "");
    }
  }, [user]);

  // Fetch availability when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const params = { date: dateStr };
        if (selectedService) params.serviceType = selectedService;

        const res = await client.get("/appointments/availability", { params });
        setBookedSlots(res.data.bookedSlots || []);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, selectedService]);

  const isTimeSlotBooked = (timeValue) => {
    if (!selectedDate || !bookedSlots.length) return false;

    const slotDateTime = selectedDate.hour(parseInt(timeValue.split(":")[0])).minute(0);

    return bookedSlots.some((slot) => {
      const slotStart = dayjs(slot.start);
      const slotEnd = slot.end ? dayjs(slot.end) : slotStart.add(1, "hour");
      return slotDateTime.isSame(slotStart, "hour") ||
        (slotDateTime.isAfter(slotStart) && slotDateTime.isBefore(slotEnd));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time");
      return;
    }

    if (!clientName || !email) {
      setError("Name and email are required");
      return;
    }

    const finalServiceType = selectedService || serviceType;
    if (!finalServiceType) {
      setError("Please select a service type");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const requestedStartAt = selectedDate
        .hour(parseInt(selectedTime.split(":")[0]))
        .minute(parseInt(selectedTime.split(":")[1] || 0))
        .second(0)
        .toISOString();

      const requestedEndAt = dayjs(requestedStartAt).add(1, "hour").toISOString();

      const payload = {
        serviceType: finalServiceType,
        serviceRequestId,
        clientName,
        email,
        phone,
        requestedStartAt,
        requestedEndAt,
        notes,
      };

      const res = await client.post("/appointments", payload);

      setBookedAppointment(res.data);
      setSuccess("Appointment request submitted successfully! We will confirm your appointment shortly.");
      onBooked(res.data);

      // Reset form
      setSelectedDate(null);
      setSelectedTime("");
      setNotes("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCalendar = async () => {
    if (!bookedAppointment?._id) return;
    try {
      const res = await client.get(`/appointments/${bookedAppointment._id}/google-calendar`);
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error("Failed to get Google Calendar URL:", err);
    }
  };

  const handleDownloadIcal = () => {
    if (!bookedAppointment?._id) return;
    const token = localStorage.getItem("token");
    window.open(`${apiBase}/api/appointments/${bookedAppointment._id}/ical?token=${token}`, "_blank");
  };

  // Show success state with calendar options
  if (success && bookedAppointment) {
    return (
      <Card variant="outlined" sx={{ borderColor: "success.main" }}>
        <CardContent>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <SuccessIcon sx={{ fontSize: 48, color: "success.main" }} />
            <Typography variant="h6" color="success.main">
              Appointment Requested!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {success}
            </Typography>

            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, width: "100%" }}>
              <Typography variant="body2">
                <strong>Service:</strong> {SERVICE_LABELS[bookedAppointment.serviceType]}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {dayjs(bookedAppointment.requestedStartAt).format("dddd, MMMM D, YYYY")}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {dayjs(bookedAppointment.requestedStartAt).format("h:mm A")}
              </Typography>
              <Chip
                label="Awaiting Confirmation"
                color="warning"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              Add to your calendar:
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleCalendar}
                size="small"
              >
                Google Calendar
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadIcal}
                size="small"
              >
                Download .ics
              </Button>
            </Stack>

            <Button
              variant="text"
              onClick={() => {
                setSuccess(null);
                setBookedAppointment(null);
              }}
              size="small"
            >
              Book Another Appointment
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarIcon color="primary" />
            <Typography variant="h6">{title}</Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Service Type (if showServiceSelect) */}
              {showServiceSelect && (
                <Grid size={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Service Type</InputLabel>
                    <Select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      label="Service Type"
                    >
                      {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Date Picker */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newValue) => {
                      setSelectedDate(newValue);
                      setSelectedTime("");
                    }}
                    minDate={minDate}
                    maxDate={maxDate}
                    shouldDisableDate={(date) => date.day() === 0} // Disable Sundays
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Time Slot */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required disabled={!selectedDate}>
                  <InputLabel>Select Time</InputLabel>
                  <Select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    label="Select Time"
                    startAdornment={loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  >
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = isTimeSlotBooked(slot.value);
                      return (
                        <MenuItem
                          key={slot.value}
                          value={slot.value}
                          disabled={isBooked}
                        >
                          {slot.label} {isBooked && "(Booked)"}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {selectedDate && (
                    <FormHelperText>
                      {loading ? "Checking availability..." : "Available time slots for selected date"}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Client Info */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Notes (optional)"
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requests or information..."
                />
              </Grid>

              <Grid size={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting || !selectedDate || !selectedTime}
                  startIcon={submitting ? <CircularProgress size={20} /> : <TimeIcon />}
                >
                  {submitting ? "Booking..." : "Request Appointment"}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            After submitting, our team will confirm your appointment and send you a confirmation email.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AppointmentBookingWidget;
