import { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/MSW/MSWSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TableContainer,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Box,
  Typography,
  Snackbar,
  Alert,
  Chip,
  Grid,
  Card,
  InputAdornment,
  IconButton,
  Checkbox
} from "@mui/material";
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon
} from "@mui/icons-material";

import { apiRequest } from "../../utils/api";

export default function MSWVirtualC() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64 pt-16">
        <Navbar />
        <div className="p-6">
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <StreamSection setSnackbar={setSnackbar} />
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

function StreamSection({ setSnackbar }) {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementFilterContext, setAnnouncementFilterContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ageFilter, setAgeFilter] = useState('all');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [userMunicipality, setUserMunicipality] = useState('');
  const [cdcListForAnnouncements, setCdcListForAnnouncements] = useState([]);
  const [cdcBarangayFilter, setCdcBarangayFilter] = useState('');
  const [cdcBarangayOptions, setCdcBarangayOptions] = useState([]);
  const [cdcListLoading, setCdcListLoading] = useState(false);
  const [selectedCdcIds, setSelectedCdcIds] = useState([]);
  const [multiAnnouncementModalOpen, setMultiAnnouncementModalOpen] = useState(false);
  const [multiAnnouncementSubmitting, setMultiAnnouncementSubmitting] = useState(false);
  const [multiAnnouncement, setMultiAnnouncement] = useState({
    title: '',
    message: '',
    ageFilter: 'all',
    roleFilter: [],
    attachment: null,
    attachmentName: ''
  });

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const loggedInUser = JSON.parse(userString);
      if (loggedInUser) {
        if (loggedInUser.role || loggedInUser.type) {
          const role = loggedInUser.role || loggedInUser.type;
          setUserRole(role);
        }
        if (loggedInUser.id) {
          setUserId(loggedInUser.id);
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.id) {
          return;
        }
        const data = await apiRequest(`/api/user_session/current-user/details?userId=${storedUser.id}`);
        const address = data?.user?.other_info?.address;
        if (address) {
          const addressParts = address.split(',').map(part => part.trim());
          if (addressParts.length >= 2) {
            const municipality = addressParts.length === 2 ? addressParts[0] : addressParts[1];
            setUserMunicipality(municipality || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch user info for CDC list:', err);
      }
    };

    fetchUserInfo();
  }, []);

  const fetchCdcOptions = useCallback(async (municipalityParam) => {
    try {
      setCdcListLoading(true);
      const params = new URLSearchParams();
      if (municipalityParam) {
        params.append('municipality', municipalityParam);
      }
      const response = await apiRequest(`/api/cdc?${params.toString()}`);
      const list = response?.data || [];
      setCdcListForAnnouncements(list);
      const uniqueBarangays = [...new Set(list.map(item => item.barangay).filter(Boolean))].sort();
      setCdcBarangayOptions(uniqueBarangays);
    } catch (err) {
      console.error('Error fetching CDC list:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load CDC list',
        severity: 'error'
      });
    } finally {
      setCdcListLoading(false);
    }
  }, [setSnackbar]);

  useEffect(() => {
    if (userMunicipality) {
      fetchCdcOptions(userMunicipality);
    }
  }, [userMunicipality, fetchCdcOptions]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/announcements');
      setAnnouncements(data.announcements || []);
      setAnnouncementFilterContext(data.filter || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: 'Failed to fetch announcements',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [setSnackbar]);

  useEffect(() => {
    if (userId) {
      fetchAnnouncements();
    }
  }, [fetchAnnouncements, userId]);

  const handleDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const myAnnouncements = useMemo(() => {
    if (!userId) return [];
    return announcements.filter(ann => String(ann.author_id) === String(userId));
  }, [announcements, userId]);

  const filteredAnnouncements = ageFilter === 'all' 
    ? myAnnouncements 
    : myAnnouncements.filter(ann => ann.ageFilter === ageFilter || ann.ageFilter === 'all');

  const groupedAnnouncements = useMemo(() => {
    const map = new Map();
    filteredAnnouncements.forEach((announcement) => {
      const key = `${announcement.title}||${announcement.message}||${announcement.createdAt || ''}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: announcement.title,
          message: announcement.message,
          author: announcement.author,
          author_id: announcement.author_id,
          createdAt: announcement.createdAt,
          ageFilter: announcement.ageFilter,
          attachmentUrl: announcement.attachmentUrl,
          attachmentName: announcement.attachmentName,
          roleFilter: announcement.roleFilter,
          items: [],
        });
      }
      map.get(key).items.push(announcement);
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredAnnouncements]);

  const filteredCdcList = useMemo(() => {
    const baseList = cdcBarangayFilter
      ? cdcListForAnnouncements.filter(cdc => cdc.barangay === cdcBarangayFilter)
      : cdcListForAnnouncements;
    return [...baseList].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [cdcBarangayFilter, cdcListForAnnouncements]);

  const toggleCdcSelection = (cdcId) => {
    const id = String(cdcId);
    setSelectedCdcIds(prev =>
      prev.includes(id) ? prev.filter(existingId => existingId !== id) : [...prev, id]
    );
  };

  const allFilteredSelected = filteredCdcList.length > 0 && filteredCdcList.every(cdc => selectedCdcIds.includes(String(cdc.cdcId)));
  const someFilteredSelected = filteredCdcList.some(cdc => selectedCdcIds.includes(String(cdc.cdcId)));

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIds = filteredCdcList.map(cdc => String(cdc.cdcId));
      setSelectedCdcIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const newIds = filteredCdcList.map(cdc => String(cdc.cdcId));
      setSelectedCdcIds(prev => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const resetMultiAnnouncementState = () => {
    setSelectedCdcIds([]);
    setCdcBarangayFilter('');
    setMultiAnnouncement({
      title: '',
      message: '',
      ageFilter: 'all',
      roleFilter: userRole ? [userRole] : [],
      attachment: null,
      attachmentName: ''
    });
  };

  const handleCloseMultiAnnouncementModal = () => {
    setMultiAnnouncementModalOpen(false);
    resetMultiAnnouncementState();
  };

  const handleOpenMultiAnnouncementModal = () => {
    if (!cdcListForAnnouncements.length && !cdcListLoading) {
      fetchCdcOptions(userMunicipality);
    }
    setMultiAnnouncement(prev => ({
      ...prev,
      roleFilter: userRole ? [userRole] : []
    }));
    setMultiAnnouncementModalOpen(true);
  };

  const handleMultiAnnouncementFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setMultiAnnouncement(prev => ({
        ...prev,
        attachment: file,
        attachmentName: file.name
      }));
    }
  };

  const handleMultiAnnouncementSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCdcIds.length) {
      setSnackbar({
        open: true,
        message: 'Select at least one CDC',
        severity: 'warning'
      });
      return;
    }

    if (!multiAnnouncement.title.trim() || !multiAnnouncement.message.trim()) {
      setSnackbar({
        open: true,
        message: 'Title and message are required',
        severity: 'warning'
      });
      return;
    }

    try {
      setMultiAnnouncementSubmitting(true);
      const formData = new FormData();
      formData.append('title', multiAnnouncement.title.trim());
      formData.append('message', multiAnnouncement.message.trim());
      formData.append('ageFilter', multiAnnouncement.ageFilter);
      formData.append('roleFilter', multiAnnouncement.roleFilter.join(','));
      selectedCdcIds.forEach(id => formData.append('cdc_ids[]', id));
      if (multiAnnouncement.attachment) {
        formData.append('attachment', multiAnnouncement.attachment);
      }

      await apiRequest('/api/announcements/multi-cdc', 'POST', formData, true);

      setSnackbar({
        open: true,
        message: 'Announcements sent to selected CDCs',
        severity: 'success'
      });
      handleCloseMultiAnnouncementModal();
      fetchAnnouncements();
    } catch (err) {
      console.error('Error sending announcements to CDCs:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to send announcements',
        severity: 'error'
      });
    } finally {
      setMultiAnnouncementSubmitting(false);
    }
  };

  return (
    <div className="text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <label className="font-medium">Filter:</label>
            <FormControl size="small">
              <InputLabel>Age Group</InputLabel>
              <Select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                label="Age Group"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All Ages</MenuItem>
                <MenuItem value="3-4">3.0 - 4.0 years</MenuItem>
                <MenuItem value="4-5">4.1 - 5.0 years</MenuItem>
                <MenuItem value="5-6">5.1 - 5.11 years</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <Button
            onClick={handleOpenMultiAnnouncementModal}
            variant="contained"
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
            startIcon={<CloudUploadIcon />}
          >
            Send to Multiple CDCs
          </Button>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && groupedAnnouncements.length === 0 && (
        <Box sx={{ 
          border: 2, 
          borderColor: 'grey.300', 
          borderStyle: 'dashed', 
          borderRadius: 2, 
          p: 6, 
          textAlign: 'center',
          my: 4
        }}>
          <Typography variant="h6" gutterBottom>
            No announcements yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Get started by creating a new announcement.
          </Typography>
        </Box>
      )}

      {!loading && groupedAnnouncements.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {groupedAnnouncements.map((group) => {
            const primary = group.items[0];
            const uniqueCdcs = Array.from(new Set(group.items.map(item => item.cdcId).filter(Boolean)));
            const getCdcDisplayName = (cdcId) => {
              const cdc = cdcListForAnnouncements.find(c => String(c.cdcId) === String(cdcId));
              if (cdc) {
                return `${cdc.name}${cdc.barangay ? ` (${cdc.barangay})` : ''}`;
              }
              return `CDC ID ${cdcId}`;
            };

            return (
              <Paper key={group.key} elevation={3} sx={{ p: 0 }}>
              <Box sx={{ 
                bgcolor: 'success.main', 
                color: 'white', 
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box sx={{ overflow: 'hidden', pr: 2 }}>
                  <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>{primary.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Posted by {primary.author} on {primary.createdAt ? new Date(primary.createdAt).toLocaleDateString() : 'Unknown date'}
                  </Typography>
                </Box>
                <Chip 
                  label={primary.ageFilter === 'all' ? 'All Ages' : `${primary.ageFilter} years`}
                  color="secondary"
                  size="small"
                />
              </Box>
              <Box sx={{ p: 3 }}>
                <Typography sx={{ whiteSpace: 'pre-line', mb: 2, wordBreak: 'break-word' }}>
                  {primary.message}
                </Typography>

                {uniqueCdcs.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      color="primary"
                      label={`Sent to ${uniqueCdcs.length} CDC${uniqueCdcs.length > 1 ? 's' : ''}`}
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ pl: 1 }}>
                      {uniqueCdcs.map(cdcId => (
                        <Typography key={cdcId} variant="body2" color="text.secondary">
                          • {getCdcDisplayName(cdcId)}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {primary.attachmentUrl && (
                  <Box sx={{ 
                    borderTop: 1, 
                    borderColor: 'divider', 
                    pt: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <InsertDriveFileIcon color="success" sx={{ mr: 1 }} />
                    <Typography>{primary.attachmentName}</Typography>
                    </Box>
                    <Button
                      onClick={() => handleDownload(primary.attachmentUrl, primary.attachmentName)}
                      color="success"
                      size="small"
                      startIcon={<DownloadIcon />}
                    >
                      Download
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
            );
          })}
        </Box>
      )}

      <Modal open={multiAnnouncementModalOpen} onClose={handleCloseMultiAnnouncementModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: 900,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            Send Announcement to Multiple CDCs
          </Typography>
          {userMunicipality ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Based on your municipality: {userMunicipality}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              CDC list is limited to your assigned area.
            </Typography>
          )}

          <form onSubmit={handleMultiAnnouncementSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Filter by Barangay</InputLabel>
              <Select
                value={cdcBarangayFilter}
                label="Filter by Barangay"
                onChange={(e) => setCdcBarangayFilter(e.target.value)}
              >
                <MenuItem value="">All Barangays</MenuItem>
                {cdcBarangayOptions.map(barangay => (
                  <MenuItem key={barangay} value={barangay}>
                    {barangay}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{
              border: 1,
              borderColor: 'grey.300',
              borderRadius: 1,
              p: 2,
              mb: 3
            }}>
              {cdcListLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox
                      checked={allFilteredSelected}
                      indeterminate={!allFilteredSelected && someFilteredSelected}
                      onChange={handleToggleSelectAllFiltered}
                      disabled={!filteredCdcList.length}
                    />
                    <Typography>
                      Select All ({filteredCdcList.length})
                    </Typography>
                  </Box>
                  <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                    {filteredCdcList.length === 0 ? (
                      <Typography color="text.secondary" sx={{ p: 2 }}>
                        No CDCs available for the selected filter.
                      </Typography>
                    ) : (
                      filteredCdcList.map(cdc => (
                        <Box
                          key={cdc.cdcId}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                            borderBottom: '1px solid',
                            borderColor: 'grey.100',
                          }}
                        >
                          <Checkbox
                            checked={selectedCdcIds.includes(String(cdc.cdcId))}
                            onChange={() => toggleCdcSelection(cdc.cdcId)}
                          />
                          <Box>
                            <Typography fontWeight={600}>{cdc.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Barangay: {cdc.barangay || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </>
              )}
            </Box>

            <TextField
              label="Title"
              fullWidth
              required
              value={multiAnnouncement.title}
              onChange={(e) => setMultiAnnouncement(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Message"
              fullWidth
              required
              multiline
              rows={4}
              value={multiAnnouncement.message}
              onChange={(e) => setMultiAnnouncement(prev => ({ ...prev, message: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Age Group</InputLabel>
              <Select
                value={multiAnnouncement.ageFilter}
                label="Target Age Group"
                onChange={(e) => setMultiAnnouncement(prev => ({ ...prev, ageFilter: e.target.value }))}
                required
              >
                <MenuItem value="all">All Ages</MenuItem>
                <MenuItem value="3-4">3.0 - 4.0 years</MenuItem>
                <MenuItem value="4-5">4.1 - 5.0 years</MenuItem>
                <MenuItem value="5-6">5.1 - 5.11 years</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Target Roles</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {['worker', 'president', 'parent', 'focal'].map(role => (
                  <Chip
                    key={role}
                    label={
                      role === 'worker'
                        ? 'CD Workers'
                        : role === 'president'
                        ? 'President'
                        : role === 'parent'
                        ? 'Parents'
                        : 'Focal'
                    }
                    color={multiAnnouncement.roleFilter.includes(role) ? 'primary' : 'default'}
                    clickable={userRole !== role}
                    onClick={() => {
                      if (userRole !== role) {
                        setMultiAnnouncement(prev => {
                          const exists = prev.roleFilter.includes(role);
                          return {
                            ...prev,
                            roleFilter: exists
                              ? prev.roleFilter.filter(r => r !== role)
                              : [...prev.roleFilter, role]
                          };
                        });
                      }
                    }}
                  />
                ))}
              </Box>
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Attachment (Optional)</Typography>
              <Box sx={{
                border: 2,
                borderColor: 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 1,
                p: 3,
                textAlign: 'center'
              }}>
                {multiAnnouncement.attachmentName ? (
                  <Typography>{multiAnnouncement.attachmentName}</Typography>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Drag and drop file here or click to browse
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                    >
                      Select File
                      <input
                        type="file"
                        hidden
                        onChange={handleMultiAnnouncementFileChange}
                      />
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      PDF, DOCX, XLSX up to 10MB
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCloseMultiAnnouncementModal}
                disabled={multiAnnouncementSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={multiAnnouncementSubmitting}
                startIcon={!multiAnnouncementSubmitting && <CloudUploadIcon />}
              >
                {multiAnnouncementSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send Announcements'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
}


