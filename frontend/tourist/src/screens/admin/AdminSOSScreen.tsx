import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, IconButton } from '@mui/material';
import { Warning, CheckCircle, LocationOn, Phone } from '@mui/icons-material';
import { apiService, EmergencyAlert } from '../../services/api';

const AdminSOSScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await apiService.getEmergencyAlerts();
      if (response.success && response.alerts) {
        setAlerts(response.alerts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED');

  const handleResolve = async (id: string) => {
    await apiService.resolveAlert(id);
    fetchAlerts();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
          SOS Monitoring Panel
        </Typography>
        <Chip 
          icon={<Warning />} 
          label={`${activeAlerts.length} Active Alerts`} 
          color={activeAlerts.length > 0 ? "error" : "success"}
          sx={{ fontWeight: 'bold', fontSize: '16px', py: 2 }}
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#ef4444' }}>
        🔴 Live Emergencies
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 5 }}>
        {activeAlerts.map(alert => (
          <Box key={alert.alertId}>
            <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                    🚨 {alert.emergencyType ? alert.emergencyType.toUpperCase() : 'EMERGENCY'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Message:</strong> {alert.message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip icon={<LocationOn />} label={`Lat: ${alert.location.latitude.toFixed(4)}, Lng: ${alert.location.longitude.toFixed(4)}`} size="small" />
                  <Chip label={`Tourist ID: ${alert.digitalId}`} size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" color="primary" startIcon={<LocationOn />} onClick={() => window.open(`https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`, '_blank')}>
                    View Map
                  </Button>
                  <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleResolve(alert.alertId)}>
                    Mark Resolved
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
        {activeAlerts.length === 0 && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3, textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                No active emergencies. System is clear.
              </Typography>
            </Card>
          </Box>
        )}
      </Box>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1e293b' }}>
        ✅ Recently Resolved
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {resolvedAlerts.slice(0, 4).map(alert => (
          <Box key={alert.alertId}>
            <Card sx={{ bgcolor: '#f8fafc', borderRadius: 3, opacity: 0.8 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                    {alert.emergencyType ? alert.emergencyType.toUpperCase() : 'EMERGENCY'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mt: 1 }}>
                  Resolved. Tourist ID: {alert.digitalId}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AdminSOSScreen;
