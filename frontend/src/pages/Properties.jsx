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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const Properties = () => {
  const [propertyList, setPropertyList] = useState([]);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });
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

  const loadProperties = () => {
    const endpoint = canManage ? "/properties/admin" : "/properties";
    client
      .get(endpoint, { params: filters })
      .then((res) => setPropertyList(res.data || []))
      .catch(() => setError("Failed to load properties"));
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Properties
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse listings and apply—registration required to proceed.
        </Typography>
      </Stack>
      <Stack
        component="form"
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
        onSubmit={applyFilters}
      >
        <TextField
          fullWidth
          label="Keyword"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <TextField
          fullWidth
          label="Location"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <TextField
          fullWidth
          label="Min price"
          name="minPrice"
          type="number"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <TextField
          fullWidth
          label="Max price"
          name="maxPrice"
          type="number"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ minWidth: { md: 120 } }}
        >
          Filter
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {propertyList.map((property) => (
          <PropertyCard
            key={property._id}
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
        ))}
      </Box>
      {!propertyList.length && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No properties found.
        </Typography>
      )}
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice("")}
        message={notice}
      />
      <Dialog
        open={interestOpen}
        onClose={() => setInterestOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>I'm Interested</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={interestForm.name}
              onChange={(e) =>
                setInterestForm({ ...interestForm, name: e.target.value })
              }
              required
            />
            <TextField
              label="Address"
              value={interestForm.address}
              onChange={(e) =>
                setInterestForm({ ...interestForm, address: e.target.value })
              }
              required
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
            />
            <TextField
              label="Phone"
              value={interestForm.phone}
              onChange={(e) =>
                setInterestForm({ ...interestForm, phone: e.target.value })
              }
            />
            <TextField
              label="Notes"
              multiline
              minRows={2}
              value={interestForm.notes}
              onChange={(e) =>
                setInterestForm({ ...interestForm, notes: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterestOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitInterest}
            disabled={
              submittingInterest ||
              !interestForm.name ||
              !interestForm.email ||
              !interestForm.address
            }
          >
            {submittingInterest ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Apply for this property</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Notes (optional)"
            value={applyNotes}
            onChange={(e) => setApplyNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitApply}
            disabled={submittingApply}
          >
            {submittingApply ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Properties;
