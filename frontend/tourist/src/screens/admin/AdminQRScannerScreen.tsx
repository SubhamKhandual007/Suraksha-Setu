import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Chip, Avatar, CircularProgress, Alert, Divider, Tooltip
} from '@mui/material';
import { QrCodeScanner, CheckCircle, UploadFile, ImageSearch, Clear } from '@mui/icons-material';
import { apiService } from '../../services/api';
import jsQR from 'jsqr';
import { verificationLog } from '../../services/verificationLog';

const AdminQRScannerScreen: React.FC = () => {
  const [scannedId, setScannedId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const verify = async (digitalId: string) => {
    if (!digitalId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiService.verifyDigitalId(digitalId.trim());
      const userData = response.user || response.tourist;

      if (response.success && userData) {
        const resultData = {
          name: userData.name || (userData.firstName + ' ' + userData.lastName),
          digitalId: userData.digitalId,
          status: userData.status || 'Verified',
          phone: userData.phone || 'N/A',
          email: userData.email || 'N/A',
          emergencyContact: userData.emergencyContact || 'N/A',
          location: userData.location,
        };
        setResult(resultData);
        // Log this scan so the Notifications screen shows the real name
        verificationLog.add({
          touristName: resultData.name,
          digitalId: resultData.digitalId,
          phone: resultData.phone,
          timestamp: new Date().toISOString(),
        });
      } else {
        setError('Invalid or unregistered Digital ID.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error verifying Digital ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => verify(scannedId);

  const decodeQRFromImage = useCallback((file: File) => {
    setError('');
    setResult(null);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Failed to process image.');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          // Try to parse as JSON (QR code data format from our system)
          try {
            const parsed = JSON.parse(code.data);
            if (parsed.digitalId) {
              setScannedId(parsed.digitalId);
              verify(parsed.digitalId);
              return;
            }
          } catch {
            // Not JSON, treat as raw Digital ID string or URL
          }

          let idToVerify = code.data;
          // If it is a URL, parse the digitalId out of it (e.g. /verify/TIDXXXX)
          if (idToVerify.includes('/verify/')) {
            const parts = idToVerify.split('/verify/');
            if (parts.length > 1) {
              idToVerify = parts[1].split('?')[0].split('#')[0].trim();
            }
          }

          setScannedId(idToVerify);
          verify(idToVerify);
        } else {
          setError('No QR code found in the uploaded image. Please try a clearer image.');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decodeQRFromImage(file);
    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      decodeQRFromImage(file);
    } else {
      setError('Please drop a valid image file.');
    }
  };

  const handleClear = () => {
    setUploadedImage(null);
    setUploadedFileName('');
    setScannedId('');
    setResult(null);
    setError('');
  };

  const statusColor = result?.status === 'EMERGENCY' ? '#ef4444' : '#22c55e';
  const statusBg = result?.status === 'EMERGENCY' ? '#fef2f2' : '#f0fdf4';
  const statusBorder = result?.status === 'EMERGENCY' ? '#fecaca' : '#bbf7d0';

  return (
    <Box sx={{ p: 3, maxWidth: 860, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
        Tourist QR Scanner
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
        Scan or upload a tourist's QR code to verify their Digital ID
      </Typography>

      {/* QR Upload Drop Zone */}
      <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageSearch sx={{ color: '#6366f1' }} /> Upload QR Code Image
          </Typography>

          {/* Drop Zone */}
          <Box
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !uploadedImage && fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${isDragging ? '#6366f1' : '#cbd5e1'}`,
              borderRadius: 3,
              p: 3,
              bgcolor: isDragging ? '#eef2ff' : uploadedImage ? '#f8fafc' : '#f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              cursor: uploadedImage ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': !uploadedImage ? { borderColor: '#6366f1', bgcolor: '#eef2ff' } : {},
              position: 'relative',
            }}
          >
            {uploadedImage ? (
              <>
                <img
                  src={uploadedImage}
                  alt="Uploaded QR"
                  style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
                />
                <Typography variant="caption" sx={{ color: '#64748b', mt: 1 }}>
                  {uploadedFileName}
                </Typography>
                <Tooltip title="Clear image">
                  <Button
                    size="small"
                    startIcon={<Clear />}
                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                    sx={{ mt: 1, color: '#ef4444' }}
                  >
                    Clear
                  </Button>
                </Tooltip>
              </>
            ) : (
              <>
                <UploadFile sx={{ fontSize: 52, color: '#94a3b8', mb: 1.5 }} />
                <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600 }}>
                  Drag & drop a QR image here
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  or click to browse files
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', mt: 0.5 }}>
                  Supports PNG, JPG, JPEG, WEBP
                </Typography>
              </>
            )}
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ mt: 2, borderColor: '#6366f1', color: '#6366f1', '&:hover': { bgcolor: '#eef2ff', borderColor: '#4f46e5' } }}
            fullWidth
          >
            Choose QR Image File
          </Button>
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeScanner sx={{ color: '#6366f1' }} /> Manual Digital ID Entry
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Enter Digital ID (e.g. TID1776620288768167)"
              variant="outlined"
              size="small"
              fullWidth
              value={scannedId}
              onChange={(e) => setScannedId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              onClick={handleScan}
              disabled={loading || !scannedId.trim()}
              sx={{ minWidth: 120, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 2, py: 1 }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3, py: 2 }}>
          <CircularProgress size={28} sx={{ color: '#6366f1' }} />
          <Typography sx={{ color: '#64748b' }}>Verifying Digital ID...</Typography>
        </Box>
      )}

      {/* Result */}
      {result && (
        <Card sx={{ borderRadius: 3, bgcolor: statusBg, border: `1px solid ${statusBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: statusColor, fontSize: 22, fontWeight: 700 }}>
                {result.name[0].toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{result.name}</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Digital ID: {result.digitalId}</Typography>
              </Box>
              <Chip
                icon={<CheckCircle />}
                label={result.status === 'EMERGENCY' ? '⚠ EMERGENCY' : '✓ VERIFIED SAFE'}
                sx={{
                  bgcolor: statusColor,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  px: 1,
                  '& .MuiChip-icon': { color: '#fff' }
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[
                { label: 'Phone', value: result.phone },
                { label: 'Email', value: result.email },
                { label: 'Emergency Contact', value: result.emergencyContact },
                { label: 'Last Known City', value: result.location?.city || 'Unknown' },
              ].map(({ label, value }) => (
                <Box key={label}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminQRScannerScreen;
