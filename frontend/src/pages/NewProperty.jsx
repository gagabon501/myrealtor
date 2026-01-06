import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
  ImageList,
  ImageListItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const statuses = ["AVAILABLE", "RESERVED", "SOLD"];

const NewProperty = () => {
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    status: "AVAILABLE",
    description: "",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      files.slice(0, 4).forEach((file) => data.append("images", file));
      await client.post("/properties", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Property created");
      setTimeout(() => navigate("/properties"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 6, maxWidth: "900px" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Add New Property
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create a new listing and upload a primary photo. Additional images can be added later via update.
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
            {files.length ? "Change photos (up to 4)" : "Select photos (up to 4)"}
            <input
              type="file"
              accept="image/*"
              hidden
              multiple
              onChange={(e) => {
                const incoming = Array.from(e.target.files || []);
                setFiles(incoming.slice(0, 4));
              }}
            />
          </Button>
          {files.length > 0 && (
            <ImageList cols={4} gap={8} sx={{ width: "100%", maxWidth: 520 }}>
              {files.map((file, idx) => (
                <ImageListItem key={file.name + idx}>
                  <img src={URL.createObjectURL(file)} alt={file.name} loading="lazy" />
                </ImageListItem>
              ))}
            </ImageList>
          )}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Create property"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default NewProperty;

