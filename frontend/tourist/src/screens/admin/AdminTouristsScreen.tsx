import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Avatar,
  TextField, InputAdornment, Button, IconButton, Tooltip,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Stack
} from '@mui/material';
import { Search, VerifiedUser, Refresh, QrCode2, Phone, Badge as BadgeIcon, Close, ContentCopy, CheckCircle } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { apiService, User } from '../../services/api';

interface TouristCardProps {
  user: User;
  onViewQR: (user: User) => void;
}

const TouristCard: React.FC<TouristCardProps> = ({ user, onViewQR }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emergencyPhone =
    (user as any).emergencyContacts?.[0]?.phone ||
    (user as any).emergencyContact ||
    'N/A';

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      border: '1px solid #f1f5f9',
      transition: 'all 0.2s ease',
      '&:hover': { boxShadow: '0 8px 32px rgba(99,102,241,0.12)', borderColor: '#c7d2fe' }
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 52, height: 52, bgcolor: '#6366f1', fontWeight: 800, fontSize: 20 }}>
            {user.name[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
              {user.email}
            </Typography>
          </Box>
          <Chip
            icon={<CheckCircle sx={{ fontSize: 14 }} />}
            label="Active"
            size="small"
            sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: 11 }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Digital ID */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BadgeIcon sx={{ fontSize: 12 }} /> Digital ID
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#6366f1', fontFamily: 'monospace', fontSize: 13, bgcolor: '#eef2ff', px: 1.5, py: 0.5, borderRadius: 1.5, flex: 1 }}>
              {user.digitalId}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy ID'}>
              <IconButton size="small" onClick={() => handleCopy(user.digitalId)} sx={{ color: '#6366f1' }}>
                <ContentCopy sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Phone */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Phone sx={{ fontSize: 12 }} /> Contact Number
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.5 }}>
            {user.phone || 'N/A'}
          </Typography>
        </Box>

        {/* Emergency Contact */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Emergency Contact
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#ef4444', mt: 0.5 }}>
            {emergencyPhone}
          </Typography>
        </Box>

        {/* QR Preview + Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <QRCodeSVG
              value={`${window.location.origin}/verify/${user.digitalId}`}
              size={52}
              level="M"
              includeMargin={false}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<QrCode2 />}
            size="small"
            onClick={() => onViewQR(user)}
            sx={{
              borderColor: '#6366f1',
              color: '#6366f1',
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': { bgcolor: '#eef2ff', borderColor: '#4f46e5' }
            }}
          >
            View Full QR
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── QR Dialog ───────────────────────────────────────────────────────────────
const QRDialog: React.FC<{ user: User | null; onClose: () => void }> = ({ user, onClose }) => {
  if (!user) return null;

  const qrValue = `${window.location.origin}/verify/${user.digitalId}`;

  const downloadQR = () => {
    const svg = document.getElementById('tourist-qr-full');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.digitalId}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={!!user} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Tourist Digital ID QR</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ display: 'inline-block', p: 3, bgcolor: '#fff', border: '2px solid #e2e8f0', borderRadius: 3, mb: 2 }}>
          <QRCodeSVG
            id="tourist-qr-full"
            value={qrValue}
            size={220}
            level="H"
            includeMargin
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>{user.name}</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#6366f1', bgcolor: '#eef2ff', px: 2, py: 0.5, borderRadius: 1, display: 'inline-block', mb: 1 }}>
          {user.digitalId}
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>📞 {user.phone || 'N/A'}</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>✉ {user.email}</Typography>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
        <Button onClick={downloadQR} variant="contained" startIcon={<QrCode2 />} sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 2 }}>
          Download QR
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const AdminTouristsScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllUsers();
      if (response.success && response.users) {
        setUsers(response.users.filter((u: User) => u.role === 'tourist'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.digitalId?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
            Tourist Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
            {users.length} registered tourist{users.length !== 1 ? 's' : ''} — showing Digital ID, contact & QR code
          </Typography>
        </Box>
        <Tooltip title="Refresh list">
          <IconButton onClick={fetchUsers} disabled={loading} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
            {loading ? <CircularProgress size={20} sx={{ color: '#6366f1' }} /> : <Refresh sx={{ color: '#6366f1' }} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by name, Digital ID, phone or email..."
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start"><Search sx={{ color: '#94a3b8' }} /></InputAdornment>
            )
          }
        }}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
      />

      {/* Loading */}
      {loading && users.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
      )}

      {/* Cards Grid */}
      {!loading || users.length > 0 ? (
        filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <VerifiedUser sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
            <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {search ? 'No tourists match your search.' : 'No tourists registered yet.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
            gap: 2.5
          }}>
            {filtered.map((user) => (
              <TouristCard key={user.id || (user as any)._id} user={user} onViewQR={setSelectedUser} />
            ))}
          </Box>
        )
      ) : null}

      {/* QR Dialog */}
      <QRDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
    </Box>
  );
};

export default AdminTouristsScreen;
