import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { Shield, Send } from 'lucide-react';
import { incidentAPI, tokenManager } from '../services/api';
import { useNavigate } from 'react-router-dom';

const REPORT_TYPES = [
  { value: 'theft_report', label: 'Theft Report', icon: '🔓' },
  { value: 'harassment_report', label: 'Harassment Report', icon: '⚠️' },
  { value: 'medical_emergency', label: 'Medical Emergency', icon: '🏥' },
  { value: 'suspicious_activity', label: 'Suspicious Activity', icon: '👁️' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const ReportIncidentScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportType: '',
    severity: 'medium',
    address: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.reportType || !formData.address) {
      setSnack({ open: true, msg: 'Please fill out all required fields', sev: 'error' });
      return;
    }

    if (formData.address === 'Other' && !(formData as any).customAddress) {
      setSnack({ open: true, msg: 'Please specify the custom location', sev: 'error' });
      return;
    }

    setLoading(true);
    try {
      const userData = tokenManager.getUserData();
      
      const payload = {
        title: formData.title,
        description: formData.description,
        reportType: formData.reportType,
        severity: formData.severity,
        location: {
          latitude: 0, 
          longitude: 0,
          address: formData.address === 'Other' ? (formData as any).customAddress : formData.address,
          city: 'Bhubaneswar'
        },
        source: 'tourist_report',
        touristName: userData?.name || 'Unknown Tourist',
        touristDigitalId: userData?.digitalId || 'Unknown ID',
      };

      console.log('Submitting incident report:', payload);

      // Try to get actual location
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          payload.location.latitude = position.coords.latitude;
          payload.location.longitude = position.coords.longitude;
        } catch (err) {
          console.warn('Geolocation failed or timed out, using default coordinates');
        }
      }

      const response = await incidentAPI.create(payload as any);
      if (response.success) {
        setSnack({ open: true, msg: 'Incident reported successfully! Authorities have been notified.', sev: 'success' });
        setFormData({ title: '', description: '', reportType: '', severity: 'medium', address: '' });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setSnack({ open: true, msg: response.message || 'Failed to report incident', sev: 'error' });
      }
    } catch (err: any) {
      console.error('Incident report submission error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Network error. Please try again.';
      setSnack({ open: true, msg: errorMsg, sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <div style={{ backgroundColor: '#1a237e', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield color="white" size={24} />
        </div>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e' }}>Report an Incident</Typography>
          <Typography variant="body2" color="text.secondary">Submit a safety report to the administrative authorities</Typography>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <TextField
                label="Incident Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Bag stolen at Connaught Place"
                required
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth required>
                  <InputLabel>Incident Type</InputLabel>
                  <Select
                    name="reportType"
                    value={formData.reportType}
                    label="Incident Type"
                    onChange={handleChange}
                  >
                    {REPORT_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    name="severity"
                    value={formData.severity}
                    label="Severity"
                    onChange={handleChange}
                  >
                    {SEVERITIES.map(sev => (
                      <MenuItem key={sev.value} value={sev.value}>
                        {sev.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <FormControl fullWidth required>
                <InputLabel>Location Details</InputLabel>
                <Select
                  name="address"
                  value={formData.address}
                  label="Location Details"
                  onChange={handleChange}
                >
                  {[
                    'Lingaraj Temple',
                    'Khandagiri & Udayagiri Caves',
                    'Dhauli Shanti Stupa',
                    'Nandankanan Zoological Park',
                    'Mukteswara Temple',
                    'Rajarani Temple',
                    'Odisha State Museum',
                    'Ekamra Haat',
                    'Biju Patnaik International Airport',
                    'Bhubaneswar Railway Station',
                    'Baramunda Bus Stand',
                    'Esplanade One Mall',
                    'KIIT Square',
                    'Patia',
                    'Chandrasekharpur',
                    'Jayadev Vihar',
                    'Nayapalli',
                    'Master Canteen',
                    'Unit-1 Market',
                    'Old Town',
                    'Other'
                  ].map(loc => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.address === 'Other' && (
                <TextField
                  label="Specify Location"
                  name="customAddress"
                  onChange={(e) => setFormData(prev => ({ ...prev, customAddress: e.target.value }))}
                  placeholder="Enter custom location"
                  required
                  fullWidth
                />
              )}

              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe what happened in detail..."
                required
                fullWidth
                multiline
                rows={4}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 2, 
                  py: 1.5, 
                  bgcolor: '#1a237e', 
                  '&:hover': { bgcolor: '#0d47a1' },
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '16px'
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportIncidentScreen;
