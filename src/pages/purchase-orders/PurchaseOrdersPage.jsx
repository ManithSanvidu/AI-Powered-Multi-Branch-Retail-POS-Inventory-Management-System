import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiDownload,
  FiEye,
  FiFilter,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTruck,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi'
import './PurchaseOrdersPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
const API_URL = `${API_BASE_URL}/api/purchase-orders`

const initialPurchaseOrders = [
  {
    po: 'PO-2026-1048',
    supplier: 'BlueLine Wholesale',
    branch: 'Colombo Central',
    date: '2026-06-02',
    expectedDate: '2026-06-06',
    amount: '$18,450.00',
    status: 'Pending',
    priority: 'High',
    items: 24,
    category: 'Grocery Essentials',
    owner: 'Kasun Perera',
  },
  {
    po: 'PO-2026-1047',
    supplier: 'NorthStar Distributors',
    branch: 'Kandy City',
    date: '2026-06-01',
    expectedDate: '2026-06-05',
    amount: '$9,780.00',
    status: 'Approved',
    priority: 'Medium',
    items: 13,
    category: 'Electronics',
    owner: 'Nimali Silva',
  },
  {
    po: 'PO-2026-1046',
    supplier: 'Metro Retail Supply',
    branch: 'Galle Fort',
    date: '2026-05-31',
    expectedDate: '2026-06-03',
    amount: '$24,120.00',
    status: 'Received',
    priority: 'Normal',
    items: 31,
    category: 'General Merchandise',
    owner: 'Ravi Fernando',
  },
  {
    po: 'PO-2026-1045',
    supplier: 'Prime Foods Lanka',
    branch: 'Negombo',
    date: '2026-05-30',
    expectedDate: '2026-06-04',
    amount: '$7,360.00',
    status: 'Rejected',
    priority: 'Low',
    items: 9,
    category: 'Fresh Foods',
    owner: 'Ayesha Noor',
  },
]

const reorderRecommendations = [
  { item: 'Premium Basmati Rice', branch: 'Colombo Central', stock: 50, reorder: 500, confidence: '96%', supplier: 'BlueLine Wholesale' },
  { item: 'Organic Coconut Oil', branch: 'Kandy City', stock: 23, reorder: 200, confidence: '93%', supplier: 'Prime Foods Lanka' },
  { item: 'Milk Powder 400g', branch: 'Negombo', stock: 42, reorder: 150, confidence: '91%', supplier: 'Metro Retail Supply' },
]

const supplierScorecards = [
  { name: 'BlueLine Wholesale', score: 96, metric: 'On-time delivery', open: 12 },
  { name: 'NorthStar Distributors', score: 91, metric: 'Best price match', open: 8 },
  { name: 'Prime Foods Lanka', score: 86, metric: 'Fresh-stock reliability', open: 5 },
]

const statuses = ['All', 'Pending', 'Approved', 'Received', 'Rejected']

const parseAmount = (amount) => Number(String(amount).replace(/[$,]/g, '')) || 0

const formatAmount = (amount) =>
  `$${parseAmount(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const normalizeOrder = (order) => ({
  id: order.id ?? order._id,
  po: order.po ?? order.poNumber ?? 'PO-PENDING',
  supplier: order.supplier ?? order.supplierName ?? '',
  branch: order.branch ?? '',
  date: order.date ?? order.orderDate ?? '',
  expectedDate: order.expectedDate ?? order.deliveryDate ?? 'Not scheduled',
  amount: formatAmount(order.amount ?? order.totalAmount ?? 0),
  status: order.status ?? 'Pending',
  priority: order.priority ?? 'Normal',
  items: order.items ?? order.itemCount ?? 1,
  category: order.category ?? 'Mixed Stock',
  owner: order.owner ?? 'Procurement Team',
})

function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(initialPurchaseOrders[0])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [lastSync, setLastSync] = useState('Ready')
  const [apiMessage, setApiMessage] = useState('Using sample data until MongoDB responds')
  const [form, setForm] = useState({
    supplier: '',
    branch: '',
    date: new Date().toISOString().slice(0, 10),
    expectedDate: '',
    amount: '',
    priority: 'Normal',
    category: '',
    items: 1,
  })

  const loadPurchaseOrders = useCallback(async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Could not load purchase orders')

      const orders = await response.json()
      if (orders.length > 0) {
        const normalized = orders.map(normalizeOrder)
        setPurchaseOrders(normalized)
        setSelectedOrder(normalized[0])
      }
      setApiMessage('Connected to MongoDB purchase orders')
      setLastSync(`Synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
    } catch {
      setApiMessage('Database not connected. Showing polished demo data.')
    }
  }, [])

  useEffect(() => {
    loadPurchaseOrders()
  }, [loadPurchaseOrders])

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase()
    return purchaseOrders.filter((order) => {
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter
      const matchesSearch =
        !search ||
        [order.po, order.supplier, order.branch, order.category, order.owner].some((value) =>
          String(value).toLowerCase().includes(search),
        )
      return matchesStatus && matchesSearch
    })
  }, [purchaseOrders, query, statusFilter])

  const kpis = useMemo(() => {
    const pending = purchaseOrders.filter((order) => order.status === 'Pending').length
    const approved = purchaseOrders.filter((order) => order.status === 'Approved').length
    const totalValue = purchaseOrders.reduce((sum, order) => sum + parseAmount(order.amount), 0)
    const highPriority = purchaseOrders.filter((order) => order.priority === 'High').length

    return [
      { label: 'Open PO Value', value: `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, trend: 'Across active branches', icon: FiBarChart2, tone: 'value' },
      { label: 'Pending Approval', value: pending.toString(), trend: 'Needs manager decision', icon: FiShield, tone: 'warning' },
      { label: 'Approved Orders', value: approved.toString(), trend: 'Ready for supplier dispatch', icon: FiCheckCircle, tone: 'success' },
      { label: 'AI Reorder Alerts', value: reorderRecommendations.length.toString(), trend: 'Low-stock suggestions', icon: FiAlertTriangle, tone: 'danger' },
      { label: 'High Priority', value: highPriority.toString(), trend: 'Expedite before stock-out', icon: FiTruck, tone: 'info' },
    ]
  }, [purchaseOrders])

  const updateOrderStatus = async (order, status) => {
    if (!order.id) {
      const updated = { ...order, status }
      setPurchaseOrders((orders) => orders.map((item) => (item.po === order.po ? updated : item)))
      setSelectedOrder(updated)
      setApiMessage(`${order.po} updated locally as ${status}`)
      return
    }

    try {
      const response = await fetch(`${API_URL}/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Could not update purchase order')

      const updatedOrder = normalizeOrder(await response.json())
      setPurchaseOrders((orders) => orders.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)))
      setSelectedOrder(updatedOrder)
      setApiMessage(`${updatedOrder.po} saved as ${status}`)
    } catch {
      setApiMessage('Could not save status. Check backend and MongoDB connection.')
    }
  }

  const handleCreateOrder = async (event) => {
    event.preventDefault()

    const orderPayload = {
      supplier: form.supplier.trim(),
      branch: form.branch.trim(),
      date: form.date,
      expectedDate: form.expectedDate || form.date,
      amount: Number(form.amount),
      priority: form.priority || 'Normal',
      category: form.category.trim() || 'Mixed Stock',
      items: Number(form.items) || 1,
    }

    if (!orderPayload.supplier || !orderPayload.branch || !orderPayload.date || orderPayload.amount <= 0) {
      setApiMessage('Supplier, branch, order date, and a positive amount are required.')
      return
    }

    const localOrder = normalizeOrder({
      ...orderPayload,
      id: `local-${Date.now()}`,
      po: `PO-2026-${Math.floor(1100 + Math.random() * 800)}`,
      status: 'Pending',
      owner: 'Procurement Team',
    })

    setPurchaseOrders((orders) => [localOrder, ...orders])
    setSelectedOrder(localOrder)
    setApiMessage(`${localOrder.po} created locally. Saving to MongoDB...`)
    setForm({
      supplier: '',
      branch: '',
      date: new Date().toISOString().slice(0, 10),
      expectedDate: '',
      amount: '',
      priority: 'Normal',
      category: '',
      items: 1,
    })
    setIsCreateOpen(false)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      if (!response.ok) throw new Error('Could not create purchase order')

      const createdOrder = normalizeOrder(await response.json())
      setPurchaseOrders((orders) => orders.map((order) => (order.id === localOrder.id ? createdOrder : order)))
      setSelectedOrder(createdOrder)
      setApiMessage(`${createdOrder.po} saved to MongoDB`)
    } catch {
      setApiMessage(`${localOrder.po} created locally. MongoDB is not connected, so it is not saved permanently yet.`)
    }
  }

  const handleExport = () => {
    const headers = ['PO Number', 'Supplier', 'Branch', 'Date', 'Expected', 'Amount', 'Status', 'Priority', 'Items']
    const rows = filteredOrders.map((order) => [
      order.po,
      order.supplier,
      order.branch,
      order.date,
      order.expectedDate,
      order.amount,
      order.status,
      order.priority,
      order.items,
    ])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'purchase-orders.csv'
    link.click()
    URL.revokeObjectURL(url)
    setApiMessage(`Exported ${filteredOrders.length} purchase orders`)
  }

  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <nav className="topbar" aria-label="Purchase order navigation">
          <div className="brand-mark">
            <span className="brand-icon"><FiClipboard aria-hidden="true" /></span>
            <span>Procurement Control</span>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" type="button" onClick={loadPurchaseOrders}>
              <FiRefreshCw aria-hidden="true" /> Sync
            </button>
            <button className="ghost-button" type="button" onClick={handleExport}>
              <FiDownload aria-hidden="true" /> Export
            </button>
            <button className="primary-button" type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" /> New PO
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <div>
            <p className="eyebrow">Purchase Order Management</p>
            <h1>Approve, track, and receive supplier orders from one workspace.</h1>
            <p className="subtitle">
              Built for fast procurement decisions with AI reorder alerts, supplier scorecards,
              approval actions, delivery tracking, and exportable purchase reports.
            </p>
          </div>
          <div className="hero-summary" aria-label="Current workflow summary">
            <span>Today</span>
            <strong>{purchaseOrders.filter((order) => order.status === 'Pending').length} approvals</strong>
            <small>{lastSync} across 5 active branches</small>
            <small>{apiMessage}</small>
          </div>
        </div>
      </section>

      <section className="kpi-grid" aria-label="Purchase order statistics">
        {kpis.map((item) => {
          const Icon = item.icon
          return (
            <article className={`kpi-card ${item.tone}`} key={item.label}>
              <div className="card-icon"><Icon aria-hidden="true" /></div>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <span>{item.trend}</span>
              </div>
            </article>
          )
        })}
      </section>

      <section className="control-panel panel" aria-label="Purchase order filters">
        <label className="search-box">
          <FiSearch aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search PO, supplier, branch, owner..." />
        </label>
        <div className="status-tabs" role="tablist" aria-label="Filter by order status">
          {statuses.map((status) => (
            <button
              className={statusFilter === status ? 'active' : ''}
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="filter-chip"><FiFilter aria-hidden="true" /> {filteredOrders.length} results</div>
      </section>

      <section className="workspace-grid">
        <article className="panel table-panel">
          <div className="table-header">
            <div>
              <p className="section-label">Live Order Register</p>
              <h2>Purchase Orders</h2>
            </div>
            <button className="primary-button compact" type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" /> Create PO
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PO</th>
                  <th>Supplier</th>
                  <th>Branch</th>
                  <th>ETA</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id ?? order.po} className={selectedOrder?.po === order.po ? 'selected-row' : ''}>
                    <td className="po-number">{order.po}<small>{order.items} items</small></td>
                    <td>{order.supplier}<small>{order.category}</small></td>
                    <td>{order.branch}<small>{order.owner}</small></td>
                    <td>{order.expectedDate}</td>
                    <td>{order.amount}</td>
                    <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td><span className={`priority-badge ${order.priority.toLowerCase()}`}>{order.priority}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="action view" type="button" onClick={() => setSelectedOrder(order)} aria-label={`View ${order.po}`}>
                          <FiEye aria-hidden="true" /> View
                        </button>
                        <button className="action approve" type="button" onClick={() => updateOrderStatus(order, 'Approved')} aria-label={`Approve ${order.po}`}>
                          <FiCheckCircle aria-hidden="true" /> Approve
                        </button>
                        <button className="action receive" type="button" onClick={() => updateOrderStatus(order, 'Received')} aria-label={`Receive goods for ${order.po}`}>
                          <FiPackage aria-hidden="true" /> Receive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="side-stack">
          <article className="panel detail-panel">
            <div className="panel-heading">
              <div>
                <p className="section-label">Selected Order</p>
                <h2>{selectedOrder?.po ?? 'No order selected'}</h2>
              </div>
              <FiClipboard aria-hidden="true" />
            </div>
            {selectedOrder && (
              <>
                <div className="detail-total">{selectedOrder.amount}</div>
                <dl className="detail-list">
                  <div><dt>Supplier</dt><dd>{selectedOrder.supplier}</dd></div>
                  <div><dt>Branch</dt><dd>{selectedOrder.branch}</dd></div>
                  <div><dt>Expected Delivery</dt><dd>{selectedOrder.expectedDate}</dd></div>
                  <div><dt>Owner</dt><dd>{selectedOrder.owner}</dd></div>
                </dl>
                <div className="decision-row">
                  <button className="action approve" type="button" onClick={() => updateOrderStatus(selectedOrder, 'Approved')}>
                    <FiCheckCircle aria-hidden="true" /> Approve
                  </button>
                  <button className="action reject" type="button" onClick={() => updateOrderStatus(selectedOrder, 'Rejected')}>
                    <FiXCircle aria-hidden="true" /> Reject
                  </button>
                </div>
              </>
            )}
          </article>

          <article className="panel ai-panel">
            <div className="panel-heading">
              <div>
                <p className="section-label">AI Smart Reordering</p>
                <h2>Low-stock suggestions</h2>
              </div>
              <FiAlertTriangle aria-hidden="true" />
            </div>
            <div className="recommendation-list">
              {reorderRecommendations.map((item) => (
                <div className="recommendation-item" key={item.item}>
                  <strong>{item.item}</strong>
                  <span>{item.branch} stock: {item.stock} units</span>
                  <small>Suggest {item.reorder} units from {item.supplier} - {item.confidence} confidence</small>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="content-grid">
        <article className="panel supplier-panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">Supplier-linked Purchases</p>
              <h2>Supplier scorecards</h2>
            </div>
            <FiUsers aria-hidden="true" />
          </div>
          <div className="supplier-list">
            {supplierScorecards.map((supplier) => (
              <div key={supplier.name}>
                <span>{supplier.name}</span>
                <strong>{supplier.score}% {supplier.metric}</strong>
                <small>{supplier.open} active purchase orders</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel workflow-panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">Approval Workflow</p>
              <h2>Status tracking</h2>
            </div>
            <FiShield aria-hidden="true" />
          </div>
          <div className="workflow">
            {['Draft created', 'Manager review', 'Approval decision', 'Goods receiving'].map((step, index) => (
              <div className={index < 3 ? 'workflow-step active' : 'workflow-step'} key={step}>
                <span>{index + 1}</span>
                <div>
                  <strong>{step}</strong>
                  <small>{index === 3 ? 'Inventory updates after receiving notes are confirmed' : 'Tracked in the order audit trail'}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {isCreateOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-po-title">
            <div className="modal-header">
              <div>
                <p className="section-label">New Supplier Order</p>
                <h2 id="create-po-title">Create Purchase Order</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setIsCreateOpen(false)} aria-label="Close">
                <FiXCircle aria-hidden="true" />
              </button>
            </div>

            <form className="po-form" onSubmit={handleCreateOrder}>
              <label>Supplier Name<input value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} placeholder="BlueLine Wholesale" required /></label>
              <label>Branch<input value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} placeholder="Colombo Central" required /></label>
              <label>Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Mixed Stock" /></label>
              <div className="form-grid">
                <label>Order Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
                <label>Expected Date<input type="date" value={form.expectedDate} onChange={(event) => setForm({ ...form, expectedDate: event.target.value })} /></label>
              </div>
              <div className="form-grid">
                <label>Total Amount<input type="number" min="1" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="12500.00" required /></label>
                <label>Item Count<input type="number" min="1" value={form.items} onChange={(event) => setForm({ ...form, items: event.target.value })} required /></label>
              </div>
              <label>
                Priority
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  <option>Normal</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
              <div className="form-actions">
                <button className="ghost-form-button" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button className="primary-button" type="submit"><FiPlus aria-hidden="true" /> Create Purchase Order</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default PurchaseOrdersPage
