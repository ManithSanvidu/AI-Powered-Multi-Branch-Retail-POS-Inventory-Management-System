import React, { useState, useEffect, useCallback } from 'react';
import KPICards from '../../components/dashboard/KPICards';
import SalesChart from '../../components/dashboard/SalesChart';
import BranchPerformance from '../../components/dashboard/BranchPerformance';
import InventoryStatus from '../../components/dashboard/InventoryStatus';
import TopProducts from '../../components/dashboard/TopProducts';
import LiveFeed from '../../components/dashboard/LiveFeed';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socketService';

// Demo data generator
const generateDemoData = () => ({
  kpi: {
    revenue: { total: '$48,250', growth_percentage: 12.4, trend: 'up' },
    sales: { count: 1284, growth_percentage: 8.1, avg_transaction_value: '$37.58', unique_customers: 842 },
    profit: { total: '$14,820', margin_percentage: 30.7 },
    stock_turnover: { avg_rate: '4.2x', efficiency: 'Healthy' },
  },
  inventory: { total_products: 486, total_stock: 32610, inventory_value: '$124,600', avg_stock_level: 67.1 },
  low_stock_alerts: { count: 12 },
  branches: null,
  top_products: null,
  sales: null,
});

const BRANCHES = [
  { id: 'all', name: 'All Branches', icon: '🏢', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop' },
  { id: '1', name: 'Colombo Head Office', icon: '🏙️', image: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=100&h=100&fit=crop' },
  { id: '2', name: 'Kandy City Branch', icon: '🏞️', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=100&h=100&fit=crop' },
  { id: '3', name: 'Galle Fort Branch', icon: '🏯', image: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=100&h=100&fit=crop' },
  { id: '4', name: 'Negombo Branch', icon: '🏖️', image: 'https://images.unsplash.com/photo-1582308883171-79927e0e0697?w=100&h=100&fit=crop' },
];

const DATE_PRESETS = [
  { label: 'Today', value: 'today', icon: '📅' },
  { label: 'This Week', value: 'week', icon: '📆' },
  { label: 'This Month', value: 'month', icon: '📊' },
  { label: 'Last 3 Months', value: 'quarter', icon: '📈' },
  { label: 'Custom', value: 'custom', icon: '⚙️' },
];

const getDateRange = (preset) => {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start;
  if (preset === 'today') start = end;
  else if (preset === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); start = d.toISOString().split('T')[0]; }
  else if (preset === 'month') { const d = new Date(now); d.setDate(1); start = d.toISOString().split('T')[0]; }
  else if (preset === 'quarter') { const d = new Date(now); d.setMonth(d.getMonth() - 3); start = d.toISOString().split('T')[0]; }
  else start = end;
  return { startDate: start, endDate: end };
};

const Dashboard = ({ viewRole }) => {
  const { user, token } = useAuth();
  const role = viewRole || user?.role || 'admin';

  const [dashboardData, setDashboardData] = useState(generateDemoData());
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [datePreset, setDatePreset] = useState('month');
  const [dateRange, setDateRange] = useState(getDateRange('month'));
  const [wsConnected, setWsConnected] = useState(false);
  const [liveTransaction, setLiveTransaction] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Time-based state
  const [sunPhase, setSunPhase] = useState('morning'); // sunrise, morning, afternoon, sunset, night
  const [moonVisible, setMoonVisible] = useState(false);
  const [clouds, setClouds] = useState([]);

  // Update greeting and time-based elements
  useEffect(() => {
    const updateTimeBasedElements = () => {
      const now = new Date();
      const hour = now.getHours();
      setCurrentTime(now);
      
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
      
      // Update sun phase and moon visibility
      if (hour >= 5 && hour < 7) setSunPhase('sunrise');
      else if (hour >= 7 && hour < 12) setSunPhase('morning');
      else if (hour >= 12 && hour < 16) setSunPhase('afternoon');
      else if (hour >= 16 && hour < 18) setSunPhase('sunset');
      else setSunPhase('night');
      
      setMoonVisible(hour >= 19 || hour < 5);
      
      // Generate random clouds
      const cloudCount = Math.floor(Math.random() * 4) + 3;
      const newClouds = Array.from({ length: cloudCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 40 + 10,
        width: Math.random() * 150 + 100,
        opacity: Math.random() * 0.4 + 0.2,
        delay: Math.random() * 10,
      }));
      setClouds(newClouds);
    };
    
    updateTimeBasedElements();
    const interval = setInterval(updateTimeBasedElements, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // WebSocket
  useEffect(() => {
    socketService.connect(import.meta.env.VITE_API_URL || 'http://localhost:5000', token);
    socketService.on('connect', () => setWsConnected(true));
    socketService.on('disconnect', () => setWsConnected(false));
    socketService.on('dashboard-update', (data) => {
      setDashboardData(prev => ({ ...prev, ...data }));
      setLastUpdated(new Date());
      if (data.liveTransaction) setLiveTransaction(data.liveTransaction);
    });
    return () => socketService.disconnect();
  }, []);

  // Fetch data (simulated)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      setDashboardData(generateDemoData());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, dateRange]);

  useEffect(() => { fetchData(); }, [selectedBranch, datePreset]);

  const handlePreset = (preset) => {
    setDatePreset(preset);
    if (preset !== 'custom') setDateRange(getDateRange(preset));
  };

  const selectedBranchData = BRANCHES.find(b => b.id === selectedBranch);
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  // Get sky gradient based on time
  const getSkyGradient = () => {
    switch(sunPhase) {
      case 'sunrise':
        return 'linear-gradient(180deg, #ff7e5e 0%, #feb47b 40%, #ffd6a5 100%)';
      case 'morning':
        return 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)';
      case 'afternoon':
        return 'linear-gradient(180deg, #3b8dff 0%, #86b6ff 50%, #b8d4ff 100%)';
      case 'sunset':
        return 'linear-gradient(180deg, #ff6b6b 0%, #ff8e53 30%, #ffd93d 100%)';
      case 'night':
        return 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
      default:
        return 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)';
    }
  };

  return (
    <div className="dashboard-page">
      {/* Dynamic Sky Background */}
      <div className="sky-background" style={{ background: getSkyGradient() }}>
        {/* Sun */}
        <div className={`sun ${sunPhase}`}>
          <div className="sun-core"></div>
          <div className="sun-rays"></div>
        </div>
        
        {/* Moon */}
        {moonVisible && (
          <div className="moon">
            <div className="moon-crater"></div>
            <div className="moon-crater small"></div>
          </div>
        )}
        
        {/* Clouds */}
        {clouds.map(cloud => (
          <div 
            key={cloud.id} 
            className="cloud" 
            style={{
              left: `${cloud.left}%`,
              top: `${cloud.top}%`,
              width: `${cloud.width}px`,
              opacity: cloud.opacity,
              animationDelay: `${cloud.delay}s`,
            }}
          />
        ))}
        
        {/* City Skyline */}
        <div className="city-skyline">
          <div className="building"></div>
          <div className="building tall"></div>
          <div className="building"></div>
          <div className="building wide"></div>
          <div className="building"></div>
          <div className="building tall"></div>
          <div className="building"></div>
        </div>
      </div>

      {/* Page Content */}
      <div className="content-wrapper">
        {/* Page Header */}
        <div className="dash-header">
          <div className="dash-header-left">
            <div className="greeting-badge">
              <span className="wave-emoji">👋</span>
              <span className="greeting-text">{greeting}, {user?.name || 'Admin'}!</span>
              <span className="time-display">🕐 {formattedTime}</span>
            </div>
            <h1 className="dash-title">
              Business Overview
              <span className="title-badge">
                <span className="badge-pulse"></span>
                Live
              </span>
            </h1>
            <p className="dash-sub">Real-time insights & performance metrics</p>
            <div className="time-indicator">
              <span className="time-icon">⏰</span>
              <span>{sunPhase === 'sunrise' ? 'Beautiful sunrise over the city' : 
                     sunPhase === 'morning' ? 'Bright morning sun warming up' :
                     sunPhase === 'afternoon' ? 'High sun with scattered clouds' :
                     sunPhase === 'sunset' ? 'Spectacular sunset colors' : 
                     'Starlit night over Colombo'}</span>
            </div>
          </div>
          <div className="dash-header-right">
            <div className="weather-widget">
              <span className="weather-icon">
                {sunPhase === 'night' ? '🌙' : 
                 sunPhase === 'sunset' ? '🌅' : 
                 sunPhase === 'sunrise' ? '🌄' : '☀️'}
              </span>
              <span className="weather-temp">
                {sunPhase === 'night' ? '22°C' : 
                 sunPhase === 'morning' ? '26°C' : 
                 sunPhase === 'afternoon' ? '32°C' : 
                 sunPhase === 'sunset' ? '28°C' : '24°C'}
              </span>
              <span className="weather-location">Colombo</span>
            </div>
            <div className="notification-wrapper">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <span className="bell-icon">🔔</span>
                <span className="notification-dot"></span>
              </button>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">Notifications</div>
                  <div className="notification-item">
                    <span className="notif-icon">🔄</span>
                    <span>Inventory updated</span>
                    <span className="notif-time">2 min ago</span>
                  </div>
                  <div className="notification-item">
                    <span className="notif-icon">💰</span>
                    <span>New sale recorded</span>
                    <span className="notif-time">15 min ago</span>
                  </div>
                </div>
              )}
            </div>
            <div className="last-update">
              <span className="update-icon">🕐</span>
              Updated {lastUpdated.toLocaleTimeString()}
            </div>
            <button className="refresh-btn" onClick={fetchData} disabled={loading}>
              <span className={loading ? 'spinning' : ''}>↻</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Branch Hero Banner */}
        {selectedBranch !== 'all' && (
          <div className="branch-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${selectedBranchData?.image})` }}>
            <div className="branch-hero-content">
              <span className="branch-hero-icon">{selectedBranchData?.icon}</span>
              <div className="branch-hero-info">
                <h2>{selectedBranchData?.name}</h2>
                <p>Branch Performance Overview</p>
              </div>
              <div className="branch-stats">
                <div className="branch-stat">
                  <span>Today's Revenue</span>
                  <strong>$12,450</strong>
                </div>
                <div className="branch-stat">
                  <span>Growth</span>
                  <strong className="positive">+8.2%</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="filter-group">
            <label className="filter-label">📍 Location</label>
            <select className="filter-select" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
              {BRANCHES.map(b => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">📅 Time Period</label>
            <div className="date-presets">
              {DATE_PRESETS.map(p => (
                <button
                  key={p.value}
                  className={`preset-btn ${datePreset === p.value ? 'active' : ''}`}
                  onClick={() => handlePreset(p.value)}
                >
                  <span className="preset-icon">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {datePreset === 'custom' && (
            <div className="filter-group custom-date-group">
              <label className="filter-label">📆 Custom Range</label>
              <div className="date-range-inputs">
                <input type="date" className="filter-input" value={dateRange.startDate} onChange={e => setDateRange(p => ({ ...p, startDate: e.target.value }))} />
                <span className="date-separator">→</span>
                <input type="date" className="filter-input" value={dateRange.endDate} onChange={e => setDateRange(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
          )}

          <div className="filter-group ml-auto">
            <div className="connection-status">
              <span className={`status-dot ${wsConnected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">{wsConnected ? 'Live Connection' : 'Reconnecting...'}</span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <section className="dash-section">
          <KPICards data={dashboardData} loading={loading} role={role} />
        </section>

        {/* Charts Section */}
        <section className="dash-section chart-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="section-icon">📊</span>
              <h2 className="section-title">Sales Analytics</h2>
              <span className="section-badge">Real-time</span>
            </div>
            <div className="chart-controls">
              <button className="chart-control">Daily</button>
              <button className="chart-control active">Weekly</button>
              <button className="chart-control">Monthly</button>
            </div>
          </div>
          <div className="chart-container">
            <SalesChart data={dashboardData} />
          </div>
        </section>

        {/* Branch Performance */}
        <section className="dash-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="section-icon">🏪</span>
              <h2 className="section-title">Branch Performance</h2>
            </div>
            <button className="view-all-btn">View All Branches →</button>
          </div>
          <BranchPerformance data={dashboardData} />
        </section>

        {/* Inventory + Live Feed Grid */}
        <section className="dash-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="section-icon">📦</span>
              <h2 className="section-title">Inventory Status</h2>
            </div>
            <div className="inventory-badge">
              <span className="badge-icon">⚠️</span>
              <span>{dashboardData.low_stock_alerts?.count || 0} Low Stock Alerts</span>
            </div>
          </div>
          <div className="inventory-grid">
            <InventoryStatus data={dashboardData} />
            <div className="quick-stats">
              <div className="quick-stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <span className="stat-value">94%</span>
                  <span className="stat-label">Stock Accuracy</span>
                </div>
              </div>
              <div className="quick-stat-card">
                <div className="stat-icon">🚚</div>
                <div className="stat-info">
                  <span className="stat-value">3</span>
                  <span className="stat-label">Pending Orders</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Products + Live Feed */}
        <section className="dash-section">
          <div className="tp-live-grid">
            <div className="top-products-wrapper">
              <div className="section-header">
                <div className="section-title-wrapper">
                  <span className="section-icon">⭐</span>
                  <h2 className="section-title">Top Performing Products</h2>
                </div>
              </div>
              <TopProducts data={dashboardData} />
            </div>
            <div className="live-feed-wrapper">
              <div className="section-header">
                <div className="section-title-wrapper">
                  <span className="section-icon">🔴</span>
                  <h2 className="section-title">Live Activity</h2>
                  {wsConnected && <span className="live-badge">LIVE</span>}
                </div>
              </div>
              <LiveFeed wsConnected={wsConnected} liveTransaction={liveTransaction} />
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Sky Background */
        .sky-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
          transition: background 0.5s ease;
        }

        /* Sun */
        .sun {
          position: absolute;
          border-radius: 50%;
          transition: all 0.5s ease;
        }

        .sun.sunrise {
          bottom: 10%;
          right: 15%;
          width: 80px;
          height: 80px;
          animation: sunriseAnim 20s ease-in-out infinite;
        }

        .sun.morning {
          top: 15%;
          right: 20%;
          width: 90px;
          height: 90px;
          animation: floatSun 10s ease-in-out infinite;
        }

        .sun.afternoon {
          top: 10%;
          right: 25%;
          width: 100px;
          height: 100px;
          animation: pulseSun 4s ease-in-out infinite;
        }

        .sun.sunset {
          bottom: 5%;
          right: 10%;
          width: 85px;
          height: 85px;
          animation: sunsetAnim 15s ease-in-out infinite;
        }

        .sun.night {
          display: none;
        }

        .sun-core {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, #fff5a0 0%, #ffdd00 60%, #ffaa00 100%);
          border-radius: 50%;
          box-shadow: 0 0 40px rgba(255, 200, 0, 0.8);
        }

        .sun-rays {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 140%;
          height: 140%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(255, 200, 0, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: rotateRays 20s linear infinite;
        }

        /* Moon */
        .moon {
          position: absolute;
          top: 12%;
          right: 18%;
          width: 70px;
          height: 70px;
          background: radial-gradient(circle, #ffeaa7 0%, #fdcb6e 100%);
          border-radius: 50%;
          box-shadow: 0 0 30px rgba(255, 235, 190, 0.5);
          animation: floatMoon 12s ease-in-out infinite;
        }

        .moon-crater {
          position: absolute;
          top: 25%;
          left: 30%;
          width: 15px;
          height: 12px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 50%;
        }

        .moon-crater.small {
          top: 55%;
          left: 60%;
          width: 10px;
          height: 8px;
        }

        /* Clouds */
        .cloud {
          position: absolute;
          height: 60px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50px;
          animation: floatCloud 25s linear infinite;
        }

        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: inherit;
          border-radius: 50%;
        }

        .cloud::before {
          width: 50px;
          height: 50px;
          top: -25px;
          left: 20px;
        }

        .cloud::after {
          width: 70px;
          height: 70px;
          top: -35px;
          left: 60px;
        }

        /* City Skyline */
        .city-skyline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 180px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 0 20px;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
        }

        .building {
          width: 60px;
          background: linear-gradient(180deg, rgba(30, 40, 60, 0.7) 0%, rgba(20, 30, 50, 0.9) 100%);
          border-radius: 8px 8px 0 0;
          backdrop-filter: blur(2px);
          transition: all 0.3s ease;
        }

        .building:nth-child(1) { height: 100px; width: 55px; }
        .building:nth-child(2) { height: 150px; width: 65px; }
        .building:nth-child(3) { height: 85px; width: 50px; }
        .building:nth-child(4) { height: 120px; width: 80px; }
        .building:nth-child(5) { height: 95px; width: 55px; }
        .building:nth-child(6) { height: 160px; width: 70px; }
        .building:nth-child(7) { height: 75px; width: 50px; }

        .building.tall {
          background: linear-gradient(180deg, rgba(40, 50, 70, 0.7) 0%, rgba(25, 35, 55, 0.9) 100%);
        }

        .building.wide {
          width: 90px;
        }

        /* Animations */
        @keyframes sunriseAnim {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-30px) scale(1.05); opacity: 1; }
        }

        @keyframes sunsetAnim {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.9; }
          50% { transform: translateY(-20px) scale(1.03); opacity: 1; }
        }

        @keyframes floatSun {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes pulseSun {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes rotateRays {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes floatMoon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }

        @keyframes floatCloud {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }

        /* Content Wrapper */
        .content-wrapper {
          position: relative;
          z-index: 1;
          padding: 24px 28px;
        }

        /* Header Styles */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .greeting-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 30px;
          margin-bottom: 16px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #1e293b;
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .time-display {
          color: #3b82f6;
          font-weight: 600;
        }

        .dash-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-family: 'Syne', sans-serif;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-badge {
          position: relative;
          font-size: 0.7rem;
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 4px 12px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
        }

        .title-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .badge-pulse {
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          animation: badgeBlink 1s ease-in-out infinite;
        }

        @keyframes badgeBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .time-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          font-size: 0.8rem;
          color: #475569;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(5px);
          padding: 5px 12px;
          border-radius: 20px;
          width: fit-content;
        }

        .dash-header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .weather-widget {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.5);
        }

        .notification-wrapper {
          position: relative;
        }

        .notification-btn {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          padding: 8px 14px;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.5);
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
        }

        .notification-btn:hover {
          background: white;
          transform: scale(1.05);
        }

        .notification-dot {
          position: absolute;
          top: 6px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: blink 1.5s ease-in-out infinite;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          min-width: 280px;
          z-index: 10;
          overflow: hidden;
        }

        .notification-header {
          padding: 12px 16px;
          background: #f8fafc;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
        }

        .notification-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
          cursor: pointer;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .branch-hero {
          background-size: cover;
          background-position: center;
          border-radius: 20px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .branch-hero-content {
          padding: 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          color: white;
        }

        .branch-hero-icon {
          font-size: 3rem;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
        }

        .branch-hero-info h2 {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }

        .branch-stats {
          display: flex;
          gap: 24px;
          margin-left: auto;
        }

        .branch-stat {
          text-align: center;
        }

        .branch-stat span {
          font-size: 0.75rem;
          opacity: 0.8;
          display: block;
        }

        .branch-stat strong {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .positive {
          color: #10b981;
        }

        .filters-bar {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.5);
          padding: 16px 24px;
          margin-bottom: 24px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ml-auto {
          margin-left: auto;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-select {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
        }

        .date-presets {
          display: flex;
          gap: 6px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
        }

        .preset-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          background: none;
          transition: all 0.3s;
        }

        .preset-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f1f5f9;
          border-radius: 20px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .status-dot.connected {
          background: #10b981;
        }

        .status-dot.disconnected {
          background: #ef4444;
        }

        .dash-section {
          margin-bottom: 28px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-icon {
          font-size: 1.5rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .section-badge {
          font-size: 0.7rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          padding: 3px 10px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
        }

        .chart-controls {
          display: flex;
          gap: 8px;
        }

        .chart-control {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          background: #f1f5f9;
          transition: all 0.3s;
        }

        .chart-control.active {
          background: #3b82f6;
          color: white;
        }

        .chart-container {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transform: perspective(1000px) rotateX(0deg);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .chart-container:hover {
          transform: perspective(1000px) rotateX(2deg);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }

        .inventory-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
        }

        .quick-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quick-stat-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transform: perspective(1000px) rotateX(0deg);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .quick-stat-card:hover {
          transform: perspective(1000px) rotateX(3deg) translateY(-2px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.12);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
        }

        .tp-live-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
        }

        .top-products-wrapper,
        .live-feed-wrapper {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transform: perspective(1000px) rotateX(0deg);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .top-products-wrapper:hover,
        .live-feed-wrapper:hover {
          transform: perspective(1000px) rotateX(2deg);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }

        .live-badge {
          background: #ef4444;
          color: white;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          animation: blink 1s ease-in-out infinite;
        }

        .view-all-btn {
          padding: 8px 16px;
          border-radius: 10px;
          background: #f1f5f9;
          font-size: 0.8rem;
          transition: all 0.3s;
        }

        .view-all-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 30px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          font-weight: 600;
          transition: all 0.3s;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .spinning {
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @media (max-width: 1100px) {
          .tp-live-grid {
            grid-template-columns: 1fr;
          }
          .content-wrapper {
            padding: 16px;
          }
          .inventory-grid {
            grid-template-columns: 1fr;
          }
          .branch-hero-content {
            flex-direction: column;
            text-align: center;
          }
          .branch-stats {
            margin-left: 0;
          }
          .dash-header {
            flex-direction: column;
            gap: 16px;
          }
          .dash-header-right {
            flex-wrap: wrap;
          }
          .city-skyline {
            height: 120px;
          }
          .building {
            width: 30px;
          }
          .building:nth-child(1) { width: 30px; height: 60px; }
          .building:nth-child(2) { width: 35px; height: 90px; }
          .building:nth-child(3) { width: 28px; height: 50px; }
          .building:nth-child(4) { width: 45px; height: 70px; }
          .building:nth-child(5) { width: 30px; height: 55px; }
          .building:nth-child(6) { width: 38px; height: 95px; }
          .building:nth-child(7) { width: 28px; height: 45px; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;