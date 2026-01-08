import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import DocumentUploader from "./DocumentUploader";
import DocumentList from "./DocumentList";
import { MODULES, OWNER_TYPES, CATEGORIES } from "../constants/documentLibrary";

const ListingRequestDocumentsDialog = ({
  open,
  onClose,
  listingRequestId,
  title,
  mode = "client",
  categories: categoriesProp,
  defaultCategory,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const categories = categoriesProp || [CATEGORIES.PROPERTY_REQUEST[0]]; // ATTACHMENT
  const bumpRefresh = () => setRefreshKey((v) => v + 1);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title || "Authority to Sell Documents"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {mode === "client" && (
            <Typography variant="body2" color="text.secondary">
              Upload your Authority to Sell (ATS) document (category: ATTACHMENT). This is required
              for approval.
            </Typography>
          )}
          <DocumentUploader
            module={MODULES.PROPERTY_REQUEST}
            ownerType={OWNER_TYPES.PROPERTY_REQUEST}
            ownerId={listingRequestId}
            categories={categories}
            defaultCategory={defaultCategory || categories[0]}
            onUploaded={bumpRefresh}
          />
          <DocumentList
            module={MODULES.PROPERTY_REQUEST}
            ownerId={listingRequestId}
            ownerType={OWNER_TYPES.PROPERTY_REQUEST}
            categories={categories}
            refreshKey={refreshKey}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ListingRequestDocumentsDialog;


