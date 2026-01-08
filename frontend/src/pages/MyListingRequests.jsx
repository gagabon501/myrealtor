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
          const isAtsNeeded = ["ATS_PENDING", "SUBMITTED"].includes(req.status);
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
                    label={req.status}
                    size="small"
                    color={statusColor(req.status)}
                    variant="filled"
                  />
                </Stack>
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
                    variant="outlined"
                    onClick={() => setDocModal({ open: true, id: req._id })}
                  >
                    Documents
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
      />
    </Container>
  );
};

export default MyListingRequests;

