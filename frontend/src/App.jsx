import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
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
import TopBar from "./components/TopBar";
import Notifications from "./pages/Notifications";
import ApplicationMessages from "./pages/ApplicationMessages";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    background: { default: "#f8fafc" },
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
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
