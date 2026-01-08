import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import client from "../api/client";
import { REGISTRY } from "../constants/documentLibrary";

const DocumentUploader = ({
  module,
  ownerType,
  ownerId,
  categories,
  defaultCategory,
  onUploaded,
}) => {
  const derivedCategories = categories ||
    REGISTRY[module]?.categories || ["ATTACHMENT", "PHOTO"];
  const [category, setCategory] = useState(
    defaultCategory || derivedCategories[0] || ""
  );
  const [files, setFiles] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [labels, setLabels] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!module || !ownerType || !ownerId) return false;
    if (!files.length) return false;
    if (descriptions.length !== files.length) return false;
    return descriptions.every((d) => String(d || "").trim().length > 0);
  }, [module, ownerType, ownerId, files, descriptions]);

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
    setDescriptions(picked.map(() => ""));
    setLabels(picked.map(() => ""));
    setError("");
  };

  const setDescAt = (idx, val) => {
    setDescriptions((prev) => prev.map((v, i) => (i === idx ? val : v)));
  };

  const setLabelAt = (idx, val) => {
    setLabels((prev) => prev.map((v, i) => (i === idx ? val : v)));
  };

  const removeFileAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setDescriptions((prev) => prev.filter((_, i) => i !== idx));
    setLabels((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    setError("");
    if (!canSubmit) {
      setError("Please attach files and provide a description for each file.");
      return;
    }

    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("module", module);
      fd.append("ownerType", ownerType);
      fd.append("ownerId", ownerId);
      if (category) fd.append("category", category);

      files.forEach((file, idx) => {
        fd.append("files", file);
        fd.append("descriptions", descriptions[idx]);
        if (labels[idx]) fd.append("labels", labels[idx]);
      });

      const token = localStorage.getItem("token");
      const res = await client.post("/document-library", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // backend may return array of docs or {documents: []}
      const docs = Array.isArray(res.data)
        ? res.data
        : res.data?.documents || [];
      onUploaded?.(docs);

      // reset
      setFiles([]);
      setDescriptions([]);
      setLabels([]);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Upload documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A description is required for every uploaded file.
            </Typography>
          </Box>

          {!!error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {derivedCategories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <Button variant="outlined" component="label">
              Choose files
              <input hidden multiple type="file" onChange={onPickFiles} />
            </Button>

            <Button
              variant="contained"
              disabled={!canSubmit || busy}
              onClick={handleUpload}
            >
              {busy ? "Uploading..." : "Upload"}
            </Button>
          </Stack>

          {!!files.length && (
            <Stack spacing={1.5}>
              <Divider />
              {files.map((f, idx) => (
                <Box
                  key={`${f.name}-${idx}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {f.name}
                    </Typography>

                    <TextField
                      fullWidth
                      required
                      label="Document description (required)"
                      value={descriptions[idx] || ""}
                      onChange={(e) => setDescAt(idx, e.target.value)}
                    />

                    <TextField
                      fullWidth
                      label="Label (optional)"
                      value={labels[idx] || ""}
                      onChange={(e) => setLabelAt(idx, e.target.value)}
                    />

                    <Box>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => removeFileAt(idx)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;
