import { useEffect, useState } from "react";
import {
  Alert,
  Container,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Button,
} from "@mui/material";
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
      setNotice("Please login before applying.");
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

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Properties
      </Typography>
      <Stack
        component="form"
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
        onSubmit={applyFilters}
      >
        <TextField label="Keyword" name="search" value={filters.search} onChange={handleFilterChange} />
        <TextField label="Location" name="location" value={filters.location} onChange={handleFilterChange} />
        <TextField
          label="Min price"
          name="minPrice"
          type="number"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <TextField
          label="Max price"
          name="maxPrice"
          type="number"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <Button type="submit" variant="contained">
          Filter
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        {properties.map((property) => (
          <Grid item xs={12} md={4} key={property._id}>
            <PropertyCard
              property={property}
              onApply={handleApply}
              canManage={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Grid>
        ))}
        {!properties.length && (
          <Grid item xs={12}>
            <Typography color="text.secondary">No properties found.</Typography>
          </Grid>
        )}
      </Grid>
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

