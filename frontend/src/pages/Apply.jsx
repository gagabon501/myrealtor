import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const Apply = () => {
  const { user } = useAuth();
  const role = user?.role ? String(user.role).toLowerCase() : "public";
  const isCompany = role === "staff" || role === "admin";
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ propertyId: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const selectedProperty = useMemo(
    () => properties.find((p) => p._id === form.propertyId),
    [properties, form.propertyId]
  );

  useEffect(() => {
    const endpoint = isCompany ? "/properties/admin" : "/properties";
    client
      .get(endpoint)
      .then((res) => {
        const allowed = ["PUBLISHED", "RESERVED"];
        const filtered = res.data.filter((p) =>
          allowed.includes(String(p.status || "").toUpperCase())
        );
        setProperties(filtered);
      })
      .catch(() => setError("Failed to load properties"));
  }, [isCompany]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCompany) {
      setError("You are not allowed to apply with this account.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await client.post("/applications", { propertyId: form.propertyId, notes: form.notes });
      setSuccess("Application submitted. Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === "Application already exists") {
        setError("You already applied for this property.");
      } else if (err.response?.status === 403) {
        setError("You are not allowed to apply with this account.");
      } else {
        setError(msg || "Could not submit application");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 6, maxWidth: "800px" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Apply for Property Licensing
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select a property and submit your intent to proceed. You can upload supporting documents and track
        compliance steps in your dashboard afterward.
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

      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          select
          label="Choose property"
          name="propertyId"
          value={form.propertyId}
          onChange={handleChange}
          required
        >
          {properties.map((prop) => (
            <MenuItem key={prop._id} value={prop._id}>
              {prop.title} — {prop.location} — ₱{prop.price?.toLocaleString()}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Notes (optional)"
          name="notes"
          multiline
          minRows={3}
          value={form.notes}
          onChange={handleChange}
        />

        <Button type="submit" variant="contained" disabled={loading || !form.propertyId}>
          {loading ? "Submitting..." : "Submit application"}
        </Button>
      </Stack>

      {selectedProperty && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">{selectedProperty.title}</Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {selectedProperty.location}
            </Typography>
            <Typography sx={{ mb: 1 }}>₱{selectedProperty.price?.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedProperty.description || "No description provided."}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Apply;

