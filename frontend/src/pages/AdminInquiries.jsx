import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import client from "../api/client";

const statusOptions = ["NEW", "CONTACTED", "CLOSED"];

const AdminInquiries = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
    load();
  }, []);

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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
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
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    No inquiries yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
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
    </Container>
  );
};

export default AdminInquiries;

