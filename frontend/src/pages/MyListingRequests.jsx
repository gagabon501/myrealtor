import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
  Alert,
  Button,
  CardActions,
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

const MyListingRequests = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase?.() || "public";
  const isClient = role === "user" || role === "client";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [docModal, setDocModal] = useState({ open: false, id: null });
  const [photoModal, setPhotoModal] = useState({ open: false, id: null });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await client.get("/listing-requests/mine");
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

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isClient) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="warning">Not authorized.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
        spacing={2}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          My Listing Requests
        </Typography>
        <Button variant="contained" onClick={() => navigate("/sell/request")}>
          Create Listing Request
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        {requests.length === 0 && (
          <Alert severity="info">No listing requests yet.</Alert>
        )}
        {requests.map((req) => {
          const status = (req.status || "ATS_PENDING").toUpperCase();
          const isAtsNeeded = ["ATS_PENDING", "SUBMITTED"].includes(status);
          const isAtsRejected = status === "ATS_REJECTED";
          const isAtsApproved = status === "ATS_APPROVED";
          const statusLabelMap = {
            ATS_PENDING: "ATS Pending",
            ATS_APPROVED: "ATS Approved",
            ATS_REJECTED: "ATS Rejected",
            SUBMITTED: "ATS Pending",
          };
          const statusLabel = statusLabelMap[status] || status;
          const buttonLabel = isAtsRejected
            ? "Re-upload ATS Document"
            : isAtsApproved
            ? "View ATS Documents"
            : "Upload ATS Document";
          return (
            <Card key={req._id} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                  spacing={1}
                >
                  <Typography variant="h6">{req.propertyDraft?.title || "Untitled"}</Typography>
                  <Chip
                    label={statusLabel}
                    size="small"
                    color={statusColor(req.status)}
                    variant="filled"
                  />
                </Stack>
                {isAtsRejected && (
                  <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    Reason: {req.atsRejectedReason || "Not provided"}
                  </Typography>
                )}
                {isAtsNeeded && (
                  <Alert severity={isAtsRejected ? "error" : "warning"} sx={{ mb: 1.5 }}>
                    {isAtsRejected
                      ? "ATS was rejected. Please upload a corrected ATS document."
                      : "Authority to Sell (ATS) document is required before approval."}
                  </Alert>
                )}
                <Typography variant="body2" color="text.secondary">
                  {req.propertyDraft?.location}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  ₱{Number(req.propertyDraft?.price || 0).toLocaleString()}
                </Typography>
                {req.propertyDraft?.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {req.propertyDraft.description}
                  </Typography>
                )}
                <CardActions sx={{ px: 0, pt: 1 }}>
                  <Button
                    size="small"
                    variant={isAtsApproved ? "text" : "contained"}
                    onClick={() => setDocModal({ open: true, id: req._id })}
                  >
                    {buttonLabel}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setPhotoModal({ open: true, id: req._id })}
                  >
                    Photos
                  </Button>
                </CardActions>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
      <ListingRequestDocumentsDialog
        open={docModal.open}
        listingRequestId={docModal.id}
        onClose={() => setDocModal({ open: false, id: null })}
        mode="client"
        categories={["ATTACHMENT"]}
        defaultCategory="ATTACHMENT"
      />
      <ListingRequestDocumentsDialog
        open={photoModal.open}
        listingRequestId={photoModal.id}
        onClose={() => setPhotoModal({ open: false, id: null })}
        mode="client"
        categories={["PHOTO"]}
        defaultCategory="PHOTO"
      />
    </Container>
  );
};

export default MyListingRequests;

