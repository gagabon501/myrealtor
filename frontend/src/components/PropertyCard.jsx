import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  CardMedia,
  CardActionArea,
} from "@mui/material";
import { apiBase } from "../api/client";

const normalizeImageUrl = (image) => {
  if (!image) return null;
  let cleaned = image.replace(/\\/g, "/");
  const uploadsIndex = cleaned.indexOf("/uploads/");
  if (uploadsIndex > -1) cleaned = cleaned.slice(uploadsIndex);
  if (!cleaned.startsWith("/uploads/") && !cleaned.startsWith("http")) {
    cleaned = `/uploads/${cleaned.replace(/^\/?/, "")}`;
  }
  if (cleaned.startsWith("http")) return cleaned;
  return `${apiBase}${cleaned}`;
};

const PropertyCard = ({ property, onApply, onEdit, onDelete, canManage }) => {
  const images = property.images || [];
  const imageUrl = normalizeImageUrl(images[0]);
  return (
    <Card variant="outlined">
      {imageUrl && (
        <CardActionArea component="a" href={imageUrl} target="_blank" rel="noreferrer">
          <CardMedia
            component="img"
            height="160"
            image={imageUrl}
            alt={property.title}
            sx={{ objectFit: "cover" }}
          />
        </CardActionArea>
      )}
      <CardContent>
        <Typography variant="h6">{property.title}</Typography>
        <Typography color="text.secondary">{property.location}</Typography>
        <Typography sx={{ my: 1 }}>₱{property.price?.toLocaleString()}</Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={property.status} color="primary" size="small" />
        </Stack>
      </CardContent>
      {(onApply || canManage) && (
        <CardActions>
          {onApply && (
            <Button size="small" onClick={() => onApply(property)}>
              Apply
            </Button>
          )}
          {canManage && (
            <>
              <Button size="small" onClick={() => onEdit?.(property)}>
                Edit
              </Button>
              <Button size="small" color="error" onClick={() => onDelete?.(property)}>
                Delete
              </Button>
            </>
          )}
        </CardActions>
      )}
      {images.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ p: 1, pt: 0, flexWrap: "wrap" }}>
          {images.slice(1, 4).map((img, idx) => {
            const thumb = normalizeImageUrl(img);
            return (
              <CardActionArea
                key={img + idx}
                component="a"
                href={thumb}
                target="_blank"
                rel="noreferrer"
                sx={{ width: 72 }}
              >
                <CardMedia
                  component="img"
                  height="56"
                  image={thumb}
                  alt={`${property.title} thumbnail ${idx + 1}`}
                  sx={{ objectFit: "cover", borderRadius: 1 }}
                />
              </CardActionArea>
            );
          })}
        </Stack>
      )}
    </Card>
  );
};

export default PropertyCard;

