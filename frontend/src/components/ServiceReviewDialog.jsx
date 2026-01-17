import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Description as DocumentIcon,
  Assessment as AppraisalIcon,
  Gavel as TitlingIcon,
  Support as ConsultancyIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import client, { apiBase } from "../api/client";
import dayjs from "dayjs";

const SERVICE_CONFIG = {
  APPRAISAL: {
    icon: <AppraisalIcon />,
    label: "Property Appraisal",
    color: "#0ea5e9",
    statuses: ["SUBMITTED", "IN_REVIEW", "APPOINTMENT_SET", "IN_PROGRESS", "REPORT_READY", "COMPLETED", "CANCELLED"],
    endpoint: "appraisal",
  },
  TITLING: {
    icon: <TitlingIcon />,
    label: "Land Titling / Transfer",
    color: "#10b981",
    statuses: ["SUBMITTED", "IN_REVIEW", "APPOINTMENT_SET", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    endpoint: "titling",
  },
  CONSULTANCY: {
    icon: <ConsultancyIcon />,
    label: "Real Estate Consultancy",
    color: "#8b5cf6",
    statuses: ["SUBMITTED", "APPOINTMENT_SET", "COMPLETED", "CANCELLED"],
    endpoint: "consultancy",
  },
};

const STATUS_COLORS = {
  SUBMITTED: "info",
  IN_REVIEW: "warning",
  APPOINTMENT_SET: "primary",
  IN_PROGRESS: "secondary",
  REPORT_READY: "success",
  COMPLETED: "success",
  CANCELLED: "error",
};

const ServiceReviewDialog = ({ open, onClose, serviceRequest, onUpdate }) => {
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!serviceRequest) return null;

  const serviceType = serviceRequest._serviceType;
  const config = SERVICE_CONFIG[serviceType] || SERVICE_CONFIG.APPRAISAL;

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === serviceRequest.status) return;

    setUpdating(true);
    setError(null);
    try {
      await client.patch(`/services/${config.endpoint}/${serviceRequest._id}/status`, {
        status: newStatus,
      });
      setSuccess("Status updated successfully");
      // Notify parent to refresh data
      if (onUpdate) {
        onUpdate({ ...serviceRequest, status: newStatus });
      }
      // Close after a short delay
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    setNewStatus("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ color: config.color }}>{config.icon}</Box>
          <Typography variant="h6">{config.label} Request</Typography>
        </Stack>
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Status */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.secondary">
              Current Status
            </Typography>
            <Chip
              label={serviceRequest.status || "SUBMITTED"}
              color={STATUS_COLORS[serviceRequest.status] || "default"}
            />
          </Stack>

          <Divider />

          {/* Client Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Client Information
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body1">{serviceRequest.name}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{serviceRequest.email}</Typography>
              </Stack>
              {serviceRequest.phone && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{serviceRequest.phone}</Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Service Details */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Service Details
            </Typography>
            <Stack spacing={1.5}>
              {serviceRequest.propertyLocation && (
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <LocationIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Property Location
                    </Typography>
                    <Typography variant="body1">{serviceRequest.propertyLocation}</Typography>
                  </Box>
                </Stack>
              )}

              {serviceRequest.topic && (
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <DocumentIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Consultation Topic
                    </Typography>
                    <Typography variant="body1">{serviceRequest.topic}</Typography>
                  </Box>
                </Stack>
              )}

              {serviceRequest.rate && (
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <DocumentIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Quoted Rate
                    </Typography>
                    <Typography variant="body1">PHP {serviceRequest.rate.toLocaleString()}</Typography>
                  </Box>
                </Stack>
              )}

              {serviceRequest.appointment && (
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <CalendarIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Requested Appointment
                    </Typography>
                    <Typography variant="body1">{serviceRequest.appointment}</Typography>
                  </Box>
                </Stack>
              )}

              {serviceRequest.details && (
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <DocumentIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Additional Details
                    </Typography>
                    <Typography variant="body1">{serviceRequest.details}</Typography>
                  </Box>
                </Stack>
              )}

              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <CalendarIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Submitted
                  </Typography>
                  <Typography variant="body1">
                    {dayjs(serviceRequest.createdAt).format("MMMM D, YYYY [at] h:mm A")}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* Documents */}
          {serviceRequest.documents && serviceRequest.documents.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Uploaded Documents ({serviceRequest.documents.length})
                </Typography>
                <Stack spacing={1}>
                  {serviceRequest.documents.map((doc, index) => {
                    // Documents can be objects { title, path } or strings
                    const docPath = typeof doc === "string" ? doc : doc.path;
                    const docTitle = typeof doc === "string" ? doc.split("/").pop() : doc.title;
                    return (
                      <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          p: 1.5,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                        }}
                      >
                        <AttachFileIcon fontSize="small" color="action" />
                        <Link
                          href={`${apiBase}${docPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ flex: 1 }}
                        >
                          {docTitle}
                        </Link>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            </>
          )}

          <Divider />

          {/* Update Status */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Update Status
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus || serviceRequest.status || "SUBMITTED"}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={updating}
              >
                {config.statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={status}
                        size="small"
                        color={STATUS_COLORS[status] || "default"}
                        sx={{ minWidth: 100 }}
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={updating}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleUpdateStatus}
          disabled={updating || !newStatus || newStatus === serviceRequest.status}
          startIcon={updating && <CircularProgress size={16} color="inherit" />}
        >
          {updating ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceReviewDialog;
