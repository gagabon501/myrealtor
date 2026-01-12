import { useEffect, useState } from "react";
import {
  Alert,
  Container,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FilterListIcon from "@mui/icons-material/FilterList";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import ApartmentIcon from "@mui/icons-material/Apartment";

const Properties = () => {
  const [propertyList, setPropertyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ? String(user.role).toLowerCase() : "public";
  const isCompany = role === "staff" || role === "admin";
  const isClient = !!user && !isCompany;
  const canManage = isCompany;

  const [interestOpen, setInterestOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [interestForm, setInterestForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [applyNotes, setApplyNotes] = useState("");
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [submittingApply, setSubmittingApply] = useState(false);
  const [interestedIds, setInterestedIds] = useState(new Set());

  const loadProperties = async () => {
    setLoading(true);
    const endpoint = canManage ? "/properties/admin" : "/properties";
    try {
      const res = await client.get(endpoint, { params: filters });
      setPropertyList(res.data || []);
    } catch {
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const loadInterested = async () => {
    if (!isClient) return;
    try {
      const res = await client.get("/services/brokerage/interest/mine");
      const ids = new Set(
        (res.data?.propertyIds || []).map((id) => String(id))
      );
      setInterestedIds(ids);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadProperties();
    if (isClient) {
      loadInterested();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, isClient, user?.id]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    loadProperties();
  };

  const clearFilters = () => {
    setFilters({ search: "", location: "", minPrice: "", maxPrice: "" });
  };

  const handleEdit = (property) => {
    navigate(`/properties/${property._id}/edit`);
  };

  const handleDelete = async (property) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      await client.delete(`/properties/${property._id}`);
      setNotice("Property deleted");
      loadProperties();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete property");
    }
  };

  const isActionable = (property) => {
    const status = String(property.status || "").toUpperCase();
    const published = property.published || status === "PUBLISHED";
    return published && status === "PUBLISHED";
  };

  const openInterested = (property) => {
    if (!isActionable(property)) {
      setError("This property is not accepting interest right now.");
      return;
    }
    if (!user) {
      setNotice("Please sign up to submit your interest.");
      navigate("/register");
      return;
    }
    setSelectedProperty(property);
    setInterestForm({
      name: user?.profile?.fullName || user?.name || "",
      address: "",
      email: user?.email || "",
      phone: user?.profile?.phone || "",
      notes: "",
    });
    setInterestOpen(true);
  };

  const openApply = (property) => {
    if (!isActionable(property)) {
      setError("This property is not accepting applications right now.");
      return;
    }
    if (!isClient) {
      setNotice("Please register to apply.");
      navigate("/register");
      return;
    }
    setSelectedProperty(property);
    setApplyNotes("");
    setApplyOpen(true);
  };

  const submitInterest = async () => {
    if (!selectedProperty) return;
    const status = String(selectedProperty.status || "").toUpperCase();
    const published = selectedProperty.published || status === "PUBLISHED";
    const statusOk = ["PUBLISHED", "AVAILABLE"].includes(status);
    if (!(published && statusOk)) {
      setError("This property is not accepting interest right now.");
      return;
    }
    setSubmittingInterest(true);
    setError(null);
    try {
      await client.post("/services/brokerage/interest", {
        propertyId: selectedProperty._id,
        ...interestForm,
      });
      setNotice("Thanks! We recorded your interest.");
      setInterestOpen(false);
      await loadInterested();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 409 || msg === "Interest already exists") {
        setError("You already registered interest for this property.");
      } else {
        setError(msg || "Could not submit interest");
      }
    } finally {
      setSubmittingInterest(false);
    }
  };

  const submitApply = async () => {
    if (!selectedProperty) return;
    setSubmittingApply(true);
    setError(null);
    try {
      await client.post("/applications", {
        propertyId: selectedProperty._id,
        notes: applyNotes,
      });
      setNotice("Application submitted");
      setApplyOpen(false);
      navigate("/dashboard");
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
      setSubmittingApply(false);
    }
  };

  const lifecycleAction = async (property, endpoint, confirmation) => {
    if (!window.confirm(confirmation)) return;
    try {
      const res = await client.post(`/properties/${property._id}/${endpoint}`);
      setNotice(`Updated: ${res.data.status || "ok"}`);
      loadProperties();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  };

  const handlePublish = (property) =>
    lifecycleAction(property, "publish", "Publish this property?");
  const handleUnpublish = (property) =>
    lifecycleAction(property, "unpublish", "Unpublish this property?");
  const handleReserve = (property) =>
    lifecycleAction(
      property,
      "mark-reserved",
      "Mark this property as reserved?"
    );
  const handleSold = (property) =>
    lifecycleAction(
      property,
      "mark-sold",
      "Mark this property as sold? This hides it from public."
    );
  const handleWithdraw = (property) =>
    lifecycleAction(
      property,
      "withdraw",
      "Withdraw this property? It will be hidden from public."
    );

  const hasActiveFilters = filters.search || filters.location || filters.minPrice || filters.maxPrice;

  return (
    <Box sx={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          pt: { xs: 4, md: 6 },
          pb: { xs: 10, md: 14 },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)
            `,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Chip
              icon={<ApartmentIcon sx={{ fontSize: 16 }} />}
              label="Property Marketplace"
              sx={{
                mb: 2,
                background: "rgba(14, 165, 233, 0.15)",
                border: "1px solid rgba(14, 165, 233, 0.3)",
                color: "#38bdf8",
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                color: "#fff",
                mb: 1,
              }}
            >
              Find Your Perfect Property
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.7)",
                maxWidth: 500,
                mx: "auto",
              }}
            >
              Browse our curated selection of properties across the Philippines
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Search Section - Floating Card */}
      <Container maxWidth="lg" sx={{ mt: { xs: -6, md: -8 }, mb: 4 }}>
        <Paper
          component="form"
          onSubmit={applyFilters}
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background: "#fff",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by keyword..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "#f8fafc",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "#f8fafc",
                  },
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                placeholder="Min Price"
                name="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={handleFilterChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "#f8fafc",
                  },
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                placeholder="Max Price"
                name="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "#f8fafc",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.75,
                  background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                  },
                }}
              >
                <SearchIcon />
              </Button>
            </Grid>
          </Grid>

          {hasActiveFilters && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mr: 1 }}>
                Active filters:
              </Typography>
              {filters.search && (
                <Chip
                  label={`"${filters.search}"`}
                  size="small"
                  onDelete={() => setFilters({ ...filters, search: "" })}
                />
              )}
              {filters.location && (
                <Chip
                  label={filters.location}
                  size="small"
                  onDelete={() => setFilters({ ...filters, location: "" })}
                />
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Chip
                  label={`₱${filters.minPrice || "0"} - ₱${filters.maxPrice || "∞"}`}
                  size="small"
                  onDelete={() => setFilters({ ...filters, minPrice: "", maxPrice: "" })}
                />
              )}
              <Button size="small" onClick={clearFilters} sx={{ ml: 1 }}>
                Clear all
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>

      {/* Properties Grid */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
            {loading ? "Loading..." : `${propertyList.length} Properties Found`}
          </Typography>
          {canManage && (
            <Button
              variant="contained"
              onClick={() => navigate("/properties/new")}
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                },
              }}
            >
              Add Property
            </Button>
          )}
        </Stack>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : propertyList.length > 0 ? (
          <Grid container spacing={3}>
            {propertyList.map((property) => (
              <Grid item xs={12} sm={6} lg={4} key={property._id}>
                <PropertyCard
                  property={property}
                  onApply={isClient ? openApply : null}
                  isInterested={interestedIds.has(String(property._id))}
                  canManage={canManage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                  onUnpublish={handleUnpublish}
                  onReserve={handleReserve}
                  onSold={handleSold}
                  onWithdraw={handleWithdraw}
                  onInterested={openInterested}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              background: "#fff",
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <ApartmentIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
              No properties found
            </Typography>
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              Try adjusting your search filters or check back later
            </Typography>
          </Paper>
        )}

        <Snackbar
          open={Boolean(notice)}
          autoHideDuration={4000}
          onClose={() => setNotice("")}
          message={notice}
        />

        {/* Interest Dialog */}
        <Dialog
          open={interestOpen}
          onClose={() => setInterestOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Express Interest
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProperty?.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setInterestOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Full Name"
                value={interestForm.name}
                onChange={(e) =>
                  setInterestForm({ ...interestForm, name: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Address"
                value={interestForm.address}
                onChange={(e) =>
                  setInterestForm({ ...interestForm, address: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={interestForm.email}
                onChange={(e) =>
                  setInterestForm({ ...interestForm, email: e.target.value })
                }
                disabled={isClient}
                required
                fullWidth
              />
              <TextField
                label="Phone Number"
                value={interestForm.phone}
                onChange={(e) =>
                  setInterestForm({ ...interestForm, phone: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Additional Notes"
                multiline
                minRows={3}
                value={interestForm.notes}
                onChange={(e) =>
                  setInterestForm({ ...interestForm, notes: e.target.value })
                }
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setInterestOpen(false)} sx={{ color: "text.secondary" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={submitInterest}
              disabled={
                submittingInterest ||
                !interestForm.name ||
                !interestForm.email ||
                !interestForm.address
              }
              sx={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                px: 4,
              }}
            >
              {submittingInterest ? "Submitting..." : "Submit Interest"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Apply Dialog */}
        <Dialog
          open={applyOpen}
          onClose={() => setApplyOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Apply for Property
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProperty?.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setApplyOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Alert severity="info" sx={{ mb: 2 }}>
              Your profile information will be used for this application. You can add notes below.
            </Alert>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Notes (optional)"
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              placeholder="Any additional information you'd like to share..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setApplyOpen(false)} sx={{ color: "text.secondary" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={submitApply}
              disabled={submittingApply}
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                px: 4,
              }}
            >
              {submittingApply ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Properties;
