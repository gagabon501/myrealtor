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
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Badge from "@mui/material/Badge";
import { fetchUnreadCount } from "../api/notificationsApi";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SellIcon from "@mui/icons-material/Sell";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import WorkIcon from "@mui/icons-material/Work";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HandshakeIcon from "@mui/icons-material/Handshake";
import GavelIcon from "@mui/icons-material/Gavel";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EventIcon from "@mui/icons-material/Event";
import GoshenLogo from "../assets/Goshen_Realty_Logo.svg";

const ALLOWED_ROLES = ["user", "staff", "admin"];

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isAuthed && !rawRole) {
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
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavButton = ({ to, children, icon }) => (
    <Button
      component={Link}
      to={to}
      startIcon={icon}
      sx={{
        color: isActive(to) ? "primary.main" : "text.secondary",
        fontWeight: isActive(to) ? 700 : 500,
        position: "relative",
        px: 2,
        "&::after": isActive(to) ? {
          content: '""',
          position: "absolute",
          bottom: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 24,
          height: 3,
          borderRadius: 2,
          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
        } : {},
        "&:hover": {
          color: "primary.main",
          backgroundColor: "rgba(14, 165, 233, 0.08)",
        },
      }}
    >
      {children}
    </Button>
  );

  const serviceMenuItems = [
    { label: "Brokerage", path: "/sell/requests", icon: <HandshakeIcon fontSize="small" /> },
    { label: "Property Appraisal", path: "/services", icon: <AssessmentIcon fontSize="small" /> },
    { label: "Land Titling & Transfer", path: "/services", icon: <GavelIcon fontSize="small" /> },
    { label: "Consultancy", path: "/services", icon: <SupportAgentIcon fontSize="small" /> },
  ];

  const mobileDrawer = (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          borderLeft: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
          Menu
        </Typography>
        <IconButton onClick={() => setMobileOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {isAuthed && (
        <Box sx={{ p: 2, background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", mx: 2, my: 1, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }}>
              {(user?.profile?.fullName || user?.email || "U")[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600 }}>
                {user?.profile?.fullName || user?.email || "User"}
              </Typography>
              <Chip
                label={role.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: "0.65rem",
                  height: 20,
                }}
              />
            </Box>
          </Stack>
        </Box>
      )}

      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/properties" onClick={() => setMobileOpen(false)}>
            <ListItemIcon><ApartmentIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Properties" />
          </ListItemButton>
        </ListItem>

        {showServices && serviceMenuItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        {isClient && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/sell/requests" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><SellIcon color="primary" /></ListItemIcon>
                <ListItemText primary="My Selling" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {isCompany && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="overline" sx={{ px: 2, color: "text.secondary" }}>
              Staff Tools
            </Typography>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/staff" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><WorkIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Staff Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/staff/listing-requests" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Listing Requests" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/staff/appointments" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Appointments" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/properties/new" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><AddCircleIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Add Property" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/inquiries" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><ContactMailIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Buyer Inquiries" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/applications" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Applications" />
              </ListItemButton>
            </ListItem>
            {role === "admin" && (
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/users" onClick={() => setMobileOpen(false)}>
                  <ListItemIcon><PeopleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Users" />
                </ListItemButton>
              </ListItem>
            )}
          </>
        )}

        {isAuthed && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/notifications" onClick={() => setMobileOpen(false)}>
              <ListItemIcon>
                <Badge color="error" badgeContent={unread} invisible={unread === 0}>
                  <NotificationsNoneIcon color="primary" />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItemButton>
          </ListItem>
        )}

        <Divider sx={{ my: 1 }} />

        {isPublic ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><LoginIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/register"
                onClick={() => setMobileOpen(false)}
                sx={{
                  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                  borderRadius: 2,
                  mx: 1,
                  "&:hover": { background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)" },
                }}
              >
                <ListItemIcon><PersonAddIcon sx={{ color: "#fff" }} /></ListItemIcon>
                <ListItemText primary="Sign Up" sx={{ "& .MuiTypography-root": { color: "#fff", fontWeight: 600 } }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Logout" sx={{ "& .MuiTypography-root": { color: "error.main" } }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled
            ? "rgba(255, 255, 255, 0.85)"
            : "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid",
          borderColor: scrolled ? "divider" : "transparent",
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
            py: scrolled ? 0.5 : 1,
            transition: "padding 0.3s ease",
          }}
        >
          {/* Logo */}
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
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
          >
            <Box
              component={Link}
              to="/"
              sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}
            >
              <img
                src={GoshenLogo}
                alt="Goshen Realty"
                style={{
                  height: 48,
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
              }}
            >
              <NavButton to="/properties" icon={<ApartmentIcon sx={{ fontSize: 18 }} />}>
                Properties
              </NavButton>

              {showServices && (
                <>
                  <Button
                    onClick={(e) => setServicesAnchor(e.currentTarget)}
                    endIcon={<ExpandMoreIcon />}
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                      px: 2,
                      "&:hover": {
                        color: "primary.main",
                        backgroundColor: "rgba(14, 165, 233, 0.08)",
                      },
                    }}
                  >
                    Services
                  </Button>
                  <Menu
                    anchorEl={servicesAnchor}
                    open={Boolean(servicesAnchor)}
                    onClose={() => setServicesAnchor(null)}
                    transformOrigin={{ horizontal: "center", vertical: "top" }}
                    anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 220,
                      },
                    }}
                  >
                    {serviceMenuItems.map((item) => (
                      <MenuItem
                        key={item.label}
                        onClick={() => {
                          setServicesAnchor(null);
                          navigate(item.path);
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.label}</ListItemText>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {isClient && (
                <>
                  <NavButton to="/dashboard" icon={<DashboardIcon sx={{ fontSize: 18 }} />}>
                    Dashboard
                  </NavButton>
                  <NavButton to="/sell/requests" icon={<SellIcon sx={{ fontSize: 18 }} />}>
                    My Selling
                  </NavButton>
                </>
              )}

              {isCompany && (
                <>
                  <NavButton to="/staff" icon={<WorkIcon sx={{ fontSize: 18 }} />}>
                    Staff
                  </NavButton>
                  <NavButton to="/staff/listing-requests" icon={<AssignmentIcon sx={{ fontSize: 18 }} />}>
                    Listings
                  </NavButton>
                  <NavButton to="/staff/appointments" icon={<EventIcon sx={{ fontSize: 18 }} />}>
                    Appointments
                  </NavButton>
                  <NavButton to="/admin/inquiries" icon={<ContactMailIcon sx={{ fontSize: 18 }} />}>
                    Inquiries
                  </NavButton>
                  {role === "admin" && (
                    <NavButton to="/users" icon={<PeopleIcon sx={{ fontSize: 18 }} />}>
                      Users
                    </NavButton>
                  )}
                </>
              )}

              {isAuthed && (
                <IconButton
                  component={Link}
                  to="/notifications"
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "primary.main", backgroundColor: "rgba(14, 165, 233, 0.08)" },
                  }}
                >
                  <Badge color="error" badgeContent={unread} invisible={unread === 0}>
                    <NotificationsNoneIcon />
                  </Badge>
                </IconButton>
              )}

              {isAuthed && (
                <Chip
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main", width: 28, height: 28, fontSize: "0.75rem" }}>
                      {(user?.profile?.fullName || user?.email || "U")[0].toUpperCase()}
                    </Avatar>
                  }
                  label={user?.profile?.fullName || user?.email?.split("@")[0] || "User"}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "divider",
                    fontWeight: 500,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              )}

              {isPublic && (
                <Stack direction="row" spacing={1}>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/register"
                    sx={{
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                      boxShadow: "0 4px 14px rgba(14, 165, 233, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                        boxShadow: "0 6px 20px rgba(14, 165, 233, 0.5)",
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Stack>
              )}

              {isAuthed && (
                <Button
                  onClick={handleLogout}
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    "&:hover": { color: "error.main", backgroundColor: "rgba(239, 68, 68, 0.08)" },
                  }}
                  startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                >
                  Logout
                </Button>
              )}
            </Stack>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              {isAuthed && (
                <IconButton
                  component={Link}
                  to="/notifications"
                  sx={{ color: "text.secondary" }}
                >
                  <Badge color="error" badgeContent={unread} invisible={unread === 0}>
                    <NotificationsNoneIcon />
                  </Badge>
                </IconButton>
              )}
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Toolbar sx={{ mb: 2 }} />

      {/* Mobile Drawer */}
      {mobileDrawer}
    </>
  );
};

export default TopBar;
