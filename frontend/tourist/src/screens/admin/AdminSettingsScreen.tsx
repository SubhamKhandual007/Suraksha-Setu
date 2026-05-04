import React from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel } from '@mui/material';

const AdminSettingsScreen: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>
        System Settings
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>General Preferences</Typography>
          <FormControlLabel control={<Switch defaultChecked />} label="Enable Auto-Tracking for SOS" />
          <br />
          <FormControlLabel control={<Switch defaultChecked />} label="Send SMS to Emergency Contacts" />
          <br />
          <FormControlLabel control={<Switch />} label="Maintenance Mode" />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSettingsScreen;
