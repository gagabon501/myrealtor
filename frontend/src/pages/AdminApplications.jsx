import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Stack,
  Chip,
} from "@mui/material";
import client from "../api/client";

const STATUS_OPTIONS = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"];

const AdminApplications = () => {
  const [apps, setApps] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const res = await client.get("/applications");
      setApps(res.data);
    } catch (err) {
      setError("Failed to load applications");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredApps = useMemo(() => {
    const term = search.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : (app.status || "SUBMITTED") === statusFilter;
      const haystack = [
        app.propertyId?.title,
        app.userId?.email,
        app.notes,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = term ? haystack.includes(term) : true;
      return matchesStatus && matchesSearch;
    });
  }, [apps, statusFilter, search]);

  const summary = useMemo(() => {
    const total = apps.length;
    const byStatus = apps.reduce(
      (acc, a) => {
        const key = (a.status || "SUBMITTED").toUpperCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { SUBMITTED: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0, WITHDRAWN: 0 }
    );
    return { total, byStatus };
  }, [apps]);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    try {
      const res = await client.patch(`/applications/${id}/status`, { status });
      setApps((prev) => prev.map((app) => (app._id === id ? res.data : app)));
      setNotice("Status updated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Applications
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <TextField
          size="small"
          label="Search (property / applicant / notes)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220, maxWidth: 360 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`Total: ${summary.total}`} />
          <Chip label={`Submitted: ${summary.byStatus.SUBMITTED || 0}`} color="primary" />
          <Chip label={`Under review: ${summary.byStatus.UNDER_REVIEW || 0}`} color="info" />
          <Chip label={`Approved: ${summary.byStatus.APPROVED || 0}`} color="success" />
          <Chip label={`Rejected: ${summary.byStatus.REJECTED || 0}`} color="error" />
          <Chip label={`Withdrawn: ${summary.byStatus.WITHDRAWN || 0}`} />
        </Stack>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Applicant</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow key={app._id} hover>
                <TableCell>
                  {new Date(app.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{app.propertyId?.title || app.propertyId?._id}</TableCell>
                <TableCell>{app.userId?.email || app.userId?._id}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    disabled={busyId === app._id}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>{app.notes || "-"}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    component="a"
                    href={`/admin/applications/${app._id}/messages`}
                  >
                    Messages
                  </Button>
                </TableCell>
              <TableCell>
                {app.activity?.length
                  ? new Date(app.activity[app.activity.length - 1].at).toLocaleString()
                  : "—"}
              </TableCell>
            </TableRow>
            ))}
            {!filteredApps.length && (
              <TableRow>
                <TableCell colSpan={7}>No applications match the current filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3000}
        onClose={() => setNotice("")}
        message={notice}
      />
    </Container>
  );
};

export default AdminApplications;


