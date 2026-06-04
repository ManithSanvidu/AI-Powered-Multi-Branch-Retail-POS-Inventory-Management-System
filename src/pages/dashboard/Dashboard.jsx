import React, { useState, useEffect, useCallback, useRef } from 'react';
import KPICards from '../../components/dashboard/KPICards';
import SalesChart from '../../components/dashboard/SalesChart';
import BranchPerformance from '../../components/dashboard/BranchPerformance';
import InventoryStatus from '../../components/dashboard/InventoryStatus';
import TopProducts from '../../components/dashboard/TopProducts';
import LiveFeed from '../../components/dashboard/LiveFeed';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socketService';
import SuppliersPage from '../suppliers/SuppliersPage';
import EmployeesPage from '../employees/EmployeesPage';
import { InventoryProvider } from '../../context/InventoryContext';
import InventoryDashboard from '../inventory/InventoryDashboard';

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

// 20 Modules (excluding AI Retail Assistant which is now the chatbot)
const MODULE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard & Business Overview', icon: '📊', page: 1, isMain: true },
  { id: 'user-mgmt', label: 'User Management', icon: '👥', page: 1 },
  { id: 'branch-mgmt', label: 'Branch Management', icon: '🏢', page: 1 },
  { id: 'employee-mgmt', label: 'Employee Management', icon: '👔', page: 1 },
  { id: 'customer-mgmt', label: 'Customer Management', icon: '👤', page: 2 },
  { id: 'supplier-mgmt', label: 'Supplier Management', icon: '🚚', page: 2 },
  { id: 'product-mgmt', label: 'Product Management', icon: '📦', page: 2 },
  { id: 'inventory-mgmt', label: 'Inventory Management', icon: '📊', page: 2 },
  { id: 'warehouse-mgmt', label: 'Warehouse Management', icon: '🏭', page: 2 },
  { id: 'purchase-order', label: 'Purchase Order Management', icon: '📋', page: 2 },
  { id: 'pos-sales', label: 'POS Sales & Billing', icon: '🛒', page: 3 },
  { id: 'returns-refund', label: 'Returns & Refund', icon: '🔄', page: 3 },
  { id: 'stock-transfer', label: 'Stock Transfer', icon: '🚛', page: 3 },
  { id: 'promotion', label: 'Promotion & Discount', icon: '🏷️', page: 3 },
  { id: 'ai-forecast', label: 'AI Demand Forecasting', icon: '🤖', page: 3 },
  { id: 'ai-reorder', label: 'AI Smart Reordering', icon: '📈', page: 3 },
  { id: 'analytics', label: 'Business Analytics', icon: '📉', page: 3 },
  { id: 'reporting', label: 'Reporting', icon: '📄', page: 4 },
  { id: 'notifications', label: 'Notifications & Alert', icon: '🔔', page: 4 },
  { id: 'audit-logs', label: 'Audit Logs & Security', icon: '🛡️', page: 4 },
];

const _getDateRange = (preset) => {
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
  const [dateRange, setDateRange] = useState(_getDateRange('month'));
  const [wsConnected, setWsConnected] = useState(false);
  const [liveTransaction, setLiveTransaction] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [navExpanded, setNavExpanded] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [visibleModule, setVisibleModule] = useState('dashboard');
  
  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'bot', text: '👋 Hello! I\'m your AI Retail Assistant. How can I help you today?\n\nYou can ask me about:\n• Sales performance and revenue\n• Inventory status and low stock alerts\n• Branch performance comparisons\n• Product recommendations\n• Business insights and analytics' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Time-based state
  const [sunPhase, setSunPhase] = useState('morning');
  const [moonVisible, setMoonVisible] = useState(false);
  const [clouds, setClouds] = useState([]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // AI Chatbot response generator
  const generateAIResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Sales & Revenue queries
    if (msg.includes('revenue') || msg.includes('sales') || msg.includes('how much')) {
      return `📊 **Sales Performance Update**\n\n• Total Revenue: $48,250\n• Sales Count: 1,284 transactions\n• Growth: +12.4% vs last period\n• Average Transaction: $37.58\n• Unique Customers: 842\n\nWould you like to see branch-wise breakdown?`;
    }
    
    // Profit queries
    if (msg.includes('profit') || msg.includes('margin')) {
      return `💰 **Profit Analysis**\n\n• Total Profit: $14,820\n• Profit Margin: 30.7%\n• Gross Profit: $32,430\n• Net Profit Margin: 24.2%\n\nProfit is healthy compared to industry average of 25-30%.`;
    }
    
    // Inventory queries
    if (msg.includes('inventory') || msg.includes('stock')) {
      return `📦 **Inventory Status**\n\n• Total Products: 486\n• Total Stock Units: 32,610\n• Inventory Value: $124,600\n• Low Stock Alerts: 12 items\n• Stock Turnover Rate: 4.2x (Healthy)\n\n⚠️ Recommended to reorder: Rice (50 units left), Cooking Oil (23 units)`;
    }
    
    // Low stock alerts
    if (msg.includes('low stock') || msg.includes('alert')) {
      return `⚠️ **Low Stock Alerts**\n\n12 products are running low:\n1. Premium Rice - 50 units left\n2. Coconut Oil - 23 units left\n3. Sugar - 35 units left\n4. Milk Powder - 42 units left\n5. Tea Bags - 67 units left\n\n🔔 AI Suggestion: Create purchase orders for these items today.`;
    }
    
    // Branch performance
    if (msg.includes('branch') || msg.includes('location')) {
      return `🏢 **Branch Performance**\n\n• Colombo Head Office: $18,240 (Top performer)\n• Kandy City Branch: $12,560 (+8.2% growth)\n• Galle Fort Branch: $9,340\n• Negombo Branch: $8,110\n\n📈 Colombo leads with 38% of total revenue.`;
    }
    
    // Product recommendations
    if (msg.includes('product') || msg.includes('recommend') || msg.includes('top product')) {
      return `⭐ **Top Performing Products**\n\n1. Premium Basmati Rice - $12,450\n2. Organic Coconut Oil - $8,920\n3. Ceylon Tea Gift Pack - $7,340\n4. Fresh Milk - $5,670\n5. Spice Assortment - $4,890\n\n🎯 AI Recommendation: Increase stock of organic products - demand up 23% this month.`;
    }
    
    // Demand forecasting
    if (msg.includes('forecast') || msg.includes('prediction') || msg.includes('demand')) {
      return `🔮 **AI Demand Forecast**\n\nNext 30 days predictions:\n• Rice & Grains: ↑15% demand increase\n• Cooking Oils: ↑12% (holiday season)\n• Dairy Products: ↑8%\n• Spices: ↑20% (export demand)\n\n📊 Recommended stock levels: Increase inventory by 25% for essential items.`;
    }
    
    // Reorder suggestions
    if (msg.includes('reorder') || msg.includes('purchase')) {
      return `🛒 **Smart Reorder Recommendations**\n\nAuto-generated purchase orders:\n• 500 units - Premium Rice (Current: 50)\n• 200 units - Coconut Oil (Current: 23)\n• 300 units - Sugar (Current: 35)\n• 150 units - Milk Powder (Current: 42)\n\n✅ AI Confidence: 94% - Ready to approve?`;
    }
    
    // Business insights
    if (msg.includes('insight') || msg.includes('analysis') || msg.includes('trend')) {
      return `📈 **Business Insights**\n\n• Morning sales increased by 18% (8am-11am)\n• Weekend revenue is 2.3x higher than weekdays\n• Organic products category growing at 27% MoM\n• Customer retention rate: 68% (↑5%)\n\n💡 Tip: Launch morning breakfast combos to maximize morning traffic.`;
    }
    
    // Help / greeting
    if (msg.includes('help') || msg.includes('what can you') || msg.includes('hi') || msg.includes('hello')) {
      return `🤖 **How I Can Help You**\n\nAsk me about:\n• 📊 Sales & Revenue stats\n• 💰 Profit margins and analysis\n• 📦 Inventory status and alerts\n• 🏢 Branch performance comparison\n• ⭐ Top products & recommendations\n• 🔮 Demand forecasting & predictions\n• 🛒 Smart reordering suggestions\n• 📈 Business insights & trends\n\nWhat would you like to know today?`;
    }
    
    // Default response
    return `🤔 I understand you're asking about "${userMessage.substring(0, 50)}".\n\nI can help with:\n• Sales and revenue reports\n• Inventory management\n• Branch performance\n• Product recommendations\n• Demand forecasting\n\nCould you please rephrase your question? For example: "What's our total revenue?" or "Show me low stock alerts."`;
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMsg = { id: Date.now(), type: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      const botResponse = generateAIResponse(chatInput);
      const botMsg = { id: Date.now() + 1, type: 'bot', text: botResponse };
      setChatMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const showModule = (moduleId) => {
    setActiveModule(moduleId);
    setVisibleModule(moduleId);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [visibleModule]);

  // Update greeting and time-based elements
  useEffect(() => {
    const updateTimeBasedElements = () => {
      const now = new Date();
      const hour = now.getHours();
      setCurrentTime(now);
      
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
      
      if (hour >= 5 && hour < 7) setSunPhase('sunrise');
      else if (hour >= 7 && hour < 12) setSunPhase('morning');
      else if (hour >= 12 && hour < 16) setSunPhase('afternoon');
      else if (hour >= 16 && hour < 18) setSunPhase('sunset');
      else setSunPhase('night');
      
      setMoonVisible(hour >= 19 || hour < 5);
      
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
  }, [token]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      setDashboardData(generateDemoData());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [selectedBranch, datePreset, fetchData]);

  const handlePreset = (preset) => {
    setDatePreset(preset);
    if (preset !== 'custom') setDateRange(_getDateRange(preset));
  };

  const selectedBranchData = BRANCHES.find(b => b.id === selectedBranch);
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const getSkyGradient = () => {
    switch(sunPhase) {
      case 'sunrise': return 'linear-gradient(180deg, #ff7e5e 0%, #feb47b 40%, #ffd6a5 100%)';
      case 'morning': return 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)';
      case 'afternoon': return 'linear-gradient(180deg, #3b8dff 0%, #86b6ff 50%, #b8d4ff 100%)';
      case 'sunset': return 'linear-gradient(180deg, #ff6b6b 0%, #ff8e53 30%, #ffd93d 100%)';
      case 'night': return 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
      default: return 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)';
    }
  };

  // Render module content based on visibleModule
  const renderModuleContent = () => {
    switch(visibleModule) {
      case 'dashboard':
        return (
          <>
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
                    {sunPhase === 'night' ? '🌙' : sunPhase === 'sunset' ? '🌅' : sunPhase === 'sunrise' ? '🌄' : '☀️'}
                  </span>
                  <span className="weather-temp">
                    {sunPhase === 'night' ? '22°C' : sunPhase === 'morning' ? '26°C' : sunPhase === 'afternoon' ? '32°C' : sunPhase === 'sunset' ? '28°C' : '24°C'}
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
                      <div className="notification-item"><span className="notif-icon">🔄</span><span>Inventory updated</span><span className="notif-time">2 min ago</span></div>
                      <div className="notification-item"><span className="notif-icon">💰</span><span>New sale recorded</span><span className="notif-time">15 min ago</span></div>
                    </div>
                  )}
                </div>
                <div className="last-update"><span className="update-icon">🕐</span>Updated {lastUpdated.toLocaleTimeString()}</div>
                <button className="refresh-btn" onClick={fetchData} disabled={loading}>
                  <span className={loading ? 'spinning' : ''}>↻</span><span>Refresh</span>
                </button>
              </div>
            </div>

            {selectedBranch !== 'all' && (
              <div className="branch-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${selectedBranchData?.image})` }}>
                <div className="branch-hero-content">
                  <span className="branch-hero-icon">{selectedBranchData?.icon}</span>
                  <div className="branch-hero-info"><h2>{selectedBranchData?.name}</h2><p>Branch Performance Overview</p></div>
                  <div className="branch-stats">
                    <div className="branch-stat"><span>Today's Revenue</span><strong>$12,450</strong></div>
                    <div className="branch-stat"><span>Growth</span><strong className="positive">+8.2%</strong></div>
                  </div>
                </div>
              </div>
            )}

            <div className="filters-bar">
              <div className="filter-group"><label className="filter-label">📍 Location</label>
                <select className="filter-select" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                  {BRANCHES.map(b => (<option key={b.id} value={b.id}>{b.icon} {b.name}</option>))}
                </select>
              </div>
              <div className="filter-group"><label className="filter-label">📅 Time Period</label>
                <div className="date-presets">{DATE_PRESETS.map(p => (
                  <button key={p.value} className={`preset-btn ${datePreset === p.value ? 'active' : ''}`} onClick={() => handlePreset(p.value)}>
                    <span className="preset-icon">{p.icon}</span><span>{p.label}</span>
                  </button>
                ))}</div>
              </div>
              {datePreset === 'custom' && (
                <div className="filter-group custom-date-group"><label className="filter-label">📆 Custom Range</label>
                  <div className="date-range-inputs">
                    <input type="date" className="filter-input" value={dateRange.startDate} onChange={e => setDateRange(p => ({ ...p, startDate: e.target.value }))} />
                    <span className="date-separator">→</span>
                    <input type="date" className="filter-input" value={dateRange.endDate} onChange={e => setDateRange(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="filter-group ml-auto"><div className="connection-status"><span className={`status-dot ${wsConnected ? 'connected' : 'disconnected'}`}></span><span className="status-text">{wsConnected ? 'Live Connection' : 'Reconnecting...'}</span></div></div>
            </div>

            <div className="dash-section"><KPICards data={dashboardData} loading={loading} role={role} /></div>

            <div className="dash-section chart-section">
              <div className="section-header"><div className="section-title-wrapper"><span className="section-icon">📊</span><h2 className="section-title">Sales Analytics</h2><span className="section-badge">Real-time</span></div>
                <div className="chart-controls"><button className="chart-control">Daily</button><button className="chart-control active">Weekly</button><button className="chart-control">Monthly</button></div>
              </div>
              <div className="chart-container"><SalesChart data={dashboardData} /></div>
            </div>

            <div className="dash-section">
              <div className="section-header"><div className="section-title-wrapper"><span className="section-icon">🏪</span><h2 className="section-title">Branch Performance</h2></div><button className="view-all-btn">View All Branches →</button></div>
              <BranchPerformance data={dashboardData} />
            </div>

            <div className="dash-section">
              <div className="section-header"><div className="section-title-wrapper"><span className="section-icon">📦</span><h2 className="section-title">Inventory Status</h2></div>
                <div className="inventory-badge"><span className="badge-icon">⚠️</span><span>{dashboardData.low_stock_alerts?.count || 0} Low Stock Alerts</span></div>
              </div>
              <div className="inventory-grid"><InventoryStatus data={dashboardData} />
                <div className="quick-stats"><div className="quick-stat-card"><div className="stat-icon">📈</div><div className="stat-info"><span className="stat-value">94%</span><span className="stat-label">Stock Accuracy</span></div></div>
                  <div className="quick-stat-card"><div className="stat-icon">🚚</div><div className="stat-info"><span className="stat-value">3</span><span className="stat-label">Pending Orders</span></div></div>
                </div>
              </div>
            </div>

            <div className="dash-section">
              <div className="tp-live-grid">
                <div className="top-products-wrapper"><div className="section-header"><div className="section-title-wrapper"><span className="section-icon">⭐</span><h2 className="section-title">Top Performing Products</h2></div></div><TopProducts data={dashboardData} /></div>
                <div className="live-feed-wrapper"><div className="section-header"><div className="section-title-wrapper"><span className="section-icon">🔴</span><h2 className="section-title">Live Activity</h2>{wsConnected && <span className="live-badge">LIVE</span>}</div></div><LiveFeed wsConnected={wsConnected} liveTransaction={liveTransaction} /></div>
              </div>
            </div>
          </>
        );

      case 'ai-forecast':
        return <AIDemandForecastModule />;
      case 'user-mgmt':
        return <ModuleDetail title="User Management" icon="👥" page={1} description="CRUD APIs for user management. Store user information securely. Assign and update user roles. Track account status and activity. Validate data before storage." features={['Add/Edit/Remove Users', 'User Profiles & Account Status', 'Search & Filtering', 'Role & Permissions Assignment', 'Profile Updates', 'Activity Tracking']} />;
      case 'branch-mgmt':
        return <ModuleDetail title="Branch Management" icon="🏢" page={1} description="Manage branch records and configurations. Link branches with employees and inventory. Store branch-level settings. Generate branch performance statistics. Handle branch-related business logic." features={['Branch Information Display', 'Performance Metrics', 'Branch Creation & Updates', 'Branch-specific Inventory & Sales', 'Branch Search Functionality']} />;
      case 'employee-mgmt':
        return <EmployeesPage />;
      case 'customer-mgmt':
        return <ModuleDetail title="Customer Management" icon="👤" page={2} description="Manage customer data and transactions. Track loyalty rewards and points. Store customer purchase histories. Generate customer insights. Handle customer-related CRUD operations." features={['Customer Profiles', 'Purchase History', 'Loyalty Points', 'Customer Search & Filtering', 'Customer Analytics']} />;
      case 'supplier-mgmt':
        return <SuppliersPage />;
      case 'product-mgmt':
        return <ModuleDetail title="Product Management" icon="📦" page={2} description="Store product and category information. Manage pricing structures. Handle product CRUD operations. Validate product data. Support barcode integration." features={['Product Catalog', 'Category & Brand Management', 'Product Image Uploads', 'Search & Filtering', 'Pricing & Stock Details', 'Barcode Integration']} />;
      case 'inventory-mgmt':
        return (
          <InventoryProvider>
            <InventoryDashboard />
          </InventoryProvider>
        );
      case 'warehouse-mgmt':
        return <ModuleDetail title="Warehouse Management" icon="🏭" page={2} description="Track warehouse inventory. Manage storage allocations. Record warehouse transactions. Handle warehouse transfers. Generate warehouse statistics." features={['Storage Location Visualization', 'Stock Allocations', 'Warehouse Transfers', 'Capacity Monitoring', 'Warehouse Reports']} />;
      case 'purchase-order':
        return (
          <>
            <ModuleDetail title="Purchase Order Management" icon="PO" page={2} description="Process purchase orders. Manage approval workflows. Update inventory upon receipt. Store procurement records. Generate purchasing analytics." features={['Purchase Order Forms', 'Order Status Tracking', 'Supplier-linked Purchases', 'Approval Management', 'Purchase Reports']} />
            <div style={{ marginTop: '-8px', marginBottom: '24px' }}>
              <a
                href="/purchase-orders"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                }}
              >
                Open Purchase Order Workspace
              </a>
            </div>
          </>
        );
      case 'pos-sales':
        return <ModuleDetail title="POS Sales & Billing" icon="🛒" page={3} description="Handle sales transactions. Process payments securely. Update inventory automatically. Store transaction records. Generate sales summaries." features={['Cashier POS Screens', 'Barcode Scanning', 'Shopping Cart Management', 'Digital Receipts', 'Multiple Payment Methods']} />;
      case 'returns-refund':
        return <ModuleDetail title="Returns & Refund" icon="🔄" page={3} description="Process returns and refunds. Update inventory after returns. Record return history. Validate eligibility rules. Generate return reports." features={['Return Request Screens', 'Refund Status Display', 'Returned Items Management', 'Return Condition Validation', 'Return Receipts']} />;
      case 'stock-transfer':
        return <ModuleDetail title="Stock Transfer" icon="🚛" page={3} description="Manage inter-branch stock transfers. Validate stock availability. Update inventories automatically. Record transfer logs. Generate transfer analytics." features={['Transfer Request Forms', 'Transfer Progress Tracking', 'Branch Stock Availability', 'Transfer History', 'Transfer Reports']} />;
      case 'promotion':
        return <ModuleDetail title="Promotion & Discount Management" icon="🏷️" page={3} description="Apply pricing rules automatically. Manage promotional campaigns. Validate discount eligibility. Generate campaign reports. Maintain coupon records." features={['Promotion Campaigns', 'Discount Rule Configuration', 'Active Promotions Display', 'Coupon System Management', 'Campaign Performance Monitoring']} />;
      case 'ai-reorder':
        return <ModuleDetail title="AI Smart Reordering" icon="📈" page={3} description="Calculate reorder points automatically. Analyze inventory consumption. Generate purchase recommendations. Trigger low-stock alerts. Improve recommendations using AI." features={['Reorder Recommendations', 'Stock Risk Indicators', 'AI Suggestion Approval', 'Reorder Action Tracking', 'Procurement Alerts']} />;
      case 'analytics':
        return <ModuleDetail title="Business Analytics" icon="📉" page={3} description="Aggregate business data. Calculate business KPIs. Generate analytical insights. Support complex queries. Provide reporting APIs." features={['Advanced Analytics Dashboards', 'Sales & Profit Trends', 'Branch Performance Comparison', 'Visual Reports', 'Drill-down Analysis']} />;
      case 'reporting':
        return <ModuleDetail title="Reporting Module" icon="📄" page={4} description="Generate reports dynamically. Export data in multiple formats. Manage scheduled reports. Process large datasets efficiently. Store report history." features={['Downloadable Reports', 'Report Filters', 'Report Previews', 'PDF & Excel Export', 'Scheduled Report Generation']} />;
      case 'notifications':
        return <ModuleDetail title="Notifications & Alert Module" icon="🔔" page={4} description="Send email, SMS, and push notifications. Trigger inventory and sales alerts. Manage notification queues. Store notification history. Monitor delivery status." features={['Notification Center', 'Alerts & Reminders', 'Real-time Notifications', 'Notification Settings', 'Alert Preferences']} />;
      case 'audit-logs':
        return <ModuleDetail title="Audit Logs & Security" icon="🛡️" page={4} description="Record all system activities. Monitor suspicious actions. Store audit trails. Implement security policies. Generate compliance reports." features={['Activity Logs Display', 'Login History', 'Security Monitoring Views', 'Audit Record Filtering', 'Security Reports']} />;
      default:
        return <ModuleDetail title="Module Coming Soon" icon="🚀" page={0} description="This module is under development." features={['Full implementation coming in next update']} />;
    }
  };

  return (
    <div className="dashboard-page">
      {/* Floating Navigation Menu */}
      <div className={`floating-nav ${navExpanded ? 'expanded' : 'collapsed'}`}>
        <button className="nav-toggle" onClick={() => setNavExpanded(!navExpanded)}>
          {navExpanded ? '◀' : '▶'}
        </button>
        <div className="nav-header">
          <span className="nav-logo">📋</span>
          {navExpanded && <span className="nav-title">POS Modules</span>}
        </div>
        <div className="nav-items">
          {MODULE_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => showModule(item.id)}
              title={!navExpanded ? `${item.label} (Page ${item.page})` : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {navExpanded && (
                <>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-page">p.{item.page}</span>
                </>
              )}
            </button>
          ))}
        </div>
        {navExpanded && (
          <div className="nav-footer">
            <div className="nav-badge">Multi-Branch POS</div>
            <div className="nav-module-count">{MODULE_NAV_ITEMS.length} Active Modules</div>
          </div>
        )}
      </div>

      {/* Dynamic Sky Background */}
      <div className="sky-background" style={{ background: getSkyGradient() }}>
        <div className={`sun ${sunPhase}`}>
          <div className="sun-core"></div>
          <div className="sun-rays"></div>
        </div>
        {moonVisible && (
          <div className="moon">
            <div className="moon-crater"></div>
            <div className="moon-crater small"></div>
          </div>
        )}
        {clouds.map(cloud => (
          <div key={cloud.id} className="cloud" style={{ left: `${cloud.left}%`, top: `${cloud.top}%`, width: `${cloud.width}px`, opacity: cloud.opacity, animationDelay: `${cloud.delay}s` }} />
        ))}
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
        {renderModuleContent()}
      </div>

      {/* AI Chatbot Icon - Bottom Right */}
      <div className="chatbot-icon" onClick={() => setIsChatOpen(!isChatOpen)}>
        <div className="chatbot-pulse"></div>
        <span className="chatbot-emoji">🤖</span>
        <span className="chatbot-label">AI Assistant</span>
      </div>

      {/* AI Chatbot Window */}
      {isChatOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-header-icon">🧠</span>
              <div>
                <h3>AI Retail Assistant</h3>
                <p>Online • Ready to help</p>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsChatOpen(false)}>✕</button>
          </div>
          <div className="chatbot-messages">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div className="message-bubble">
                  {msg.type === 'bot' && <span className="message-avatar">🤖</span>}
                  <div className="message-text">{msg.text}</div>
                  {msg.type === 'user' && <span className="message-avatar-user">👤</span>}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot">
                <div className="message-bubble typing">
                  <span className="message-avatar">🤖</span>
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask me about sales, inventory, forecasts..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chatbot-input"
            />
            <button className="chatbot-send" onClick={sendMessage}>
              <span>➤</span>
            </button>
          </div>
          <div className="chatbot-suggestions">
            <button onClick={() => setChatInput("What's our total revenue?")}>💰 Revenue</button>
            <button onClick={() => setChatInput("Show me low stock alerts")}>⚠️ Low Stock</button>
            <button onClick={() => setChatInput("Branch performance")}>🏢 Branches</button>
            <button onClick={() => setChatInput("Demand forecast")}>🔮 Forecast</button>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-page { min-height: 100vh; position: relative; overflow-x: hidden; }
        .sky-background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; transition: background 0.5s ease; }
        .sun { position: absolute; border-radius: 50%; transition: all 0.5s ease; }
        .sun.sunrise { bottom: 10%; right: 15%; width: 80px; height: 80px; animation: sunriseAnim 20s ease-in-out infinite; }
        .sun.morning { top: 15%; right: 20%; width: 90px; height: 90px; animation: floatSun 10s ease-in-out infinite; }
        .sun.afternoon { top: 10%; right: 25%; width: 100px; height: 100px; animation: pulseSun 4s ease-in-out infinite; }
        .sun.sunset { bottom: 5%; right: 10%; width: 85px; height: 85px; animation: sunsetAnim 15s ease-in-out infinite; }
        .sun.night { display: none; }
        .sun-core { width: 100%; height: 100%; background: radial-gradient(circle, #fff5a0 0%, #ffdd00 60%, #ffaa00 100%); border-radius: 50%; box-shadow: 0 0 40px rgba(255, 200, 0, 0.8); }
        .sun-rays { position: absolute; top: 50%; left: 50%; width: 140%; height: 140%; transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(255, 200, 0, 0.3) 0%, transparent 70%); border-radius: 50%; animation: rotateRays 20s linear infinite; }
        .moon { position: absolute; top: 12%; right: 18%; width: 70px; height: 70px; background: radial-gradient(circle, #ffeaa7 0%, #fdcb6e 100%); border-radius: 50%; box-shadow: 0 0 30px rgba(255, 235, 190, 0.5); animation: floatMoon 12s ease-in-out infinite; }
        .moon-crater { position: absolute; top: 25%; left: 30%; width: 15px; height: 12px; background: rgba(0, 0, 0, 0.15); border-radius: 50%; }
        .moon-crater.small { top: 55%; left: 60%; width: 10px; height: 8px; }
        .cloud { position: absolute; height: 60px; background: rgba(255, 255, 255, 0.8); border-radius: 50px; animation: floatCloud 25s linear infinite; }
        .cloud::before, .cloud::after { content: ''; position: absolute; background: inherit; border-radius: 50%; }
        .cloud::before { width: 50px; height: 50px; top: -25px; left: 20px; }
        .cloud::after { width: 70px; height: 70px; top: -35px; left: 60px; }
        .city-skyline { position: absolute; bottom: 0; left: 0; width: 100%; height: 180px; display: flex; align-items: flex-end; gap: 8px; padding: 0 20px; background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%); }
        .building { width: 60px; background: linear-gradient(180deg, rgba(30, 40, 60, 0.7) 0%, rgba(20, 30, 50, 0.9) 100%); border-radius: 8px 8px 0 0; backdrop-filter: blur(2px); }
        .building:nth-child(1) { height: 100px; width: 55px; }
        .building:nth-child(2) { height: 150px; width: 65px; }
        .building:nth-child(3) { height: 85px; width: 50px; }
        .building:nth-child(4) { height: 120px; width: 80px; }
        .building:nth-child(5) { height: 95px; width: 55px; }
        .building:nth-child(6) { height: 160px; width: 70px; }
        .building:nth-child(7) { height: 75px; width: 50px; }
        @keyframes sunriseAnim { 0%,100%{transform:translateY(0) scale(1); opacity:0.8} 50%{transform:translateY(-30px) scale(1.05); opacity:1} }
        @keyframes sunsetAnim { 0%,100%{transform:translateY(0) scale(1); opacity:0.9} 50%{transform:translateY(-20px) scale(1.03); opacity:1} }
        @keyframes floatSun { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        @keyframes pulseSun { 0%,100%{transform:scale(1); opacity:0.9} 50%{transform:scale(1.08); opacity:1} }
        @keyframes rotateRays { from{transform:translate(-50%,-50%) rotate(0)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes floatMoon { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-15px) rotate(5deg)} }
        @keyframes floatCloud { 0%{transform:translateX(-100px)} 100%{transform:translateX(calc(100vw + 200px))} }
        
        .content-wrapper { position: relative; z-index: 1; padding: 24px 28px; margin-left: 280px; transition: margin-left 0.3s ease; min-height: 100vh; }
        .floating-nav.collapsed + .sky-background + .content-wrapper { margin-left: 70px; }
        .floating-nav { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(15px); border-right: 1px solid rgba(255,255,255,0.1); z-index: 100; display: flex; flex-direction: column; transition: width 0.3s ease; box-shadow: 2px 0 20px rgba(0,0,0,0.2); }
        .floating-nav.collapsed { width: 70px; }
        .nav-toggle { position: absolute; right: -12px; top: 20px; width: 24px; height: 24px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; cursor: pointer; border: 2px solid white; z-index: 101; transition: transform 0.2s; }
        .nav-toggle:hover { transform: scale(1.1); }
        .nav-header { padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px; }
        .nav-logo { font-size: 28px; }
        .nav-title { font-size: 18px; font-weight: 700; color: white; }
        .nav-items { flex: 1; overflow-y: auto; padding: 12px 0; }
        .nav-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: transparent; border: none; color: #94a3b8; cursor: pointer; transition: all 0.2s; text-align: left; font-size: 13px; border-radius: 0; }
        .nav-item:hover { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .nav-item.active { background: linear-gradient(90deg, rgba(59,130,246,0.3), transparent); color: #3b82f6; border-left: 3px solid #3b82f6; }
        .nav-icon { font-size: 20px; min-width: 28px; }
        .nav-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nav-page { font-size: 10px; color: #64748b; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px; }
        .nav-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #64748b; text-align: center; }
        .nav-badge { background: #3b82f6; color: white; padding: 4px 8px; border-radius: 20px; display: inline-block; margin-bottom: 8px; font-weight: 600; font-size: 10px; }
        .nav-module-count { font-size: 10px; }
        .floating-nav.collapsed .nav-label, .floating-nav.collapsed .nav-page, .floating-nav.collapsed .nav-title, .floating-nav.collapsed .nav-footer { display: none; }
        .floating-nav.collapsed .nav-item { justify-content: center; padding: 12px; }
        .floating-nav.collapsed .nav-icon { font-size: 24px; min-width: auto; }
        
        /* Dashboard Content Styles */
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .greeting-badge { display: inline-flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 8px 20px; border-radius: 30px; margin-bottom: 16px; font-size: 0.85rem; font-weight: 500; color: #1e293b; border: 1px solid rgba(255,255,255,0.5); }
        .time-display { color: #3b82f6; font-weight: 600; }
        .dash-title { font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); -webkit-background-clip: text; background-clip: text; color: transparent; display: flex; align-items: center; gap: 12px; }
        .title-badge { position: relative; font-size: 0.7rem; background: linear-gradient(135deg, #10b981, #059669); padding: 4px 12px; border-radius: 20px; color: white; font-weight: 600; display: flex; align-items: center; gap: 6px; overflow: hidden; }
        .title-badge::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 3s infinite; }
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 100%; } }
        .badge-pulse { width: 8px; height: 8px; background: #fff; border-radius: 50%; animation: badgeBlink 1s ease-in-out infinite; }
        @keyframes badgeBlink { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.5; transform:scale(0.8)} }
        .time-indicator { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 0.8rem; color: #475569; background: rgba(255,255,255,0.8); backdrop-filter: blur(5px); padding: 5px 12px; border-radius: 20px; width: fit-content; }
        .dash-header-right { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
        .weather-widget { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.5); }
        .notification-wrapper { position: relative; }
        .notification-btn { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 8px 14px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.5); position: relative; cursor: pointer; transition: all 0.2s; }
        .notification-btn:hover { background: white; transform: scale(1.05); }
        .notification-dot { position: absolute; top: 6px; right: 8px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: blink 1.5s ease-in-out infinite; }
        .notification-dropdown { position: absolute; top: 100%; right: 0; margin-top: 8px; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); min-width: 280px; z-index: 10; overflow: hidden; }
        .notification-header { padding: 12px 16px; background: #f8fafc; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
        .notification-item { padding: 12px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s; }
        .notification-item:hover { background: #f8fafc; }
        .branch-hero { background-size: cover; background-position: center; border-radius: 20px; margin-bottom: 24px; overflow: hidden; }
        .branch-hero-content { padding: 32px; display: flex; align-items: center; gap: 24px; color: white; flex-wrap: wrap; }
        .branch-hero-icon { font-size: 3rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 20px; }
        .branch-hero-info h2 { font-size: 1.5rem; margin-bottom: 4px; }
        .branch-stats { display: flex; gap: 24px; margin-left: auto; }
        .branch-stat { text-align: center; }
        .branch-stat span { font-size: 0.75rem; opacity: 0.8; display: block; }
        .branch-stat strong { font-size: 1.25rem; font-weight: 700; }
        .positive { color: #10b981; }
        .filters-bar { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 16px 24px; margin-bottom: 24px; }
        .filter-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ml-auto { margin-left: auto; }
        .filter-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .filter-select { padding: 8px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; font-size: 0.85rem; cursor: pointer; }
        .date-presets { display: flex; gap: 6px; background: #f1f5f9; padding: 4px; border-radius: 12px; flex-wrap: wrap; }
        .preset-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; background: none; cursor: pointer; transition: all 0.2s; }
        .preset-btn.active { background: white; color: #3b82f6; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .connection-status { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #f1f5f9; border-radius: 20px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; }
        .status-dot.connected { background: #10b981; }
        .status-dot.disconnected { background: #ef4444; }
        .dash-section { margin-bottom: 28px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-radius: 24px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .section-title-wrapper { display: flex; align-items: center; gap: 12px; }
        .section-icon { font-size: 1.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
        .section-badge { font-size: 0.7rem; background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 3px 10px; border-radius: 12px; color: white; font-weight: 600; }
        .chart-controls { display: flex; gap: 8px; }
        .chart-control { padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; background: #f1f5f9; cursor: pointer; transition: all 0.2s; }
        .chart-control.active { background: #3b82f6; color: white; }
        .chart-container { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: transform 0.3s ease; }
        .chart-container:hover { transform: perspective(1000px) rotateX(2deg); }
        .inventory-grid { display: grid; grid-template-columns: 1fr auto; gap: 20px; }
        .quick-stats { display: flex; flex-direction: column; gap: 12px; }
        .quick-stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.2s; cursor: pointer; }
        .quick-stat-card:hover { transform: translateY(-2px); }
        .stat-icon { font-size: 2rem; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; }
        .stat-label { font-size: 0.75rem; color: #64748b; }
        .tp-live-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
        .top-products-wrapper, .live-feed-wrapper { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .live-badge { background: #ef4444; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; animation: blink 1s ease-in-out infinite; }
        .view-all-btn { padding: 8px 16px; border-radius: 10px; background: #f1f5f9; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; border: none; }
        .view-all-btn:hover { background: #3b82f6; color: white; }
        .refresh-btn { display: flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 30px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
        .refresh-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
        .spinning { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes pulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.5; transform:scale(1.2)} }
        
        /* Module Detail View Styles */
        .module-detail { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 28px; padding: 32px; margin-bottom: 24px; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .module-header { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid rgba(59,130,246,0.2); flex-wrap: wrap; }
        .module-icon { font-size: 64px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; border-radius: 30px; box-shadow: 0 10px 30px rgba(59,130,246,0.3); }
        .module-title-info { flex: 1; }
        .module-title { font-size: 2rem; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .module-page { display: inline-block; background: #e2e8f0; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; color: #64748b; font-weight: 600; }
        .module-description { font-size: 1rem; color: #475569; line-height: 1.5; margin-bottom: 28px; background: #f8fafc; padding: 20px; border-radius: 20px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
        .feature-card { background: white; padding: 16px 20px; border-radius: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; transition: all 0.2s; }
        .feature-card:hover { transform: translateX(5px); border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.1); }
        .feature-icon { font-size: 24px; }
        .feature-text { font-size: 0.9rem; font-weight: 500; color: #334155; }
        
        /* AI Demand Forecast Module */
        .ai-forecast-module { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 28px; padding: 32px; animation: fadeIn 0.4s ease; }
        .forecast-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
        .forecast-icon { font-size: 60px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; border-radius: 30px; }
        .forecast-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .forecast-card { background: linear-gradient(135deg, #f8fafc, #ffffff); padding: 20px; border-radius: 20px; text-align: center; border: 1px solid #e2e8f0; }
        .forecast-card .value { font-size: 28px; font-weight: 800; color: #3b82f6; }
        .forecast-card .label { font-size: 12px; color: #64748b; margin-top: 8px; }
        .forecast-list { margin-top: 20px; }
        .forecast-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e2e8f0; }
        .forecast-item .product { font-weight: 600; }
        .forecast-item .prediction { color: #10b981; font-weight: 600; }
        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }
        
        /* AI Chatbot Styles */
        .chatbot-icon { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 200; box-shadow: 0 4px 20px rgba(59,130,246,0.4); transition: all 0.3s ease; animation: floatIcon 3s ease-in-out infinite; }
        .chatbot-icon:hover { transform: scale(1.1); }
        .chatbot-pulse { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(59,130,246,0.4); animation: pulseRing 1.5s ease-out infinite; }
        .chatbot-emoji { font-size: 32px; position: relative; z-index: 1; }
        .chatbot-label { position: absolute; bottom: -25px; right: 0; background: #1e293b; color: white; font-size: 10px; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
        @keyframes floatIcon { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulseRing { 0%{transform:scale(1); opacity:0.6} 100%{transform:scale(1.5); opacity:0} }
        
        .chatbot-window { position: fixed; bottom: 100px; right: 24px; width: 380px; height: 550px; background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 200; display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .chatbot-header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; color: white; }
        .chatbot-header-info { display: flex; align-items: center; gap: 12px; }
        .chatbot-header-icon { font-size: 28px; }
        .chatbot-header-info h3 { font-size: 16px; margin: 0; }
        .chatbot-header-info p { font-size: 11px; opacity: 0.8; margin: 2px 0 0; }
        .chatbot-close { background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .chatbot-close:hover { background: rgba(255,255,255,0.4); transform: scale(1.05); }
        .chatbot-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; }
        .chat-message { display: flex; }
        .chat-message.bot { justify-content: flex-start; }
        .chat-message.user { justify-content: flex-end; }
        .message-bubble { max-width: 85%; display: flex; align-items: flex-start; gap: 8px; }
        .message-avatar { width: 28px; height: 28px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .message-avatar-user { width: 28px; height: 28px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .message-text { background: white; padding: 10px 14px; border-radius: 18px; font-size: 13px; line-height: 1.4; color: #1e293b; white-space: pre-wrap; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .chat-message.user .message-text { background: #3b82f6; color: white; }
        .typing-indicator { display: flex; gap: 4px; padding: 10px 14px; background: white; border-radius: 18px; }
        .typing-indicator span { width: 8px; height: 8px; background: #94a3b8; border-radius: 50%; animation: typingAnim 1.4s infinite; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingAnim { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .chatbot-input-area { padding: 12px 16px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; }
        .chatbot-input { flex: 1; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 24px; font-size: 13px; outline: none; transition: all 0.2s; }
        .chatbot-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
        .chatbot-send { background: #3b82f6; border: none; width: 36px; height: 36px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .chatbot-send:hover { background: #2563eb; transform: scale(1.05); }
        .chatbot-suggestions { padding: 10px 16px 16px; display: flex; gap: 8px; flex-wrap: wrap; border-top: 1px solid #e2e8f0; background: white; }
        .chatbot-suggestions button { background: #f1f5f9; border: none; padding: 6px 12px; border-radius: 20px; font-size: 11px; color: #475569; cursor: pointer; transition: all 0.2s; }
        .chatbot-suggestions button:hover { background: #3b82f6; color: white; }
        
        @media (max-width: 1100px) {
          .content-wrapper { margin-left: 70px; padding: 16px; }
          .floating-nav { width: 70px; }
          .tp-live-grid { grid-template-columns: 1fr; }
          .inventory-grid { grid-template-columns: 1fr; }
          .branch-hero-content { flex-direction: column; text-align: center; }
          .branch-stats { margin-left: 0; }
          .city-skyline { height: 120px; }
          .building { width: 30px; }
          .building:nth-child(1) { width: 30px; height: 60px; }
          .building:nth-child(2) { width: 35px; height: 90px; }
          .building:nth-child(3) { width: 28px; height: 50px; }
          .building:nth-child(4) { width: 45px; height: 70px; }
          .building:nth-child(5) { width: 30px; height: 55px; }
          .building:nth-child(6) { width: 38px; height: 95px; }
          .building:nth-child(7) { width: 28px; height: 45px; }
          .features-grid { grid-template-columns: 1fr; }
          .module-icon { width: 70px; height: 70px; font-size: 40px; }
          .module-title { font-size: 1.3rem; }
          .forecast-stats { grid-template-columns: repeat(2, 1fr); }
          .chatbot-window { width: 340px; right: 16px; bottom: 90px; }
        }
      `}</style>
    </div>
  );
};

// AI Demand Forecast Module Component
const AIDemandForecastModule = () => (
  <div className="ai-forecast-module">
    <div className="forecast-header">
      <div className="forecast-icon">🤖</div>
      <div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#1e293b' }}>AI Demand Forecasting</h1>
        <span className="module-page">📄 Page 3 of PDF Document</span>
      </div>
    </div>
    
    <div className="module-description">
      <strong>📋 Module Overview:</strong><br />
      Train forecasting models. Predict future product demand. Analyze historical sales data. Generate forecast reports. Continuously update models using machine learning algorithms.
    </div>
    
    <div className="forecast-stats">
      <div className="forecast-card"><div className="value">↑ 15%</div><div className="label">Next Month Demand Increase</div></div>
      <div className="forecast-card"><div className="value">94%</div><div className="label">Forecast Accuracy</div></div>
      <div className="forecast-card"><div className="value">2,450</div><div className="label">Predicted Sales (units)</div></div>
      <div className="forecast-card"><div className="value">$52.8K</div><div className="label">Expected Revenue</div></div>
    </div>
    
    <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>📈 Product Demand Forecast (Next 30 Days)</h3>
    <div className="forecast-list">
      <div className="forecast-item"><span className="product">Premium Basmati Rice</span><span className="prediction trend-up">↑ 18% demand increase</span><span style={{ fontSize: '12px', color: '#64748b' }}>Confidence: 96%</span></div>
      <div className="forecast-item"><span className="product">Organic Coconut Oil</span><span className="prediction trend-up">↑ 23% demand increase</span><span style={{ fontSize: '12px', color: '#64748b' }}>Confidence: 92%</span></div>
      <div className="forecast-item"><span className="product">Ceylon Tea Gift Pack</span><span className="prediction trend-up">↑ 31% demand increase</span><span style={{ fontSize: '12px', color: '#64748b' }}>Confidence: 89%</span></div>
      <div className="forecast-item"><span className="product">Fresh Milk (1L)</span><span className="prediction trend-up">↑ 8% demand increase</span><span style={{ fontSize: '12px', color: '#64748b' }}>Confidence: 94%</span></div>
      <div className="forecast-item"><span className="product">Spice Assortment Pack</span><span className="prediction trend-up">↑ 27% demand increase</span><span style={{ fontSize: '12px', color: '#64748b' }}>Confidence: 88%</span></div>
      <div className="forecast-item"><span className="product">Sugar (1kg)</span><span className="prediction trend-down">↓ 3% demand decrease</span><span style={{ fontSize: '12px', color: '#64748b' }}>Confidence: 91%</span></div>
    </div>
    
    <h3 style={{ margin: '24px 0 16px', color: '#1e293b' }}>✨ Key Features</h3>
    <div className="features-grid">
      {[
        'Sales Forecasts Display with Visual Charts',
        'Demand Trends Visualization by Category',
        'Branch-specific Predictions and Comparisons',
        'Interactive Forecasting Filters (Date, Category, Branch)',
        'AI-generated Business Insights & Recommendations',
        'Historical Data Analysis & Pattern Recognition',
        'Export Forecast Reports (PDF/Excel)',
        'Continuous Model Updates & Retraining'
      ].map((feature, idx) => (
        <div key={idx} className="feature-card"><span className="feature-icon">✓</span><span className="feature-text">{feature}</span></div>
      ))}
    </div>
  </div>
);

// Module Detail Component
const ModuleDetail = ({ title, icon, page, description, features }) => (
  <div className="module-detail">
    <div className="module-header">
      <div className="module-icon">{icon}</div>
      <div className="module-title-info">
        <h1 className="module-title">{title}</h1>
        {page > 0 && <span className="module-page">📄 Page {page} of PDF Document</span>}
      </div>
    </div>
    <div className="module-description">
      <strong>📋 Module Overview:</strong><br />
      {description}
    </div>
    <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>✨ Key Features</h3>
    <div className="features-grid">
      {features.map((feature, idx) => (
        <div key={idx} className="feature-card">
          <span className="feature-icon">✓</span>
          <span className="feature-text">{feature}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Dashboard;
