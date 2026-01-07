import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Chip,
  Snackbar,
} from "@mui/material";
import client from "../api/client";

const PropertyInterest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", notes: "" });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    client
      .get(`/properties/${id}`)
      .then((res) => setProperty(res.data))
      .catch(() => setError("Property not found"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await client.post("/inquiries", {
        propertyId: id,
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
      });
      setNotice("Inquiry submitted. We will reach out shortly.");
      setSuccessOpen(true);
      setTimeout(() => navigate("/properties"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit interest");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        I'm Interested
      </Typography>
      {property && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">{property.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {property.location}
          </Typography>
          {property.price && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              ₱{property.price?.toLocaleString()}
            </Typography>
          )}
          {property.earnestMoneyRequired && (
            <Chip label="Earnest money required" color="warning" size="small" sx={{ mt: 1 }} />
          )}
        </Box>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Address" name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <TextField label="Phone" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Email" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <TextField
            label="Notes"
            name="notes"
            multiline
            minRows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Button type="submit" variant="contained">
            Submit interest
          </Button>
        </Stack>
      </Box>
      <Snackbar
        open={successOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)} sx={{ width: "100%" }}>
          {notice}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PropertyInterest;

