import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as ConfirmIcon,
  Cancel as CancelIcon,
  Done as CompleteIcon,
  Archive as CloseStatusIcon,
  PersonOff as NoShowIcon,
  Schedule as RescheduleIcon,
  Google as GoogleIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import client, { apiBase } from "../api/client";

const SERVICE_LABELS = {
  APPRAISAL: "Property Appraisal",
  TITLING: "Land Titling / Title Transfer",
  CONSULTANCY: "Real Estate Consultancy",
  BROKERAGE_VIEWING: "Property Viewing",
};

const STATUS_CONFIG = {
  REQUESTED: { color: "warning", label: "Requested", canConfirm: true, canCancel: true },
  CONFIRMED: { color: "success", label: "Confirmed", canCancel: true, canComplete: true, canNoShow: true, canReschedule: true },
  CANCELLED: { color: "error", label: "Cancelled" },
  COMPLETED: { color: "info", label: "Completed", canClose: true },
  NO_SHOW: { color: "secondary", label: "No Show" },
  CLOSED: { color: "default", label: "Closed" },
};

const AppointmentDetailModal = ({
  open,
  onClose,
  appointment,
  onUpdate = () => {},
}) => {
  const [actionMode, setActionMode] = useState(null); // 'confirm', 'cancel', 'reschedule', 'complete', 'close', 'noshow'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form fields for actions
  const [confirmedDateTime, setConfirmedDateTime] = useState(
    appointment ? dayjs(appointment.requestedStartAt) : dayjs()
  );
  const [confirmedEndDateTime, setConfirmedEndDateTime] = useState(
    appointment ? dayjs(appointment.requestedEndAt || appointment.requestedStartAt).add(1, "hour") : dayjs().add(1, "hour")
  );
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleDateTime, setRescheduleDateTime] = useState(
    appointment ? dayjs(appointment.requestedStartAt) : dayjs()
  );
  const [rescheduleEndDateTime, setRescheduleEndDateTime] = useState(
    appointment ? dayjs(appointment.requestedEndAt || appointment.requestedStartAt).add(1, "hour") : dayjs().add(1, "hour")
  );
  const [actionNotes, setActionNotes] = useState("");
  const [showGoogleCalPrompt, setShowGoogleCalPrompt] = useState(false);

  if (!appointment) return null;

  const statusConfig = STATUS_CONFIG[appointment.status] || {};

  const handleAction = async (action) => {
    setError(null);
    setLoading(true);

    try {
      let endpoint = "";
      let payload = {};

      switch (action) {
        case "confirm":
          endpoint = `/appointments/${appointment._id}/confirm`;
          payload = {
            confirmedStartAt: confirmedDateTime.toISOString(),
            confirmedEndAt: confirmedEndDateTime.toISOString(),
            internalNotes: actionNotes || undefined,
          };
          break;

        case "cancel":
          endpoint = `/appointments/${appointment._id}/cancel`;
          payload = { reason: cancelReason };
          break;

        case "reschedule":
          endpoint = `/appointments/${appointment._id}/reschedule`;
          payload = {
            requestedStartAt: rescheduleDateTime.toISOString(),
            requestedEndAt: rescheduleEndDateTime.toISOString(),
          };
          break;

        case "complete":
          endpoint = `/appointments/${appointment._id}/complete`;
          payload = { notes: actionNotes || undefined };
          break;

        case "close":
          endpoint = `/appointments/${appointment._id}/close`;
          payload = { notes: actionNotes || undefined };
          break;

        case "noshow":
          endpoint = `/appointments/${appointment._id}/no-show`;
          payload = { notes: actionNotes || undefined };
          break;

        default:
          return;
      }

      const res = await client.post(endpoint, payload);
      onUpdate(res.data);
      setActionMode(null);
      resetActionFields();
      // Show Google Calendar prompt after confirmation
      if (action === "confirm") {
        setShowGoogleCalPrompt(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} appointment`);
    } finally {
      setLoading(false);
    }
  };

  const resetActionFields = () => {
    setCancelReason("");
    setActionNotes("");
    setConfirmedDateTime(dayjs(appointment.requestedStartAt));
    setConfirmedEndDateTime(dayjs(appointment.requestedEndAt || appointment.requestedStartAt).add(1, "hour"));
    setRescheduleDateTime(dayjs(appointment.requestedStartAt));
    setRescheduleEndDateTime(dayjs(appointment.requestedEndAt || appointment.requestedStartAt).add(1, "hour"));
  };

  const handleClose = () => {
    setActionMode(null);
    setError(null);
    setShowGoogleCalPrompt(false);
    resetActionFields();
    onClose();
  };

  const handleGoogleCalendar = async () => {
    try {
      const res = await client.get(`/appointments/${appointment._id}/google-calendar`);
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error("Failed to get Google Calendar URL:", err);
    }
  };

  const handleDownloadIcal = () => {
    const token = localStorage.getItem("token");
    window.open(`${apiBase}/api/appointments/${appointment._id}/ical?token=${token}`, "_blank");
  };

  const renderActionForm = () => {
    switch (actionMode) {
      case "confirm":
        return (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Confirm Appointment</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Start Date & Time"
                value={confirmedDateTime}
                onChange={(val) => {
                  setConfirmedDateTime(val);
                  // Auto-adjust end time to maintain duration
                  const duration = confirmedEndDateTime.diff(confirmedDateTime, "minute");
                  setConfirmedEndDateTime(val.add(duration > 0 ? duration : 60, "minute"));
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="End Date & Time"
                value={confirmedEndDateTime}
                onChange={setConfirmedEndDateTime}
                minDateTime={confirmedDateTime}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <Typography variant="body2" color="text.secondary">
              Duration: {Math.round(confirmedEndDateTime.diff(confirmedDateTime, "minute"))} minutes
            </Typography>
            <TextField
              fullWidth
              label="Internal Notes (optional)"
              multiline
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleAction("confirm")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : <ConfirmIcon />}
              >
                Confirm
              </Button>
              <Button variant="outlined" onClick={() => setActionMode(null)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        );

      case "cancel":
        return (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Cancel Appointment</Typography>
            <TextField
              fullWidth
              label="Cancellation Reason"
              multiline
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              required
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleAction("cancel")}
                disabled={loading || !cancelReason.trim()}
                startIcon={loading ? <CircularProgress size={18} /> : <CancelIcon />}
              >
                Cancel Appointment
              </Button>
              <Button variant="outlined" onClick={() => setActionMode(null)}>
                Back
              </Button>
            </Stack>
          </Stack>
        );

      case "reschedule":
        return (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Reschedule Appointment</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="New Start Date & Time"
                value={rescheduleDateTime}
                onChange={(val) => {
                  setRescheduleDateTime(val);
                  // Auto-adjust end time to maintain duration
                  const duration = rescheduleEndDateTime.diff(rescheduleDateTime, "minute");
                  setRescheduleEndDateTime(val.add(duration > 0 ? duration : 60, "minute"));
                }}
                minDate={dayjs()}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="New End Date & Time"
                value={rescheduleEndDateTime}
                onChange={setRescheduleEndDateTime}
                minDateTime={rescheduleDateTime}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <Typography variant="body2" color="text.secondary">
              Duration: {Math.round(rescheduleEndDateTime.diff(rescheduleDateTime, "minute"))} minutes
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={() => handleAction("reschedule")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : <RescheduleIcon />}
              >
                Reschedule
              </Button>
              <Button variant="outlined" onClick={() => setActionMode(null)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        );

      case "complete":
        return (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Mark as Completed</Typography>
            <TextField
              fullWidth
              label="Notes (optional)"
              multiline
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Add any notes about the meeting..."
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="info"
                onClick={() => handleAction("complete")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : <CompleteIcon />}
              >
                Mark Completed
              </Button>
              <Button variant="outlined" onClick={() => setActionMode(null)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        );

      case "close":
        return (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Close Appointment</Typography>
            <Typography variant="body2" color="text.secondary">
              This marks the case as fully resolved. This action is final.
            </Typography>
            <TextField
              fullWidth
              label="Closure Notes (optional)"
              multiline
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={() => handleAction("close")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : <CloseStatusIcon />}
              >
                Close Case
              </Button>
              <Button variant="outlined" onClick={() => setActionMode(null)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        );

      case "noshow":
        return (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Mark as No-Show</Typography>
            <TextField
              fullWidth
              label="Notes (optional)"
              multiline
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleAction("noshow")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : <NoShowIcon />}
              >
                Mark No-Show
              </Button>
              <Button variant="outlined" onClick={() => setActionMode(null)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Appointment Details</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Status Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={statusConfig.label || appointment.status}
            color={statusConfig.color}
            size="small"
          />
        </Box>

        {/* Service Type */}
        <Typography variant="h6" gutterBottom>
          {SERVICE_LABELS[appointment.serviceType]}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Client Information */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Client Information
        </Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={12}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2">{appointment.clientName}</Typography>
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2">{appointment.email}</Typography>
            </Stack>
          </Grid>
          {appointment.phone && (
            <Grid size={12}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">{appointment.phone}</Typography>
              </Stack>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Date/Time */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Appointment Time
        </Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={12}>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <EventIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="body2">
                  <strong>Requested:</strong>{" "}
                  {dayjs(appointment.requestedStartAt).format("dddd, MMMM D, YYYY h:mm A")}
                  {appointment.requestedEndAt && (
                    <> - {dayjs(appointment.requestedEndAt).format("h:mm A")}</>
                  )}
                </Typography>
                {appointment.requestedEndAt && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0 }}>
                    Duration: {Math.round(dayjs(appointment.requestedEndAt).diff(dayjs(appointment.requestedStartAt), "minute"))} minutes
                  </Typography>
                )}
                {appointment.confirmedStartAt && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="success.main">
                      <strong>Confirmed:</strong>{" "}
                      {dayjs(appointment.confirmedStartAt).format("dddd, MMMM D, YYYY h:mm A")}
                      {appointment.confirmedEndAt && (
                        <> - {dayjs(appointment.confirmedEndAt).format("h:mm A")}</>
                      )}
                    </Typography>
                    {appointment.confirmedEndAt && (
                      <Typography variant="body2" color="success.light">
                        Duration: {Math.round(dayjs(appointment.confirmedEndAt).diff(dayjs(appointment.confirmedStartAt), "minute"))} minutes
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Notes */}
        {appointment.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Client Notes
            </Typography>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <NotesIcon fontSize="small" color="action" />
              <Typography variant="body2">{appointment.notes}</Typography>
            </Stack>
          </>
        )}

        {/* Internal Notes */}
        {appointment.internalNotes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Internal Notes
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", bgcolor: "grey.50", p: 1, borderRadius: 1 }}>
              {appointment.internalNotes}
            </Typography>
          </>
        )}

        {/* Cancellation Reason */}
        {appointment.status === "CANCELLED" && appointment.cancellationReason && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="error" gutterBottom>
              Cancellation Reason
            </Typography>
            <Typography variant="body2">{appointment.cancellationReason}</Typography>
          </>
        )}

        {/* Action Form */}
        {actionMode && renderActionForm()}

        {/* Google Calendar Prompt - shows after successful confirmation */}
        {showGoogleCalPrompt && (
          <Alert
            severity="success"
            sx={{ mt: 2 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<GoogleIcon />}
                  onClick={() => {
                    handleGoogleCalendar();
                    setShowGoogleCalPrompt(false);
                  }}
                >
                  Add to Google Calendar
                </Button>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setShowGoogleCalPrompt(false)}
                >
                  Skip
                </Button>
              </Stack>
            }
          >
            <Typography variant="body2">
              Appointment confirmed! Would you like to add it to your Google Calendar?
            </Typography>
          </Alert>
        )}

        {/* Action Buttons (when no action mode) */}
        {!actionMode && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Actions
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {statusConfig.canConfirm && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<ConfirmIcon />}
                  onClick={() => setActionMode("confirm")}
                >
                  Confirm
                </Button>
              )}
              {statusConfig.canReschedule && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RescheduleIcon />}
                  onClick={() => setActionMode("reschedule")}
                >
                  Reschedule
                </Button>
              )}
              {statusConfig.canComplete && (
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  startIcon={<CompleteIcon />}
                  onClick={() => setActionMode("complete")}
                >
                  Complete
                </Button>
              )}
              {statusConfig.canClose && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloseStatusIcon />}
                  onClick={() => setActionMode("close")}
                >
                  Close Case
                </Button>
              )}
              {statusConfig.canNoShow && (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<NoShowIcon />}
                  onClick={() => setActionMode("noshow")}
                >
                  No-Show
                </Button>
              )}
              {statusConfig.canCancel && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={() => setActionMode("cancel")}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleCalendar}
          >
            Google Calendar
          </Button>
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadIcal}
          >
            Download .ics
          </Button>
        </Stack>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailModal;
