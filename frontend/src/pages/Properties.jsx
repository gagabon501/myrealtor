import { useEffect, useState } from "react";
import { Container, Grid, Typography, Alert, Snackbar } from "@mui/material";
import PropertyCard from "../components/PropertyCard";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    client
      .get("/properties")
      .then((res) => setProperties(res.data))
      .catch(() => setError("Failed to load properties"));
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

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Properties
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        {properties.map((property) => (
          <Grid item xs={12} md={4} key={property._id}>
            <PropertyCard property={property} onApply={handleApply} />
          </Grid>
        ))}
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

