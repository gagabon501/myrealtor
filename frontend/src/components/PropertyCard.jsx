import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  CardMedia,
  CardActionArea,
  ImageList,
  ImageListItem,
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
  const rawImages = property.images;
  const images = Array.isArray(rawImages)
    ? rawImages
    : rawImages
    ? [rawImages]
    : [];
  const imageUrl = normalizeImageUrl(images[0]);
  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
      }}
    >
      {imageUrl && (
        <CardActionArea component="a" href={imageUrl} target="_blank" rel="noreferrer">
          <CardMedia
            component="img"
            sx={{ height: { xs: 180, md: 210 }, objectFit: "cover" }}
            image={imageUrl}
            alt={property.title}
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
      {property.description && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 40,
            }}
          >
            {property.description}
          </Typography>
        </Box>
      )}
      {images.length > 1 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <ImageList cols={{ xs: 3, sm: 3, md: 3 }} gap={8} sx={{ width: "100%" }}>
            {images.slice(1, 4).map((img, idx) => {
              const thumb = normalizeImageUrl(img);
              return (
                <ImageListItem
                  key={img + idx}
                  sx={{ overflow: "hidden", borderRadius: 1, border: "1px solid rgba(0,0,0,0.04)" }}
                >
                  <CardActionArea component="a" href={thumb} target="_blank" rel="noreferrer">
                    <img
                      src={thumb}
                      alt={`${property.title} thumbnail ${idx + 1}`}
                      loading="lazy"
                      style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }}
                    />
                  </CardActionArea>
                </ImageListItem>
              );
            })}
          </ImageList>
        </Box>
      )}
      {(onApply || canManage) && (
        <CardActions sx={{ mt: "auto" }}>
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
    </Card>
  );
};

export default PropertyCard;

