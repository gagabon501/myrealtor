import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Box sx={{ background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #0f172a 100%)", color: "#fff" }}>
      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center" direction={{ xs: "column-reverse", md: "row" }}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="overline"
              sx={{ letterSpacing: 2, color: "rgba(255,255,255,0.7)", textAlign: { xs: "center", md: "left" } }}
            >
              MyRealtor PH
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2, textAlign: { xs: "center", md: "left" } }}
            >
              Discover, apply, and own property with confidence.
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "rgba(255,255,255,0.85)", mb: 4, textAlign: { xs: "center", md: "left" } }}
            >
              Seamless listings, secure applications, compliance tracking, and payments—purpose-built
              for the Philippine market.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { xs: "stretch", sm: "center" } }}>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/properties"
                size="large"
                fullWidth
                sx={{ maxWidth: { sm: 220 } }}
              >
                Browse properties
              </Button>
              <Button
                variant="contained"
                color="inherit"
                component={Link}
                to="/apply"
                size="large"
                fullWidth
                sx={{
                  maxWidth: { sm: 220 },
                  color: "#0f172a",
                  background: "linear-gradient(135deg, #ffffff, #e0e7ff)",
                  fontWeight: 700,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #e0e7ff, #ffffff)",
                  },
                }}
              >
                Start Application
              </Button>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 4, color: "rgba(255,255,255,0.8)", textAlign: { xs: "center", md: "left" } }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  End-to-end
                </Typography>
                <Typography variant="body2">From reservation to transfer</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Compliance-first
                </Typography>
                <Typography variant="body2">DHSUD, LRA, NHA workflows</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Secure
                </Typography>
                <Typography variant="body2">JWT auth, audit logs, RBAC</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6} sx={{ width: "100%" }}>
            <Card
              sx={{
                background: "#0b1224",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                  Featured workflow
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  How clients move from browsing to ownership
                </Typography>
                <Stack spacing={2}>
                  {[
                    { label: "Browse listings", desc: "Search by location, price, and status." },
                    { label: "Apply securely", desc: "Submit documents and reserve online." },
                    {
                      label: "Track compliance",
                      desc: "See DHSUD/LRA steps, approvals, and tasks in one place.",
                    },
                    { label: "Close and transfer", desc: "Audit trails, payments, and ownership transfer status." },
                  ].map((item) => (
                    <Stack
                      key={item.label}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ p: 1.5, borderRadius: 2, background: "rgba(255,255,255,0.04)" }}
                    >
                      <Chip label={item.label} color="secondary" size="small" />
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                        {item.desc}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ textAlign: "center", color: "rgba(255,255,255,0.7)", pb: 3 }}>
        <Typography variant="body2">© {new Date().getFullYear()} Gilberto Gabon. All rights reserved.</Typography>
      </Box>
    </Box>
  );
};

export default Home;

