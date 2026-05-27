import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  AccountCircle,
  People,
  Security,
  Analytics,
  Refresh,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService, User, AlertStats, EmergencyAlert, Activity, tokenManager } from '../services/api';
import { refreshAuthStatus } from '../hooks/useAuth';

const AdminDashboardScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats>({
    totalAlerts: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    lastAlert: null
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [resolveDialog, setResolveDialog] = useState<{
    open: boolean;
    alertId: string;
    alertType: string;
  }>({
    open: false,
    alertId: '',
    alertType: '',
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchAlertStats();
    fetchActivities();
    
    // Set up auto-refresh for real-time updates
    const interval = setInterval(() => {
      fetchAlertStats();
      fetchActivities();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers();
      
      if (response.success && response.users) {
        setUsers(response.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err: any) {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertStats = async () => {
    try {
      const response = await apiService.getAlertStats();
      
      if (response.success && response.stats) {
        setAlertStats(response.stats);
      }
    } catch (err: any) {
      console.error('Failed to fetch alert stats:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await apiService.getRecentActivities();
      
      if (response.success && response.activities) {
        setActivities(response.activities);
      }
    } catch (err: any) {
      console.error('Failed to fetch recent activities:', err);
    }
  };

  const handleLogout = () => {
    tokenManager.removeToken();
    tokenManager.removeUserData();
    refreshAuthStatus();
    navigate('/login');
  };

  const refreshData = () => {
    fetchUsers();
    fetchAlertStats();
    fetchActivities();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'police': return 'warning';
      case 'tourist': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'SOS_ALERT': return '🚨';
      case 'DIGITAL_ID_CHECK': return '🔍';
      case 'LOGIN': return '🔐';
      case 'REGISTER': return '👤';
      default: return '📋';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'error.main';
      case 'WARNING': return 'warning.main';
      case 'SUCCESS': return 'success.main';
      default: return 'info.main';
    }
  };

  const getEmergencyTypeInfo = (emergencyType?: string) => {
    const types: { [key: string]: { label: string; icon: string; color: string } } = {
      'panic': { label: 'General Emergency', icon: '🚨', color: '#e74c3c' },
      'medical': { label: 'Medical Emergency', icon: '🏥', color: '#e67e22' },
      'accident': { label: 'Accident', icon: '🚗', color: '#d35400' },
      'theft': { label: 'Theft/Robbery', icon: '🔓', color: '#f39c12' },
      'harassment': { label: 'Harassment', icon: '⚠️', color: '#e74c3c' },
      'lost': { label: 'Lost/Stranded', icon: '🧭', color: '#9b59b6' },
      'natural_disaster': { label: 'Natural Disaster', icon: '🌪️', color: '#c0392b' },
      'fire': { label: 'Fire Emergency', icon: '🔥', color: '#e74c3c' },
      'violence': { label: 'Violence/Assault', icon: '🛡️', color: '#8e44ad' },
      'suspicious_activity': { label: 'Suspicious Activity', icon: '👁️', color: '#f39c12' },
      'transport': { label: 'Transport Issue', icon: '🚌', color: '#3498db' },
      'other': { label: 'Other Emergency', icon: '📞', color: '#7f8c8d' },
    };
    return types[emergencyType || 'other'] || types['other'];
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL': return '#c0392b';
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const handleResolveAlert = (alertId: string, alertType: string = 'Emergency') => {
    setResolveDialog({
      open: true,
      alertId,
      alertType,
    });
  };

  const confirmResolveAlert = async () => {
    const { alertId, alertType } = resolveDialog;
    
    try {
      const response = await apiService.resolveAlert(alertId);
      
      if (response.success) {
        setNotification({
          open: true,
          message: `${alertType} alert resolved successfully!`,
          severity: 'success',
        });
        
        await fetchAlertStats();
        await fetchActivities();
      } else {
        setNotification({
          open: true,
          message: `Failed to resolve alert: ${response.message}`,
          severity: 'error',
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error resolving alert. Please try again.',
        severity: 'error',
      });
    } finally {
      setResolveDialog({ open: false, alertId: '', alertType: '' });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🛡️ Admin Control Center
          </Typography>
          <Button color="inherit" onClick={refreshData} startIcon={<Refresh />}>
            Refresh
          </Button>
          <div>
            <IconButton
              size="large"
              onClick={(event) => setAnchorEl(event.currentTarget)}
              color="inherit"
              sx={{ p: 0.5 }}
            >
              <Avatar src="/assets/admin_photo.webp" alt="Admin" sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{users.filter(u => u.role !== 'admin').length}</Typography>
                  <Typography variant="body2">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => u.role === 'tourist').length}
                  </Typography>
                  <Typography variant="body2">Tourists</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Analytics sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{alertStats.activeAlerts}</Typography>
                  <Typography variant="body2">Active Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText', flex: 1, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{alertStats.totalAlerts}</Typography>
                  <Typography variant="body2">Total Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Realistic Dashboard Additions */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          
          {/* Main Content Area */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1e293b' }}>
                  📊 System Health Status
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
                  gap: 2 
                }}>
                  <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'bold' }}>API Services</Typography>
                    <Typography variant="h6" color="success.main">Operational</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'bold' }}>Database Core</Typography>
                    <Typography variant="h6" color="success.main">Operational</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a', textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 'bold' }}>Map Geocoding</Typography>
                    <Typography variant="h6" color="warning.main">High Latency</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1e293b' }}>
                  ⚡ Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="error" onClick={() => navigate('/admin/notifications')}>
                    Broadcast Emergency Alert
                  </Button>
                  <Button variant="outlined" color="primary" onClick={() => navigate('/admin/tourists')}>
                    Verify Pending Tourists
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => navigate('/admin/reports')}>
                    Generate Weekly Report
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar Area */}
          <Box>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1e293b' }}>
                  📋 Recent Activity Log
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activities.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No recent activities.</Typography>
                    </Box>
                  ) : (
                    activities.map((activity) => {
                      return (
                        <Box key={activity._id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box 
                            sx={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: '50%', 
                              bgcolor: getActivityColor(activity.status), 
                              mt: 1 
                            }} 
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {getActivityIcon(activity.type)} {activity.action}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.userName || activity.digitalId || 'System'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(activity.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>

                <Button fullWidth variant="text" sx={{ mt: 3 }} onClick={() => navigate('/admin/activities')}>
                  View Full Logs
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboardScreen;
