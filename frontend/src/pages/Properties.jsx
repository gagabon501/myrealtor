import { useEffect, useState } from "react";
import { Alert, Container, Snackbar, Stack, TextField, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({ search: "", location: "", minPrice: "", maxPrice: "" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = ["staff", "admin"].includes(user?.role);

  const loadProperties = () => {
    client
      .get("/properties", { params: filters })
      .then((res) => setProperties(res.data))
      .catch(() => setError("Failed to load properties"));
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleApply = async (property) => {
    if (!user) {
      setNotice("Please register to continue your application.");
      navigate("/register");
      return;
    }
    try {
      await client.post("/applications", { propertyId: property._id });
      setNotice("Application submitted");
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application");
    }
  };

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
    lifecycleAction(property, "mark-reserved", "Mark this property as reserved?");
  const handleSold = (property) =>
    lifecycleAction(property, "mark-sold", "Mark this property as sold? This hides it from public.");
  const handleWithdraw = (property) =>
    lifecycleAction(
      property,
      "withdraw",
      "Withdraw this property? It will be hidden from public."
    );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
        <TextField fullWidth label="Keyword" name="search" value={filters.search} onChange={handleFilterChange} />
        <TextField fullWidth label="Location" name="location" value={filters.location} onChange={handleFilterChange} />
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
        <Button type="submit" variant="contained" sx={{ minWidth: { md: 120 } }}>
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
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onApply={handleApply}
            canManage={canManage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onReserve={handleReserve}
            onSold={handleSold}
            onWithdraw={handleWithdraw}
          />
        ))}
      </Box>
      {!properties.length && (
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
    </Container>
  );
};

export default Properties;

