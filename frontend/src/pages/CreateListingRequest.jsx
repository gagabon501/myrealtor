import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import client from "../api/client";
import DocumentUploader from "../components/DocumentUploader";
import DocumentList from "../components/DocumentList";
import { MODULES, OWNER_TYPES } from "../constants/documentLibrary";

const CreateListingRequest = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [photoRefresh, setPhotoRefresh] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSuccess(false);
    setLoading(true);
    setSubmitting(true);
    try {
      const payload = {
        propertyDraft: {
          title,
          location,
          price: Number(price),
          description,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      };
      const res = await client.post("/listing-requests", payload);
      setSuccess(true);
      setRequestId(res.data?._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create listing request");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Create Listing Request
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Location"
            required
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextField
            label="Price"
            required
            fullWidth
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || submitting}
          >
            {loading || submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </Stack>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Listing request submitted"
      />
      {requestId && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Photos (max 4)
          </Typography>
          <DocumentUploader
            module={MODULES.PROPERTY_REQUEST}
            ownerType={OWNER_TYPES.PROPERTY_REQUEST}
            ownerId={requestId}
            categories={["PHOTO"]}
            defaultCategory="PHOTO"
            accept="image/*"
            onUploaded={() => setPhotoRefresh((v) => v + 1)}
          />
          <DocumentList
            module={MODULES.PROPERTY_REQUEST}
            ownerId={requestId}
            ownerType={OWNER_TYPES.PROPERTY_REQUEST}
            categories={["PHOTO"]}
            refreshKey={photoRefresh}
          />
        </Box>
      )}
    </Container>
  );
};

export default CreateListingRequest;

