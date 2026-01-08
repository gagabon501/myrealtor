import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import client from "../api/client";
import { useNavigate } from "react-router-dom";
import { uploadDocuments } from "../api/documentLibraryApi";
import { MODULES } from "../constants/documentLibrary";

const CreateListingRequest = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const idemKeyRef = useRef(null);
  const submitLockRef = useRef(false);
  const [atsFiles, setAtsFiles] = useState([]);
  const [atsDescription, setAtsDescription] = useState("");
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoDescription, setPhotoDescription] = useState("");
  const [atsPreviews, setAtsPreviews] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const handleRemoveAts = (index) => {
    setAtsFiles((prev) => prev.filter((_, i) => i !== index));
    setAtsPreviews((prev) =>
      prev.filter((item, i) => {
        if (i === index) {
          URL.revokeObjectURL(item.url);
        }
        return i !== index;
      })
    );
  };

  const handleRemovePhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) =>
      prev.filter((item, i) => {
        if (i === index) {
          URL.revokeObjectURL(item.url);
        }
        return i !== index;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current || submitting) return;
    submitLockRef.current = true;
    // eslint-disable-next-line no-console
    console.log("[LR-FE] submit fired", Date.now());
    setError("");
    setSuccess(false);
    setLoading(true);
    setSubmitting(true);
    try {
      if (!idemKeyRef.current) {
        idemKeyRef.current = crypto.randomUUID();
      }
      const clientRequestId = idemKeyRef.current;
      const payload = {
        propertyDraft: {
          title,
          location,
          price: Number(price),
          description,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      };
      const createdRes = await client.post(
        "/listing-requests",
        { ...payload, clientRequestId },
        {
          headers: { "Idempotency-Key": idemKeyRef.current },
        }
      );
      const requestId = createdRes.data?._id;
      // upload ATS if provided
      if (atsFiles.length) {
        const fd = new FormData();
        fd.append("module", MODULES.PROPERTY_REQUEST);
        fd.append("ownerType", "PropertyListingRequest");
        fd.append("ownerId", requestId);
        fd.append("category", "ATTACHMENT");
        atsFiles.forEach((file) => {
          fd.append("files", file);
          fd.append("descriptions", atsDescription || file.name);
        });
        await uploadDocuments(fd);
      }
      // upload photos if provided
      if (photoFiles.length) {
        const fd = new FormData();
        fd.append("module", MODULES.PROPERTY_REQUEST);
        fd.append("ownerType", "PropertyListingRequest");
        fd.append("ownerId", requestId);
        fd.append("category", "PHOTO");
        photoFiles.slice(0, 4).forEach((file) => {
          fd.append("files", file);
          fd.append("descriptions", photoDescription || file.name);
        });
        await uploadDocuments(fd);
      }
      setSuccess(true);
      idemKeyRef.current = null;
      navigate("/sell/requests");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create listing request"
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
      setTimeout(() => {
        submitLockRef.current = false;
      }, 1500);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Create Listing Request
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Location"
            required
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextField
            label="Price"
            required
            fullWidth
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Authority to Sell (ATS) Document
            </Typography>
            <Button variant="outlined" component="label" sx={{ mr: 1 }}>
              Choose ATS file(s)
              <input
                hidden
                multiple
                type="file"
                onChange={(e) => {
                  const picked = Array.from(e.target.files || []);
                  setAtsFiles(picked);
                  setAtsPreviews(
                    picked.map((f) => ({
                      name: f.name,
                      url: URL.createObjectURL(f),
                    }))
                  );
                }}
              />
            </Button>
            <TextField
              label="ATS description (applied to all)"
              fullWidth
              sx={{ mt: 1 }}
              value={atsDescription}
              onChange={(e) => setAtsDescription(e.target.value)}
              required={atsFiles.length > 0}
            />
            {atsPreviews.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {atsPreviews.map((f, idx) => (
                  <Card key={f.url} variant="outlined">
                    <CardActionArea
                      component="a"
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <CardContent>
                        <Typography variant="body2" color="text.primary">
                          {f.name}
                        </Typography>
                        <Button
                          size="small"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleRemoveAts(idx);
                          }}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Photos (max 4)
            </Typography>
            <Button variant="outlined" component="label" sx={{ mr: 1 }}>
              Choose photos
              <input
                hidden
                multiple
                accept="image/*"
                type="file"
                onChange={(e) => {
                  const picked = Array.from(e.target.files || []).slice(0, 4);
                  setPhotoFiles(picked);
                  setPhotoPreviews(
                    picked.map((f) => ({
                      name: f.name,
                      url: URL.createObjectURL(f),
                    }))
                  );
                }}
              />
            </Button>
            <TextField
              label="Photo description (applied to all)"
              fullWidth
              sx={{ mt: 1 }}
              value={photoDescription}
              onChange={(e) => setPhotoDescription(e.target.value)}
              required={photoFiles.length > 0}
            />
            {photoPreviews.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                {photoPreviews.map((f, idx) => (
                  <Card
                    key={f.url}
                    variant="outlined"
                    sx={{ width: 120, borderRadius: 2, overflow: "hidden" }}
                  >
                    <CardActionArea
                      component="a"
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <CardContent sx={{ p: 0 }}>
                        <img
                          src={f.url}
                          alt={f.name}
                          style={{
                            width: "100%",
                            height: 90,
                            objectFit: "cover",
                          }}
                        />
                        <Button
                          size="small"
                          fullWidth
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || submitting}
          >
            {loading || submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </Stack>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Listing request submitted"
      />
    </Container>
  );
};

export default CreateListingRequest;
