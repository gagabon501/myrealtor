import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Box,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Badge from "@mui/material/Badge";
import { fetchUnreadCount } from "../api/notificationsApi";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ALLOWED_ROLES = ["user", "staff", "admin"];

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const rawRole = user?.role;
  const normalizedRole = rawRole ? String(rawRole).toLowerCase() : "public";
  const role = normalizedRole === "client" ? "user" : normalizedRole;
  const isAuthed = !!user;
  const isPublic = !isAuthed || role === "public";
  const isClient = role === "user";
  const isCompany = role === "staff" || role === "admin";
  const showServices = isPublic || isClient;
  const [unread, setUnread] = useState(0);
  const [servicesAnchor, setServicesAnchor] = useState(null);
  if (isAuthed && !rawRole) {
    // eslint-disable-next-line no-console
    console.warn("TopBar: user is logged in but role missing", user);
  }

  useEffect(() => {
    if (!isAuthed) return;
    if (!ALLOWED_ROLES.includes(role)) {
      console.warn("TopBar: invalid role, logging out", user);
      logout();
      window.alert("Session invalid. Please log in again.");
      navigate("/login", { replace: true });
    }
  }, [isAuthed, role, logout, navigate, user]);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const res = await fetchUnreadCount();
        setUnread(res.data?.count || 0);
      } catch {
        /* ignore */
      }
    };
    if (isAuthed) loadCount();
  }, [isAuthed]);

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
            alignItems: "center",
            rowGap: 1,
          }}
        >
          <Button component={Link} to="/properties">Properties</Button>
          {showServices && (
            <>
              <Button
                onClick={(e) => setServicesAnchor(e.currentTarget)}
                endIcon={<ExpandMoreIcon />}
              >
                Services
              </Button>
              <Menu
                anchorEl={servicesAnchor}
                open={Boolean(servicesAnchor)}
                onClose={() => setServicesAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    setServicesAnchor(null);
                    navigate("/sell/requests");
                  }}
                >
                  Brokerage
                </MenuItem>
                <MenuItem onClick={() => setServicesAnchor(null)}>Property Appraisal</MenuItem>
                <MenuItem onClick={() => setServicesAnchor(null)}>Land Titling & Transfer</MenuItem>
                <MenuItem onClick={() => setServicesAnchor(null)}>Consultancy</MenuItem>
              </Menu>
            </>
          )}
          {isClient && (
            <>
              <Button component={Link} to="/dashboard">Dashboard</Button>
              <Button component={Link} to="/sell/requests">My Selling</Button>
            </>
          )}
          {isCompany && (
            <>
              <Button component={Link} to="/staff">Staff</Button>
              <Button component={Link} to="/staff/listing-requests">Listing Requests</Button>
              <Button component={Link} to="/properties/new">Add Property</Button>
              <Button component={Link} to="/admin/inquiries">Buyer Inquiries</Button>
              <Button component={Link} to="/applications">Applications</Button>
              {role === "admin" && (
                <Button component={Link} to="/users">Users</Button>
              )}
              <Button component={Link} to="/dashboard">Dashboard</Button>
            </>
          )}
          {isAuthed && (
            <Button
              component={Link}
              to="/notifications"
              startIcon={
                <Badge color="error" badgeContent={unread} invisible={unread === 0}>
                  <NotificationsNoneIcon />
                </Badge>
              }
            >
              Notifications
            </Button>
          )}
          {isAuthed && (
            <Chip
              variant="outlined"
              color="primary"
              size="small"
              label={`Signed in as ${user?.profile?.fullName || user?.email || "user"} • ${role}`}
              sx={{ maxWidth: { xs: "100%", md: 360 } }}
            />
          )}
          {isPublic && (
            <>
              <Button component={Link} to="/login">
                Login
              </Button>
              <Button variant="contained" component={Link} to="/register">
                Sign Up
              </Button>
            </>
          )}
          {isAuthed && (
            <Button onClick={handleLogout}>Logout</Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;

