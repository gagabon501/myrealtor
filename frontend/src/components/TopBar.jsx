import { AppBar, Toolbar, Typography, Button, Stack, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Box
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.08)",
            },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1d4ed8, #0f172a)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 800,
              letterSpacing: -0.5,
            }}
          >
            MR
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            MyRealtor PH
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: "wrap",
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Button component={Link} to="/properties">
            Properties
          </Button>
          <Button component={Link} to="/services">
            Services
          </Button>
          {user ? (
            <>
              <Button component={Link} to="/apply">
                Apply
              </Button>
              {["staff", "admin"].includes(user.role) && (
                <Button component={Link} to="/properties/new">
                  Add Property
                </Button>
              )}
              {["staff", "admin"].includes(user.role) && (
                <Button component={Link} to="/admin/inquiries">
                  Buyer Inquiries
                </Button>
              )}
              {user.role === "admin" && (
                <Button component={Link} to="/users">
                  Users
                </Button>
              )}
              <Button component={Link} to="/dashboard">
                Dashboard
              </Button>
              {["staff", "admin"].includes(user.role) && (
                <Button component={Link} to="/staff">
                  Staff
                </Button>
              )}
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login">
                Login
              </Button>
              <Button variant="contained" component={Link} to="/register">
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;

