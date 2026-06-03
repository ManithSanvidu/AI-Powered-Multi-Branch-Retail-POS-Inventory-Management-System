import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiCheckCircle,
  FiClipboard,
  FiPackage,
  FiPieChart,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiTruck,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi'
import './PurchaseOrdersPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
const API_URL = `${API_BASE_URL}/api/purchase-orders`

const initialPurchaseOrders = [
  {
    po: 'PO-2026-1048',
    supplier: 'BlueLine Wholesale',
    branch: 'Colombo Central',
    date: '2026-06-02',
    amount: '$18,450.00',
    status: 'Pending',
  },
  {
    po: 'PO-2026-1047',
    supplier: 'NorthStar Distributors',
    branch: 'Kandy City',
    date: '2026-06-01',
    amount: '$9,780.00',
    status: 'Approved',
  },
  {
    po: 'PO-2026-1046',
    supplier: 'Metro Retail Supply',
    branch: 'Galle Fort',
    date: '2026-05-31',
    amount: '$24,120.00',
    status: 'Received',
  },
  {
    po: 'PO-2026-1045',
    supplier: 'Prime Foods Lanka',
    branch: 'Negombo',
    date: '2026-05-30',
    amount: '$7,360.00',
    status: 'Rejected',
  },
]

const workflow = [
  { label: 'Draft Created', detail: 'Supplier and branch selected', active: true },
  { label: 'Manager Review', detail: 'Budget and stock levels checked', active: true },
  { label: 'Approval Decision', detail: 'Approve or reject purchase request', active: true },
  { label: 'Goods Receiving', detail: 'Inventory quantity updated by branch', active: false },
]

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
  amount: formatAmount(order.amount ?? order.totalAmount ?? 0),
  status: order.status ?? 'Pending',
})

function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [lastSync, setLastSync] = useState('Ready')
  const [apiMessage, setApiMessage] = useState('Using sample data until MongoDB responds')
  const [form, setForm] = useState({
    supplier: '',
    branch: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
  })

  const loadPurchaseOrders = useCallback(async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Could not load purchase orders')
      }

      const orders = await response.json()
      if (orders.length > 0) {
        setPurchaseOrders(orders.map(normalizeOrder))
      }
      setApiMessage('Connected to MongoDB purchase orders')
      setLastSync(`Synced at ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`)
    } catch {
      setApiMessage('Database not connected. Showing sample data.')
    }
  }, [])

  useEffect(() => {
    // Initial synchronization with the purchase order API.
    loadPurchaseOrders()
  }, [loadPurchaseOrders])

  const kpis = useMemo(() => {
    const pending = purchaseOrders.filter((order) => order.status === 'Pending').length
    const approved = purchaseOrders.filter((order) => order.status === 'Approved').length
    const received = purchaseOrders.filter((order) => order.status === 'Received').length
    const totalValue = purchaseOrders.reduce((sum, order) => {
      return sum + parseAmount(order.amount)
    }, 0)

    return [
      {
        label: 'Total Purchase Orders',
        value: purchaseOrders.length.toString(),
        trend: 'Live order register',
        icon: FiClipboard,
        tone: 'primary',
      },
      {
        label: 'Pending Approvals',
        value: pending.toString(),
        trend: 'Awaiting manager review',
        icon: FiShield,
        tone: 'warning',
      },
      {
        label: 'Approved Orders',
        value: approved.toString(),
        trend: 'Ready for supplier processing',
        icon: FiCheckCircle,
        tone: 'success',
      },
      {
        label: 'Received Orders',
        value: received.toString(),
        trend: 'Inventory updated',
        icon: FiPackage,
        tone: 'info',
      },
      {
        label: 'Total Purchase Value',
        value: `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        trend: 'Based on listed purchase orders',
        icon: FiPieChart,
        tone: 'value',
      },
    ]
  }, [purchaseOrders])

  const updateOrderStatus = async (order, status) => {
    if (!order.id) {
      setPurchaseOrders((orders) =>
        orders.map((item) => (item.po === order.po ? { ...item, status } : item)),
      )
      setApiMessage('Sample row updated locally. Create a DB row to save changes.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Could not update purchase order')
      }

      const updatedOrder = normalizeOrder(await response.json())
      setPurchaseOrders((orders) =>
        orders.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)),
      )
      setApiMessage(`${updatedOrder.po} saved as ${status}`)
    } catch {
      setApiMessage('Could not save status. Check backend and MongoDB connection.')
    }
  }

  const handleCreateOrder = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Could not create purchase order')
      }

      const createdOrder = normalizeOrder(await response.json())
      setPurchaseOrders((orders) => [createdOrder, ...orders])
      setForm({
        supplier: '',
        branch: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
      })
      setIsCreateOpen(false)
      setApiMessage(`${createdOrder.po} saved to MongoDB`)
    } catch {
      setApiMessage('Create failed. Check MongoDB Atlas connection and backend console.')
    }
  }

  const handleSync = () => {
    loadPurchaseOrders()
  }

  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <nav className="topbar" aria-label="Dashboard navigation">
          <div className="brand-mark">
            <span className="brand-icon">
              <FiTruck aria-hidden="true" />
            </span>
            <span>RetailPOS AI</span>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" type="button" onClick={handleSync}>
              <FiRefreshCw aria-hidden="true" />
              Sync
            </button>
            <button className="primary-button" type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" />
              Create Purchase Order
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <div>
            <p className="eyebrow">Procurement Control Center</p>
            <h1>Purchase Order Management</h1>
            <p className="subtitle">
              Manage supplier orders, approvals, goods receiving, inventory
              updates, and purchase reports efficiently.
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
              <div className="card-icon">
                <Icon aria-hidden="true" />
              </div>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <span>{item.trend}</span>
              </div>
            </article>
          )
        })}
      </section>

      <section className="content-grid">
        <article className="panel supplier-panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">Supplier Linked Orders</p>
              <h2>Priority Suppliers</h2>
            </div>
            <FiUsers aria-hidden="true" />
          </div>
          <div className="supplier-list">
            <div>
              <span>BlueLine Wholesale</span>
              <strong>12 active POs</strong>
              <small>Fast moving groceries and essentials</small>
            </div>
            <div>
              <span>NorthStar Distributors</span>
              <strong>8 active POs</strong>
              <small>Electronics, accessories, and POS hardware</small>
            </div>
            <div>
              <span>Prime Foods Lanka</span>
              <strong>5 active POs</strong>
              <small>Fresh stock replenishment for branch stores</small>
            </div>
          </div>
        </article>

        <article className="panel workflow-panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">Approval Workflow</p>
              <h2>Status Tracking</h2>
            </div>
            <FiShield aria-hidden="true" />
          </div>
          <div className="workflow">
            {workflow.map((step, index) => (
              <div className={step.active ? 'workflow-step active' : 'workflow-step'} key={step.label}>
                <span>{index + 1}</span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{step.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel table-panel">
        <div className="table-header">
          <div>
            <p className="section-label">Recent Purchase Orders</p>
            <h2>Order Register</h2>
          </div>
          <button className="primary-button compact" type="button" onClick={() => setIsCreateOpen(true)}>
            <FiPlus aria-hidden="true" />
            Create Purchase Order
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier Name</th>
                <th>Branch</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((order) => (
                <tr key={order.id ?? order.po}>
                  <td className="po-number">{order.po}</td>
                  <td>{order.supplier}</td>
                  <td>{order.branch}</td>
                  <td>{order.date}</td>
                  <td>{order.amount}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="action approve"
                        type="button"
                        onClick={() => updateOrderStatus(order, 'Approved')}
                        aria-label={`Approve ${order.po}`}
                      >
                        <FiCheckCircle aria-hidden="true" />
                        Approve
                      </button>
                      <button
                        className="action reject"
                        type="button"
                        onClick={() => updateOrderStatus(order, 'Rejected')}
                        aria-label={`Reject ${order.po}`}
                      >
                        <FiXCircle aria-hidden="true" />
                        Reject
                      </button>
                      <button
                        className="action receive"
                        type="button"
                        onClick={() => updateOrderStatus(order, 'Received')}
                        aria-label={`Receive goods for ${order.po}`}
                      >
                        <FiPackage aria-hidden="true" />
                        Receive Goods
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <label>
                Supplier Name
                <input
                  value={form.supplier}
                  onChange={(event) => setForm({ ...form, supplier: event.target.value })}
                  placeholder="Example: BlueLine Wholesale"
                  required
                />
              </label>
              <label>
                Branch
                <input
                  value={form.branch}
                  onChange={(event) => setForm({ ...form, branch: event.target.value })}
                  placeholder="Example: Colombo Central"
                  required
                />
              </label>
              <label>
                Order Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  required
                />
              </label>
              <label>
                Total Amount
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  placeholder="12500.00"
                  required
                />
              </label>
              <div className="form-actions">
                <button className="ghost-form-button" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  <FiPlus aria-hidden="true" />
                  Create Purchase Order
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default PurchaseOrdersPage
