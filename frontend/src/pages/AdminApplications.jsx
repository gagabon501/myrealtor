import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import client from "../api/client";

const STATUS_OPTIONS = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"];

const AdminApplications = () => {
  const [apps, setApps] = useState([]);
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
            {apps.map((app) => (
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
            {!apps.length && (
              <TableRow>
                <TableCell colSpan={5}>No applications found.</TableCell>
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


