import api from '../api/axiosInstance';

/**
 * Fetch Audit Logs with filters
 */
export const getAuditLogs = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.action) query.append('action', params.action);
    if (params.userId) query.append('userId', params.userId);
    // UI එකෙන් 'All Modules' ආවොත් backend එකට filter එකක් යවන්න ඕනේ නැහැ
    if (params.module && params.module !== 'All Modules') query.append('module', params.module);
    if (params.severity && params.severity !== 'All Severities') query.append('severity', params.severity);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.search) query.append('search', params.search);
    if (params.branchId) query.append('branchId', params.branchId);

    // Backend එකෙන් logs response එක කෙලින්ම return කරනවා
    const res = await api.get(`/audit/logs?${query.toString()}`);
    return res.data; 
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

export const getAuditLogById = (id) => api.get(`/audit/logs/${id}`);

/**
 * Fetch Audit Dashboard Statistics
 */
export const getAuditStats = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.branchId) query.append('branchId', params.branchId);

    const res = await api.get(`/audit/stats?${query.toString()}`);
    // Backend එකෙන් එන stats response data එක කෙලින්ම return කරනවා
    return res.data;
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    throw error;
  }
};

/**
 * Fetch Login History
 */
export const getLoginHistory = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    // AuditSecurityPage එකෙන් pagination pass කරන්නේ සරලව (page, limit) විදිහටයි
    const page = params.page || 1;
    const limit = params.limit || 10;
    query.append('page', page);
    query.append('limit', limit);
    
    if (params.userId) query.append('userId', params.userId);
    if (params.status) query.append('status', params.status);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.search) query.append('search', params.search);

    const res = await api.get(`/audit/login-history?${query.toString()}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching login history:', error);
    throw error;
  }
};

/**
 * Fetch Security Events / Monitor
 */
export const getSecurityEvents = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.type) query.append('type', params.type);
    if (params.severity) query.append('severity', params.severity);
    if (params.resolved) query.append('resolved', params.resolved);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const res = await api.get(`/audit/security-events?${query.toString()}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching security events:', error);
    throw error;
  }
};

/**
 * Resolve a Security Event with Notes
 * UI එකෙන් බලාපොරොත්තු වෙන්නේ patch හෝ put එකක් backend එකට යනකම්
 */
export const resolveSecurityEvent = async (id, notes) => {
  try {
    const res = await api.patch(`/audit/security-events/${id}/resolve`, { notes });
    return res.data;
  } catch (error) {
    console.error('Error resolving security event:', error);
    throw error;
  }
};

/**
 * Generate a New Security/Audit Report
 */
export const generateAuditReport = async (payload) => {
  try {
    const res = await api.post('/audit/reports/generate', payload);
    return res.data;
  } catch (error) {
    console.error('Error generating audit report:', error);
    throw error;
  }
};

/**
 * Get Historically Generated Reports List
 */
export const getAuditReportHistory = async () => {
  try {
    const res = await api.get('/audit/reports');
    return res.data;
  } catch (error) {
    console.error('Error fetching report history:', error);
    throw error;
  }
};

/**
 * Export Logs
 */
export const exportAuditLogs = (params = {}) => {
  const query = new URLSearchParams();
  if (params.format) query.append('format', params.format);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.module) query.append('module', params.module);
  return api.get(`/audit/export?${query.toString()}`);
};

/**
 * User Sessions Management
 */
export const getActiveSessions = () => api.get('/audit/sessions/active');

export const revokeSession = async (sessionId) => {
  try {
    const res = await api.delete(`/audit/sessions/${sessionId}`);
    return res.data;
  } catch (error) {
    console.error('Error revoking session:', error);
    throw error;
  }
};

export const revokeAllSessions = (userId) =>
  api.delete(`/audit/sessions/user/${userId}`);