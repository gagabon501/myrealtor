import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const initialAppraisal = {
  name: "",
  address: "",
  email: "",
  phone: "",
  propertyLocation: "",
  size: "",
  includesBuilding: false,
  numberOfFloors: 0,
  timeOfBuild: "",
  lastRepair: "",
  appointment: "",
  documents: [],
};

const initialTitling = {
  name: "",
  address: "",
  email: "",
  phone: "",
  propertyLocation: "",
  appointment: "",
  documents: [],
};

const initialConsultancy = {
  name: "",
  email: "",
  phone: "",
  topic: "",
  appointment: "",
};

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [appraisal, setAppraisal] = useState(initialAppraisal);
  const [titling, setTitling] = useState(initialTitling);
  const [consultancy, setConsultancy] = useState(initialConsultancy);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAppraisalSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: "/services" } });
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(appraisal).forEach(([k, v]) => {
        if (k !== "documents") data.append(k, v);
      });
      appraisal.documents.forEach((file) => data.append("documents", file));
      const res = await client.post("/services/appraisal", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotice(
        `Appraisal request submitted successfully! Estimated rate: PHP ${res.data.rate?.toLocaleString() || "TBD"} (50% upfront required).`
      );
      setAppraisal(initialAppraisal);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit appraisal request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTitlingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: "/services" } });
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(titling).forEach(([k, v]) => {
        if (k !== "documents") data.append(k, v);
      });
      titling.documents.forEach((file) => data.append("documents", file));
      await client.post("/services/titling", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotice("Titling/transfer request submitted successfully! We will contact you shortly.");
      setTitling(initialTitling);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit titling request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConsultancySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: "/services" } });
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await client.post("/services/consultancy", consultancy);
      setNotice("Consultancy appointment requested successfully! We will contact you to confirm.");
      setConsultancy(initialConsultancy);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit consultancy request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Our Services
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Goshen Realty ABCD offers comprehensive real estate services. Submit your request below.
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

      {!user && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please <Button size="small" onClick={() => navigate("/login")}>log in</Button> to submit service requests.
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Property Appraisal" />
          <Tab label="Land Titling / Transfer" />
          <Tab label="Consultancy" />
        </Tabs>
      </Paper>

      {/* Appraisal Tab */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Property Appraisal Request
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Request a professional property appraisal. Base rate is PHP 10,000 for land only,
              plus PHP 10,000 for buildings and PHP 5,000 per additional floor.
            </Typography>
            <Box component="form" onSubmit={handleAppraisalSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={appraisal.name}
                    onChange={(e) => setAppraisal({ ...appraisal, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={appraisal.email}
                    onChange={(e) => setAppraisal({ ...appraisal, email: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={appraisal.phone}
                    onChange={(e) => setAppraisal({ ...appraisal, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={appraisal.address}
                    onChange={(e) => setAppraisal({ ...appraisal, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Location"
                    value={appraisal.propertyLocation}
                    onChange={(e) => setAppraisal({ ...appraisal, propertyLocation: e.target.value })}
                    required
                    helperText="Complete address of the property to be appraised"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lot Area (sqm)"
                    value={appraisal.size}
                    onChange={(e) => setAppraisal({ ...appraisal, size: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={appraisal.includesBuilding}
                        onChange={(e) => setAppraisal({ ...appraisal, includesBuilding: e.target.checked })}
                      />
                    }
                    label="Includes Building/Structure"
                  />
                </Grid>
                {appraisal.includesBuilding && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Number of Floors"
                        type="number"
                        value={appraisal.numberOfFloors}
                        onChange={(e) => setAppraisal({ ...appraisal, numberOfFloors: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Year Built"
                        value={appraisal.timeOfBuild}
                        onChange={(e) => setAppraisal({ ...appraisal, timeOfBuild: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Last Major Renovation"
                        value={appraisal.lastRepair}
                        onChange={(e) => setAppraisal({ ...appraisal, lastRepair: e.target.value })}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Appointment Date"
                    type="date"
                    value={appraisal.appointment}
                    onChange={(e) => setAppraisal({ ...appraisal, appointment: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label">
                    Upload Documents (Title, Tax Dec, Photos)
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={(e) => setAppraisal({ ...appraisal, documents: Array.from(e.target.files) })}
                    />
                  </Button>
                  {appraisal.documents.length > 0 && (
                    <Typography variant="caption" sx={{ ml: 2 }}>
                      {appraisal.documents.length} file(s) selected
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || !user}
                    size="large"
                  >
                    {submitting ? "Submitting..." : "Submit Appraisal Request"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Titling Tab */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Land Titling / Title Transfer Request
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Request assistance with land titling, title transfer, or other property documentation services.
              You can upload multiple documents with your request.
            </Typography>
            <Box component="form" onSubmit={handleTitlingSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={titling.name}
                    onChange={(e) => setTitling({ ...titling, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={titling.email}
                    onChange={(e) => setTitling({ ...titling, email: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={titling.phone}
                    onChange={(e) => setTitling({ ...titling, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={titling.address}
                    onChange={(e) => setTitling({ ...titling, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Location"
                    value={titling.propertyLocation}
                    onChange={(e) => setTitling({ ...titling, propertyLocation: e.target.value })}
                    required
                    helperText="Complete address of the property"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Appointment Date"
                    type="date"
                    value={titling.appointment}
                    onChange={(e) => setTitling({ ...titling, appointment: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label">
                    Upload Documents (any number)
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={(e) => setTitling({ ...titling, documents: Array.from(e.target.files) })}
                    />
                  </Button>
                  {titling.documents.length > 0 && (
                    <Typography variant="caption" sx={{ ml: 2 }}>
                      {titling.documents.length} file(s) selected
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || !user}
                    size="large"
                  >
                    {submitting ? "Submitting..." : "Submit Titling Request"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Consultancy Tab */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Real Estate Consultancy
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Book a consultation with our real estate experts. We offer advice on property investment,
              legal matters, and more.
            </Typography>
            <Box component="form" onSubmit={handleConsultancySubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={consultancy.name}
                    onChange={(e) => setConsultancy({ ...consultancy, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={consultancy.email}
                    onChange={(e) => setConsultancy({ ...consultancy, email: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={consultancy.phone}
                    onChange={(e) => setConsultancy({ ...consultancy, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Appointment Date"
                    type="date"
                    value={consultancy.appointment}
                    onChange={(e) => setConsultancy({ ...consultancy, appointment: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Consultation Topic"
                    value={consultancy.topic}
                    onChange={(e) => setConsultancy({ ...consultancy, topic: e.target.value })}
                    helperText="Briefly describe what you'd like to discuss"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || !user}
                    size="large"
                  >
                    {submitting ? "Submitting..." : "Request Consultation"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Property Appraisal</Typography>
              <Typography variant="body2" color="text.secondary">
                Professional property valuation for buying, selling, loans, or legal purposes.
                Our licensed appraisers provide accurate market valuations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Land Titling</Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive assistance with land titling, title transfers, and property documentation.
                We handle the paperwork so you don't have to.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Consultancy</Typography>
              <Typography variant="body2" color="text.secondary">
                Expert advice on property investment, legal considerations, and real estate strategies.
                Book a consultation with our team.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Services;
