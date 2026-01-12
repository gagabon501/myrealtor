import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Paper,
  Stack,
  TextField,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role || "").toLowerCase();
  const normalizedRole = role === "client" ? "user" : role;
  const isUser = normalizedRole === "user";
  const [tab, setTab] = useState("buying");
  const [applications, setApplications] = useState([]);
  const [lastLoaded, setLastLoaded] = useState(null);
  const [interests, setInterests] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [titlings, setTitlings] = useState([]);
  const [consultancies, setConsultancies] = useState([]);
  const [listingRequests, setListingRequests] = useState([]);
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

  const stats = useMemo(() => {
    const total = applications.length;
    const inProgress = applications.filter(
      (a) => !["APPROVED", "REJECTED", "WITHDRAWN"].includes(a.status)
    ).length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const reserved = applications.filter((a) => a.status === "RESERVED").length;
    return { total, inProgress, approved, reserved };
  }, [applications]);

  const loadApplications = async () => {
    if (!isUser) return;
    try {
      const res = await client.get("/applications/mine");
      setApplications(res.data);
      if (!selectedAppId && res.data.length) {
        setSelectedAppId(res.data[0]._id);
      }
      setLastLoaded(new Date());
    } catch (err) {
      setError("Failed to load applications");
    }
  };

  const loadInterests = async () => {
    if (!isUser) return;
    try {
      const res = await client.get("/services/brokerage/interest/mine");
      setInterests(res.data?.interests || []);
    } catch {
      /* ignore */
    }
  };

  const loadAppraisals = async () => {
    if (!isUser) return;
    try {
      const res = await client.get("/services/appraisal/mine");
      setAppraisals(res.data?.items || []);
    } catch {
      /* ignore */
    }
  };

  const loadTitlings = async () => {
    if (!isUser) return;
    try {
      const res = await client.get("/services/titling/mine");
      setTitlings(res.data?.items || []);
    } catch {
      /* ignore */
    }
  };

  const loadConsultancies = async () => {
    if (!isUser) return;
    try {
      const res = await client.get("/services/consultancy/mine");
      setConsultancies(res.data?.items || []);
    } catch {
      /* ignore */
    }
  };

  const loadListingRequests = async () => {
    if (!isUser) return;
    try {
      const res = await client.get("/listing-requests/mine");
      setListingRequests(res.data || []);
    } catch {
      /* ignore */
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
    if (!isUser) {
      navigate("/staff", { replace: true });
      return;
    }
    loadApplications();
    loadInterests();
    loadAppraisals();
    loadTitlings();
    loadConsultancies();
    loadListingRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    const onFocus = () => {
      if (isUser) loadApplications();
      if (isUser) loadInterests();
      if (isUser) loadAppraisals();
      if (isUser) loadTitlings();
      if (isUser) loadConsultancies();
      if (isUser) loadListingRequests();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [normalizedRole]);

  useEffect(() => {
    if (selectedAppId) {
      loadDocuments(selectedAppId);
      loadPayments(selectedAppId);
      loadTasks(selectedAppId);
      setDocPayload((prev) => ({ ...prev, applicationId: selectedAppId }));
    }
  }, [selectedAppId]);

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
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Client Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.profile?.fullName || user?.email}. Track buying
          activity and manage your selling requests.
        </Typography>
      </Stack>

      <Paper sx={{ mt: 2, mb: 3 }} variant="outlined">
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab value="buying" label="My Buying" />
          <Tab value="selling" label="My Selling" />
        </Tabs>
      </Paper>

      {tab === "buying" && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total applications
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    In review
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.inProgress}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reserved
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.reserved}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Approved
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.approved}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              onClick={() => setSelectedAppId("")}
              href="/properties"
            >
              Browse properties
            </Button>
            <Button variant="outlined" href="/notifications">
              View notifications
            </Button>
            <Button variant="outlined" onClick={loadApplications}>
              Refresh applications
            </Button>
            {lastLoaded && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ alignSelf: "center" }}
              >
                Last updated: {lastLoaded.toLocaleString()}
              </Typography>
            )}
          </Stack>
        </>
      )}

      {tab === "selling" && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Alert severity="info">
            Submit listing requests, upload ATS documents, and track approvals.
            Publishing remains staff-only.
          </Alert>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="contained" href="/sell/request">
              Create Listing Request
            </Button>
            <Button variant="outlined" href="/sell/requests">
              View My Listing Requests
            </Button>
          </Stack>
          <Typography variant="h6" sx={{ mt: 2 }}>
            My Listing Requests
          </Typography>
          <Stack spacing={1.5}>
            {listingRequests.map((req) => {
              const status = String(req.status || "ATS_PENDING").toUpperCase();
              const title = req.propertyDraft?.title || "Listing Request";
              const loc = req.propertyDraft?.location;
              const price = req.propertyDraft?.price;
              const isPublished = !!req.publishedPropertyId;
              return (
                <Card key={req._id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">{title}</Typography>
                    {loc && (
                      <Typography variant="body2" color="text.secondary">
                        {loc}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        label={status.replace("ATS_", "ATS ").replace("_", " ")}
                        color={
                          status === "ATS_APPROVED"
                            ? "success"
                            : status === "ATS_REJECTED"
                            ? "error"
                            : "default"
                        }
                        size="small"
                      />
                      {isPublished && (
                        <Chip label="Published" size="small" color="primary" />
                      )}
                      {price !== undefined && (
                        <Chip
                          label={`₱${Number(price).toLocaleString()}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      Updated:{" "}
                      {new Date(
                        req.updatedAt || req.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
            {!listingRequests.length && (
              <Typography color="text.secondary">
                No listing requests yet.
              </Typography>
            )}
          </Stack>
        </Stack>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {tab === "buying" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              My Interests (Brokerage)
            </Typography>
            <Stack spacing={1.5}>
              {interests.map((interest) => (
                <Card
                  key={interest._id || interest.propertyId}
                  variant="outlined"
                >
                  <CardContent>
                    <Typography variant="subtitle1">
                      {interest.propertyId?.title || "Property"}
                    </Typography>
                    <Typography color="text.secondary">
                      {interest.propertyId?.location}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        label={interest.status || "NEW"}
                        color={
                          interest.status === "CONTACTED"
                            ? "info"
                            : interest.status === "CLOSED"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                      {interest.propertyId?.price && (
                        <Chip
                          label={`₱${Number(
                            interest.propertyId.price
                          ).toLocaleString()}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      Updated:{" "}
                      {new Date(
                        interest.updatedAt || interest.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              {!interests.length && (
                <Typography color="text.secondary">
                  No interests yet.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                My Service Requests
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Appraisal
              </Typography>
              {appraisals.map((item, idx) => (
                <Card key={`appraisal-${idx}`} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">
                      {item.propertyLocation || "Appraisal request"}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={item.status || "SUBMITTED"} size="small" />
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      Updated:{" "}
                      {new Date(
                        item.updatedAt || item.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              {!appraisals.length && (
                <Typography color="text.secondary">
                  No appraisal requests yet.
                </Typography>
              )}

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Titling / Transfer
              </Typography>
              {titlings.map((item, idx) => (
                <Card key={`titling-${idx}`} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">
                      {item.propertyLocation || "Titling request"}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={item.status || "SUBMITTED"} size="small" />
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      Updated:{" "}
                      {new Date(
                        item.updatedAt || item.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              {!titlings.length && (
                <Typography color="text.secondary">
                  No titling requests yet.
                </Typography>
              )}

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Consultancy
              </Typography>
              {consultancies.map((item, idx) => (
                <Card key={`consultancy-${idx}`} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">
                      {item.topic || "Consultancy request"}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={item.status || "SUBMITTED"} size="small" />
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      Updated:{" "}
                      {new Date(
                        item.updatedAt || item.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              {!consultancies.length && (
                <Typography color="text.secondary">
                  No consultancy requests yet.
                </Typography>
              )}
            </Stack>
          </Grid>

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
                    <Typography color="text.secondary">
                      Status: {app.status}
                    </Typography>
                    {app.activity?.length > 0 && (
                      <Typography color="text.secondary" variant="caption">
                        Last update:{" "}
                        {new Date(
                          app.activity[app.activity.length - 1].at
                        ).toLocaleString()}
                      </Typography>
                    )}
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      href={`/applications/${app._id}/messages`}
                    >
                      Messages
                    </Button>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        label={
                          app.assignedTo
                            ? `Assigned to ${app.assignedTo.email}`
                            : "Unassigned"
                        }
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              {!applications.length && (
                <Typography color="text.secondary">
                  No applications yet.
                </Typography>
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
                  onChange={(e) =>
                    setDocPayload({
                      ...docPayload,
                      applicationId: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setDocPayload({ ...docPayload, type: e.target.value })
                  }
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
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!docPayload.applicationId}
                >
                  Upload
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      )}

      {tab === "buying" && <Divider sx={{ my: 4 }} />}

      {tab === "buying" && (
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
              {!documents.length && (
                <Typography color="text.secondary">
                  No documents yet.
                </Typography>
              )}
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
              {!tasks.length && (
                <Typography color="text.secondary">
                  No compliance tasks yet.
                </Typography>
              )}
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
              {!payments.length && (
                <Typography color="text.secondary">No payments yet.</Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
