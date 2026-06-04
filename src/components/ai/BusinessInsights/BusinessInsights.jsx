import React from 'react';
import { BarChart3 } from 'lucide-react';
import KpiCard from './KpiCard';
import ChartWidget from './ChartWidget';

const BusinessInsights = ({ darkMode }) => {
  const surface = darkMode ? '#1E293B' : '#FFFFFF';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const shadow = darkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)';

  return (
    <div style={{ background: surface, borderRadius: '20px', border: `1px solid ${border}`, padding: '20px', boxShadow: shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(124,58,237,0.12)', padding: '8px', borderRadius: '12px', color: '#7C3AED' }}>
          <BarChart3 size={20} />
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: text }}>Business Insights</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <KpiCard title="Total Revenue" value="$52,800" change="+16.8%" isPositive={true} darkMode={darkMode} />
        <KpiCard title="Avg Order Value" value="$124.50" change="+3.2%" isPositive={true} darkMode={darkMode} />
        <KpiCard title="Return Rate" value="2.4%" change="-0.5%" isPositive={true} darkMode={darkMode} />
        <KpiCard title="Active Customers" value="1,432" change="0.0%" neutral={true} darkMode={darkMode} />
      </div>

      <ChartWidget darkMode={darkMode} />
    </div>
  );
};

export default BusinessInsights;
