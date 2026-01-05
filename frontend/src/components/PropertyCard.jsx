import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
} from "@mui/material";

const PropertyCard = ({ property, onApply }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{property.title}</Typography>
        <Typography color="text.secondary">{property.location}</Typography>
        <Typography sx={{ my: 1 }}>${property.price?.toLocaleString()}</Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={property.status} color="primary" size="small" />
        </Stack>
      </CardContent>
      {onApply ? (
        <CardActions>
          <Button size="small" onClick={() => onApply(property)}>
            Apply
          </Button>
        </CardActions>
      ) : null}
    </Card>
  );
};

export default PropertyCard;

