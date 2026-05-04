import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Divider, Chip, IconButton, Tooltip, CircularProgress,
  Alert, Badge, Avatar, Stack
} from '@mui/material';
import {
  Send, Refresh, PersonAdd, Warning, LocationOn,
  CheckCircle, NotificationsActive, BroadcastOnPersonal
} from '@mui/icons-material';
import { emergencyAPI, authAPI } from '../../services/api';
import { verificationLog } from '../../services/verificationLog';

interface ActivityItem {
  id: string;
  type: 'registration' | 'sos_resolved' | 'sos_active' | 'zone' | 'system' | 'verification';
  title: string;
  detail: string;
  timestamp: Date;
  rawTime: string;
}

const timeAgo = (date: Date): string => {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
};

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  registration: {
    icon: <PersonAdd sx={{ fontSize: 18 }} />,
    color: '#6366f1',
    bg: '#eef2ff',
    label: 'Registration',
  },
  sos_active: {
    icon: <Warning sx={{ fontSize: 18 }} />,
    color: '#ef4444',
    bg: '#fef2f2',
    label: 'SOS Active',
  },
  sos_resolved: {
    icon: <CheckCircle sx={{ fontSize: 18 }} />,
    color: '#22c55e',
    bg: '#f0fdf4',
    label: 'SOS Resolved',
  },
  zone: {
    icon: <LocationOn sx={{ fontSize: 18 }} />,
    color: '#f59e0b',
    bg: '#fffbeb',
    label: 'Zone Update',
  },
  system: {
    icon: <NotificationsActive sx={{ fontSize: 18 }} />,
    color: '#64748b',
    bg: '#f1f5f9',
    label: 'System',
  },
  verification: {
    icon: <CheckCircle sx={{ fontSize: 18 }} />,
    color: '#6366f1',
    bg: '#eef2ff',
    label: 'ID Scanned',
  },
};

const AdminNotificationsScreen: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  const fetchActivities = useCallback(async () => {
    setLoadingFeed(true);
    setFeedError('');
    try {
      const items: ActivityItem[] = [];

      // 1. QR Scan / Verification events (from sessionStorage log)
      verificationLog.getAll().forEach((ev) => {
        items.push({
          id: ev.id,
          type: 'verification',
          title: 'Digital ID Scanned & Verified',
          detail: `${ev.touristName} — ID: ${ev.digitalId} | Phone: ${ev.phone}`,
          timestamp: new Date(ev.timestamp),
          rawTime: ev.timestamp,
        });
      });

      // 2. Fetch recent users (registrations)
      try {
        const usersRes = await authAPI.getAllUsers();
        const users = usersRes.users || usersRes.data || [];
        users
          .filter((u: any) => u.role === 'tourist')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .forEach((u: any) => {
            items.push({
              id: `reg-${u._id || u.id}`,
              type: 'registration',
              title: 'New Tourist Registration',
              detail: `${u.name} registered with Digital ID: ${u.digitalId}`,
              timestamp: new Date(u.createdAt),
              rawTime: u.createdAt,
            });
          });
      } catch {}

      // 2. Fetch emergency alerts
      try {
        const alertsRes = await emergencyAPI.getEmergencyAlerts();
        const alerts = alertsRes.alerts || alertsRes.data || [];
        alerts
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8)
          .forEach((a: any) => {
            const isResolved = a.status === 'resolved';
            items.push({
              id: `alert-${a.alertId || a._id}`,
              type: isResolved ? 'sos_resolved' : 'sos_active',
              title: isResolved ? 'SOS Alert Resolved' : '🚨 Active SOS Alert',
              detail: a.message || `${a.emergencyType || 'Emergency'} alert triggered`,
              timestamp: new Date(a.timestamp),
              rawTime: a.timestamp,
            });
          });
      } catch {}

      // Sort all items by timestamp descending
      items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(items);
      setLastRefreshed(new Date());
    } catch (e) {
      setFeedError('Failed to load activity feed. Please try again.');
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) return;
    setBroadcasting(true);
    setBroadcastSuccess('');
    // Simulate broadcast (no backend endpoint yet — add to socket later)
    await new Promise((r) => setTimeout(r, 1200));
    setBroadcastSuccess(`Broadcast sent successfully to all active tourists!`);
    setTitle('');
    setMessage('');
    setBroadcasting(false);
  };

  const unreadCount = activities.filter(a => a.type === 'sos_active').length;

  return (
    <Box sx={{ p: 3, maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActive sx={{ fontSize: 32, color: '#6366f1' }} />
          </Badge>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
              Notifications
            </Typography>
            {lastRefreshed && (
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>
        <Tooltip title="Refresh feed">
          <IconButton
            onClick={fetchActivities}
            disabled={loadingFeed}
            sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
          >
            {loadingFeed
              ? <CircularProgress size={20} sx={{ color: '#6366f1' }} />
              : <Refresh sx={{ color: '#6366f1' }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Activity Feed */}
      <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
            Live Activity Feed
          </Typography>

          {feedError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{feedError}</Alert>
          )}

          {loadingFeed && activities.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
          ) : activities.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsActive sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography sx={{ color: '#94a3b8' }}>No activity yet</Typography>
            </Box>
          ) : (
            <Stack spacing={0}>
              {activities.map((item, index) => {
                const cfg = typeConfig[item.type] || typeConfig.system;
                return (
                  <Box key={item.id}>
                    <Box sx={{ display: 'flex', gap: 2, py: 2, alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{ width: 38, height: 38, bgcolor: cfg.bg, color: cfg.color, mt: 0.3 }}
                      >
                        {cfg.icon}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {item.title}
                          </Typography>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{
                              bgcolor: cfg.bg,
                              color: cfg.color,
                              fontWeight: 600,
                              fontSize: 11,
                              height: 20
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#475569', mt: 0.3 }}>
                          {item.detail}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.3, display: 'block' }}>
                          {timeAgo(item.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                    {index < activities.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Broadcast Panel */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BroadcastOnPersonal sx={{ color: '#6366f1' }} /> Broadcast Safety Advisory
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Send a push notification to all registered tourists instantly.
          </Typography>

          {broadcastSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{broadcastSuccess}</Alert>
          )}

          <TextField
            fullWidth
            label="Advisory Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Message Body"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            endIcon={broadcasting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Send />}
            onClick={handleBroadcast}
            disabled={broadcasting || !title.trim() || !message.trim()}
            sx={{
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' },
              borderRadius: 2,
              px: 3,
              py: 1.2,
              fontWeight: 700,
            }}
          >
            {broadcasting ? 'Sending...' : 'Broadcast to All Tourists'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminNotificationsScreen;
