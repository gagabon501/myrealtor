import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DocumentUploader from "../components/DocumentUploader";
import DocumentList from "../components/DocumentList";
import { MODULES, REGISTRY } from "../constants/documentLibrary";

const SERVICE_MODULES = [
  MODULES.APPRAISAL,
  MODULES.TITLING,
  MODULES.CONSULTANCY,
];

const MyServiceDocuments = () => {
  const [module, setModule] = useState(MODULES.APPRAISAL);
  const [ownerId, setOwnerId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const categories = REGISTRY[module]?.categories || ["ATTACHMENT", "PHOTO"];

  const onUploaded = () => setRefreshKey((k) => k + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!module || !ownerId.trim()) {
      setError("Module and Service Request ID are required");
      return;
    }
    setError("");
    setRefreshKey((k) => k + 1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        My Service Documents
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            select
            label="Service Module"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            fullWidth
          >
            {SERVICE_MODULES.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Service Request ID"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained">
            Load Documents
          </Button>
        </Stack>
      </Box>

      {module && ownerId && (
        <Stack spacing={2}>
          <DocumentUploader
            module={module}
            ownerType="User"
            ownerId={ownerId}
            categories={categories}
            defaultCategory={categories[0]}
            onUploaded={onUploaded}
          />
          <DocumentList module={module} ownerId={ownerId} refreshKey={refreshKey} />
        </Stack>
      )}
    </Container>
  );
};

export default MyServiceDocuments;

