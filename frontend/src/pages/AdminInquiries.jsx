import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Snackbar,
  Chip,
} from "@mui/material";
import client from "../api/client";
import DocumentUploader from "../components/DocumentUploader";
import DocumentList from "../components/DocumentList";
import { MODULES, OWNER_TYPES, REGISTRY } from "../constants/documentLibrary";
import { useAuth } from "../context/AuthContext";

const statusOptions = ["NEW", "CONTACTED", "CLOSED"];

const AdminInquiries = () => {
  const { user } = useAuth();
  const canManage = ["staff", "admin"].includes(user?.role);
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [docOpen, setDocOpen] = useState(false);
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/inquiries");
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) load();
    else {
      setLoading(false);
    }
  }, [canManage]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : (row.status || "NEW") === statusFilter;
      const haystack = [
        row.buyer?.name,
        row.buyer?.email,
        row.buyer?.phone,
        row.propertyId?.title,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = term ? haystack.includes(term) : true;
      return matchesStatus && matchesSearch;
    });
  }, [rows, statusFilter, search]);

  const summary = useMemo(() => {
    const total = rows.length;
    const byStatus = rows.reduce(
      (acc, r) => {
        const key = (r.status || "NEW").toUpperCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { NEW: 0, CONTACTED: 0, CLOSED: 0 }
    );
    return { total, byStatus };
  }, [rows]);

  const openDocs = (row) => {
    setActiveInquiry(row);
    setDocOpen(true);
    setRefreshKey((k) => k + 1);
  };

  const closeDocs = () => {
    setDocOpen(false);
    setActiveInquiry(null);
  };

  const handleUploaded = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleStatusChange = async (id, status) => {
    const prev = rows.find((r) => r._id === id)?.status;
    setRows((prevRows) => prevRows.map((row) => (row._id === id ? { ...row, status } : row)));
    try {
      await client.patch(`/inquiries/${id}/status`, { status });
      setSuccess("Status updated");
    } catch (err) {
      setRows((prevRows) =>
        prevRows.map((row) => (row._id === id ? { ...row, status: prev } : row))
      );
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Buyer Inquiries
      </Typography>
      {!canManage && (
        <Alert severity="error">Access denied. Staff/Admin only.</Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : canManage ? (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ mb: 2 }}
          >
            <TextField
              size="small"
              label="Search (property / buyer)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 200, maxWidth: 320 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All</MenuItem>
                {statusOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Total: ${summary.total}`} />
              <Chip label={`New: ${summary.byStatus.NEW || 0}`} color="primary" />
              <Chip label={`Contacted: ${summary.byStatus.CONTACTED || 0}`} color="info" />
              <Chip label={`Closed: ${summary.byStatus.CLOSED || 0}`} color="success" />
            </Stack>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Created</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.propertyId?.title || row.propertyId || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {row.buyer?.name || "—"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.buyer?.address || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.buyer?.phone || "—"}</TableCell>
                  <TableCell>{row.buyer?.email || "—"}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => openDocs(row)}>
                      Documents
                    </Button>
                  </TableCell>
                  <TableCell>
                    {row.status === "CLOSED" ? (
                      <Chip label="CLOSED" color="success" size="small" />
                    ) : (
                      <FormControl size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          label="Status"
                          value={row.status || "NEW"}
                          onChange={(e) => handleStatusChange(row._id, e.target.value)}
                        >
                          {statusOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!filteredRows.length && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" color="text.secondary">
                      No inquiries match the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      ) : null}
      <Snackbar
        open={!!success}
        autoHideDuration={2000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>

      <Dialog
        fullWidth
        maxWidth="md"
        open={docOpen}
        onClose={closeDocs}
        aria-labelledby="documents-dialog-title"
      >
        <DialogTitle id="documents-dialog-title">
          Documents for {activeInquiry?.buyer?.name || "Inquiry"}
        </DialogTitle>
        <DialogContent dividers>
          {activeInquiry && (
            <Box sx={{ display: "grid", gap: 2 }}>
              <DocumentUploader
                module={MODULES.INQUIRY}
                ownerType={OWNER_TYPES.BUYER_INQUIRY}
                ownerId={activeInquiry._id}
                categories={REGISTRY[MODULES.INQUIRY].categories}
                defaultCategory={REGISTRY[MODULES.INQUIRY].categories[0]}
                onUploaded={handleUploaded}
              />
              <DocumentList
                module={MODULES.INQUIRY}
                ownerId={activeInquiry._id}
                refreshKey={refreshKey}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDocs}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminInquiries;

