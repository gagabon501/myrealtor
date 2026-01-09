import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
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
  const [selectedAppId, setSelectedAppId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [docPayload, setDocPayload] = useState({ applicationId: "", type: "" });
  const [file, setFile] = useState(null);

  const selectedApp = useMemo(
    () => applications.find((app) => app._id === selectedAppId),
    [applications, selectedAppId]
  );

  const loadApplications = async () => {
    if (!user || user.role !== "user") return;
    try {
      const res = await client.get("/applications/mine");
      setApplications(res.data);
      if (!selectedAppId && res.data.length) {
        setSelectedAppId(res.data[0]._id);
      }
    } catch (err) {
      setError("Failed to load applications");
    }
  };

  const loadDocuments = async (applicationId) => {
    if (!applicationId) return;
    try {
      const res = await client.get(`/documents/${applicationId}`);
      setDocuments(res.data);
    } catch (err) {
      setError("Failed to load documents");
    }
  };

  const loadPayments = async (applicationId) => {
    if (!applicationId) return;
    try {
      const res = await client.get(`/payments/${applicationId}`);
      setPayments(res.data);
    } catch (err) {
      setError("Failed to load payments");
    }
  };

  const loadTasks = async (applicationId) => {
    if (!applicationId) return;
    try {
      const res = await client.get(`/compliance/${applicationId}`);
      setTasks(res.data);
    } catch (err) {
      setError("Failed to load compliance tasks");
    }
  };

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (selectedAppId) {
      loadDocuments(selectedAppId);
      loadPayments(selectedAppId);
      loadTasks(selectedAppId);
      setDocPayload((prev) => ({ ...prev, applicationId: selectedAppId }));
    }
  }, [selectedAppId]);

  const submitPayment = async (applicationId) => {
    try {
      await client.post("/payments", { applicationId, amount: 5000, gateway: "mock" });
      setMessage("Payment recorded");
      await loadPayments(applicationId);
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
      setDocPayload({ applicationId: selectedAppId, type: "" });
      setFile(null);
      await loadDocuments(selectedAppId);
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
              <Card
                key={app._id}
                variant={app._id === selectedAppId ? "elevation" : "outlined"}
                onClick={() => setSelectedAppId(app._id)}
                sx={{ cursor: "pointer" }}
              >
                <CardContent>
                  <Typography variant="subtitle1">
                    {app.propertyId?.title || "Property"}
                  </Typography>
                  <Typography color="text.secondary">Status: {app.status}</Typography>
                  {app.activity?.length > 0 && (
                    <Typography color="text.secondary" variant="caption">
                      Last update: {new Date(app.activity[app.activity.length - 1].at).toLocaleString()}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" onClick={() => submitPayment(app._id)}>
                      Pay reservation
                    </Button>
                    <Chip label={app.assignedTo ? `Assigned to ${app.assignedTo.email}` : "Unassigned"} />
                  </Stack>
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
              <Button type="submit" variant="contained" disabled={!docPayload.applicationId}>
                Upload
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Documents
          </Typography>
          <Stack spacing={1.5}>
            {documents.map((doc) => (
              <Card key={doc._id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">{doc.type}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doc.fileName} • {doc.status}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            {!documents.length && <Typography color="text.secondary">No documents yet.</Typography>}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Compliance tasks
          </Typography>
          <Stack spacing={1.5}>
            {tasks.map((task) => (
              <Card key={task._id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.agency} • {task.status}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            {!tasks.length && <Typography color="text.secondary">No compliance tasks yet.</Typography>}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Payments
          </Typography>
          <Stack spacing={1.5}>
            {payments.map((pay) => (
              <Card key={pay._id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">{pay.reference}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pay.amount} • {pay.status}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            {!payments.length && <Typography color="text.secondary">No payments yet.</Typography>}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

