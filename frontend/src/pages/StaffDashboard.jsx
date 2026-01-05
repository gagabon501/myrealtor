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
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const stageOptions = [
  "INITIATED",
  "DOCUMENTS_SUBMITTED",
  "UNDER_REVIEW",
  "PAYMENT_PENDING",
  "APPROVED",
  "REJECTED",
  "TRANSFERRED",
];

const regulatoryOptions = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED_TO_AGENCY",
  "APPROVED",
  "REJECTED",
];

const agencies = ["DHSUD", "LRA", "NHA", "HLURB", "OTHERS"];
const taskStatuses = ["PENDING", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "REJECTED"];

const StaffDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", agency: agencies[0], dueDate: "" });

  const selectedApp = useMemo(
    () => applications.find((app) => app._id === selectedAppId),
    [applications, selectedAppId]
  );

  const loadApplications = async () => {
    try {
      const res = await client.get("/applications");
      setApplications(res.data);
      if (!selectedAppId && res.data.length) {
        setSelectedAppId(res.data[0]._id);
      }
    } catch (err) {
      setError("Failed to load applications");
    }
  };

  const loadTasks = async (appId) => {
    if (!appId) return;
    try {
      const res = await client.get(`/compliance/${appId}`);
      setTasks(res.data);
    } catch (err) {
      setError("Failed to load compliance tasks");
    }
  };

  const loadDocuments = async (appId) => {
    if (!appId) return;
    try {
      const res = await client.get(`/documents/${appId}`);
      setDocuments(res.data);
    } catch (err) {
      setError("Failed to load documents");
    }
  };

  const loadPayments = async (appId) => {
    if (!appId) return;
    try {
      const res = await client.get(`/payments/${appId}`);
      setPayments(res.data);
    } catch (err) {
      setError("Failed to load payments");
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (selectedAppId) {
      loadTasks(selectedAppId);
      loadDocuments(selectedAppId);
      loadPayments(selectedAppId);
    }
  }, [selectedAppId]);

  const updateWorkflow = async (id, payload) => {
    try {
      await client.put(`/applications/${id}/stage`, payload);
      await loadApplications();
      setNotice("Workflow updated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update application");
    }
  };

  const assignToMe = (id) => {
    updateWorkflow(id, { assignedTo: user.id });
  };

  const createComplianceTask = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await client.post("/compliance", { ...newTask, applicationId: selectedAppId });
      setNewTask({ title: "", agency: agencies[0], dueDate: "" });
      await loadTasks(selectedAppId);
      setNotice("Compliance task created");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await client.put(`/compliance/${taskId}`, { status });
      await loadTasks(selectedAppId);
      setNotice("Task updated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  const updateDocumentStatus = async (docId, status) => {
    try {
      await client.put(`/documents/${docId}/status`, { status });
      await loadDocuments(selectedAppId);
      setNotice("Document status updated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update document");
    }
  };

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      await client.put(`/payments/${paymentId}/status`, { status });
      await loadPayments(selectedAppId);
      setNotice("Payment status updated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update payment");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Internal Case Management
      </Typography>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            {applications.map((app) => (
              <Card
                key={app._id}
                variant={app._id === selectedAppId ? "elevation" : "outlined"}
                onClick={() => setSelectedAppId(app._id)}
                sx={{ cursor: "pointer" }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1">
                        {app.propertyId?.title || "Property"} • {app.stage}
                      </Typography>
                      <Typography color="text.secondary">
                        Applicant: {app.userId?.email} | Assigned: {app.assignedTo?.email || "Unassigned"}
                      </Typography>
                    </Box>
                    <Chip label={app.regulatoryStatus} color="info" size="small" />
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
                    <Select
                      size="small"
                      value={app.stage}
                      onChange={(e) => updateWorkflow(app._id, { stage: e.target.value })}
                    >
                      {stageOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      value={app.regulatoryStatus || "NOT_STARTED"}
                      onChange={(e) => updateWorkflow(app._id, { regulatoryStatus: e.target.value })}
                    >
                      {regulatoryOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>

                    <Button size="small" onClick={() => assignToMe(app._id)}>
                      Assign to me
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {!applications.length && <Typography color="text.secondary">No applications yet.</Typography>}
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Compliance Tasks</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Selected application: {selectedApp?.propertyId?.title || selectedAppId || "None"}
              </Typography>
              <Box component="form" onSubmit={createComplianceTask}>
                <Stack spacing={1.5}>
                  <TextField
                    label="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                  <Select
                    value={newTask.agency}
                    onChange={(e) => setNewTask({ ...newTask, agency: e.target.value })}
                  >
                    {agencies.map((agency) => (
                      <MenuItem key={agency} value={agency}>
                        {agency}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    label="Due date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                  <Button type="submit" variant="contained" disabled={!selectedAppId}>
                    Add task
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {tasks.map((task) => (
                  <Card key={task._id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.agency} • {task.status} •{" "}
                        {task.dueDate ? `Due ${dayjs(task.dueDate).format("MMM D")}` : "No due date"}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {taskStatuses.map((status) => (
                          <Button
                            key={status}
                            size="small"
                            variant={task.status === status ? "contained" : "text"}
                            onClick={() => updateTaskStatus(task._id, status)}
                          >
                            {status}
                          </Button>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!tasks.length && <Typography color="text.secondary">No tasks yet.</Typography>}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Payments</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Confirm or reject incoming payments.
              </Typography>
              <Stack spacing={1}>
                {payments.map((pay) => (
                  <Card key={pay._id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2">{pay.reference}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pay.amount} • {pay.status}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button size="small" onClick={() => updatePaymentStatus(pay._id, "SUCCESS")}>
                          Mark paid
                        </Button>
                        <Button size="small" onClick={() => updatePaymentStatus(pay._id, "FAILED")}>
                          Mark failed
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!payments.length && <Typography color="text.secondary">No payments yet.</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Documents</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Review and approve/reject client uploads.
              </Typography>
              <Stack spacing={1}>
                {documents.map((doc) => (
                  <Card key={doc._id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2">{doc.type}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doc.fileName} • {doc.status}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button size="small" onClick={() => updateDocumentStatus(doc._id, "APPROVED")}>
                          Approve
                        </Button>
                        <Button size="small" onClick={() => updateDocumentStatus(doc._id, "REJECTED")}>
                          Reject
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!documents.length && <Typography color="text.secondary">No documents uploaded.</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StaffDashboard;

