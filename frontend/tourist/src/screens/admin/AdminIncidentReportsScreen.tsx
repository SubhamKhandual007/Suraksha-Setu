import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, IconButton,
  TextField, Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, Badge, CircularProgress, InputAdornment,
} from '@mui/material';
import {
  Search, Refresh, Warning, CheckCircle, LocationOn,
  Assignment, FilterList, Close, Shield, TrendingUp,
} from '@mui/icons-material';
import { incidentAPI, IncidentReport, IncidentStats, emergencyAPI, EmergencyAlert } from '../../services/api';
import { zoneService } from '../../services/zoneService';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

const REPORT_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  tourist_in_danger:   { label: 'Tourist in Danger',    icon: '🆘', color: '#dc2626' },
  theft_report:        { label: 'Theft Report',          icon: '🔓', color: '#d97706' },
  harassment_report:   { label: 'Harassment Report',     icon: '⚠️', color: '#ea580c' },
  lost_tourist:        { label: 'Lost Tourist',          icon: '🧭', color: '#7c3aed' },
  unsafe_area_alert:   { label: 'Unsafe Area Alert',     icon: '🚧', color: '#b45309' },
  medical_emergency:   { label: 'Medical Emergency',     icon: '🏥', color: '#dc2626' },
  suspicious_activity: { label: 'Suspicious Activity',   icon: '👁️', color: '#0284c7' },
  sos_alert:           { label: 'SOS Alert',             icon: '🚨', color: '#dc2626' },
  other:               { label: 'Other',                 icon: '📋', color: '#64748b' },
};

const SEVERITY_META: Record<string, { label: string; color: 'default'|'error'|'warning'|'success'|'info' }> = {
  low:      { label: 'Low',      color: 'success' },
  medium:   { label: 'Medium',   color: 'info' },
  high:     { label: 'High',     color: 'warning' },
  critical: { label: 'Critical', color: 'error' },
};

const STATUS_META: Record<string, { label: string; color: 'default'|'error'|'warning'|'success'|'info' }> = {
  pending:   { label: 'Pending',    color: 'warning' },
  responding:{ label: 'Responding', color: 'info' },
  resolved:  { label: 'Resolved',   color: 'success' },
  dismissed: { label: 'Dismissed',  color: 'default' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminIncidentReportsScreen: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [stats, setStats] = useState<IncidentStats>({ total:0, active:0, resolved:0, critical:0, highAlertZones:0, byType:[] });
  const [liveAlerts, setLiveAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterType, setFilterType] = useState('');

  // Detail / status dialog
  const [selected, setSelected] = useState<IncidentReport | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success'|'error' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus)   params.status    = filterStatus;
      if (filterSeverity) params.severity  = filterSeverity;
      if (filterType)     params.reportType= filterType;
      if (search)         params.search    = search;

      const [iRes, sRes, aRes] = await Promise.all([
        incidentAPI.getAll(params),
        incidentAPI.getStats(),
        emergencyAPI.getEmergencyAlerts(),
      ]);
      if (iRes.success)  setIncidents(iRes.reports || []);
      if (sRes.success)  setStats(sRes.stats);
      if (aRes.success)  setLiveAlerts((aRes.alerts || []).filter((a: EmergencyAlert) => a.status === 'ACTIVE'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filterStatus, filterSeverity, filterType]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  const openDetail = async (inc: IncidentReport) => {
    const r = await incidentAPI.getById(inc._id);
    if (r.success) setSelected(r.report);
    else setSelected(inc);
    setDetailOpen(true);
  };

  const openStatusDialog = (inc: IncidentReport) => {
    setSelected(inc);
    setNewStatus(inc.status);
    setAssignedTo(inc.assignedTo || '');
    setAdminNotes(inc.adminNotes || '');
    setStatusDialog(true);
  };

  const saveStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const r = await incidentAPI.updateStatus(selected._id, { status: newStatus, adminNotes, assignedTo });
      if (r.success) {
        setSnack({ open:true, msg:'Status updated successfully', sev:'success' });
        setStatusDialog(false);
        load();
      } else setSnack({ open:true, msg:'Update failed', sev:'error' });
    } catch { setSnack({ open:true, msg:'Network error', sev:'error' }); }
    finally { setSaving(false); }
  };

  const navigate = useNavigate();

  const markZone = async (inc: IncidentReport, zoneType: string) => {
    const r = await incidentAPI.markZone(inc._id, zoneType);
    if (r.success) { 
      setSnack({ open:true, msg:`Marked as ${zoneType || 'no zone'}`, sev:'success' }); 
      
      if (zoneType === 'high_risk' || zoneType === 'caution') {
        zoneService.add({
          id: `inc_${inc._id}`,
          name: `Incident Zone: ${inc.incidentId}`,
          type: zoneType === 'high_risk' ? 'danger' : 'caution',
          lat: inc.location.latitude || 20.2961,
          lng: inc.location.longitude || 85.8245,
          radius: zoneType === 'high_risk' ? 800 : 500,
          reason: REPORT_TYPE_META[inc.reportType]?.label || inc.reportType
        });
      } else {
        zoneService.removeByIncidentId(inc._id);
      }
      
      load(); 
    }
  };

  const viewMap = (lat: number, lng: number) => {
    navigate(`/admin/tracking?lat=${lat}&lng=${lng}`);
  };

  const fmt = (d: string) => new Date(d).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });

  // ─── Stat cards ────────────────────────────────────────────────────────────
  const StatCard = ({ label, value, icon, bg, textColor }: any) => (
    <Card sx={{ flex:1, background: bg, color: textColor||'#fff', borderRadius:3, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Typography sx={{ fontSize: 36 }}>{icon}</Typography>
        <Box><Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
          <Typography variant="body2" sx={{ opacity:0.85 }}>{label}</Typography></Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p:3, bgcolor:'#f1f5f9', minHeight:'100vh' }}>

      {/* ── Header */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h4" color="#1e293b" sx={{ fontWeight: 800 }}>🛡️ Incident Reports</Typography>
          <Typography variant="body2" color="text.secondary">Monitor, manage and respond to tourist safety incidents</Typography>
        </Box>
        <Button variant="contained" startIcon={<Refresh />} onClick={load}
          sx={{ bgcolor:'#1e293b', '&:hover':{ bgcolor:'#334155' }, borderRadius:2 }}>
          Refresh
        </Button>
      </Box>

      {/* ── Live Emergency Alerts Panel */}
      {liveAlerts.length > 0 && (
        <Box sx={{ mb:3, p:2, bgcolor:'#fef2f2', border:'2px solid #fecaca', borderRadius:3 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1.5 }}>
            <Typography variant="h6" color="error" sx={{ fontWeight: 800 }}>
              🚨 LIVE EMERGENCIES — {liveAlerts.length} Active
            </Typography>
            <Badge badgeContent={liveAlerts.length} color="error" />
          </Box>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            {liveAlerts.map(alert => (
              <Card key={alert.alertId} sx={{ bgcolor:'#fff', border:'1px solid #fca5a5', borderRadius:2, minWidth:280, flex:1 }}>
                <CardContent sx={{ py:1.5, px:2 }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Typography color="error.main" sx={{ fontWeight: 700, fontSize: 14 }}>
                      🚨 {alert.emergencyType?.toUpperCase() || 'EMERGENCY'}
                    </Typography>
                    <Chip label="ACTIVE" color="error" size="small" />
                  </Box>
                  <Typography variant="body2" sx={{ mt:0.5 }}>{alert.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tourist: {(alert as any).userName || alert.digitalId} • {fmt(alert.timestamp)}
                  </Typography>
                  <Box sx={{ display:'flex', gap:1, mt:1 }}>
                    <Button size="small" variant="outlined" color="error"
                      onClick={() => viewMap(alert.location.latitude, alert.location.longitude)}>
                      📍 Map
                    </Button>
                    <Button size="small" variant="contained" color="success"
                      onClick={async () => { await emergencyAPI.resolveAlert(alert.alertId); load(); }}>
                      ✅ Resolve
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* ── Stats */}
      <Box sx={{ display:'flex', gap:2, mb:3, flexWrap:'wrap' }}>
        <StatCard label="Total Incidents" value={stats.total} icon="📋"
          bg="linear-gradient(135deg,#1e293b,#334155)" />
        <StatCard label="Active Cases" value={stats.active} icon="🔴"
          bg="linear-gradient(135deg,#dc2626,#ef4444)" />
        <StatCard label="Resolved Cases" value={stats.resolved} icon="✅"
          bg="linear-gradient(135deg,#16a34a,#22c55e)" />
        <StatCard label="Critical Alerts" value={stats.critical} icon="⚡"
          bg="linear-gradient(135deg,#d97706,#f59e0b)" />
        <StatCard label="High-Risk Zones" value={stats.highAlertZones} icon="🗺️"
          bg="linear-gradient(135deg,#7c3aed,#8b5cf6)" />
      </Box>

      {/* ── Filters */}
      <Card sx={{ borderRadius:3, mb:3, boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap', alignItems:'center' }}>
            <FilterList color="action" />
            <TextField variant="outlined" size="small" placeholder="Search by tourist, ID, location…"
              value={search} onChange={e => setSearch(e.target.value)}
              // @ts-ignore - MUI union type issue
              InputProps={{ startAdornment:<InputAdornment position="start"><Search fontSize="small"/></InputAdornment> }}
              sx={{ flex:2, minWidth:220 }} />
            <FormControl size="small" sx={{ minWidth:140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={e=>setFilterStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {Object.entries(STATUS_META).map(([k,v])=><MenuItem key={k} value={k}>{v.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth:140 }}>
              <InputLabel>Severity</InputLabel>
              <Select value={filterSeverity} label="Severity" onChange={e=>setFilterSeverity(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {Object.entries(SEVERITY_META).map(([k,v])=><MenuItem key={k} value={k}>{v.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth:180 }}>
              <InputLabel>Type</InputLabel>
              <Select value={filterType} label="Type" onChange={e=>setFilterType(e.target.value)}>
                <MenuItem value="">All Types</MenuItem>
                {Object.entries(REPORT_TYPE_META).map(([k,v])=><MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>)}
              </Select>
            </FormControl>
            {(filterStatus||filterSeverity||filterType||search) && (
              <Button size="small" startIcon={<Close/>}
                onClick={()=>{ setSearch(''); setFilterStatus(''); setFilterSeverity(''); setFilterType(''); }}>
                Clear
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ── Table */}
      <Card sx={{ borderRadius:3, boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor:'#1e293b' }}>
              <TableRow>
                {['Incident ID','Type','Tourist','Location','Date & Time','Severity','Status','Actions']
                  .map(h=><TableCell key={h} sx={{ color:'#e2e8f0', fontWeight:700, fontSize:13 }}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py:4 }}>
                  <CircularProgress size={32} />
                </TableCell></TableRow>
              ) : incidents.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py:5 }}>
                  <Typography color="text.secondary">No incidents found</Typography>
                </TableCell></TableRow>
              ) : incidents.map(inc => {
                const typeMeta = REPORT_TYPE_META[inc.reportType] || REPORT_TYPE_META.other;
                const sevMeta  = SEVERITY_META[inc.severity]      || SEVERITY_META.medium;
                const stsMeta  = STATUS_META[inc.status]          || STATUS_META.pending;
                return (
                  <TableRow key={inc._id} hover
                    sx={{ borderLeft: inc.severity==='critical' ? '4px solid #dc2626' :
                                      inc.severity==='high'     ? '4px solid #f59e0b' : '4px solid transparent' }}>
                    <TableCell>
                      <Typography color="#1e293b" sx={{ fontWeight: 700, fontSize: 13 }}>{inc.incidentId}</Typography>
                      {inc.markedAsZone && (
                        <Chip size="small" label={inc.zoneType==='high_risk'?'🔴 High Risk':'🟡 Caution'}
                          sx={{ fontSize:10, height:18, mt:0.3 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                        <span style={{ fontSize:18 }}>{typeMeta.icon}</span>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{typeMeta.label}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{inc.touristName}</Typography>
                      {inc.touristDigitalId && (
                        <Typography color="text.secondary" sx={{ fontSize: 11 }}>{inc.touristDigitalId}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12 }}>{inc.location.address || 'GPS Location'}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                        {inc.location.latitude.toFixed(4)}, {inc.location.longitude.toFixed(4)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12 }}>{fmt(inc.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={sevMeta.label} color={sevMeta.color} size="small" sx={{ fontWeight:700 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={stsMeta.label} color={stsMeta.color} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display:'flex', gap:0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={()=>openDetail(inc)}>
                            <Assignment fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton size="small" onClick={()=>openStatusDialog(inc)}>
                            <TrendingUp fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View on Map">
                          <IconButton size="small"
                            onClick={()=>viewMap(inc.location.latitude, inc.location.longitude)}>
                            <LocationOn fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p:2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {incidents.length} incident{incidents.length!==1?'s':''} • Auto-refreshes every 10s
          </Typography>
        </Box>
      </Card>

      {/* ── Detail Dialog */}
      <Dialog open={detailOpen} onClose={()=>setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor:'#1e293b', color:'#fff', display:'flex', justifyContent:'space-between' }}>
          <span>🛡️ Incident Detail — {selected?.incidentId}</span>
          <IconButton size="small" onClick={()=>setDetailOpen(false)} sx={{ color:'#fff' }}>
            <Close/>
          </IconButton>
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt:3 }}>
            <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Report Type</Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {REPORT_TYPE_META[selected.reportType]?.icon} {REPORT_TYPE_META[selected.reportType]?.label}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Severity</Typography>
                <Box sx={{ mt: 0.5 }}><Chip label={selected.severity.toUpperCase()} color={SEVERITY_META[selected.severity]?.color} size="small"/></Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Tourist</Typography>
                <Typography sx={{ fontWeight: 600 }}>{selected.touristName}</Typography>
                <Typography variant="caption" color="text.secondary">{selected.touristDigitalId}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}><Chip label={selected.status} color={STATUS_META[selected.status]?.color} size="small"/></Box>
              </Box>
              <Box sx={{ gridColumn:'1/-1' }}>
                <Typography variant="caption" color="text.secondary">Location</Typography>
                <Typography>{selected.location.address}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.location.latitude.toFixed(6)}, {selected.location.longitude.toFixed(6)}
                </Typography>
                <Button size="small" startIcon={<LocationOn/>} sx={{ mt:1 }}
                  onClick={()=>viewMap(selected.location.latitude, selected.location.longitude)}>
                  Open in Google Maps
                </Button>
              </Box>
              <Box sx={{ gridColumn:'1/-1' }}>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography>{selected.description || '—'}</Typography>
              </Box>
              {selected.adminNotes && (
                <Box sx={{ gridColumn:'1/-1', bgcolor:'#f8fafc', p:1.5, borderRadius:2 }}>
                  <Typography variant="caption" color="text.secondary">Admin Notes</Typography>
                  <Typography>{selected.adminNotes}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                <Typography>{selected.assignedTo || 'Unassigned'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Reported At</Typography>
                <Typography>{fmt(selected.createdAt)}</Typography>
              </Box>
            </Box>

            {/* Zone Actions */}
            <Box sx={{ mt:3, p:2, bgcolor:'#f8fafc', borderRadius:2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                <Shield fontSize="small" sx={{ mr:0.5, verticalAlign:'middle' }}/>
                Safety Zone Integration
              </Typography>
              <Box sx={{ display:'flex', gap:1 }}>
                <Button size="small" variant={selected.zoneType==='caution'?'contained':'outlined'}
                  color="warning" onClick={()=>markZone(selected, 'caution')}>
                  🟡 Mark as Caution Zone
                </Button>
                <Button size="small" variant={selected.zoneType==='high_risk'?'contained':'outlined'}
                  color="error" onClick={()=>markZone(selected, 'high_risk')}>
                  🔴 Mark as High-Risk Zone
                </Button>
                {selected.markedAsZone && (
                  <Button size="small" variant="outlined" onClick={()=>markZone(selected, '')}>
                    Clear Zone
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ px:3, pb:2, gap:1 }}>
          <Button onClick={()=>setDetailOpen(false)}>Close</Button>
          {selected && selected.status !== 'resolved' && (
            <Button variant="contained" color="success" startIcon={<CheckCircle/>}
              onClick={async () => {
                await incidentAPI.updateStatus(selected._id, { status:'resolved' });
                setDetailOpen(false); load();
                setSnack({ open:true, msg:'Incident resolved', sev:'success' });
              }}>
              Mark Resolved
            </Button>
          )}
          {selected && (
            <Button variant="contained" sx={{ bgcolor:'#1e293b' }}
              onClick={()=>{ setDetailOpen(false); openStatusDialog(selected); }}>
              Update Status
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Status Update Dialog */}
      <Dialog open={statusDialog} onClose={()=>setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor:'#1e293b', color:'#fff' }}>
          Update Incident Status — {selected?.incidentId}
        </DialogTitle>
        <DialogContent sx={{ pt:3, display:'flex', flexDirection:'column', gap:2 }}>
          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select value={newStatus} label="New Status" onChange={e=>setNewStatus(e.target.value)}>
              <MenuItem value="pending">🟡 Pending</MenuItem>
              <MenuItem value="responding">🔵 Responding</MenuItem>
              <MenuItem value="resolved">✅ Resolved</MenuItem>
              <MenuItem value="dismissed">⬛ Dismissed</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Assigned To (Station / Officer)"
            value={assignedTo} onChange={e=>setAssignedTo(e.target.value)}
            placeholder="e.g. Connaught Place Police Station" />
          <TextField fullWidth multiline rows={3} label="Admin Notes"
            value={adminNotes} onChange={e=>setAdminNotes(e.target.value)}
            placeholder="Add response notes, actions taken…" />
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={()=>setStatusDialog(false)}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor:'#1e293b' }}
            onClick={saveStatus} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit"/> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.sev} variant="filled" onClose={()=>setSnack(s=>({...s,open:false}))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminIncidentReportsScreen;
