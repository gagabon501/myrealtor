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
  ImageList,
  ImageListItem,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { apiBase } from "../api/client";

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
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
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
        setExistingImages(p.images || []);
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
      files.slice(0, 4).forEach((file) => data.append("images", file));
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
          {existingImages.length > 0 && (
            <>
              <Typography variant="subtitle2" color="text.secondary">
                Existing photos
              </Typography>
              <ImageList cols={4} gap={8} sx={{ width: "100%", maxWidth: 520 }}>
                {existingImages.map((img, idx) => {
                  const full = img.startsWith("http") ? img : `${apiBase}${img.startsWith("/") ? "" : "/"}${img}`;
                  return (
                    <ImageListItem key={img + idx}>
                      <img src={full} alt={`existing-${idx}`} loading="lazy" />
                    </ImageListItem>
                  );
                })}
              </ImageList>
            </>
          )}
          <Button variant="outlined" component="label">
            {files.length ? "Change photos (adds up to 4)" : "Add photos (up to 4 total)"}
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
            {loading ? "Saving..." : "Update property"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default EditProperty;

