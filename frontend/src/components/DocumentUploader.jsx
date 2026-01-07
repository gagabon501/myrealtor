import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import client from "../api/client";

// Single DocumentUploader component. Requires description per file; posts to /document-library.
const DocumentUploader = ({
  module,
  ownerType,
  ownerId,
  category,
  onUploaded,
  maxFiles = 20,
}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles);
    setEntries(
      files.map((file) => ({
        file,
        description: "",
        label: "",
      }))
    );
  };

  const updateEntry = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry))
    );
  };

  const canSubmit =
    module &&
    ownerType &&
    ownerId &&
    entries.length > 0 &&
    entries.every((e) => e.description && e.description.trim().length > 0) &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("module", module);
      formData.append("ownerType", ownerType);
      formData.append("ownerId", ownerId);
      if (category) formData.append("category", category);
      entries.forEach((entry) => {
        formData.append("descriptions", entry.description.trim());
        if (entry.label && entry.label.trim()) {
          formData.append("labels", entry.label.trim());
        }
        formData.append("files", entry.file);
      });
      await client.post("/document-library", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Documents uploaded");
      setEntries([]);
      onUploaded?.();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Box>
          <Button variant="outlined" component="label">
            Select files
            <input
              hidden
              type="file"
              multiple
              onChange={handleFilesChange}
              accept="*/*"
            />
          </Button>
          <Typography variant="caption" sx={{ ml: 1 }}>
            Up to {maxFiles} files
          </Typography>
        </Box>
        {entries.map((entry, idx) => (
          <Box
            key={`${entry.file.name}-${idx}`}
            sx={{
              p: 1.5,
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {entry.file.name} ({Math.round(entry.file.size / 1024)} KB)
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField
                label="Description (required)"
                value={entry.description}
                onChange={(e) => updateEntry(idx, "description", e.target.value)}
                required
              />
              <TextField
                label="Label (optional)"
                value={entry.label}
                onChange={(e) => updateEntry(idx, "label", e.target.value)}
              />
            </Stack>
          </Box>
        ))}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Button type="submit" variant="contained" disabled={!canSubmit}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </Stack>
      <Snackbar
        open={!!success}
        autoHideDuration={2500}
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

export default DocumentUploader;
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import client from "../api/client";

const DocumentUploader = ({
  module,
  ownerType,
  ownerId,
  category,
  onUploaded,
  maxFiles = 20,
}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setEntries(
      files.map((file) => ({
        file,
        description: "",
        label: file.name,
      }))
    );
  };

  const updateEntry = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry))
    );
  };

  const canSubmit =
    entries.length > 0 &&
    entries.every((e) => e.description && e.description.trim().length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("module", module);
      formData.append("ownerType", ownerType);
      formData.append("ownerId", ownerId);
      if (category) formData.append("category", category);
      entries.forEach((entry) => {
        formData.append("descriptions", entry.description.trim());
        if (entry.label && entry.label.trim()) {
          formData.append("labels", entry.label.trim());
        }
        formData.append("files", entry.file);
      });
      await client.post("/document-library", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Documents uploaded");
      setEntries([]);
      onUploaded?.();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Box>
          <Button variant="outlined" component="label">
            Select files
            <input
              hidden
              type="file"
              multiple
              onChange={handleFilesChange}
              accept="*/*"
            />
          </Button>
          <Typography variant="caption" sx={{ ml: 1 }}>
            Up to {maxFiles} files
          </Typography>
        </Box>
        {entries.map((entry, idx) => (
          <Box
            key={`${entry.file.name}-${idx}`}
            sx={{
              p: 1.5,
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {entry.file.name}
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField
                label="Description (required)"
                value={entry.description}
                onChange={(e) => updateEntry(idx, "description", e.target.value)}
                required
              />
              <TextField
                label="Label (optional)"
                value={entry.label}
                onChange={(e) => updateEntry(idx, "label", e.target.value)}
              />
            </Stack>
          </Box>
        ))}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </Stack>
      <Snackbar
        open={!!success}
        autoHideDuration={2500}
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

export default DocumentUploader;

