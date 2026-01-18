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
import { listDocuments } from "../api/documentLibraryApi";

const statusColor = (status) => {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "ATS_APPROVED":
      return "success";
    case "ATS_REJECTED":
      return "error";
    case "ATS_PENDING":
    case "SUBMITTED":
      return "warning";
    default:
      return "default";
  }
};

const statusLabel = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "ATS_APPROVED") return "ATS Approved";
  if (s === "ATS_REJECTED") return "ATS Rejected";
  return "ATS Pending";
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
  const [docModal, setDocModal] = useState({ open: false, id: null, readOnly: false });
  const [actionBusyId, setActionBusyId] = useState(null);

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

  const ensureAtsDocExists = async (id) => {
    try {
      const res = await listDocuments({ module: "PROPERTY_REQUEST", ownerId: id });
      const docs = Array.isArray(res.data) ? res.data : res.data?.documents || [];
      if (!docs.length) {
        setSnackbar({
          open: true,
          message: "ATS document is required before approval",
          severity: "error",
        });
        return false;
      }
      return true;
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Could not verify ATS documents",
        severity: "error",
      });
      return false;
    }
  };

  const handleApprove = async (id) => {
    setActionError("");
    try {
      setActionBusyId(id);
      const ok = await ensureAtsDocExists(id);
      if (!ok) {
        setActionBusyId(null);
        return;
      }
      const res = await client.post(`/listing-requests/${id}/approve`);
      setRequests((prev) => prev.map((r) => (r._id === id ? res.data : r)));
      setSnackbar({ open: true, message: "Approved", severity: "success" });
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Approval failed");
      setSnackbar({ open: true, message: "Approval failed", severity: "error" });
    } finally {
      setActionBusyId(null);
    }
  };

  const handlePublish = async (id) => {
    setActionError("");
    try {
      setActionBusyId(id);
      const res = await client.post(`/listing-requests/${id}/publish`);
      setSnackbar({ open: true, message: "Listing published", severity: "success" });
      await load();
      return res.data;
    } catch (err) {
      setActionError(err.response?.data?.message || "Publish failed");
      setSnackbar({ open: true, message: "Publish failed", severity: "error" });
      return null;
    } finally {
      setActionBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setActionError("");
    try {
      setActionBusyId(rejecting);
      const res = await client.post(`/listing-requests/${rejecting}/reject`, { reason });
      setRequests((prev) => prev.map((r) => (r._id === rejecting ? res.data : r)));
      setRejecting(null);
      setReason("");
      setSnackbar({ open: true, message: "Rejected", severity: "success" });
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Rejection failed");
      setSnackbar({ open: true, message: "Rejection failed", severity: "error" });
    } finally {
      setActionBusyId(null);
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
              <TableCell>ATS Status</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>ATS</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => {
              const statusUpper = (req.status || "").toUpperCase();
              const canAct = ["ATS_PENDING", "ATS_REJECTED", "SUBMITTED"].includes(statusUpper);
              return (
              <TableRow key={req._id} hover>
                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {req.seller?.fullName ||
                    (req.createdBy?.firstName
                      ? `${req.createdBy.firstName} ${req.createdBy.lastName || ""}`.trim()
                      : req.createdBy?.email || "N/A")}
                </TableCell>
                <TableCell>{req.propertyDraft?.title || "Untitled"}</TableCell>
                <TableCell>{req.propertyDraft?.location}</TableCell>
                <TableCell>
                  ₱{Number(req.propertyDraft?.price || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusLabel(req.status)}
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
                  {req.publishedPropertyId ? (
                    <Chip label="Published" size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label="Not published" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setDocModal({
                      open: true,
                      id: req._id,
                      readOnly: req.publishedPropertyId?.status === "SOLD",
                    })}
                  >
                    View ATS
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={!canAct || actionBusyId === req._id}
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
                      disabled={!canAct || actionBusyId === req._id}
                      onClick={() => handleApprove(req._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={
                        statusUpper !== "ATS_APPROVED" ||
                        !!req.publishedPropertyId ||
                        actionBusyId === req._id
                      }
                      onClick={() => handlePublish(req._id)}
                    >
                      Publish
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
            })}
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
        onClose={() => setDocModal({ open: false, id: null, readOnly: false })}
        mode="company"
        readOnly={docModal.readOnly}
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

