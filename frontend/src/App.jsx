import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, alpha } from "@mui/material";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import Dashboard from "./pages/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Apply from "./pages/Apply";
import NewProperty from "./pages/NewProperty";
import EditProperty from "./pages/EditProperty";
import ManageUsers from "./pages/ManageUsers";
import Services from "./pages/Services";
import PropertyInterest from "./pages/PropertyInterest";
import AdminInquiries from "./pages/AdminInquiries";
import AdminApplications from "./pages/AdminApplications";
import MyServiceDocuments from "./pages/MyServiceDocuments";
import MyListingRequests from "./pages/MyListingRequests";
import StaffListingRequests from "./pages/StaffListingRequests";
import CreateListingRequest from "./pages/CreateListingRequest";
import StaffServiceRequests from "./pages/StaffServiceRequests";
import StaffEarnestMoney from "./pages/StaffEarnestMoney";
import StaffAppraisalReports from "./pages/StaffAppraisalReports";
import StaffAppointments from "./pages/StaffAppointments";
import TopBar from "./components/TopBar";
import Notifications from "./pages/Notifications";
import ApplicationMessages from "./pages/ApplicationMessages";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Modern Real Estate Theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0ea5e9",
      light: "#38bdf8",
      dark: "#0284c7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    info: {
      main: "#6366f1",
      light: "#818cf8",
      dark: "#4f46e5",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.025em",
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.01em",
      textTransform: "none",
    },
    overline: {
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: "smooth",
        },
        body: {
          backgroundImage: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          minHeight: "100vh",
        },
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "#f1f5f9",
        },
        "*::-webkit-scrollbar-thumb": {
          background: "#cbd5e1",
          borderRadius: "4px",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: "#94a3b8",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 24px",
          fontSize: "0.9375rem",
          boxShadow: "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgb(0 0 0 / 0.15)",
            transform: "translateY(-1px)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 8px 25px rgb(0 0 0 / 0.2)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: alpha("#0ea5e9", 0.04),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          border: "1px solid #e2e8f0",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: "0 2px 8px rgb(0 0 0 / 0.08)",
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgb(14 165 233 / 0.15)",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
        filled: {
          "&.MuiChip-colorSuccess": {
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          },
          "&.MuiChip-colorError": {
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          },
          "&.MuiChip-colorWarning": {
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          },
          "&.MuiChip-colorInfo": {
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          borderBottom: "1px solid #e2e8f0",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.9375rem",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: alpha("#10b981", 0.1),
          color: "#059669",
        },
        standardError: {
          backgroundColor: alpha("#ef4444", 0.1),
          color: "#dc2626",
        },
        standardWarning: {
          backgroundColor: alpha("#f59e0b", 0.1),
          color: "#d97706",
        },
        standardInfo: {
          backgroundColor: alpha("#6366f1", 0.1),
          color: "#4f46e5",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#0f172a",
          borderRadius: 8,
          fontSize: "0.8125rem",
          padding: "8px 12px",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: "0 10px 40px rgb(0 0 0 / 0.15)",
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          padding: "10px 16px",
          "&:hover": {
            backgroundColor: alpha("#0ea5e9", 0.08),
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#e2e8f0",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: "#f8fafc",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/apply"
            element={
              <ProtectedRoute>
                <Apply />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/new"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <NewProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id/edit"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <EditProperty />
              </ProtectedRoute>
            }
          />
          <Route path="/services" element={<Services />} />
          <Route path="/properties/:id/interest" element={<PropertyInterest />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <AdminInquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <AdminApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/docs"
            element={
              <ProtectedRoute>
                <MyServiceDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell/requests"
            element={
              <ProtectedRoute>
                <MyListingRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell/request"
            element={
              <ProtectedRoute>
                <CreateListingRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/listing-requests"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <StaffListingRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id/messages"
            element={
              <ProtectedRoute roles={["user"]}>
                <ApplicationMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications/:id/messages"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <ApplicationMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/services"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <StaffServiceRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/earnest-money"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <StaffEarnestMoney />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/appraisal-reports"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <StaffAppraisalReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/appointments"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <StaffAppointments />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
