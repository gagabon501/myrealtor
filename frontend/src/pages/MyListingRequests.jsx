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
} from "@mui/material";
import client from "../api/client";
import DocumentUploader from "../components/DocumentUploader";
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

const MyListingRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Authority to Sell Documents
                  </Typography>
                  {isAtsNeeded && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Upload at least one signed Authority to Sell (category: ATTACHMENT) to proceed.
                    </Alert>
                  )}
                  {isAtsNeeded && (
                    <DocumentUploader
                      module={MODULES.PROPERTY_REQUEST}
                      ownerType={OWNER_TYPES.PROPERTY_REQUEST}
                      ownerId={req._id}
                      categories={[CATEGORIES.PROPERTY_REQUEST[0]]}
                      onUploaded={load}
                    />
                  )}
                  <DocumentList
                    module={MODULES.PROPERTY_REQUEST}
                    ownerId={req._id}
                    ownerType={OWNER_TYPES.PROPERTY_REQUEST}
                    categories={CATEGORIES.PROPERTY_REQUEST}
                    refreshKey={req._id}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};

export default MyListingRequests;

