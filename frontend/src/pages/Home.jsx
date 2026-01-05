import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Container sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Real Property Management for the Philippines
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Browse listings, submit applications, upload documents, and track your journey from
          reservation to transfer of ownership.
        </Typography>
        <Button variant="contained" component={Link} to="/properties" size="large">
          Browse Properties
        </Button>
      </Box>
    </Container>
  );
};

export default Home;

