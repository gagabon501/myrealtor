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
  Chip,
  alpha,
} from "@mui/material";
import {
  Assessment as AppraisalIcon,
  Description as TitlingIcon,
  Support as ConsultancyIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Business as BuildingIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
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

const serviceFeatures = [
  {
    icon: <AppraisalIcon />,
    title: "Property Appraisal",
    description: "Professional market valuation by licensed appraisers",
    color: "#0ea5e9",
    highlights: ["Accurate valuations", "Licensed professionals", "Detailed reports"],
  },
  {
    icon: <TitlingIcon />,
    title: "Land Titling",
    description: "Complete documentation and title transfer services",
    color: "#10b981",
    highlights: ["Title transfers", "Documentation", "Legal compliance"],
  },
  {
    icon: <ConsultancyIcon />,
    title: "Consultancy",
    description: "Expert advice on property investment and strategies",
    color: "#8b5cf6",
    highlights: ["Investment advice", "Legal guidance", "Market insights"],
  },
];

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

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "background.paper",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderWidth: 2,
      },
    },
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
          color: "white",
          py: { xs: 6, md: 10 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorations */}
        <Box
          sx={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)",
            top: -100,
            right: -100,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
            bottom: -50,
            left: -50,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Chip
              label="Professional Services"
              sx={{
                backgroundColor: alpha("#0ea5e9", 0.2),
                color: "#7dd3fc",
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 1.2,
              }}
            >
              Complete Real Estate
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  display: "block",
                }}
              >
                Services
              </Box>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.7)",
                maxWidth: 600,
                fontWeight: 400,
              }}
            >
              From property appraisal to land titling, we provide comprehensive
              real estate services to meet all your needs.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Feature Cards */}
      <Container maxWidth="lg" sx={{ mt: -6, position: "relative", zIndex: 2 }}>
        <Grid container spacing={3}>
          {serviceFeatures.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  border: tab === index ? `2px solid ${feature.color}` : "2px solid transparent",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 20px 60px ${alpha(feature.color, 0.2)}`,
                  },
                }}
                onClick={() => setTab(index)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: alpha(feature.color, 0.1),
                      color: feature.color,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>
                  <Stack spacing={0.5}>
                    {feature.highlights.map((h, i) => (
                      <Stack key={i} direction="row" spacing={1} alignItems="center">
                        <CheckIcon sx={{ fontSize: 16, color: feature.color }} />
                        <Typography variant="body2" color="text.secondary">
                          {h}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {notice && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setNotice(null)}
            icon={<CheckIcon />}
          >
            {notice}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {!user && (
          <Paper
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              color: "white",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Sign in to submit requests
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Create an account or log in to access our professional services.
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    backgroundColor: "white",
                    color: "#0ea5e9",
                    "&:hover": { backgroundColor: "#f1f5f9" },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/register")}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": { borderColor: "white", backgroundColor: alpha("#fff", 0.1) },
                  }}
                >
                  Register
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Tabs */}
        <Paper
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                py: 2,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
              },
              "& .Mui-selected": {
                color: serviceFeatures[tab]?.color,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: serviceFeatures[tab]?.color,
                height: 3,
              },
            }}
          >
            <Tab icon={<AppraisalIcon />} iconPosition="start" label="Property Appraisal" />
            <Tab icon={<TitlingIcon />} iconPosition="start" label="Land Titling" />
            <Tab icon={<ConsultancyIcon />} iconPosition="start" label="Consultancy" />
          </Tabs>
        </Paper>

        {/* Appraisal Tab */}
        {tab === 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha("#0ea5e9", 0.1),
                    color: "#0ea5e9",
                  }}
                >
                  <AppraisalIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Property Appraisal Request
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get an accurate market valuation from licensed professionals
                  </Typography>
                </Box>
              </Stack>

              {/* Pricing Info */}
              <Paper
                sx={{
                  p: 2,
                  mb: 4,
                  borderRadius: 2,
                  backgroundColor: alpha("#0ea5e9", 0.05),
                  border: "1px solid",
                  borderColor: alpha("#0ea5e9", 0.2),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <MoneyIcon sx={{ color: "#0ea5e9" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Pricing Structure
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Land only: <strong>PHP 10,000</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      With building: <strong>+PHP 10,000</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Per additional floor: <strong>+PHP 5,000</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Box component="form" onSubmit={handleAppraisalSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={appraisal.name}
                      onChange={(e) => setAppraisal({ ...appraisal, name: e.target.value })}
                      required
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
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
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={appraisal.phone}
                      onChange={(e) => setAppraisal({ ...appraisal, phone: e.target.value })}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={appraisal.address}
                      onChange={(e) => setAppraisal({ ...appraisal, address: e.target.value })}
                      InputProps={{
                        startAdornment: <HomeIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                      Property Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Property Location"
                      value={appraisal.propertyLocation}
                      onChange={(e) => setAppraisal({ ...appraisal, propertyLocation: e.target.value })}
                      required
                      helperText="Complete address of the property to be appraised"
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Lot Area (sqm)"
                      value={appraisal.size}
                      onChange={(e) => setAppraisal({ ...appraisal, size: e.target.value })}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={appraisal.includesBuilding}
                          onChange={(e) => setAppraisal({ ...appraisal, includesBuilding: e.target.checked })}
                          sx={{ color: "#0ea5e9", "&.Mui-checked": { color: "#0ea5e9" } }}
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <BuildingIcon sx={{ fontSize: 20 }} />
                          <span>Includes Building/Structure</span>
                        </Stack>
                      }
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
                          sx={inputStyles}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Year Built"
                          value={appraisal.timeOfBuild}
                          onChange={(e) => setAppraisal({ ...appraisal, timeOfBuild: e.target.value })}
                          sx={inputStyles}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Last Major Renovation"
                          value={appraisal.lastRepair}
                          onChange={(e) => setAppraisal({ ...appraisal, lastRepair: e.target.value })}
                          sx={inputStyles}
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
                      InputProps={{
                        startAdornment: <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        px: 3,
                        borderStyle: "dashed",
                        borderWidth: 2,
                      }}
                    >
                      Upload Documents (Title, Tax Dec, Photos)
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={(e) => setAppraisal({ ...appraisal, documents: Array.from(e.target.files) })}
                      />
                    </Button>
                    {appraisal.documents.length > 0 && (
                      <Chip
                        label={`${appraisal.documents.length} file(s) selected`}
                        sx={{ ml: 2 }}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting || !user}
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                        boxShadow: "0 4px 14px rgba(14,165,233,0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                          boxShadow: "0 6px 20px rgba(14,165,233,0.5)",
                        },
                      }}
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
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha("#10b981", 0.1),
                    color: "#10b981",
                  }}
                >
                  <TitlingIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Land Titling / Title Transfer Request
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete assistance with property documentation services
                  </Typography>
                </Box>
              </Stack>

              <Box component="form" onSubmit={handleTitlingSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={titling.name}
                      onChange={(e) => setTitling({ ...titling, name: e.target.value })}
                      required
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
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
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={titling.phone}
                      onChange={(e) => setTitling({ ...titling, phone: e.target.value })}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={titling.address}
                      onChange={(e) => setTitling({ ...titling, address: e.target.value })}
                      InputProps={{
                        startAdornment: <HomeIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                      Property Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Property Location"
                      value={titling.propertyLocation}
                      onChange={(e) => setTitling({ ...titling, propertyLocation: e.target.value })}
                      required
                      helperText="Complete address of the property"
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
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
                      InputProps={{
                        startAdornment: <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        px: 3,
                        borderStyle: "dashed",
                        borderWidth: 2,
                        borderColor: "#10b981",
                        color: "#10b981",
                        "&:hover": {
                          borderColor: "#059669",
                          backgroundColor: alpha("#10b981", 0.05),
                        },
                      }}
                    >
                      Upload Documents (any number)
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={(e) => setTitling({ ...titling, documents: Array.from(e.target.files) })}
                      />
                    </Button>
                    {titling.documents.length > 0 && (
                      <Chip
                        label={`${titling.documents.length} file(s) selected`}
                        sx={{ ml: 2, borderColor: "#10b981", color: "#10b981" }}
                        variant="outlined"
                      />
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting || !user}
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                          boxShadow: "0 6px 20px rgba(16,185,129,0.5)",
                        },
                      }}
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
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha("#8b5cf6", 0.1),
                    color: "#8b5cf6",
                  }}
                >
                  <ConsultancyIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Real Estate Consultancy
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expert advice on property investment and strategies
                  </Typography>
                </Box>
              </Stack>

              <Box component="form" onSubmit={handleConsultancySubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={consultancy.name}
                      onChange={(e) => setConsultancy({ ...consultancy, name: e.target.value })}
                      required
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
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
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={consultancy.phone}
                      onChange={(e) => setConsultancy({ ...consultancy, phone: e.target.value })}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
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
                      InputProps={{
                        startAdornment: <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Consultation Topic"
                      value={consultancy.topic}
                      onChange={(e) => setConsultancy({ ...consultancy, topic: e.target.value })}
                      helperText="Briefly describe what you'd like to discuss"
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting || !user}
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                        boxShadow: "0 4px 14px rgba(139,92,246,0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                          boxShadow: "0 6px 20px rgba(139,92,246,0.5)",
                        },
                      }}
                    >
                      {submitting ? "Submitting..." : "Request Consultation"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default Services;
