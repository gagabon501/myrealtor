import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import client from "../api/client";

const StaffEarnestMoney = () => {
  const [agreements, setAgreements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [form, setForm] = useState({
    propertyId: "",
    seller: { name: "", address: "" },
    buyer: { name: "", address: "", phone: "", email: "" },
    titleNo: "",
    areaSqm: "",
    earnestMoneyAmount: "",
    totalPurchasePrice: "",
    deedExecutionDeadline: "",
  });

  const loadAgreements = async () => {
    try {
      const res = await client.get("/earnest-money");
      setAgreements(res.data || []);
    } catch (err) {
      console.error("Failed to load agreements:", err);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await client.get("/properties?status=PUBLISHED");
      setProperties(res.data || []);
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadAgreements(), loadProperties()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleCreate = async () => {
    setError(null);
    try {
      const payload = {
        ...form,
        areaSqm: Number(form.areaSqm),
        earnestMoneyAmount: Number(form.earnestMoneyAmount),
        totalPurchasePrice: Number(form.totalPurchasePrice),
      };
      await client.post("/earnest-money", payload);
      setNotice("Earnest Money Agreement created successfully");
      setCreateDialogOpen(false);
      setForm({
        propertyId: "",
        seller: { name: "", address: "" },
        buyer: { name: "", address: "", phone: "", email: "" },
        titleNo: "",
        areaSqm: "",
        earnestMoneyAmount: "",
        totalPurchasePrice: "",
        deedExecutionDeadline: "",
      });
      loadAgreements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create agreement");
    }
  };

  const handleFinalize = async (id) => {
    setError(null);
    try {
      await client.post(`/earnest-money/${id}/finalize`);
      setNotice("Agreement finalized and PDF generated");
      loadAgreements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finalize agreement");
    }
  };

  const handleVoid = async (id) => {
    setError(null);
    try {
      await client.post(`/earnest-money/${id}/void`, { reason: "Voided by staff" });
      setNotice("Agreement voided");
      loadAgreements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to void agreement");
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Earnest Money Agreements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage earnest money agreements for property sales.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
          Create Agreement
        </Button>
      </Stack>

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

      {agreements.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No earnest money agreements yet.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {agreements.map((ema) => (
            <Card key={ema._id} variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6">
                      {ema.propertyId?.title || "Property"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ema.propertyId?.location}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Seller</Typography>
                        <Typography variant="body2">{ema.seller?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ema.seller?.address}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Buyer</Typography>
                        <Typography variant="body2">{ema.buyer?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ema.buyer?.email}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Typography variant="body2">
                        <strong>Title:</strong> {ema.titleNo}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Area:</strong> {ema.areaSqm} sqm
                      </Typography>
                      <Typography variant="body2">
                        <strong>Earnest:</strong> PHP {Number(ema.earnestMoneyAmount).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Price:</strong> PHP {Number(ema.totalPurchasePrice).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Deed Deadline: {ema.deedExecutionDeadline ? new Date(ema.deedExecutionDeadline).toLocaleDateString() : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1} alignItems="flex-end">
                      <Chip
                        label={ema.status}
                        color={ema.status === "FINAL" ? "success" : ema.status === "VOID" ? "error" : "default"}
                      />
                      {ema.status === "DRAFT" && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleFinalize(ema._id)}
                          >
                            Finalize & Generate PDF
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleVoid(ema._id)}
                          >
                            Void
                          </Button>
                        </>
                      )}
                      {ema.status === "FINAL" && ema.finalPdf?.url && (
                        <Button
                          size="small"
                          variant="outlined"
                          href={ema.finalPdf.url}
                          target="_blank"
                        >
                          Download PDF
                        </Button>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(ema.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Earnest Money Agreement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Property</InputLabel>
                <Select
                  value={form.propertyId}
                  label="Property"
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                >
                  {properties.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.title} - {p.location} (PHP {Number(p.price).toLocaleString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider>Seller Information</Divider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seller Name"
                value={form.seller.name}
                onChange={(e) => setForm({ ...form, seller: { ...form.seller, name: e.target.value } })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seller Address"
                value={form.seller.address}
                onChange={(e) => setForm({ ...form, seller: { ...form.seller, address: e.target.value } })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Divider>Buyer Information</Divider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buyer Name"
                value={form.buyer.name}
                onChange={(e) => setForm({ ...form, buyer: { ...form.buyer, name: e.target.value } })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buyer Email"
                type="email"
                value={form.buyer.email}
                onChange={(e) => setForm({ ...form, buyer: { ...form.buyer, email: e.target.value } })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buyer Address"
                value={form.buyer.address}
                onChange={(e) => setForm({ ...form, buyer: { ...form.buyer, address: e.target.value } })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buyer Phone"
                value={form.buyer.phone}
                onChange={(e) => setForm({ ...form, buyer: { ...form.buyer, phone: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider>Property Details</Divider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title Number"
                value={form.titleNo}
                onChange={(e) => setForm({ ...form, titleNo: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area (sqm)"
                type="number"
                value={form.areaSqm}
                onChange={(e) => setForm({ ...form, areaSqm: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Divider>Financial Terms</Divider>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Earnest Money Amount"
                type="number"
                value={form.earnestMoneyAmount}
                onChange={(e) => setForm({ ...form, earnestMoneyAmount: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Purchase Price"
                type="number"
                value={form.totalPurchasePrice}
                onChange={(e) => setForm({ ...form, totalPurchasePrice: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Deed Execution Deadline"
                type="date"
                value={form.deedExecutionDeadline}
                onChange={(e) => setForm({ ...form, deedExecutionDeadline: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffEarnestMoney;
