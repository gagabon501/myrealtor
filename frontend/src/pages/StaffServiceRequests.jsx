import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import client from "../api/client";

const statusColors = {
  SUBMITTED: "info",
  IN_REVIEW: "warning",
  APPOINTMENT_SET: "primary",
  IN_PROGRESS: "secondary",
  REPORT_READY: "success",
  COMPLETED: "success",
  CANCELLED: "error",
};

const StaffServiceRequests = () => {
  const [tab, setTab] = useState(0);
  const [appraisals, setAppraisals] = useState([]);
  const [titlings, setTitlings] = useState([]);
  const [consultancies, setConsultancies] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const loadAppraisals = async () => {
    try {
      const res = await client.get("/services/appraisal");
      setAppraisals(res.data || []);
    } catch (err) {
      console.error("Failed to load appraisals:", err);
    }
  };

  const loadTitlings = async () => {
    try {
      const res = await client.get("/services/titling");
      setTitlings(res.data || []);
    } catch (err) {
      console.error("Failed to load titlings:", err);
    }
  };

  const loadConsultancies = async () => {
    try {
      const res = await client.get("/services/consultancy");
      setConsultancies(res.data || []);
    } catch (err) {
      console.error("Failed to load consultancies:", err);
    }
  };

  const loadInterests = async () => {
    try {
      const res = await client.get("/services/brokerage/interest");
      setInterests(res.data || []);
    } catch (err) {
      console.error("Failed to load interests:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadAppraisals(), loadTitlings(), loadConsultancies(), loadInterests()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedItem || !newStatus) return;
    setError(null);
    try {
      const endpoint = selectedItem.type === "interest"
        ? `/services/brokerage/interest/${selectedItem._id}/status`
        : `/services/${selectedItem.type}/${selectedItem._id}/status`;
      await client.patch(endpoint, { status: newStatus });
      setNotice("Status updated successfully");
      setStatusDialogOpen(false);
      setSelectedItem(null);
      setNewStatus("");
      // Reload data
      if (selectedItem.type === "appraisal") loadAppraisals();
      else if (selectedItem.type === "titling") loadTitlings();
      else if (selectedItem.type === "consultancy") loadConsultancies();
      else if (selectedItem.type === "interest") loadInterests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const openStatusDialog = (item, type) => {
    setSelectedItem({ ...item, type });
    setNewStatus(item.status || "");
    setStatusDialogOpen(true);
  };

  const getStatusOptions = (type) => {
    switch (type) {
      case "appraisal":
        return ["SUBMITTED", "IN_REVIEW", "APPOINTMENT_SET", "IN_PROGRESS", "REPORT_READY", "COMPLETED", "CANCELLED"];
      case "titling":
        return ["SUBMITTED", "IN_REVIEW", "APPOINTMENT_SET", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
      case "consultancy":
        return ["SUBMITTED", "APPOINTMENT_SET", "COMPLETED", "CANCELLED"];
      case "interest":
        return ["NEW", "CONTACTED", "CLOSED"];
      default:
        return [];
    }
  };

  const renderRequestCard = (item, type) => (
    <Card key={item._id} variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {item.name || item.propertyId?.title || "Request"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.email}
            </Typography>
            {item.propertyLocation && (
              <Typography variant="body2" color="text.secondary">
                Property: {item.propertyLocation}
              </Typography>
            )}
            {item.propertyId?.location && (
              <Typography variant="body2" color="text.secondary">
                Property: {item.propertyId.title} - {item.propertyId.location}
              </Typography>
            )}
            {item.phone && (
              <Typography variant="body2" color="text.secondary">
                Phone: {item.phone}
              </Typography>
            )}
            {item.topic && (
              <Typography variant="body2" color="text.secondary">
                Topic: {item.topic}
              </Typography>
            )}
            {item.rate && (
              <Typography variant="body2" color="text.secondary">
                Quoted Rate: PHP {item.rate.toLocaleString()}
              </Typography>
            )}
            {item.appointment && (
              <Typography variant="body2" color="text.secondary">
                Requested Date: {item.appointment}
              </Typography>
            )}
          </Box>
          <Stack alignItems="flex-end" spacing={1}>
            <Chip
              label={item.status || "SUBMITTED"}
              color={statusColors[item.status] || "default"}
              size="small"
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => openStatusDialog(item, type)}
            >
              Update Status
            </Button>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Created: {new Date(item.createdAt).toLocaleString()}
        </Typography>
        {item.documents?.length > 0 && (
          <Typography variant="caption" color="text.secondary" display="block">
            Documents: {item.documents.length} file(s)
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading service requests...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Service Requests Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage appraisal, titling, consultancy requests, and buyer interests.
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

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`Appraisals (${appraisals.length})`} />
          <Tab label={`Titling (${titlings.length})`} />
          <Tab label={`Consultancy (${consultancies.length})`} />
          <Tab label={`Buyer Interests (${interests.length})`} />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Appraisal Requests</Typography>
          {appraisals.length === 0 ? (
            <Typography color="text.secondary">No appraisal requests.</Typography>
          ) : (
            appraisals.map((item) => renderRequestCard(item, "appraisal"))
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Titling / Transfer Requests</Typography>
          {titlings.length === 0 ? (
            <Typography color="text.secondary">No titling requests.</Typography>
          ) : (
            titlings.map((item) => renderRequestCard(item, "titling"))
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Consultancy Requests</Typography>
          {consultancies.length === 0 ? (
            <Typography color="text.secondary">No consultancy requests.</Typography>
          ) : (
            consultancies.map((item) => renderRequestCard(item, "consultancy"))
          )}
        </Box>
      )}

      {tab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Buyer Interests</Typography>
          {interests.length === 0 ? (
            <Typography color="text.secondary">No buyer interests.</Typography>
          ) : (
            interests.map((item) => renderRequestCard(item, "interest"))
          )}
        </Box>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {selectedItem && getStatusOptions(selectedItem.type).map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus}>Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffServiceRequests;
