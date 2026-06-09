import React, { useState, useEffect, useMemo } from 'react';
import { getSecurityEvents } from '../services/auditApi'; 

const EVENT_TYPE_CONFIG = {
  BRUTE_FORCE:        { icon: '🔨', color: '#ef4444', label: 'Brute Force' },
  SUSPICIOUS_IP:      { icon: '🌐', color: '#f97316', label: 'Suspicious IP' },
  PRIVILEGE_ESCALATION: { icon: '⬆️', color: '#8b5cf6', label: 'Privilege Escalation' },
  DATA_EXFILTRATION:  { icon: '📤', color: '#dc2626', label: 'Data Exfiltration' },
  UNAUTHORIZED_ACCESS:{ icon: '🔒', color: '#f59e0b', label: 'Unauthorized Access' },
  MULTIPLE_FAILURES:  { icon: '⚡', color: '#6366f1', label: 'Multiple Failures' },
  SESSION_HIJACK:     { icon: '🎭', color: '#ec4899', label: 'Session Hijack' },
  CONFIG_CHANGE:      { icon: '⚙️', color: '#0ea5e9', label: 'Config Change' },
};

const SecurityEventCard = ({ event, onResolve }) => {
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const config = EVENT_TYPE_CONFIG[event.type] || { icon: '⚠️', color: '#ef4444', label: event.type || 'Unknown Threat' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;
    setResolving(true);
    try {
      if (onResolve) {
        await onResolve(event._id, notes);
      } else {
        alert('Resolve function not linked to parent.');
      }
      setShowNotes(false);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className={`sec-event-card ${event.resolved ? 'resolved' : ''}`} style={{ '--type-color': config.color }}>
      <div className="sec-card-header">
        <div className="sec-type-badge">
          <span className="sec-icon">{config.icon}</span>
          <span className="sec-label">{config.label}</span>
        </div>
        <span className={`sec-sev-badge ${event.severity?.toLowerCase()}`}>{event.severity}</span>
      </div>

      <p className="sec-desc">{event.description}</p>

      <div className="sec-meta-grid">
        <div><strong>IP:</strong> <span>{event.ipAddress || '—'}</span></div>
        <div><strong>User:</strong> <span>{event.userId?.name || event.userName || 'Guest'}</span></div>
        <div><strong>Module:</strong> <span>{event.module || '—'}</span></div>
        <div><strong>Time:</strong> <span>{event.createdAt ? new Date(event.createdAt).toLocaleString() : '—'}</span></div>
      </div>

      {event.resolved ? (
        <div className="sec-resolved-box">
          <div className="resolved-by">✅ Resolved</div>
          {event.resolutionNotes && <p className="resolved-notes">"{event.resolutionNotes}"</p>}
        </div>
      ) : (
        <div className="sec-actions">
          {!showNotes ? (
            <button className="sec-btn-resolve" onClick={() => setShowNotes(true)}>Take Action / Resolve</button>
          ) : (
            <form onSubmit={handleSubmit} className="sec-resolve-form">
              <textarea
                placeholder="Enter resolution notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={resolving}
                required
              />
              <div className="form-btns">
                <button type="button" className="sec-btn-cancel" onClick={() => setShowNotes(false)} disabled={resolving}>Cancel</button>
                <button type="submit" className="sec-btn-submit" disabled={resolving}>
                  {resolving ? 'Saving…' : 'Mark Resolved'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

const SecurityMonitor = ({ events: propEvents, onResolve, loading: propLoading }) => {
  const [internalEvents, setInternalEvents] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); 
  const [search, setSearch] = useState('');

  // 💡 Fix: propEvents එක Array එකක්ද සහ එහි දත්ත තියෙනවාද කියලා නිවැරදිව පරීක්ෂා කිරීම
  const hasPropEvents = useMemo(() => {
    if (Array.isArray(propEvents) && propEvents.length > 0) return true;
    if (propEvents && typeof propEvents === 'object' && !Array.isArray(propEvents)) {
      const extra = propEvents.events || propEvents.data || propEvents.alerts;
      if (Array.isArray(extra) && extra.length > 0) return true;
    }
    return false;
  }, [propEvents]);

  const fetchBackupData = async () => {
    if (hasPropEvents) return; // 💡 Props වලින් valid array එකක් ආවොත් විතරක් fetch එක නවත්වන්න
    setInternalLoading(true);
    try {
      const res = await getSecurityEvents();
      if (Array.isArray(res)) {
        setInternalEvents(res);
      } else if (res && Array.isArray(res.events)) {
        setInternalEvents(res.events);
      } else if (res && Array.isArray(res.data)) {
        setInternalEvents(res.data);
      } else if (res && Array.isArray(res.alerts)) {
        setInternalEvents(res.alerts);
      }
    } catch (err) {
      console.error("Self-fetch failed:", err);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupData();
  }, [propEvents, hasPropEvents]);

  const finalEventsList = useMemo(() => {
    const raw = hasPropEvents ? propEvents : internalEvents;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') {
      return raw.events || raw.data || raw.alerts || [];
    }
    return [];
  }, [propEvents, internalEvents, hasPropEvents]);

  const isLoading = propLoading !== undefined ? propLoading : internalLoading;

  // Filter & Search Logic
  const filtered = useMemo(() => {
    return finalEventsList.filter(ev => {
      if (activeTab === 'active' && ev.resolved) return false;
      if (activeTab === 'resolved' && !ev.resolved) return false;

      if (search.trim() !== '') {
        const query = search.toLowerCase();
        return (
          (ev.type || '').toLowerCase().includes(query) ||
          (ev.description || '').toLowerCase().includes(query) ||
          (ev.ipAddress || '').toLowerCase().includes(query) ||
          (ev.userId?.name || ev.userName || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [finalEventsList, activeTab, search]);

  const counts = useMemo(() => {
    return {
      all: finalEventsList.length,
      active: finalEventsList.filter(e => !e.resolved).length,
      resolved: finalEventsList.filter(e => e.resolved).length,
    };
  }, [finalEventsList]);

  return (
    <div className="sec-monitor">
      <div className="sec-monitor-header">
        <div className="sec-monitor-tabs">
          <button className={`sec-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            Active Threats <span className="tab-count active">{counts.active}</span>
          </button>
          <button className={`sec-tab ${activeTab === 'resolved' ? 'active' : ''}`} onClick={() => setActiveTab('resolved')}>
            Resolved Cases <span className="tab-count resolved">{counts.resolved}</span>
          </button>
          <button className={`sec-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All History <span className="tab-count all">{counts.all}</span>
          </button>
        </div>

        <div className="sec-search-wrap">
          <input
            type="text"
            className="sec-search-input"
            placeholder="Search security incidents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="sec-loading">
          <div className="spinner" />
          <p>Analyzing network logs & threats...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="sec-empty">
          <span className="empty-icon">🛡️</span>
          <h4>No security events found</h4>
          <p>Everything looks safe. No active anomalies or incidents reported.</p>
        </div>
      ) : (
        <div className="sec-events-grid">
          {filtered.map(ev => (
            <SecurityEventCard key={ev._id} event={ev} onResolve={onResolve} />
          ))}
        </div>
      )}

      <style>{`
        .sec-monitor { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
        .sec-monitor-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; background: white; padding: 14px 20px; border: 1.5px solid #e2e8f0; border-radius: 14px; }
        .sec-monitor-tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 10px; }
        .sec-tab { padding: 7px 14px; border-radius: 7px; font-size: .82rem; font-weight: 600; color: #64748b; background: transparent; display: flex; align-items: center; gap: 6px; transition: all .15s; border: none; cursor: pointer; }
        .sec-tab.active { background: white; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
        .tab-count { font-size: .68rem; padding: 2px 7px; border-radius: 99px; font-weight: 700; }
        .tab-count.active { background: #fee2e2; color: #ef4444; }
        .tab-count.resolved { background: #dcfce7; color: #16a34a; }
        .tab-count.all { background: #e2e8f0; color: #475569; }
        
        .sec-search-wrap { min-width: 240px; }
        .sec-search-input { width: 100%; padding: 8px 14px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: .82rem; transition: border-color .15s; }
        .sec-search-input:focus { outline: none; border-color: #3b82f6; }

        .sec-events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .sec-event-card { background: white; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px; border-top: 4px solid var(--type-color); display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.01); position: relative; text-align: left; }
        .sec-event-card.resolved { border-top-color: #cbd5e1; opacity: 0.85; }
        
        .sec-card-header { display: flex; justify-content: space-between; align-items: center; }
        .sec-type-badge { display: flex; align-items: center; gap: 6px; }
        .sec-icon { font-size: 1.1rem; }
        .sec-label { font-weight: 700; font-size: .88rem; color: #0f172a; }
        
        .sec-sev-badge { font-size: .68rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; }
        .sec-sev-badge.low { background: #f0fdf4; color: #16a34a; }
        .sec-sev-badge.medium { background: #fffbeb; color: #d97706; }
        .sec-sev-badge.high { background: #fff7ed; color: #ea580c; }
        .sec-sev-badge.critical { background: #fef2f2; color: #dc2626; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

        .sec-desc { font-size: .82rem; color: #475569; margin: 0; line-height: 1.4; font-weight: 500; }
        
        .sec-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #f1f5f9; font-size: .78rem; }
        .sec-meta-grid div { color: #64748b; }
        .sec-meta-grid span { color: #1e293b; font-weight: 600; }

        .sec-btn-resolve { width: 100%; padding: 8px; background: #fff5f5; color: #ef4444; border: 1.5px solid #fee2e2; border-radius: 8px; font-size: .8rem; font-weight: 600; cursor: pointer; transition: all .15s; }
        .sec-btn-resolve:hover { background: #fee2e2; }
        
        .sec-resolve-form { display: flex; flex-direction: column; gap: 8px; }
        .sec-resolve-form textarea { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: .8rem; resize: none; font-family: inherit; }
        .form-btns { display: flex; gap: 6px; justify-content: flex-end; }
        .sec-btn-cancel { padding: 5px 11px; background: #f1f5f9; color: #475569; border: none; border-radius: 6px; font-size: .75rem; font-weight: 600; cursor: pointer; }
        .sec-btn-submit { padding: 5px 11px; background: #16a34a; color: white; border: none; border-radius: 6px; font-size: .75rem; font-weight: 600; cursor: pointer; }
        
        .sec-resolved-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 12px; border-radius: 8px; color: #16a34a; font-size: .78rem; }
        .resolved-by { font-weight: 700; margin-bottom: 2px; }
        .resolved-notes { margin: 0; color: #14532d; font-style: italic; }

        .sec-empty { text-align: center; padding: 40px; background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; color: #94a3b8; margin-top: 10px; }
        .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 8px; }
        .sec-empty h4 { margin: 0 0 4px 0; color: #475569; }
        .sec-empty p { margin: 0; font-size: .82rem; }

        .sec-loading { text-align: center; padding: 40px; color: #64748b; }
        .spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; margin: 0 auto 10px auto; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SecurityMonitor;