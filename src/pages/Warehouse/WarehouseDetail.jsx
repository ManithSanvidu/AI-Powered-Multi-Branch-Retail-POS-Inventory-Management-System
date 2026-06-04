import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiLoader, FiMapPin, FiPhone, FiBox } from "react-icons/fi";
import ZoneCard from "../../components/warehouse/ZoneCard";
import ZoneForm from "../../components/warehouse/ZoneForm";
import StockTable from "../../components/warehouse/StockTable";
import * as warehouseService from "../../services/warehouseService";

export default function WarehouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [warehouse, setWarehouse] = useState(null);
  const [zones, setZones] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [zoneError, setZoneError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warehouseRes, zonesRes, stocksRes, statsRes] = await Promise.all([
        warehouseService.getWarehouseById(id),
        warehouseService.getZonesByWarehouse(id),
        warehouseService.getWarehouseStock(id),
        warehouseService.getWarehouseStats(id),
      ]);
      setWarehouse(warehouseRes.data);
      setZones(zonesRes.data);
      setStocks(stocksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching warehouse data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const res = await warehouseService.getZonesByWarehouse(id);
      setZones(res.data);
    } catch (err) {
      console.error("Error fetching zones:", err);
    }
  };

  const handleOpenZoneForm = (zone = null) => {
    setEditingZone(zone);
    setZoneError(null);
    setShowZoneForm(true);
  };

  const handleCloseZoneForm = () => {
    setShowZoneForm(false);
    setEditingZone(null);
    setZoneError(null);
  };

  const handleZoneSubmit = async (formData) => {
    setZoneLoading(true);
    setZoneError(null);
    try {
      if (editingZone) {
        await warehouseService.updateZone(editingZone._id, formData);
      } else {
        await warehouseService.createZone(id, formData);
      }
      handleCloseZoneForm();
      fetchZones();
    } catch (err) {
      setZoneError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setZoneLoading(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    try {
      await warehouseService.deleteZone(zoneId);
      fetchZones();
    } catch (err) {
      alert("Error deleting zone: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <FiLoader className="text-5xl text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white px-8 py-6 rounded-3xl shadow-xl">
          <p className="text-red-600 font-semibold text-lg">Warehouse not found</p>
        </div>
      </div>
    );
  }

  return (
    // Main Container with Hidden Overflow for absolute background elements
    <div className="relative min-h-screen bg-slate-50 font-sans overflow-hidden p-4 md:p-8">
      
      {/* --- Abstract Background Ornaments (This makes the glassmorphism pop!) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-300/40 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-[30%] left-[40%] w-72 h-72 bg-cyan-200/40 rounded-full blur-[90px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <button
          onClick={() => navigate("/warehouse")}
          className="group flex items-center gap-2 text-slate-600 hover:text-blue-700 mb-8 font-medium transition-all bg-white/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/60 shadow-sm hover:shadow-md w-fit"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} /> 
          Back to Warehouses
        </button>

        <div className="mb-10 pl-2">
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 drop-shadow-sm tracking-tight mb-2">
            {warehouse.name}
          </h1>
          <div className="flex items-center gap-2 text-blue-700/80 font-semibold text-lg">
            <FiMapPin /> {warehouse.location}
          </div>
        </div>

        {/* Stats Cards - Premium Glass Look */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Capacity Used", value: `${stats.usagePercent}%`, subValue: `${stats.totalUsed} / ${stats.totalCapacity}`, color: "text-blue-700" },
              { label: "Total Zones", value: stats.totalZones, color: "text-indigo-700" },
              { label: "Low Stock Items", value: stats.lowStockCount, color: "text-pink-600" },
              { label: "Manager", value: warehouse.manager?.name || "N/A", color: "text-slate-700", isText: true }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/70 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/60 group"
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-colors"></div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">{stat.label}</p>
                <p className={`text-4xl font-black ${stat.color} tracking-tight ${stat.isText ? 'text-2xl mt-2' : ''}`}>{stat.value}</p>
                {stat.subValue && <p className="text-sm text-slate-500 mt-2 font-medium bg-white/50 inline-block px-3 py-1 rounded-lg">{stat.subValue}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Tabs Container */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 overflow-hidden">
          
          {/* Modern Tab Menu */}
          <div className="flex flex-wrap p-3 gap-2 bg-white/30 border-b border-white/50">
            {["overview", "zones", "stock", "transactions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold text-sm tracking-wide transition-all duration-300 rounded-2xl ${
                  activeTab === tab
                    ? "bg-white text-blue-700 shadow-sm border border-white/80"
                    : "text-slate-500 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="p-6 md:p-10">
            
            {/* 1. Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Details Card */}
                <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200/50 pb-4">
                    <div className="p-3 bg-blue-100/50 rounded-xl text-blue-600"><FiMapPin size={20}/></div>
                    <h3 className="text-xl font-bold text-slate-800">Location Details</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <p className="text-slate-500 font-medium">Branch Location</p>
                      <p className="font-bold text-slate-800 bg-white/70 px-4 py-1.5 rounded-xl border border-white">{warehouse.location}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <p className="text-slate-500 font-medium">Full Address</p>
                      <p className="font-bold text-slate-800 text-right">{warehouse.address || "Not specified"}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <p className="text-slate-500 font-medium">Contact Phone</p>
                      <p className="font-bold text-slate-800 flex items-center gap-2"><FiPhone className="text-slate-400"/> {warehouse.phone || "Not specified"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Capacity Card */}
                <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200/50 pb-4">
                    <div className="p-3 bg-indigo-100/50 rounded-xl text-indigo-600"><FiBox size={20}/></div>
                    <h3 className="text-xl font-bold text-slate-800">Storage Capacity</h3>
                  </div>
                  <div className="space-y-8 mt-2">
                    <div className="flex justify-between items-end">
                      <p className="text-slate-500 font-medium">Maximum Capacity</p>
                      <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm">
                        {warehouse.capacity} <span className="text-lg text-slate-500 font-bold">units</span>
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                        <span>Space Used</span>
                        <span>{stats?.usagePercent || 0}%</span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-5 shadow-inner border border-slate-200/50 p-1">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 shadow-sm transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(stats?.usagePercent || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Zones Tab */}
            {activeTab === "zones" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    Storage Zones
                    <span className="bg-white/80 border border-slate-200 text-blue-700 px-4 py-1 rounded-full text-xs font-bold shadow-sm">
                      {zones.length} ZONE{zones.length !== 1 ? "S" : ""}
                    </span>
                  </h3>
                  <button
                    onClick={() => handleOpenZoneForm()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    <FiPlus size={20} /> Add New Zone
                  </button>
                </div>

                {zones.length === 0 ? (
                  <div className="text-center py-20 bg-white/40 rounded-3xl border-2 border-white/60 border-dashed shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiBox className="text-3xl text-blue-300" />
                    </div>
                    <p className="text-slate-500 mb-6 font-medium text-lg">No storage zones created yet</p>
                    <button
                      onClick={() => handleOpenZoneForm()}
                      className="inline-flex items-center gap-2 bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-100 px-8 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all active:scale-95"
                    >
                      <FiPlus size={18} /> Create First Zone
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {zones.map((zone) => (
                      <ZoneCard
                        key={zone._id}
                        zone={zone}
                        onEdit={() => handleOpenZoneForm(zone)}
                        onDelete={() => handleDeleteZone(zone._id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Stock Tab */}
            {activeTab === "stock" && (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-2 border border-white/60 shadow-sm overflow-hidden">
                <StockTable stocks={stocks} />
              </div>
            )}

            {/* 4. Transactions Tab */}
            {activeTab === "transactions" && (
              <div className="text-center py-20 bg-white/40 rounded-3xl border-2 border-white/60 border-dashed shadow-sm">
                <p className="text-slate-500 font-bold text-xl">Transactions Feature Coming Soon 🚀</p>
                <p className="text-slate-400 mt-2">Track all your inbound and outbound items here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone Form Modal - Enhanced Glass Look */}
      {showZoneForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark backdrop with blur */}
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={handleCloseZoneForm}></div>
          
          <div className="relative z-10 w-full max-w-md">
            {zoneError && (
              <div className="absolute -top-16 left-0 right-0 bg-red-100/90 backdrop-blur-md border border-red-300 text-red-700 px-6 py-3 rounded-2xl shadow-xl font-medium text-center text-sm animate-bounce">
                {zoneError}
              </div>
            )}
            {/* We assume ZoneForm component handles its own internal styling, but the wrapper provides positioning */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <ZoneForm
                zone={editingZone}
                onSubmit={handleZoneSubmit}
                onClose={handleCloseZoneForm}
                loading={zoneLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}