import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService, Activity } from '../services/api';

const ActivityLogScreen: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRecentActivities();
      if (response.success && response.activities) {
        setActivities(response.activities);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'error';
      case 'WARNING': return 'warning';
      case 'SUCCESS': return 'success';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#1e293b' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📋 System Activity Logs
          </Typography>
          <Button color="inherit" onClick={fetchActivities} startIcon={<Refresh />}>
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Entity</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No activities found</TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity._id} hover>
                    <TableCell>{formatDate(activity.timestamp)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.type.replace(/_/g, ' ')} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.userName || activity.digitalId || 'System'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.status} 
                        size="small" 
                        color={getStatusColor(activity.status) as any}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default ActivityLogScreen;
