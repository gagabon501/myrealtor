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
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import { apiBase } from "../api/client";
import { useAuth } from "../context/AuthContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageIcon from "@mui/icons-material/Image";

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

const PropertyCard = ({
  property,
  onEdit,
  onDelete,
  canManage,
  onPublish,
  onUnpublish,
  onReserve,
  onSold,
  onWithdraw,
  onInterested,
  onApply,
  isInterested = false,
}) => {
  const { user } = useAuth();
  const rawImages = property.images;
  const images = Array.isArray(rawImages)
    ? rawImages
    : rawImages
    ? [rawImages]
    : [];
  const imageUrl = normalizeImageUrl(images[0]);
  const statusUpper = String(property.status || "DRAFT").toUpperCase();
  const published = property.published || statusUpper === "PUBLISHED";
  const actionableApply = published && statusUpper === "PUBLISHED";
  const actionableInterested =
    published && statusUpper !== "RESERVED" && statusUpper !== "SOLD";
  const role = user?.role ? String(user.role).toLowerCase() : "public";
  const isClient = role === "user";
  const canApply = isClient;

  const statusConfig = {
    PUBLISHED: { label: "Available", color: "success", bg: "linear-gradient(135deg, #10b981, #059669)" },
    RESERVED: { label: "Reserved", color: "warning", bg: "linear-gradient(135deg, #f59e0b, #d97706)" },
    SOLD: { label: "Sold", color: "error", bg: "linear-gradient(135deg, #ef4444, #dc2626)" },
    DRAFT: { label: "Draft", color: "default", bg: "linear-gradient(135deg, #64748b, #475569)" },
    WITHDRAWN: { label: "Withdrawn", color: "default", bg: "linear-gradient(135deg, #64748b, #475569)" },
    AVAILABLE: { label: "Available", color: "success", bg: "linear-gradient(135deg, #10b981, #059669)" },
    UNDER_NEGOTIATION: { label: "Under Negotiation", color: "info", bg: "linear-gradient(135deg, #6366f1, #4f46e5)" },
    ARCHIVED: { label: "Archived", color: "default", bg: "linear-gradient(135deg, #64748b, #475569)" },
  };

  const status = statusConfig[statusUpper] || { label: statusUpper, color: "default", bg: "#64748b" };

  const formatPrice = (price) => {
    if (!price) return "Price on Request";
    if (price >= 1000000) {
      return `₱${(price / 1000000).toFixed(1)}M`;
    }
    return `₱${price.toLocaleString()}`;
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        background: "#fff",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          borderColor: "#0ea5e9",
          boxShadow: "0 20px 40px rgba(14, 165, 233, 0.15)",
          transform: "translateY(-8px)",
          "& .property-image": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      {/* Image Section */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        {imageUrl ? (
          <CardActionArea
            component="a"
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
          >
            <CardMedia
              component="img"
              className="property-image"
              sx={{
                height: { xs: 200, md: 220 },
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
              image={imageUrl}
              alt={property.title}
            />
          </CardActionArea>
        ) : (
          <Box
            sx={{
              height: { xs: 200, md: 220 },
              background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageIcon sx={{ fontSize: 64, color: "#cbd5e1" }} />
          </Box>
        )}

        {/* Status Badge */}
        <Chip
          label={status.label}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            background: status.bg,
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.75rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        />

        {/* Price Tag */}
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            right: 12,
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(8px)",
            borderRadius: 2,
            px: 2,
            py: 0.75,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: "#fff",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {formatPrice(property.price)}
          </Typography>
        </Box>

        {/* Image Count Badge */}
        {images.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(8px)",
              borderRadius: 1.5,
              px: 1.5,
              py: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <ImageIcon sx={{ fontSize: 16, color: "#fff" }} />
            <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }}>
              {images.length}
            </Typography>
          </Box>
        )}

        {/* Interest Button - Floating */}
        {isInterested && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
            }}
          >
            <Chip
              icon={<FavoriteIcon sx={{ fontSize: 16 }} />}
              label="Interested"
              size="small"
              sx={{
                background: "linear-gradient(135deg, #ec4899, #db2777)",
                color: "#fff",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "#fff" },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            mb: 0.5,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {property.title}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
          <LocationOnIcon sx={{ fontSize: 16, color: "#64748b" }} />
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {property.location}
          </Typography>
        </Stack>

        {/* Property Features */}
        {(property.bedrooms || property.bathrooms || property.area) && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              mb: 2,
              p: 1.5,
              background: "#f8fafc",
              borderRadius: 2,
            }}
          >
            {property.bedrooms && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <BedIcon sx={{ fontSize: 18, color: "#0ea5e9" }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                  {property.bedrooms}
                </Typography>
              </Stack>
            )}
            {property.bathrooms && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <BathtubIcon sx={{ fontSize: 18, color: "#0ea5e9" }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                  {property.bathrooms}
                </Typography>
              </Stack>
            )}
            {property.area && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <SquareFootIcon sx={{ fontSize: 18, color: "#0ea5e9" }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                  {property.area} sqm
                </Typography>
              </Stack>
            )}
          </Stack>
        )}

        {/* Description */}
        {property.description && (
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              lineHeight: 1.6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {property.description}
          </Typography>
        )}

        {/* Tags */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, gap: 0.5 }}>
          {property.earnestMoneyRequired && (
            <Chip
              label="Earnest Money"
              size="small"
              sx={{
                background: "rgba(245, 158, 11, 0.1)",
                color: "#d97706",
                fontWeight: 500,
                fontSize: "0.7rem",
              }}
            />
          )}
          {property.type && (
            <Chip
              label={property.type}
              size="small"
              sx={{
                background: "rgba(14, 165, 233, 0.1)",
                color: "#0284c7",
                fontWeight: 500,
                fontSize: "0.7rem",
              }}
            />
          )}
        </Stack>
      </CardContent>

      {/* Actions Section */}
      <Divider />
      <CardActions sx={{ p: 2, background: "#fafafa" }}>
        {canManage ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ width: "100%", gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit?.(property)}
                sx={{
                  bgcolor: "rgba(14, 165, 233, 0.1)",
                  color: "#0ea5e9",
                  "&:hover": { bgcolor: "rgba(14, 165, 233, 0.2)" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete?.(property)}
                sx={{
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {statusUpper === "DRAFT" && (
              <Button
                size="small"
                onClick={() => onPublish?.(property)}
                startIcon={<VisibilityIcon />}
                sx={{
                  ml: "auto",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  "&:hover": { background: "linear-gradient(135deg, #34d399, #10b981)" },
                }}
              >
                Publish
              </Button>
            )}

            {statusUpper === "PUBLISHED" && (
              <>
                <Button size="small" onClick={() => onReserve?.(property)} sx={{ fontSize: "0.75rem" }}>
                  Reserve
                </Button>
                <Button size="small" onClick={() => onSold?.(property)} sx={{ fontSize: "0.75rem" }}>
                  Mark Sold
                </Button>
                <IconButton
                  size="small"
                  onClick={() => onUnpublish?.(property)}
                  sx={{ bgcolor: "rgba(100, 116, 139, 0.1)", color: "#64748b" }}
                >
                  <VisibilityOffIcon fontSize="small" />
                </IconButton>
              </>
            )}

            {statusUpper === "RESERVED" && (
              <>
                <Button size="small" onClick={() => onSold?.(property)} sx={{ fontSize: "0.75rem" }}>
                  Mark Sold
                </Button>
                <Button size="small" onClick={() => onUnpublish?.(property)} sx={{ fontSize: "0.75rem" }}>
                  Unpublish
                </Button>
              </>
            )}

            {statusUpper !== "SOLD" && statusUpper !== "WITHDRAWN" && (
              <Button
                size="small"
                onClick={() => onWithdraw?.(property)}
                sx={{ fontSize: "0.75rem", color: "text.secondary" }}
              >
                Withdraw
              </Button>
            )}
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            {!isInterested && actionableInterested && onInterested && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onInterested(property)}
                startIcon={<FavoriteBorderIcon />}
                sx={{
                  borderColor: "#ec4899",
                  color: "#ec4899",
                  "&:hover": {
                    borderColor: "#db2777",
                    background: "rgba(236, 72, 153, 0.05)",
                  },
                }}
              >
                Interested
              </Button>
            )}

            {onApply && canApply && (
              <Button
                size="small"
                variant="contained"
                onClick={() => onApply(property)}
                disabled={!actionableApply}
                sx={{
                  ml: "auto",
                  background: actionableApply
                    ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                    : "#e2e8f0",
                  color: actionableApply ? "#fff" : "#94a3b8",
                  "&:hover": {
                    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  },
                }}
              >
                {actionableApply ? "Apply Now" : status.label}
              </Button>
            )}
          </Stack>
        )}
      </CardActions>

      {!canManage && !actionableInterested && !isInterested && (
        <Box
          sx={{
            px: 2,
            py: 1,
            background: "rgba(100, 116, 139, 0.05)",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            This listing is not accepting inquiries at this time.
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default PropertyCard;
