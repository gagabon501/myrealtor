import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Google as GoogleIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import client, { apiBase } from "../api/client";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role || "").toLowerCase();
  const normalizedRole = role === "client" ? "user" : role;
  const isUser = normalizedRole === "user";
  const [tab, setTab] = useState("buying");
  const [applications, setApplications] = useState([]);
  const [interests, setInterests] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [titlings, setTitlings] = useState([]);
  const [consultancies, setConsultancies] = useState([]);
  const [listingRequests, setListingRequests] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);

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

  const loadAppointments = async () => {
    if (!isUser) return;
    try {
      const res = await client.get("/appointments/mine");
      setAppointments(res.data || []);
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
    loadAppointments();
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
      if (isUser) loadAppointments();
      if (isUser) loadListingRequests();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [normalizedRole]);

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
              href="/properties"
            >
              Browse properties
            </Button>
            <Button variant="outlined" href="/notifications">
              View notifications
            </Button>
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
              const propertyStatus = req.publishedPropertyId?.status;
              return (
                <Card key={req._id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">{title}</Typography>
                    {loc && (
                      <Typography variant="body2" color="text.secondary">
                        {loc}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
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
                      {isPublished && propertyStatus === "SOLD" ? (
                        <Chip label="SOLD" size="small" color="success" sx={{ fontWeight: 700 }} />
                      ) : isPublished && propertyStatus === "RESERVED" ? (
                        <Chip label="Reserved" size="small" color="warning" />
                      ) : isPublished ? (
                        <Chip label="Published" size="small" color="primary" />
                      ) : null}
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
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
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
                      {interest.propertyId?.status === "SOLD" && (
                        <Chip label="SOLD" size="small" color="success" sx={{ fontWeight: 700 }} />
                      )}
                      {interest.propertyId?.status === "RESERVED" && (
                        <Chip label="Reserved" size="small" color="warning" />
                      )}
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
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={item.status || "SUBMITTED"}
                        size="small"
                        color={
                          item.status === "COMPLETED"
                            ? "success"
                            : item.status === "CANCELLED"
                            ? "error"
                            : item.status === "REPORT_READY"
                            ? "info"
                            : "default"
                        }
                      />
                      {item.reportStatus && (
                        <Chip
                          label={`Report: ${item.reportStatus}`}
                          size="small"
                          color={
                            item.reportStatus === "RELEASED"
                              ? "success"
                              : item.reportStatus === "FINAL"
                              ? "info"
                              : "default"
                          }
                          variant="outlined"
                        />
                      )}
                      {item.rate && (
                        <Chip
                          label={`₱${Number(item.rate).toLocaleString()}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                    {item.appointment && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Appointment:{" "}
                        {new Date(item.appointment).toLocaleDateString()}
                      </Typography>
                    )}
                    {item.pdfUrl && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        href={item.pdfUrl}
                        target="_blank"
                        sx={{ mt: 1 }}
                      >
                        Download Report
                      </Button>
                    )}
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

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                My Appointments
              </Typography>
              {appointments
                .filter((apt) => !["CANCELLED", "CLOSED"].includes(apt.status))
                .slice(0, 5)
                .map((apt) => {
                  const serviceLabels = {
                    APPRAISAL: "Appraisal",
                    TITLING: "Titling",
                    CONSULTANCY: "Consultancy",
                    BROKERAGE_VIEWING: "Viewing",
                  };
                  const statusColors = {
                    REQUESTED: "warning",
                    CONFIRMED: "success",
                    COMPLETED: "info",
                    NO_SHOW: "error",
                  };
                  const displayDate = apt.confirmedStartAt || apt.requestedStartAt;
                  return (
                    <Card key={apt._id} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography variant="subtitle2">
                          {serviceLabels[apt.serviceType] || apt.serviceType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(displayDate).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ mt: 1 }}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Chip
                            label={apt.status}
                            size="small"
                            color={statusColors[apt.status] || "default"}
                          />
                          {apt.status === "CONFIRMED" && (
                            <>
                              <Button
                                size="small"
                                startIcon={<GoogleIcon />}
                                onClick={async () => {
                                  try {
                                    const res = await client.get(
                                      `/appointments/${apt._id}/google-calendar`
                                    );
                                    window.open(res.data.url, "_blank");
                                  } catch {
                                    /* ignore */
                                  }
                                }}
                                sx={{ fontSize: "0.7rem", py: 0.25, px: 1 }}
                              >
                                Google
                              </Button>
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => {
                                  const token = localStorage.getItem("token");
                                  window.open(
                                    `${apiBase}/api/appointments/${apt._id}/ical?token=${token}`,
                                    "_blank"
                                  );
                                }}
                                sx={{ fontSize: "0.7rem", py: 0.25, px: 1 }}
                              >
                                .ics
                              </Button>
                            </>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              {!appointments.filter(
                (apt) => !["CANCELLED", "CLOSED"].includes(apt.status)
              ).length && (
                <Typography color="text.secondary">
                  No upcoming appointments.
                </Typography>
              )}
              <Button
                size="small"
                variant="text"
                href="/services"
                sx={{ mt: 1 }}
              >
                Book an appointment
              </Button>
            </Stack>
          </Grid>

        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
