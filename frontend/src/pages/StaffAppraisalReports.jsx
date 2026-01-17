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
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import client, { apiBase } from "../api/client";

const StaffAppraisalReports = () => {
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [form, setForm] = useState({
    introduction: "",
    propertyIdentification: "",
    purpose: "",
    highestAndBestUse: "",
    marketAnalysis: "",
    valuationApproach: "",
    valueConclusion: "",
    limitingConditions: "",
    appraiserValue: "",
    effectiveDate: "",
    certification: {
      appraiserName: "",
      licenseNumber: "",
      signedDate: "",
    },
  });

  const loadRequests = async () => {
    try {
      const res = await client.get("/services/appraisal");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  const loadReports = async () => {
    try {
      const res = await client.get("/appraisal-reports");
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadRequests(), loadReports()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleCreateReport = async (requestId) => {
    setError(null);
    try {
      await client.post("/appraisal-reports", { appraisalRequestId: requestId });
      setNotice("Report created. You can now edit it.");
      loadReports();
    } catch (err) {
      if (err.response?.data?.reportId) {
        setNotice("Report already exists for this request.");
      } else {
        setError(err.response?.data?.message || "Failed to create report");
      }
    }
  };

  const handleOpenEdit = (report) => {
    setSelectedReport(report);
    setForm({
      introduction: report.introduction || "",
      propertyIdentification: report.propertyIdentification || "",
      purpose: report.purpose || "",
      highestAndBestUse: report.highestAndBestUse || "",
      marketAnalysis: report.marketAnalysis || "",
      valuationApproach: report.valuationApproach || "",
      valueConclusion: report.valueConclusion || "",
      limitingConditions: report.limitingConditions || "",
      appraiserValue: report.appraiserValue || "",
      effectiveDate: report.effectiveDate ? report.effectiveDate.split("T")[0] : "",
      certification: {
        appraiserName: report.certification?.appraiserName || "",
        licenseNumber: report.certification?.licenseNumber || "",
        signedDate: report.certification?.signedDate ? report.certification.signedDate.split("T")[0] : "",
      },
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    try {
      await client.patch(`/appraisal-reports/${selectedReport._id}`, {
        ...form,
        appraiserValue: Number(form.appraiserValue),
      });
      setNotice("Report saved successfully");
      setEditDialogOpen(false);
      loadReports();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save report");
    }
  };

  const handleFinalize = async (id) => {
    setError(null);
    try {
      await client.post(`/appraisal-reports/${id}/finalize`);
      setNotice("Report finalized and PDF generated");
      loadReports();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finalize report");
    }
  };

  const handleRelease = async (id) => {
    setError(null);
    try {
      await client.post(`/appraisal-reports/${id}/release`);
      setNotice("Report released to client");
      loadReports();
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to release report");
    }
  };

  const getReportForRequest = (requestId) => {
    return reports.find((r) => r.appraisalRequestId?._id === requestId || r.appraisalRequestId === requestId);
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
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Appraisal Reports Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create, edit, finalize, and release appraisal reports for clients.
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

      <Typography variant="h6" sx={{ mb: 2 }}>Appraisal Requests</Typography>
      {requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", mb: 4 }}>
          <Typography color="text.secondary">No appraisal requests.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {requests.map((req) => {
            const report = getReportForRequest(req._id);
            return (
              <Card key={req._id} variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {req.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {req.email} | {req.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Property: {req.propertyLocation}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Chip label={`Request: ${req.status}`} size="small" />
                        {report && (
                          <Chip
                            label={`Report: ${report.status}`}
                            size="small"
                            color={
                              report.status === "RELEASED"
                                ? "success"
                                : report.status === "FINAL"
                                ? "primary"
                                : "default"
                            }
                          />
                        )}
                        <Typography variant="body2">
                          Rate: PHP {req.rate?.toLocaleString()}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1} alignItems="flex-end">
                        {!report && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleCreateReport(req._id)}
                          >
                            Create Report
                          </Button>
                        )}
                        {report && report.status === "DRAFT" && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenEdit(report)}
                            >
                              Edit Report
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleFinalize(report._id)}
                            >
                              Finalize
                            </Button>
                          </>
                        )}
                        {report && report.status === "FINAL" && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleRelease(report._id)}
                            >
                              Release to Client
                            </Button>
                            {report.finalPdf?.url && (
                              <Button
                                size="small"
                                variant="outlined"
                                href={`${apiBase}${report.finalPdf.url}`}
                                target="_blank"
                              >
                                Download PDF
                              </Button>
                            )}
                          </>
                        )}
                        {report && report.status === "RELEASED" && report.finalPdf?.url && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={`${apiBase}${report.finalPdf.url}`}
                            target="_blank"
                          >
                            Download PDF
                          </Button>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Edit Report Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Appraisal Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Introduction"
                value={form.introduction}
                onChange={(e) => setForm({ ...form, introduction: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Property Identification"
                value={form.propertyIdentification}
                onChange={(e) => setForm({ ...form, propertyIdentification: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Purpose of Appraisal"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Highest and Best Use"
                value={form.highestAndBestUse}
                onChange={(e) => setForm({ ...form, highestAndBestUse: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Market Analysis"
                value={form.marketAnalysis}
                onChange={(e) => setForm({ ...form, marketAnalysis: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Valuation Approach"
                value={form.valuationApproach}
                onChange={(e) => setForm({ ...form, valuationApproach: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Value Conclusion"
                value={form.valueConclusion}
                onChange={(e) => setForm({ ...form, valueConclusion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Limiting Conditions"
                value={form.limitingConditions}
                onChange={(e) => setForm({ ...form, limitingConditions: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider>Appraisal Value</Divider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Appraised Value (PHP)"
                type="number"
                value={form.appraiserValue}
                onChange={(e) => setForm({ ...form, appraiserValue: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Effective Date"
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider>Appraiser Certification</Divider>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Appraiser Name"
                value={form.certification.appraiserName}
                onChange={(e) => setForm({ ...form, certification: { ...form.certification, appraiserName: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="License Number"
                value={form.certification.licenseNumber}
                onChange={(e) => setForm({ ...form, certification: { ...form.certification, licenseNumber: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Signed Date"
                type="date"
                value={form.certification.signedDate}
                onChange={(e) => setForm({ ...form, certification: { ...form.certification, signedDate: e.target.value } })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffAppraisalReports;
