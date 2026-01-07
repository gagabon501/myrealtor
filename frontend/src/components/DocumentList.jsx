import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import client, { apiBase } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { REGISTRY } from "../constants/documentLibrary";

const normalizeUrl = (u) => {
  if (!u) return null;
  if (String(u).startsWith("http")) return u;
  // most backends store /uploads/... or uploads/...
  const cleaned = String(u).startsWith("/") ? u : `/${u}`;
  return `${apiBase}${cleaned}`;
};

const DocumentList = ({ module, ownerId, refreshKey = 0 }) => {
  const { user } = useAuth();
  const canManage = ["staff", "admin"].includes(user?.role);
  const userId = user?.id || user?._id;
  const isServiceModule = ["APPRAISAL", "TITLING", "CONSULTANCY"].includes(
    module || ""
  );
  const isPropertyRequest = module === "PROPERTY_REQUEST";

  const [docs, setDocs] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!module || !ownerId) return;
    setError("");
    setBusy(true);
    try {
      const params = { module, ownerId };
      const res = await client.get("/document-library", {
        params,
      });
      setDocs(Array.isArray(res.data) ? res.data : res.data?.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load documents");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, ownerId, refreshKey]);

  const handleDelete = async (docId) => {
    if (!canManage) return;
    if (!window.confirm("Delete this document?")) return;

    try {
      await client.delete(`/document-library/${docId}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete document");
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Uploaded documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Description is shown for every item.
            </Typography>
          </Box>

          {!!error && <Alert severity="error">{error}</Alert>}

          {busy && (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          )}

          {!busy && !docs.length && (
            <Typography variant="body2" color="text.secondary">
              No documents uploaded yet.
            </Typography>
          )}

          {!!docs.length && (
            <Stack spacing={1}>
              <Divider />
              {docs.map((d) => {
                const url = normalizeUrl(
                  d.url || d.path || d.fileUrl || d.filePath
                );
                const name =
                  d.originalName || d.filename || d.name || "Document";
                const desc = d.description || d.documentDescription || "";
                const cat = d.category || "DOCUMENT";

                return (
                  <Box
                    key={d._id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
                        <Chip size="small" label={cat} />
                        {d.label && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={d.label}
                          />
                        )}
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        <b>Description:</b> {desc || "—"}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                        {url && (
                          <Button
                            size="small"
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </Button>
                        )}
                        {(canManage ||
                          ((isServiceModule || isPropertyRequest) &&
                            userId &&
                            d.uploadedBy &&
                            String(d.uploadedBy) === String(userId))) && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(d._id)}
                          >
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DocumentList;
