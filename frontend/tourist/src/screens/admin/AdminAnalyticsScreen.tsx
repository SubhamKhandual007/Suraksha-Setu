import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  useTheme,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Map as MapIcon,
  RefreshCw,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { zoneService, SafetyZone } from '../../services/zoneService';

const AdminAnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const incidentRes = await apiService.getAll();
      const zoneData = zoneService.getAll();
      
      if (incidentRes.success && incidentRes.reports) {
        setIncidents(incidentRes.reports);
      }
      setZones(zoneData);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process data for Incident Trends Chart
  const incidentTrendData = useMemo(() => {
    if (!incidents.length) return [];
    
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const countsByDate = incidents.reduce((acc: any, inc: any) => {
      const date = new Date(inc.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: countsByDate[date] || 0
    }));
  }, [incidents]);

  // Process data for Zone Distribution Chart
  const zoneDistributionData = useMemo(() => {
    const counts = zones.reduce((acc: any, zone) => {
      acc[zone.type] = (acc[zone.type] || 0) + 1;
      return acc;
    }, { safe: 0, caution: 0, danger: 0 });

    return [
      { name: 'Safe Zones', value: counts.safe, color: '#22c55e' },
      { name: 'Caution (Yellow)', value: counts.caution, color: '#f59e0b' },
      { name: 'High-Risk (Red)', value: counts.danger, color: '#ef4444' }
    ];
  }, [zones]);

  const stats = [
    { label: 'Total Incidents', value: incidents.length, icon: <TrendingUp />, color: '#6366f1' },
    { label: 'High-Risk Zones', value: zones.filter(z => z.type === 'danger').length, icon: <AlertTriangle />, color: '#ef4444' },
    { label: 'Caution Areas', value: zones.filter(z => z.type === 'caution').length, icon: <Info />, color: '#f59e0b' },
    { label: 'Safe Perimeters', value: zones.filter(z => z.type === 'safe').length, icon: <ShieldCheck />, color: '#22c55e' }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
            Safety Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time insights and trend analysis for tourist safety.
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={fetchData} 
            disabled={refreshing}
            sx={{ 
              bgcolor: 'white', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            <RefreshCw size={20} className={refreshing ? 'spin' : ''} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  bgcolor: `${stat.color}15`, 
                  color: stat.color,
                  display: 'flex'
                }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Incident Trends Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 4, p: 3, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
                Incident Trends (Last 7 Days)
              </Typography>
            </Box>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incidentTrendData}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorInc)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Safety Zone Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, p: 3, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155', mb: 4 }}>
              Zone Distribution
            </Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneDistributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                    width={100}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                    {zoneDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2 }}>
              {zoneDistributionData.map((zone, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: zone.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', flex: 1 }}>
                    {zone.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {zone.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Heatmap/Map Integration Note */}
      <Card sx={{ mt: 3, p: 3, borderRadius: 4, bgcolor: '#1e293b', color: 'white', border: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MapIcon size={24} color="#60a5fa" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Dynamic Map Integration
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Analytics are automatically updated when zones are added or modified in the <span style={{ color: '#60a5fa', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/admin/zones')}>Zone Management</span> portal.
            </Typography>
          </Box>
        </Box>
      </Card>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default AdminAnalyticsScreen;

