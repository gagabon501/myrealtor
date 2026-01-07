import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Container,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import client, { apiBase } from "../api/client";
import { useAuth } from "../context/AuthContext";

const DocumentList = ({ module, ownerId }) => {
  const { user } = useAuth();
  const canDelete = user && ["staff", "admin"].includes(user.role);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchDocs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { module, ownerId };
      const res = await client.get("/documents/library", { params });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (module && ownerId) {
      fetchDocs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, ownerId]);

  const handleDelete = async (id) => {
    const prev = rows;
    setRows((cur) => cur.filter((r) => r._id !== id));
    try {
      await client.delete(`/documents/library/${id}`);
      setSuccess("Document deleted");
    } catch (err) {
      setRows(prev);
      setError(err.response?.data?.message || "Failed to delete document");
    }
  };

  const fileUrl = (path) => {
    if (!path) return "#";
    if (path.startsWith("http")) return path;
    return `${apiBase}${path}`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Documents
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
              <TableCell>Description</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>File</TableCell>
              {canDelete && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell sx={{ maxWidth: 240 }}>
                  <Typography variant="body2">{row.description}</Typography>
                </TableCell>
                <TableCell>{row.label || "—"}</TableCell>
                <TableCell>{row.category || "—"}</TableCell>
                <TableCell>
                  <a href={fileUrl(row.filePath)} target="_blank" rel="noreferrer">
                    View
                  </a>
                </TableCell>
                {canDelete && (
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={canDelete ? 5 : 4}>
                  <Typography variant="body2" color="text.secondary">
                    No documents found.
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

export default DocumentList;
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const DocumentList = ({ module, ownerId, ownerType, category }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const canDelete = user && ["staff", "admin"].includes(user.role);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/document-library", {
        params: { module, ownerId, ownerType, category },
      });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (module && ownerId) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, ownerId, ownerType, category]);

  const handleDelete = async (id) => {
    try {
      await client.delete(`/document-library/${id}`);
      setRows((prev) => prev.filter((r) => r._id !== id));
      setSuccess("Document deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete document");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Created</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Label</TableCell>
            <TableCell>File</TableCell>
            {canDelete && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row._id}>
              <TableCell>
                {new Date(row.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.label || "—"}</TableCell>
              <TableCell>
                {row.originalName || row.filePath?.split("/").pop() || "—"}
              </TableCell>
              {canDelete && (
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(row._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
          {!rows.length && (
            <TableRow>
              <TableCell colSpan={canDelete ? 5 : 4}>
                <Typography variant="body2" color="text.secondary">
                  No documents found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
    </Box>
  );
};

export default DocumentList;

