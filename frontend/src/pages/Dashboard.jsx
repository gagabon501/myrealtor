import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [docPayload, setDocPayload] = useState({ applicationId: "", type: "" });
  const [file, setFile] = useState(null);

  const loadApplications = async () => {
    try {
      const res = await client.get("/applications/me");
      setApplications(res.data);
    } catch (err) {
      setError("Failed to load applications");
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const submitPayment = async (applicationId) => {
    try {
      await client.post("/payments", { applicationId, amount: 5000 });
      setMessage("Payment recorded");
    } catch (err) {
      setError("Payment failed");
    }
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("applicationId", docPayload.applicationId);
      formData.append("type", docPayload.type);
      formData.append("file", file);
      await client.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Document uploaded");
      setDocPayload({ applicationId: "", type: "" });
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Client Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Welcome, {user?.profile?.fullName || user?.email}
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            My Applications
          </Typography>
          <Stack spacing={2}>
            {applications.map((app) => (
              <Card key={app._id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1">
                    {app.propertyId?.title || "Property"} • {app.stage}
                  </Typography>
                  <Typography color="text.secondary">Status: {app.status}</Typography>
                  <Button sx={{ mt: 1 }} size="small" onClick={() => submitPayment(app._id)}>
                    Pay reservation
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!applications.length && (
              <Typography color="text.secondary">No applications yet.</Typography>
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Upload documents
          </Typography>
          <Box component="form" onSubmit={uploadDocument}>
            <Stack spacing={2}>
              <TextField
                select
                label="Application"
                value={docPayload.applicationId}
                onChange={(e) => setDocPayload({ ...docPayload, applicationId: e.target.value })}
                required
              >
                {applications.map((app) => (
                  <MenuItem key={app._id} value={app._id}>
                    {app.propertyId?.title || app._id}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Document type"
                value={docPayload.type}
                onChange={(e) => setDocPayload({ ...docPayload, type: e.target.value })}
                required
              />
              <Button variant="outlined" component="label">
                Select file
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Button>
              {file && (
                <Typography variant="body2" color="text.secondary">
                  {file.name}
                </Typography>
              )}
              <Button type="submit" variant="contained">
                Upload
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

