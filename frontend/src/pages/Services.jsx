import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import client from "../api/client";

const initialAppraisal = {
  name: "",
  address: "",
  email: "",
  phone: "",
  propertyLocation: "",
  size: "",
  includesBuilding: false,
  numberOfFloors: 0,
  timeOfBuild: "",
  lastRepair: "",
  appointment: "",
  documents: [],
};

const initialTitling = {
  name: "",
  address: "",
  email: "",
  phone: "",
  propertyLocation: "",
  appointment: "",
  documents: [],
};

const initialConsultancy = {
  name: "",
  email: "",
  phone: "",
  topic: "",
  appointment: "",
};

const Services = () => {
  const [appraisal, setAppraisal] = useState(initialAppraisal);
  const [titling, setTitling] = useState(initialTitling);
  const [consultancy, setConsultancy] = useState(initialConsultancy);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const handleAppraisalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = new FormData();
      Object.entries(appraisal).forEach(([k, v]) => {
        if (k !== "documents") data.append(k, v);
      });
      appraisal.documents.forEach((file) => data.append("documents", file));
      const res = await client.post("/services/appraisal", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotice(
        `Appraisal submitted. Quote: ₱${res.data.rate.toLocaleString()} (50% upfront).`
      );
      setAppraisal(initialAppraisal);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit appraisal request"
      );
    }
  };

  const handleTitlingSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = new FormData();
      Object.entries(titling).forEach(([k, v]) => {
        if (k !== "documents") data.append(k, v);
      });
      titling.documents.forEach((file) => data.append("documents", file));
      await client.post("/services/titling", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotice("Titling/transfer request submitted.");
      setTitling(initialTitling);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit titling request"
      );
    }
  };

  const handleConsultancySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await client.post("/services/consultancy", consultancy);
      setNotice("Consultancy appointment requested.");
      setConsultancy(initialConsultancy);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit consultancy request"
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Services
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Detailed workflows for Brokerage, Appraisal, Titling/Transfer, and
        Consultancy will be added soon. Please contact us directly for
        assistance.
      </Typography>
    </Container>
  );
};

export default Services;
