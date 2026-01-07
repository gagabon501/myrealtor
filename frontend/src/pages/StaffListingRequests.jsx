import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import client from "../api/client";
import DocumentList from "../components/DocumentList";
import { MODULES, OWNER_TYPES, CATEGORIES } from "../constants/documentLibrary";

const statusColor = (status) => {
  switch (status) {
    case "ATS_APPROVED":
      return "success";
    case "ATS_REJECTED":
      return "error";
    case "ATS_PENDING":
      return "warning";
    default:
      return "default";
  }
};

const StaffListingRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await client.get("/listing-requests");
      setRequests(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load listing requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    setActionError("");
    try {
      const res = await client.post(`/listing-requests/${id}/approve`);
      setRequests((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch (err) {
      setActionError(err.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setActionError("");
    try {
      const res = await client.post(`/listing-requests/${rejecting}/reject`, { reason });
      setRequests((prev) => prev.map((r) => (r._id === rejecting ? res.data : r)));
      setRejecting(null);
      setReason("");
    } catch (err) {
      setActionError(err.response?.data?.message || "Rejection failed");
    }
  };

  const handleEarnestToggle = async (id, value) => {
    setActionError("");
    try {
      const res = await client.patch(`/listing-requests/${id}/earnest`, {
        earnestMoneyRequired: value,
      });
      setRequests((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch (err) {
      setActionError(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Listing Requests (Staff)
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      <Stack spacing={2}>
        {requests.length === 0 && (
          <Alert severity="info">No listing requests found.</Alert>
        )}
        {requests.map((req) => (
          <Card key={req._id} variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
              >
                <Box>
                  <Typography variant="h6">{req.propertyDraft?.title || "Untitled"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {req.propertyDraft?.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    ₱{Number(req.propertyDraft?.price || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Chip
                  label={req.status}
                  color={statusColor(req.status)}
                  size="small"
                  variant="filled"
                />
              </Stack>
              {req.atsRejectedReason && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Rejection reason: {req.atsRejectedReason}
                </Alert>
              )}
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Switch
                    checked={Boolean(req.propertyDraft?.earnestMoneyRequired)}
                    onChange={(e) => handleEarnestToggle(req._id, e.target.checked)}
                  />
                }
                label="Earnest money required"
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  ATS Documents
                </Typography>
                <DocumentList
                  module={MODULES.PROPERTY_REQUEST}
                  ownerId={req._id}
                  ownerType={OWNER_TYPES.PROPERTY_REQUEST}
                  categories={CATEGORIES.PROPERTY_REQUEST}
                  refreshKey={req._id}
                />
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", gap: 1, px: 2, pb: 2 }}>
              <Button
                variant="outlined"
                color="error"
                disabled={req.status === "ATS_REJECTED"}
                onClick={() => {
                  setRejecting(req._id);
                  setReason("");
                }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                disabled={req.status === "ATS_APPROVED"}
                onClick={() => handleApprove(req._id)}
              >
                Approve
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>

      <Dialog open={Boolean(rejecting)} onClose={() => setRejecting(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Listing Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejecting(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffListingRequests;

