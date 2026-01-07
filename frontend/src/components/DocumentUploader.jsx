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

// Uploader requires a non-empty description for each file before submit.
// Posts to /document-library with module/ownerType/ownerId/category, descriptions, labels (optional), files.
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
  Container,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Grid,
} from "@mui/material";
import client from "../api/client";

const DocumentUploader = () => {
  const [moduleValue, setModuleValue] = useState("");
  const [ownerType, setOwnerType] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [labels, setLabels] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFileChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    setFiles(fileList);
    setDescriptions(fileList.map(() => ""));
    setLabels(fileList.map(() => ""));
  };

  const updateDescription = (idx, value) => {
    const next = [...descriptions];
    next[idx] = value;
    setDescriptions(next);
  };

  const updateLabel = (idx, value) => {
    const next = [...labels];
    next[idx] = value;
    setLabels(next);
  };

  const canSubmit =
    moduleValue &&
    ownerType &&
    ownerId &&
    files.length > 0 &&
    descriptions.length === files.length &&
    descriptions.every((d) => d && d.trim().length > 0) &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("module", moduleValue);
      formData.append("ownerType", ownerType);
      formData.append("ownerId", ownerId);
      if (category) formData.append("category", category);
      files.forEach((file) => formData.append("files", file));
      descriptions.forEach((desc) => formData.append("descriptions", desc));
      labels.forEach((label) => {
        if (label && label.trim()) formData.append("labels", label);
      });
      await client.post("/documents/library", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Documents uploaded successfully");
      setFiles([]);
      setDescriptions([]);
      setLabels([]);
      setModuleValue("");
      setOwnerType("");
      setOwnerId("");
      setCategory("");
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload documents");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Upload Documents
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Module"
                value={moduleValue}
                onChange={(e) => setModuleValue(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Owner Type"
                value={ownerType}
                onChange={(e) => setOwnerType(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Owner ID"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category (optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
          <Button variant="outlined" component="label">
            Select Files
            <input type="file" multiple hidden onChange={onFileChange} />
          </Button>
          {files.length > 0 && (
            <Stack spacing={2}>
              {files.map((file, idx) => (
                <Box
                  key={file.name + idx}
                  sx={{ border: "1px solid #e0e0e0", p: 2, borderRadius: 1 }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </Typography>
                  <TextField
                    label="Description *"
                    value={descriptions[idx] || ""}
                    onChange={(e) => updateDescription(idx, e.target.value)}
                    required
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Label (optional)"
                    value={labels[idx] || ""}
                    onChange={(e) => updateLabel(idx, e.target.value)}
                    fullWidth
                  />
                </Box>
              ))}
            </Stack>
          )}
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </Stack>
      </Box>
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

