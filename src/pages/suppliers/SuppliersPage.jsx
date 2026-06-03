import React, { useState, useMemo } from 'react';

// Initial Mock Suppliers Data
const INITIAL_SUPPLIERS = [
  {
    id: 'SUP-001',
    companyName: 'Lanka Grains & Co.',
    contactPerson: 'Sunil Perera',
    email: 'sunil@lankagrains.com',
    phone: '+94 77 123 4567',
    address: '142, Kandy Road, Colombo 10',
    category: 'Grains & Rice',
    taxId: 'TX-98234-LK',
    status: 'Active',
    rating: 4.8,
    totalSpend: 42500,
    performance: {
      onTimeDelivery: 98,
      qualityScore: 97,
      leadTimeDays: 3,
      returnRate: 0.5
    },
    aiRecommendation: 'Highly reliable for bulk supply. Standard delivery time is excellent. Recommended for locking in quarterly cereal contracts to save an additional 4%.',
    transactions: [
      { id: 'PO-2026-104', date: '2026-05-18', amount: 12500, itemsCount: 250, status: 'Delivered' },
      { id: 'PO-2026-092', date: '2026-04-12', amount: 18000, itemsCount: 360, status: 'Delivered' },
      { id: 'PO-2026-081', date: '2026-03-05', amount: 12000, itemsCount: 240, status: 'Delivered' }
    ]
  },
  {
    id: 'SUP-002',
    companyName: 'Ceylon Tea Estates Ltd.',
    contactPerson: 'Menaka Silva',
    email: 'menaka@ceylontea.lk',
    phone: '+94 81 765 4321',
    address: '77, Nuwara Eliya Road, Nuwara Eliya',
    category: 'Beverages',
    taxId: 'TX-10943-LK',
    status: 'Active',
    rating: 4.5,
    totalSpend: 28400,
    performance: {
      onTimeDelivery: 92,
      qualityScore: 96,
      leadTimeDays: 5,
      returnRate: 1.2
    },
    aiRecommendation: 'Stable quality levels, but lead times can fluctuate due to weather conditions. Consider keeping 15% safety stock of premium tea variants.',
    transactions: [
      { id: 'PO-2026-110', date: '2026-05-28', amount: 9500, itemsCount: 150, status: 'Pending' },
      { id: 'PO-2026-099', date: '2026-04-20', amount: 9500, itemsCount: 150, status: 'Delivered' },
      { id: 'PO-2026-085', date: '2026-03-15', amount: 9400, itemsCount: 145, status: 'Delivered' }
    ]
  },
  {
    id: 'SUP-003',
    companyName: 'RichDairy Lanka Pvt Ltd.',
    contactPerson: 'Anura De Alwis',
    email: 'anura@richdairy.lk',
    phone: '+94 11 888 9900',
    address: '56/B, Industrial Zone, Negombo',
    category: 'Dairy Products',
    taxId: 'TX-23491-LK',
    status: 'Active',
    rating: 4.9,
    totalSpend: 54100,
    performance: {
      onTimeDelivery: 99,
      qualityScore: 99,
      leadTimeDays: 1,
      returnRate: 0.2
    },
    aiRecommendation: 'Exceptional fresh goods provider. Delivery is local and within 24 hours. Highly recommended for daily automatic inventory restocking lists.',
    transactions: [
      { id: 'PO-2026-115', date: '2026-06-01', amount: 4800, itemsCount: 80, status: 'Pending' },
      { id: 'PO-2026-105', date: '2026-05-20', amount: 16500, itemsCount: 300, status: 'Delivered' },
      { id: 'PO-2026-098', date: '2026-04-29', amount: 16400, itemsCount: 295, status: 'Delivered' },
      { id: 'PO-2026-089', date: '2026-03-25', amount: 16400, itemsCount: 295, status: 'Delivered' }
    ]
  },
  {
    id: 'SUP-004',
    companyName: 'Spices of Serendib',
    contactPerson: 'Fathima Nazreen',
    email: 'fathima@spiceserendib.com',
    phone: '+94 77 999 8888',
    address: '22, Galle Road, Matara',
    category: 'Spices & Condiments',
    taxId: 'TX-87431-LK',
    status: 'Under Review',
    rating: 3.9,
    totalSpend: 15200,
    performance: {
      onTimeDelivery: 81,
      qualityScore: 91,
      leadTimeDays: 7,
      returnRate: 3.5
    },
    aiRecommendation: 'High return rates (3.5%) recorded on ground spices last month due to moisture content. Quality audit recommended before issuing next purchase order.',
    transactions: [
      { id: 'PO-2026-102', date: '2026-05-14', amount: 5200, itemsCount: 100, status: 'Delivered' },
      { id: 'PO-2026-090', date: '2026-04-10', amount: 10000, itemsCount: 200, status: 'Delivered' }
    ]
  },
  {
    id: 'SUP-005',
    companyName: 'Apex Packaging Industries',
    contactPerson: 'Rohan Wickremasinghe',
    email: 'rohan@apexpack.lk',
    phone: '+94 11 555 4444',
    address: '89, Avissawella Road, Wellampitiya',
    category: 'Packaging Materials',
    taxId: 'TX-33887-LK',
    status: 'Inactive',
    rating: 3.2,
    totalSpend: 12000,
    performance: {
      onTimeDelivery: 75,
      qualityScore: 84,
      leadTimeDays: 10,
      returnRate: 4.8
    },
    aiRecommendation: 'Performance has dropped below acceptable limits. Deliveries delayed on average by 4 days. Marked inactive. Search for alternative boxes & bags suppliers.',
    transactions: [
      { id: 'PO-2026-060', date: '2026-01-15', amount: 12000, itemsCount: 400, status: 'Delivered' }
    ]
  }
];

const CATEGORIES = [
  'Grains & Rice',
  'Beverages',
  'Dairy Products',
  'Spices & Condiments',
  'Packaging Materials',
  'Fresh Produce',
  'Meat & Seafood',
  'Other'
];

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // name, spend, rating, delivery

  // Details panel state
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('performance'); // performance, history

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create, edit
  const [editingSupplierId, setEditingSupplierId] = useState(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Grains & Rice',
    taxId: '',
    status: 'Active',
    rating: 5.0,
    performance: {
      onTimeDelivery: 95,
      qualityScore: 95,
      leadTimeDays: 3,
      returnRate: 0.0
    }
  });

  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const metrics = useMemo(() => {
    const active = suppliers.filter(s => s.status === 'Active');
    const totalSpend = suppliers.reduce((acc, curr) => acc + curr.totalSpend, 0);
    const avgDelivery = Math.round(
      suppliers.reduce((acc, curr) => acc + curr.performance.onTimeDelivery, 0) / suppliers.length
    );
    const pendingOrdersCount = suppliers.reduce((acc, curr) => {
      const pending = curr.transactions.filter(t => t.status === 'Pending').length;
      return acc + pending;
    }, 0);

    return {
      totalCount: suppliers.length,
      activeCount: active.length,
      totalSpend,
      avgDelivery,
      pendingOrdersCount
    };
  }, [suppliers]);

  // Filtering & Sorting Logic
  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];

    // Search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.companyName.toLowerCase().includes(query) ||
          s.contactPerson.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'All') {
      result = result.filter(s => s.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.companyName.localeCompare(b.companyName);
      } else if (sortBy === 'spend') {
        return b.totalSpend - a.totalSpend;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'delivery') {
        return b.performance.onTimeDelivery - a.performance.onTimeDelivery;
      }
      return 0;
    });

    return result;
  }, [suppliers, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parseFloat(value) || value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.taxId.trim()) errors.taxId = 'Tax ID is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateForm = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      category: 'Grains & Rice',
      taxId: '',
      status: 'Active',
      rating: 5.0,
      performance: {
        onTimeDelivery: 95,
        qualityScore: 95,
        leadTimeDays: 3,
        returnRate: 0.0
      }
    });
    setFormErrors({});
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (supplier, e) => {
    e.stopPropagation();
    setFormData({
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      category: supplier.category,
      taxId: supplier.taxId,
      status: supplier.status,
      rating: supplier.rating,
      performance: { ...supplier.performance }
    });
    setFormErrors({});
    setEditingSupplierId(supplier.id);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (formMode === 'create') {
      const newId = `SUP-0${suppliers.length + 1}`;
      const newSupplier = {
        ...formData,
        id: newId,
        totalSpend: 0,
        transactions: [],
        aiRecommendation: 'New supplier registered. No historical data yet. Initial verification pending.'
      };
      setSuppliers(prev => [newSupplier, ...prev]);
    } else {
      setSuppliers(prev =>
        prev.map(s =>
          s.id === editingSupplierId
            ? { ...s, ...formData }
            : s
        )
      );
      // Update viewing supplier details if it is currently open
      if (viewingSupplier && viewingSupplier.id === editingSupplierId) {
        setViewingSupplier(prev => ({ ...prev, ...formData }));
      }
    }
    setIsFormOpen(false);
  };

  const handleToggleStatus = (id, currentStatus, e) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setSuppliers(prev =>
      prev.map(s => (s.id === id ? { ...s, status: nextStatus } : s))
    );
    if (viewingSupplier && viewingSupplier.id === id) {
      setViewingSupplier(prev => ({ ...prev, status: nextStatus }));
    }
  };

  return (
    <div className="suppliers-container">
      {/* Overview Cards */}
      <div className="metrics-grid">
        <div className="metric-card bg-glass">
          <div className="metric-icon-wrapper blue">🚚</div>
          <div className="metric-details">
            <span className="metric-label">Total Suppliers</span>
            <div className="metric-value">
              {metrics.totalCount} <span className="value-sub">({metrics.activeCount} Active)</span>
            </div>
          </div>
        </div>

        <div className="metric-card bg-glass">
          <div className="metric-icon-wrapper green">🌟</div>
          <div className="metric-details">
            <span className="metric-label">Avg. On-Time Delivery</span>
            <div className="metric-value">{metrics.avgDelivery}%</div>
          </div>
        </div>

        <div className="metric-card bg-glass">
          <div className="metric-icon-wrapper orange">⏳</div>
          <div className="metric-details">
            <span className="metric-label">Pending Shipments</span>
            <div className="metric-value">{metrics.pendingOrdersCount}</div>
          </div>
        </div>

        <div className="metric-card bg-glass">
          <div className="metric-icon-wrapper gold">💰</div>
          <div className="metric-details">
            <span className="metric-label">Total Procurement Spend</span>
            <div className="metric-value">${metrics.totalSpend.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Control Panel: Filters, Search, Registration */}
      <div className="controls-panel bg-glass">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search suppliers by name, contact or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-item">
            <label>Category</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <label>Status</label>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Company Name</option>
              <option value="spend">Total Spend</option>
              <option value="rating">Rating</option>
              <option value="delivery">Delivery Performance</option>
            </select>
          </div>

          <button className="register-btn" onClick={handleOpenCreateForm}>
            <span className="plus-icon">+</span> Register Supplier
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="suppliers-content-layout">
        {/* Suppliers List */}
        <div className="suppliers-list-panel">
          <div className="list-header">
            <h3>Registered Suppliers ({filteredSuppliers.length})</h3>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="empty-state bg-glass">
              <span className="empty-icon">🚚</span>
              <p className="empty-title">No Suppliers Found</p>
              <p className="empty-subtitle">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="suppliers-grid">
              {filteredSuppliers.map(supplier => (
                <div
                  key={supplier.id}
                  className={`supplier-item-card bg-glass hover-scale ${viewingSupplier?.id === supplier.id ? 'selected' : ''}`}
                  onClick={() => {
                    setViewingSupplier(supplier);
                    setActiveDetailTab('performance');
                  }}
                >
                  <div className="card-top">
                    <div className="supplier-icon-placeholder">🏢</div>
                    <div className="title-area">
                      <span className="supplier-id">{supplier.id}</span>
                      <h4 className="supplier-name">{supplier.companyName}</h4>
                      <span className="category-badge">{supplier.category}</span>
                    </div>
                    <span className={`status-pill ${supplier.status.toLowerCase().replace(' ', '-')}`}>
                      {supplier.status}
                    </span>
                  </div>

                  <div className="card-info">
                    <div className="info-row">
                      <span>👤 Contact:</span>
                      <strong>{supplier.contactPerson}</strong>
                    </div>
                    <div className="info-row">
                      <span>📞 Phone:</span>
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="info-row">
                      <span>⭐ Rating:</span>
                      <div className="star-rating">
                        <span className="stars">★</span> {supplier.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="card-mini-metrics">
                    <div className="mini-stat">
                      <span className="label">Delivery</span>
                      <span className={`value ${supplier.performance.onTimeDelivery >= 90 ? 'good' : supplier.performance.onTimeDelivery >= 80 ? 'warn' : 'bad'}`}>
                        {supplier.performance.onTimeDelivery}%
                      </span>
                    </div>
                    <div className="mini-stat">
                      <span className="label">Spend</span>
                      <span className="value">${supplier.totalSpend.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="edit-icon-btn" onClick={(e) => handleOpenEditForm(supplier, e)} title="Edit Supplier Info">
                      ✏️ Edit
                    </button>
                    <button
                      className={`status-toggle-btn ${supplier.status === 'Active' ? 'deactivate' : 'activate'}`}
                      onClick={(e) => handleToggleStatus(supplier.id, supplier.status, e)}
                    >
                      {supplier.status === 'Active' ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Panel (Dynamic display beside the list if selected) */}
        <div className={`supplier-detail-panel bg-glass ${viewingSupplier ? 'open' : ''}`}>
          {viewingSupplier ? (
            <div className="detail-panel-content">
              {/* Close Button for smaller viewports */}
              <button className="detail-close-btn" onClick={() => setViewingSupplier(null)}>✕</button>

              <div className="detail-header">
                <span className="detail-id">{viewingSupplier.id}</span>
                <h2>{viewingSupplier.companyName}</h2>
                <div className="header-meta">
                  <span className="category-badge large">{viewingSupplier.category}</span>
                  <span className={`status-pill ${viewingSupplier.status.toLowerCase().replace(' ', '-')}`}>
                    {viewingSupplier.status}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="detail-tabs">
                <button
                  className={`tab-btn ${activeDetailTab === 'performance' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('performance')}
                >
                  📈 Performance & Insights
                </button>
                <button
                  className={`tab-btn ${activeDetailTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('history')}
                >
                  📜 Order History ({viewingSupplier.transactions.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-pane-content">
                {activeDetailTab === 'performance' ? (
                  <div className="performance-tab-content">
                    {/* Main Performance Grid */}
                    <div className="perf-grid">
                      <div className="perf-meter-card">
                        <div className="progress-circle" style={{ '--progress-pct': `${viewingSupplier.performance.onTimeDelivery}` }}>
                          <span className="value">{viewingSupplier.performance.onTimeDelivery}%</span>
                        </div>
                        <span className="label">On-Time Delivery</span>
                      </div>

                      <div className="perf-meter-card">
                        <div className="progress-circle" style={{ '--progress-pct': `${viewingSupplier.performance.qualityScore}` }}>
                          <span className="value">{viewingSupplier.performance.qualityScore}%</span>
                        </div>
                        <span className="label">Quality Index</span>
                      </div>

                      <div className="perf-stat-card">
                        <span className="label">⏰ Avg. Lead Time</span>
                        <div className="number">{viewingSupplier.performance.leadTimeDays} Days</div>
                        <span className="subtext">From PO to Delivery</span>
                      </div>

                      <div className="perf-stat-card">
                        <span className="label">🔄 Return Rate</span>
                        <div className={`number ${viewingSupplier.performance.returnRate > 2 ? 'bad' : 'good'}`}>
                          {viewingSupplier.performance.returnRate}%
                        </div>
                        <span className="subtext">Damaged/Incorrect goods</span>
                      </div>
                    </div>

                    {/* AI Recommendation Card */}
                    <div className="ai-insight-card">
                      <div className="ai-insight-title">
                        <span className="sparkles">✨</span>
                        <h4>AI Procurement Insight</h4>
                      </div>
                      <p className="ai-insight-text">{viewingSupplier.aiRecommendation}</p>
                    </div>

                    {/* Additional Details */}
                    <div className="contact-details-box">
                      <h4>Contact & Business Details</h4>
                      <div className="contact-grid">
                        <div className="grid-item">
                          <span>Contact Person</span>
                          <strong>{viewingSupplier.contactPerson}</strong>
                        </div>
                        <div className="grid-item">
                          <span>Email Address</span>
                          <strong>{viewingSupplier.email}</strong>
                        </div>
                        <div className="grid-item">
                          <span>Phone Number</span>
                          <strong>{viewingSupplier.phone}</strong>
                        </div>
                        <div className="grid-item">
                          <span>Tax Registration ID</span>
                          <strong>{viewingSupplier.taxId}</strong>
                        </div>
                        <div className="grid-item full-width">
                          <span>Office Address</span>
                          <strong>{viewingSupplier.address}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="history-tab-content">
                    <div className="table-responsive">
                      <table className="transaction-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items Count</th>
                            <th>Total Cost</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingSupplier.transactions.length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                                No purchase orders found for this supplier.
                              </td>
                            </tr>
                          ) : (
                            viewingSupplier.transactions.map(tx => (
                              <tr key={tx.id}>
                                <td className="order-id">📋 {tx.id}</td>
                                <td>{tx.date}</td>
                                <td>{tx.itemsCount} units</td>
                                <td><strong>${tx.amount.toLocaleString()}</strong></td>
                                <td>
                                  <span className={`status-pill ${tx.status.toLowerCase()}`}>
                                    {tx.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection bg-glass">
              <span className="big-icon">📊</span>
              <h3>No Supplier Selected</h3>
              <p>Click a supplier card to inspect performance analytics, contact information, and purchase order history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Form Modal */}
      {isFormOpen && (
        <div className="modal-backdrop">
          <div className="modal-content bg-glass">
            <div className="modal-header">
              <h3>{formMode === 'create' ? '🚚 Register New Supplier' : '✏️ Edit Supplier Information'}</h3>
              <button className="close-btn" onClick={() => setIsFormOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Company Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={formErrors.companyName ? 'error' : ''}
                    placeholder="Enter company name..."
                  />
                  {formErrors.companyName && <span className="error-text">{formErrors.companyName}</span>}
                </div>

                <div className="form-group">
                  <label>Contact Person Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={formErrors.contactPerson ? 'error' : ''}
                    placeholder="e.g. Sunil Perera"
                  />
                  {formErrors.contactPerson && <span className="error-text">{formErrors.contactPerson}</span>}
                </div>

                <div className="form-group">
                  <label>Tax Registration ID (TIN) <span className="required">*</span></label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className={formErrors.taxId ? 'error' : ''}
                    placeholder="e.g. TX-XXXXX-LK"
                  />
                  {formErrors.taxId && <span className="error-text">{formErrors.taxId}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'error' : ''}
                    placeholder="e.g. supplier@domain.com"
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? 'error' : ''}
                    placeholder="e.g. +94 77 123 4567"
                  />
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Primary Supply Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Supplier Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Office Address <span className="required">*</span></label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? 'error' : ''}
                    placeholder="Enter supplier office location details..."
                    rows="2"
                  />
                  {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                </div>

                {/* Initial performance scores (For simulation/edit) */}
                <div className="form-section-title full-width">
                  <h4>📊 Initial Performance Metrics (for simulation)</h4>
                </div>

                <div className="form-group">
                  <label>On-Time Delivery Rate (%)</label>
                  <input
                    type="number"
                    name="performance.onTimeDelivery"
                    min="0"
                    max="100"
                    value={formData.performance.onTimeDelivery}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Quality Score (%)</label>
                  <input
                    type="number"
                    name="performance.qualityScore"
                    min="0"
                    max="100"
                    value={formData.performance.qualityScore}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Average Lead Time (Days)</label>
                  <input
                    type="number"
                    name="performance.leadTimeDays"
                    min="1"
                    value={formData.performance.leadTimeDays}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Return Rate (%)</label>
                  <input
                    type="number"
                    name="performance.returnRate"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.performance.returnRate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {formMode === 'create' ? 'Register Supplier' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled JSX - Premium design fitting with dashboard */}
      <style>{`
        .suppliers-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #1e293b;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Glassmorphism utility */
        .bg-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
        }

        .hover-scale {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }

        /* Metrics grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .metric-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }
        .metric-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .metric-icon-wrapper.blue { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
        .metric-icon-wrapper.green { background: rgba(16, 185, 129, 0.15); color: #059669; }
        .metric-icon-wrapper.orange { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        .metric-icon-wrapper.gold { background: rgba(234, 179, 8, 0.15); color: #b45309; }

        .metric-details {
          display: flex;
          flex-direction: column;
        }
        .metric-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 4px;
        }
        .value-sub {
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
        }

        /* Controls Panel */
        .controls-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .search-box {
          position: relative;
          width: 100%;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #94a3b8;
        }
        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.6);
          color: #1e293b;
          font-size: 14px;
          transition: outline 0.15s, border-color 0.15s;
        }
        .search-box input:focus {
          outline: 2px solid #3b82f6;
          border-color: transparent;
        }

        .filters-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-end;
        }
        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 140px;
        }
        .filter-item label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          font-weight: 700;
        }
        .filter-item select {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          color: #334155;
          cursor: pointer;
        }
        .register-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: transform 0.15s, box-shadow 0.15s;
          height: 40px;
          align-self: flex-end;
        }
        .register-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        .register-btn:active {
          transform: translateY(0);
        }

        /* Layout panels */
        .suppliers-content-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .suppliers-content-layout {
            grid-template-columns: 1fr;
          }
          .supplier-detail-panel {
            position: fixed;
            top: 0;
            right: -100%;
            height: 100vh;
            width: 90% !important;
            max-width: 480px;
            z-index: 1000;
            transition: right 0.3s ease-in-out;
            box-shadow: -10px 0 30px rgba(0,0,0,0.15) !important;
            border-radius: 0 !important;
            border-left: 1px solid rgba(255,255,255,0.4) !important;
          }
          .supplier-detail-panel.open {
            right: 0;
          }
          .detail-close-btn {
            display: block !important;
          }
        }

        .suppliers-list-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .list-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
        }

        .suppliers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* Cards style */
        .supplier-item-card {
          padding: 16px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.4);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .supplier-item-card.selected {
          border: 2px solid #3b82f6;
          background: rgba(255, 255, 255, 0.95);
        }
        .card-top {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
        }
        .supplier-icon-placeholder {
          font-size: 24px;
          background: rgba(15, 23, 42, 0.05);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .title-area {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .supplier-id {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 700;
        }
        .supplier-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
        .category-badge {
          font-size: 10px;
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
          padding: 2px 6px;
          border-radius: 6px;
          align-self: flex-start;
          font-weight: 600;
        }
        .category-badge.large {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .status-pill {
          font-size: 9px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.active { background: rgba(16, 185, 129, 0.15); color: #059669; }
        .status-pill.under-review { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        .status-pill.inactive { background: rgba(100, 116, 139, 0.15); color: #64748b; }
        .status-pill.delivered { background: rgba(16, 185, 129, 0.15); color: #059669; }
        .status-pill.pending { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        .status-pill.cancelled { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          border-top: 1px dashed rgba(0, 0, 0, 0.05);
          border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
          padding: 10px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          color: #475569;
        }
        .star-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #f59e0b;
          font-weight: 700;
        }
        .card-mini-metrics {
          display: flex;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.03);
          padding: 8px 12px;
          border-radius: 8px;
        }
        .mini-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mini-stat .label { font-size: 9px; color: #64748b; font-weight: 500; }
        .mini-stat .value { font-size: 12px; font-weight: 700; }
        .mini-stat .value.good { color: #059669; }
        .mini-stat .value.warn { color: #d97706; }
        .mini-stat .value.bad { color: #dc2626; }

        .card-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .edit-icon-btn {
          font-size: 11px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          font-weight: 600;
          color: #475569;
        }
        .edit-icon-btn:hover { background: rgba(59, 130, 246, 0.1); color: #2563eb; }

        .status-toggle-btn {
          font-size: 11px;
          background: transparent;
          border: 1px dashed rgba(0,0,0,0.15);
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          font-weight: 600;
        }
        .status-toggle-btn.deactivate { color: #dc2626; }
        .status-toggle-btn.deactivate:hover { background: rgba(239, 68, 68, 0.1); }
        .status-toggle-btn.activate { color: #059669; }
        .status-toggle-btn.activate:hover { background: rgba(16, 185, 129, 0.1); }

        /* Detail Panel */
        .supplier-detail-panel {
          width: 100%;
          min-height: 500px;
          align-self: stretch;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }
        .no-selection {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }
        .no-selection .big-icon { font-size: 60px; margin-bottom: 16px; opacity: 0.6; }
        .no-selection h3 { font-size: 18px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        .no-selection p { font-size: 13px; max-width: 240px; }

        .detail-close-btn {
          display: none;
          position: absolute;
          top: 20px; right: 20px;
          background: rgba(0,0,0,0.05);
          border: none; border-radius: 50%;
          width: 32px; height: 32px;
          font-size: 14px; color: #475569;
          cursor: pointer;
        }

        .detail-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }
        .detail-id { font-size: 11px; font-weight: 800; color: #3b82f6; letter-spacing: 0.05em; }
        .detail-header h2 { font-size: 22px; font-weight: 800; color: #0f172a; }
        .header-meta { display: flex; align-items: center; gap: 12px; margin-top: 4px; }

        .detail-tabs {
          display: flex;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          gap: 4px;
        }
        .tab-btn {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .tab-btn:hover { color: #0f172a; }
        .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }

        /* Performance Analytics Tab */
        .perf-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        .perf-meter-card {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .progress-circle {
          --size: 70px;
          --bar-w: 6px;
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(closest-side, white 79%, transparent 80% 100%),
                      conic-gradient(#2563eb calc(var(--progress-pct) * 1%), rgba(37, 99, 235, 0.1) 0);
          position: relative;
        }
        .progress-circle .value {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }
        .perf-meter-card .label { font-size: 11px; font-weight: 600; color: #475569; }

        .perf-stat-card {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .perf-stat-card .label { font-size: 11px; font-weight: 600; color: #64748b; }
        .perf-stat-card .number { font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0; }
        .perf-stat-card .number.good { color: #059669; }
        .perf-stat-card .number.bad { color: #dc2626; }
        .perf-stat-card .subtext { font-size: 9px; color: #94a3b8; }

        /* AI Insight */
        .ai-insight-card {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%);
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .ai-insight-card::before {
          content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 80%);
          pointer-events: none;
        }
        .ai-insight-title {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6d28d9;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .sparkles { font-size: 14px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .ai-insight-text { font-size: 12px; color: #1e1b4b; line-height: 1.5; font-weight: 500; }

        /* Contact Box */
        .contact-details-box {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .contact-details-box h4 { font-size: 13px; font-weight: 700; margin-bottom: 12px; color: #334155; }
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .grid-item { display: flex; flex-direction: column; gap: 2px; }
        .grid-item.full-width { grid-column: span 2; }
        .grid-item span { font-size: 10px; color: #64748b; font-weight: 500; }
        .grid-item strong { font-size: 12px; color: #1e293b; font-weight: 600; word-break: break-all; }

        /* Transaction History Tab */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .transaction-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          text-align: left;
        }
        .transaction-table th {
          padding: 10px 8px;
          border-bottom: 1.5px solid rgba(0, 0, 0, 0.08);
          color: #475569;
          font-weight: 700;
        }
        .transaction-table td {
          padding: 12px 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        .transaction-table tbody tr:hover {
          background: rgba(0, 0, 0, 0.01);
        }
        .order-id { font-weight: 600; color: #2563eb; }

        /* Modal styling */
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 16px;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding-bottom: 12px;
        }
        .modal-header h3 { font-size: 18px; font-weight: 800; color: #0f172a; }
        .modal-header .close-btn {
          background: transparent; border: none; font-size: 16px; color: #64748b; cursor: pointer;
        }
        .modal-header .close-btn:hover { color: #0f172a; }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group.full-width { grid-column: span 2; }
        .form-group label {
          font-size: 11px; font-weight: 700; color: #475569;
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          color: #1e293b;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: 2px solid #3b82f6;
          border-color: transparent;
        }
        .form-group input.error, .form-group textarea.error {
          border-color: #ef4444;
          outline-color: #ef4444;
        }
        .error-text { font-size: 10px; color: #ef4444; font-weight: 600; }
        .required { color: #ef4444; }

        .form-section-title {
          margin-top: 14px;
          border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
          padding-bottom: 6px;
        }
        .form-section-title h4 { font-size: 12px; font-weight: 700; color: #475569; }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          padding-top: 16px;
        }
        .cancel-btn {
          background: transparent; border: 1px solid rgba(0,0,0,0.1);
          color: #475569; font-weight: 600; padding: 10px 20px;
          border-radius: 8px; cursor: pointer; font-size: 13px;
        }
        .cancel-btn:hover { background: rgba(0, 0, 0, 0.03); color: #0f172a; }
        .submit-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white; font-weight: 600; padding: 10px 20px;
          border-radius: 8px; border: none; cursor: pointer; font-size: 13px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        .submit-btn:hover { box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3); }

        .empty-state {
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-title { font-size: 14px; font-weight: 700; color: #334155; }
        .empty-subtitle { font-size: 12px; color: #64748b; }
      `}</style>
    </div>
  );
};

export default SuppliersPage;
