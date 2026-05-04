import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Delete, Add, Map as MapIcon, LocationOn } from '@mui/icons-material';
import { zoneService, SafetyZone } from '../../services/zoneService';

const BHUBANESWAR_PRESETS = [
  { name: 'Nandankanan Zoo', lat: 20.3956, lng: 85.8161, radius: 2500 },
  { name: 'Lingaraj Temple', lat: 20.2386, lng: 85.8334, radius: 1200 },
  { name: 'Khandagiri Caves', lat: 20.2563, lng: 85.7808, radius: 1200 },
  { name: 'Dhauli Stupa', lat: 20.1924, lng: 85.8394, radius: 1500 },
  { name: 'State Museum', lat: 20.2597, lng: 85.8409, radius: 900 },
  { name: 'Rajarani Temple', lat: 20.2434, lng: 85.8421, radius: 900 },
  { name: 'ISKCON Temple', lat: 20.2917, lng: 85.8142, radius: 1000 },
  { name: 'Jaydev Vihar', lat: 20.2965, lng: 85.8196, radius: 1500 },
  { name: 'Master Canteen', lat: 20.2727, lng: 85.8415, radius: 1400 },
  { name: 'Kalinga Stadium', lat: 20.2892, lng: 85.8248, radius: 1500 },
  { name: 'Esplanade Mall', lat: 20.2878, lng: 85.8647, radius: 1200 },
  { name: 'Railway Station', lat: 20.2739, lng: 85.8421, radius: 800 },
  { name: 'BBI Airport', lat: 20.2520, lng: 85.8178, radius: 1500 },
  { name: 'Infocity Patia', lat: 20.3531, lng: 85.8169, radius: 1700 },
  { name: 'Unit 4 Market', lat: 20.2648, lng: 85.8345, radius: 450 },
];

const AdminZoneManagementScreen: React.FC = () => {
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [newName, setNewName] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newRadius, setNewRadius] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  useEffect(() => {
    setZones(zoneService.getAll());
  }, []);

  const handlePresetChange = (event: any) => {
    const val = event.target.value;
    setSelectedPreset(val);
    if (val === 'custom') {
      setNewName('');
      setNewLat('');
      setNewLng('');
      setNewRadius('');
    } else {
      const preset = BHUBANESWAR_PRESETS.find(p => p.name === val);
      if (preset) {
        setNewName(preset.name);
        setNewLat(preset.lat.toString());
        setNewLng(preset.lng.toString());
        setNewRadius(preset.radius.toString());
      }
    }
  };

  const handleAddZone = (type: 'safe' | 'danger' | 'caution') => {
    if (!newName || !newLat || !newLng || !newRadius) return;
    
    zoneService.add({
      name: newName,
      type,
      lat: parseFloat(newLat),
      lng: parseFloat(newLng),
      radius: parseFloat(newRadius)
    });
    
    setZones(zoneService.getAll());
    setNewName('');
    setNewLat('');
    setNewLng('');
    setNewRadius('');
    setSelectedPreset('');
  };

  const handleDelete = (id: string | number) => {
    zoneService.remove(id);
    setZones(zoneService.getAll());
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
            Safety Zone Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Define safe zones (green) and danger zones (red) on the tourist tracking map.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        <Box>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#6366f1' }} /> Add New Zone
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Select Bhubaneswar Preset</InputLabel>
                <Select
                  value={selectedPreset}
                  label="Select Bhubaneswar Preset"
                  onChange={handlePresetChange}
                >
                  <MenuItem value="custom">-- Custom Location --</MenuItem>
                  {BHUBANESWAR_PRESETS.map((p) => (
                    <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField 
                fullWidth label="Zone Name" size="small" sx={{ mb: 2 }} 
                value={newName} onChange={(e) => setNewName(e.target.value)}
              />
              <TextField 
                fullWidth label="Latitude" size="small" sx={{ mb: 2 }} 
                value={newLat} onChange={(e) => setNewLat(e.target.value)}
              />
              <TextField 
                fullWidth label="Longitude" size="small" sx={{ mb: 2 }} 
                value={newLng} onChange={(e) => setNewLng(e.target.value)}
              />
              <TextField 
                fullWidth label="Radius (meters)" size="small" sx={{ mb: 2 }} 
                value={newRadius} onChange={(e) => setNewRadius(e.target.value)}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Button 
                  variant="contained" color="error" fullWidth 
                  startIcon={<Add />} onClick={() => handleAddZone('danger')}
                  sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                >
                  Danger (Red)
                </Button>
                <Button 
                  variant="contained" color="warning" fullWidth 
                  startIcon={<Add />} onClick={() => handleAddZone('caution')}
                  sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                >
                  Caution (Yellow)
                </Button>
                <Button 
                  variant="contained" color="success" fullWidth 
                  startIcon={<Add />} onClick={() => handleAddZone('safe')}
                  sx={{ borderRadius: 2, fontSize: '0.75rem', gridColumn: 'span 2' }}
                >
                  Safe Zone (Green)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Active Zones ({zones.length})</Typography>
              <List sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
                {zones.map((zone) => (
                  <ListItem 
                    key={zone.id} 
                    sx={{ 
                      bgcolor: zone.type === 'danger' ? '#fef2f2' : zone.type === 'caution' ? '#fffbeb' : '#f0fdf4', 
                      mb: 1, 
                      borderRadius: 2,
                      border: `1px solid ${zone.type === 'danger' ? '#fecaca' : zone.type === 'caution' ? '#fef3c7' : '#bbf7d0'}`
                    }}
                    secondaryAction={
                      <IconButton edge="end" color="error" onClick={() => handleDelete(zone.id)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 'bold' }} color={zone.type === 'danger' ? 'error' : zone.type === 'caution' ? 'warning.main' : 'success.main'}>
                            {zone.name}
                          </Typography>
                          <Chip 
                            label={zone.type.toUpperCase()} 
                            size="small" 
                            color={zone.type === 'danger' ? 'error' : 'success'} 
                            sx={{ height: 16, fontSize: 10, fontWeight: 800 }} 
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Lat: {zone.lat}, Lng: {zone.lng} | Radius: {zone.radius}m
                          </Typography>
                          {zone.reason && (
                            <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                              Reason: {zone.reason}
                            </Typography>
                          )}
                        </>
                      } 
                    />
                  </ListItem>
                ))}
                {zones.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <MapIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography sx={{ color: '#94a3b8' }}>No zones defined yet.</Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminZoneManagementScreen;

