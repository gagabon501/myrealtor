import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import client from "../api/client";

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
  const [appraisal, setAppraisal] = useState(initialAppraisal);
  const [titling, setTitling] = useState(initialTitling);
  const [consultancy, setConsultancy] = useState(initialConsultancy);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const handleAppraisalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = new FormData();
      Object.entries(appraisal).forEach(([k, v]) => {
        if (k !== "documents") data.append(k, v);
      });
      appraisal.documents.forEach((file) => data.append("documents", file));
      const res = await client.post("/services/appraisal", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotice(`Appraisal submitted. Quote: ₱${res.data.rate.toLocaleString()} (50% upfront).`);
      setAppraisal(initialAppraisal);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit appraisal request");
    }
  };

  const handleTitlingSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = new FormData();
      Object.entries(titling).forEach(([k, v]) => {
        if (k !== "documents") data.append(k, v);
      });
      titling.documents.forEach((file) => data.append("documents", file));
      await client.post("/services/titling", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotice("Titling/transfer request submitted.");
      setTitling(initialTitling);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit titling request");
    }
  };

  const handleConsultancySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await client.post("/services/consultancy", consultancy);
      setNotice("Consultancy appointment requested.");
      setConsultancy(initialConsultancy);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit consultancy request");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Services Offered
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Brokerage, appraisal, titling/transfer, and consultancy—managed in one place.
        </Typography>
      </Box>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card id="brokerage" variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6">Brokerage</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                We market your property with authority-to-sell, photos, and buyer lead capture. Earnest
                money indicators supported.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card id="appraisal" variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6">Property Appraisal</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Book an appraisal, upload documents, and get a rate quote with staged payments.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card id="titling" variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6">Land Titling & Transfer</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Submit documents and schedule processing for titling and transfer requirements.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Request Appraisal
              </Typography>
              <Box component="form" onSubmit={handleAppraisalSubmit}>
                <Stack spacing={1.5}>
                  <TextField size="small" label="Name" value={appraisal.name} onChange={(e) => setAppraisal({ ...appraisal, name: e.target.value })} required />
                  <TextField size="small" label="Address" value={appraisal.address} onChange={(e) => setAppraisal({ ...appraisal, address: e.target.value })} />
                  <TextField size="small" label="Email" type="email" value={appraisal.email} onChange={(e) => setAppraisal({ ...appraisal, email: e.target.value })} required />
                  <TextField size="small" label="Phone" value={appraisal.phone} onChange={(e) => setAppraisal({ ...appraisal, phone: e.target.value })} />
                  <TextField size="small" label="Property location" value={appraisal.propertyLocation} onChange={(e) => setAppraisal({ ...appraisal, propertyLocation: e.target.value })} required />
                  <TextField size="small" label="Size / area" value={appraisal.size} onChange={(e) => setAppraisal({ ...appraisal, size: e.target.value })} />
                  <TextField size="small" label="Includes building? (true/false)" value={appraisal.includesBuilding} onChange={(e) => setAppraisal({ ...appraisal, includesBuilding: e.target.value })} />
                  <TextField size="small" label="Number of floors" type="number" value={appraisal.numberOfFloors} onChange={(e) => setAppraisal({ ...appraisal, numberOfFloors: e.target.value })} />
                  <TextField size="small" label="Time of build" value={appraisal.timeOfBuild} onChange={(e) => setAppraisal({ ...appraisal, timeOfBuild: e.target.value })} />
                  <TextField size="small" label="Last major repair" value={appraisal.lastRepair} onChange={(e) => setAppraisal({ ...appraisal, lastRepair: e.target.value })} />
                  <TextField size="small" label="Preferred appointment (date/time)" value={appraisal.appointment} onChange={(e) => setAppraisal({ ...appraisal, appointment: e.target.value })} />
                  <Button variant="outlined" component="label">
                    {appraisal.documents.length ? "Change documents" : "Upload documents"}
                    <input
                      type="file"
                      multiple
                      hidden
                      onChange={(e) =>
                        setAppraisal({ ...appraisal, documents: Array.from(e.target.files || []) })
                      }
                    />
                  </Button>
                  <Button type="submit" variant="contained">
                    Submit appraisal
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} id="titling-form">
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Titling / Transfer
              </Typography>
              <Box component="form" onSubmit={handleTitlingSubmit}>
                <Stack spacing={1.5}>
                  <TextField size="small" label="Name" value={titling.name} onChange={(e) => setTitling({ ...titling, name: e.target.value })} required />
                  <TextField size="small" label="Address" value={titling.address} onChange={(e) => setTitling({ ...titling, address: e.target.value })} />
                  <TextField size="small" label="Email" type="email" value={titling.email} onChange={(e) => setTitling({ ...titling, email: e.target.value })} required />
                  <TextField size="small" label="Phone" value={titling.phone} onChange={(e) => setTitling({ ...titling, phone: e.target.value })} />
                  <TextField size="small" label="Property location" value={titling.propertyLocation} onChange={(e) => setTitling({ ...titling, propertyLocation: e.target.value })} required />
                  <TextField size="small" label="Preferred appointment (date/time)" value={titling.appointment} onChange={(e) => setTitling({ ...titling, appointment: e.target.value })} />
                  <Button variant="outlined" component="label">
                    {titling.documents.length ? "Change documents" : "Upload documents"}
                    <input
                      type="file"
                      multiple
                      hidden
                      onChange={(e) =>
                        setTitling({ ...titling, documents: Array.from(e.target.files || []) })
                      }
                    />
                  </Button>
                  <Button type="submit" variant="contained">
                    Submit titling request
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} id="consultancy">
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Consultancy
              </Typography>
              <Box component="form" onSubmit={handleConsultancySubmit}>
                <Stack spacing={1.5}>
                  <TextField size="small" label="Name" value={consultancy.name} onChange={(e) => setConsultancy({ ...consultancy, name: e.target.value })} required />
                  <TextField size="small" label="Email" type="email" value={consultancy.email} onChange={(e) => setConsultancy({ ...consultancy, email: e.target.value })} required />
                  <TextField size="small" label="Phone" value={consultancy.phone} onChange={(e) => setConsultancy({ ...consultancy, phone: e.target.value })} />
                  <TextField size="small" label="Topic / notes" multiline minRows={2} value={consultancy.topic} onChange={(e) => setConsultancy({ ...consultancy, topic: e.target.value })} />
                  <TextField size="small" label="Preferred appointment (date/time)" value={consultancy.appointment} onChange={(e) => setConsultancy({ ...consultancy, appointment: e.target.value })} />
                  <Button type="submit" variant="contained">
                    Request consultancy
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Services;

