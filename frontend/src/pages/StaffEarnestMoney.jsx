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
import client, { apiBase } from "../api/client";

const initialFormState = {
  propertyId: "",
  executionDate: "",
  executionLocation: "",
  seller: { name: "", address: "" },
  buyer: { name: "", address: "", phone: "", email: "" },
  titleNo: "",
  areaSqm: "",
  earnestMoneyAmount: "",
  totalPurchasePrice: "",
  deedExecutionDeadline: "",
};

const StaffEarnestMoney = () => {
  const [agreements, setAgreements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [previewLoading, setPreviewLoading] = useState(false);

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

  const resetForm = () => {
    setForm(initialFormState);
  };

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
      resetForm();
      loadAgreements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create agreement");
    }
  };

  const handleOpenEdit = (ema) => {
    setSelectedAgreement(ema);
    setForm({
      propertyId: ema.propertyId?._id || ema.propertyId,
      executionDate: ema.executionDate ? ema.executionDate.split("T")[0] : "",
      executionLocation: ema.executionLocation || "",
      seller: { name: ema.seller?.name || "", address: ema.seller?.address || "" },
      buyer: {
        name: ema.buyer?.name || "",
        address: ema.buyer?.address || "",
        phone: ema.buyer?.phone || "",
        email: ema.buyer?.email || "",
      },
      titleNo: ema.titleNo || "",
      areaSqm: ema.areaSqm || "",
      earnestMoneyAmount: ema.earnestMoneyAmount || "",
      totalPurchasePrice: ema.totalPurchasePrice || "",
      deedExecutionDeadline: ema.deedExecutionDeadline ? ema.deedExecutionDeadline.split("T")[0] : "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    setError(null);
    try {
      const payload = {
        executionDate: form.executionDate,
        executionLocation: form.executionLocation,
        seller: form.seller,
        buyer: form.buyer,
        titleNo: form.titleNo,
        areaSqm: Number(form.areaSqm),
        earnestMoneyAmount: Number(form.earnestMoneyAmount),
        totalPurchasePrice: Number(form.totalPurchasePrice),
        deedExecutionDeadline: form.deedExecutionDeadline,
      };
      await client.patch(`/earnest-money/${selectedAgreement._id}`, payload);
      setNotice("Agreement updated successfully");
      setEditDialogOpen(false);
      resetForm();
      setSelectedAgreement(null);
      loadAgreements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update agreement");
    }
  };

  const handlePreview = async (id) => {
    setError(null);
    setPreviewLoading(true);
    try {
      const res = await client.post(`/earnest-money/${id}/preview`);
      if (res.data?.previewUrl) {
        window.open(`${apiBase}${res.data.previewUrl}`, "_blank");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate preview");
    } finally {
      setPreviewLoading(false);
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

  const renderFormFields = (isEdit = false) => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {!isEdit && (
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
      )}
      <Grid item xs={12}>
        <Divider>Agreement Execution Details</Divider>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Execution Date"
          type="date"
          value={form.executionDate}
          onChange={(e) => setForm({ ...form, executionDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
          required
          helperText="Date when this agreement is executed"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Execution Location"
          value={form.executionLocation}
          onChange={(e) => setForm({ ...form, executionLocation: e.target.value })}
          required
          placeholder="e.g., Makati City"
          helperText="City/Municipality where agreement is executed"
        />
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
          label="Title Number (TCT/CCT)"
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
          label="Earnest Money Amount (PHP)"
          type="number"
          value={form.earnestMoneyAmount}
          onChange={(e) => setForm({ ...form, earnestMoneyAmount: e.target.value })}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Total Purchase Price (PHP)"
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
  );

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
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Execution: {ema.executionDate ? new Date(ema.executionDate).toLocaleDateString() : "N/A"} at {ema.executionLocation || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Deed Deadline: {ema.deedExecutionDeadline ? new Date(ema.deedExecutionDeadline).toLocaleDateString() : "N/A"}
                      </Typography>
                    </Stack>
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
                            variant="outlined"
                            onClick={() => handleOpenEdit(ema)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            onClick={() => handlePreview(ema._id)}
                            disabled={previewLoading}
                          >
                            {previewLoading ? "Generating..." : "Preview PDF"}
                          </Button>
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
                          href={`${apiBase}${ema.finalPdf.url}`}
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
      <Dialog open={createDialogOpen} onClose={() => { setCreateDialogOpen(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>Create Earnest Money Agreement</DialogTitle>
        <DialogContent>
          {renderFormFields(false)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); resetForm(); setSelectedAgreement(null); }} maxWidth="md" fullWidth>
        <DialogTitle>Edit Earnest Money Agreement</DialogTitle>
        <DialogContent>
          {renderFormFields(true)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialogOpen(false); resetForm(); setSelectedAgreement(null); }}>Cancel</Button>
          <Button
            variant="outlined"
            color="info"
            onClick={() => selectedAgreement && handlePreview(selectedAgreement._id)}
            disabled={previewLoading}
          >
            {previewLoading ? "Generating..." : "Preview"}
          </Button>
          <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffEarnestMoney;
