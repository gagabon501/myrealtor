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
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const CreateListingRequest = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
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
      await client.post("/listing-requests", payload);
      setSuccess(true);
      navigate("/sell/requests");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create listing request");
    } finally {
      setLoading(false);
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
          <FormControlLabel
            control={
              <Checkbox
                checked={earnestMoneyRequired}
                onChange={(e) => setEarnestMoneyRequired(e.target.checked)}
              />
            }
            label="Earnest money required"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </Stack>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Listing request submitted"
      />
    </Container>
  );
};

export default CreateListingRequest;

