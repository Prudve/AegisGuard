import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity,
  PieChart
} from 'lucide-react';

export default function AnalyticsDashboard({ analytics }) {
  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>Moderation Analytics & Safety Trends</h2>
          <p>Track content volume, flag rates, policy violations, auto-moderation accuracy, and trends over time.</p>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap blue">
            <Activity size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Posts Scanned</span>
            <span className="kpi-val">{analytics.totalScanned.toLocaleString()}</span>
            <span className="kpi-sub green"><TrendingUp size={12} /> +12.4% this week</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap orange">
            <ShieldAlert size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Flagged Items</span>
            <span className="kpi-val">{analytics.totalFlagged.toLocaleString()}</span>
            <span className="kpi-sub">{(analytics.totalFlagged / analytics.totalScanned * 100).toFixed(1)}% Flag Rate</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap red">
            <CheckCircle size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Auto-Blocked Posts</span>
            <span className="kpi-val">{analytics.autoBlocked.toLocaleString()}</span>
            <span className="kpi-sub">High confidence auto-block</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <Clock size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Avg Pipeline Latency</span>
            <span className="kpi-val">{analytics.avgResponseMs} ms</span>
            <span className="kpi-sub green">Ultra low latency</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-grid">
        {/* Category Breakdown Bar/Pie Chart */}
        <div className="card chart-card">
          <div className="card-title">
            <PieChart size={20} className="icon-orange" />
            <span>Moderation Flags by Policy Category</span>
          </div>

          <div className="category-analytics-list">
            {analytics.categoryBreakdown.map((item, idx) => (
              <div key={idx} className="cat-analytic-row">
                <div className="cat-analytic-header">
                  <span className="cat-name">{item.category}</span>
                  <span className="cat-stats"><strong>{item.count}</strong> ({item.percent}%)</span>
                </div>
                <div className="cat-bar-bg">
                  <div 
                    className="cat-bar-fill"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Volume Trend Bar Chart */}
        <div className="card chart-card">
          <div className="card-title">
            <TrendingUp size={20} className="icon-blue" />
            <span>Daily Moderation & Flag Volume (7 Days)</span>
          </div>

          <div className="daily-trend-chart">
            {analytics.dailyTrend.map((day, idx) => {
              const maxScanned = 2500;
              const heightPercent = (day.scanned / maxScanned) * 100;
              const flagPercent = (day.flagged / day.scanned) * 100 * 3.5;

              return (
                <div key={idx} className="chart-bar-column">
                  <div className="bars-wrapper">
                    <div 
                      className="bar-scanned" 
                      style={{ height: `${heightPercent}%` }}
                      title={`Scanned: ${day.scanned}`}
                    />
                    <div 
                      className="bar-flagged" 
                      style={{ height: `${flagPercent}%` }}
                      title={`Flagged: ${day.flagged}`}
                    />
                  </div>
                  <span className="chart-day-label">{day.date}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot blue" /> Total Scanned</span>
            <span className="legend-item"><span className="legend-dot orange" /> Flagged Violations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
