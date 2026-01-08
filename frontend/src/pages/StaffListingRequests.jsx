import { useEffect, useState } from "react";
import {
  Box,
  Button,
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
  Snackbar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@mui/material";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import ListingRequestDocumentsDialog from "../components/ListingRequestDocumentsDialog";

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
  const { user } = useAuth();
  const role = user?.role?.toLowerCase?.() || "public";
  const isCompany = role === "staff" || role === "admin";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [docModal, setDocModal] = useState({ open: false, id: null });

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
      setSnackbar({ open: true, message: "Approved", severity: "success" });
    } catch (err) {
      setActionError(err.response?.data?.message || "Approval failed");
      setSnackbar({ open: true, message: "Approval failed", severity: "error" });
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
      setSnackbar({ open: true, message: "Rejected", severity: "success" });
    } catch (err) {
      setActionError(err.response?.data?.message || "Rejection failed");
      setSnackbar({ open: true, message: "Rejection failed", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isCompany) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="warning">Not authorized.</Alert>
      </Container>
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
      {requests.length === 0 ? (
        <Alert severity="info">No listing requests found.</Alert>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>ATS</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req._id} hover>
                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{req.createdBy?.email || "N/A"}</TableCell>
                <TableCell>{req.propertyDraft?.title || "Untitled"}</TableCell>
                <TableCell>{req.propertyDraft?.location}</TableCell>
                <TableCell>
                  ₱{Number(req.propertyDraft?.price || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={req.status}
                    color={statusColor(req.status)}
                    size="small"
                    variant="filled"
                  />
                  {req.atsRejectedReason && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {req.atsRejectedReason}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setDocModal({ open: true, id: req._id })}
                  >
                    View ATS
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => {
                        setRejecting(req._id);
                        setReason("");
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleApprove(req._id)}
                    >
                      Approve
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
      <ListingRequestDocumentsDialog
        open={docModal.open}
        listingRequestId={docModal.id}
        onClose={() => setDocModal({ open: false, id: null })}
        mode="company"
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default StaffListingRequests;

