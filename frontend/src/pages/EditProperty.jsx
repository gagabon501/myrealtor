import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

import DocumentUploader from "../components/DocumentUploader";
import DocumentList from "../components/DocumentList";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ["staff", "admin"].includes(user?.role);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [property, setProperty] = useState(null);

  // form state (adjust to match your fields)
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    status: "AVAILABLE",
    description: "",
  });

  const [docRefreshKey, setDocRefreshKey] = useState(0);

  useEffect(() => {
    if (!canManage) {
      setError("You are not allowed to edit properties.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await client.get(`/properties/${id}`);
        const p = res.data;
        setProperty(p);
        setForm({
          title: p.title || "",
          location: p.location || "",
          price: p.price ?? "",
          status: String(p.status || "AVAILABLE").toUpperCase(),
          description: p.description || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id, canManage]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await client.put(`/properties/${id}`, {
        ...form,
        price: Number(form.price),
      });
      setSuccess("Property updated");
      // optional: navigate back
      // navigate("/properties");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update property");
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading property...</Typography>
      </Container>
    );
  }

  if (error && !property) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          onClick={() => navigate("/properties")}
        >
          Back to Properties
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Edit Property
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
            />
            <TextField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              minRows={3}
            />

            <Button type="submit" variant="contained">
              Save
            </Button>
          </Stack>
        </Box>

        {/* Documents (only once we have a real id) */}
        {property?._id && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <DocumentUploader
              module="PROPERTY"
              ownerType="Property"
              ownerId={property._id}
              defaultCategory="PHOTO"
              onUploaded={() => setDocRefreshKey((k) => k + 1)}
            />
            <DocumentList
              module="PROPERTY"
              ownerId={property._id}
              refreshKey={docRefreshKey}
            />
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default EditProperty;
