import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notificationsApi";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchNotifications();
      setItems(res.data || []);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRead = async (id, link) => {
    try {
      await markNotificationRead(id);
      if (link) navigate(link);
      await load();
    } catch (_err) {
      /* ignore */
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      await load();
    } catch (_err) {
      /* ignore */
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Notifications
        </Typography>
        <Button onClick={handleReadAll} disabled={!items.some((n) => !n.isRead)}>
          Mark all as read
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <List>
        {items.map((n) => (
          <ListItem
            key={n._id}
            alignItems="flex-start"
            sx={{
              border: "1px solid",
              borderColor: n.isRead ? "divider" : "primary.main",
              mb: 1,
              borderRadius: 1.5,
              opacity: n.isRead ? 0.7 : 1,
            }}
            secondaryAction={
              !n.isRead ? (
                <Button onClick={() => handleRead(n._id, null)} size="small">
                  Mark read
                </Button>
              ) : null
            }
            onClick={() => handleRead(n._id, n.link)}
          >
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1">{n.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {n.message}
                  </Typography>
                  {n.link && (
                    <Typography variant="caption" color="primary">
                      Click to open
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
        {!items.length && (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No notifications yet.
          </Typography>
        )}
      </List>
    </Container>
  );
};

export default Notifications;


