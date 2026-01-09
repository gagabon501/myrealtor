import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getBuyerApplicationMessages,
  sendBuyerApplicationMessage,
  getAdminApplicationMessages,
  sendAdminApplicationMessage,
} from "../api/applicationMessagesApi";

const ApplicationMessages = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role ? String(user.role).toLowerCase() : "public";
  const isAdmin = role === "staff" || role === "admin";
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = isAdmin
        ? await getAdminApplicationMessages(id)
        : await getBuyerApplicationMessages(id);
      setMessages(res.data || []);
    } catch (err) {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Message cannot be empty");
      return;
    }
    setSending(true);
    setError("");
    try {
      if (isAdmin) {
        await sendAdminApplicationMessage(id, { body: trimmed });
      } else {
        await sendBuyerApplicationMessage(id, trimmed);
      }
      setBody("");
      await loadMessages();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const senderLabel = (m) => {
    if (m.senderRole === "user") return "Buyer";
    if (m.senderRole === "staff" || m.senderRole === "admin") return "Staff";
    return "Unknown";
  };

  return (
    <Container sx={{ py: 4, maxWidth: 800 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Application Messages
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, minHeight: 200 }}>
        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : messages.length ? (
          <Stack spacing={1.5}>
            {messages.map((m) => (
              <Box
                key={m._id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: m.senderRole === "user" ? "background.paper" : "grey.50",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">{senderLabel(m)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(m.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {m.body}
                </Typography>
                {m.isInternal && (
                  <Typography variant="caption" color="warning.main">
                    Internal note
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">No messages yet.</Typography>
        )}
      </Paper>

      <Box component="form" onSubmit={handleSend}>
        <Stack spacing={1.5}>
          <TextField
            label="Message"
            multiline
            minRows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ApplicationMessages;


