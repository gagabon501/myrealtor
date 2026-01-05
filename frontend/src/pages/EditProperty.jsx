import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

const statuses = ["AVAILABLE", "RESERVED", "SOLD"];

const EditProperty = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    status: "AVAILABLE",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get(`/properties/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          title: p.title || "",
          location: p.location || "",
          price: p.price || "",
          status: p.status || "AVAILABLE",
          description: p.description || "",
        });
      })
      .catch(() => setError("Failed to load property"));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (file) data.append("image", file);
      await client.put(`/properties/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Property updated");
      setTimeout(() => navigate("/properties"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 6, maxWidth: "900px" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Edit Property
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

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
            select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description"
            name="description"
            multiline
            minRows={3}
            value={form.description}
            onChange={handleChange}
          />
          <Button variant="outlined" component="label">
            {file ? "Change photo" : "Add another photo"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Button>
          {file && (
            <Typography variant="body2" color="text.secondary">
              {file.name}
            </Typography>
          )}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Update property"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default EditProperty;

