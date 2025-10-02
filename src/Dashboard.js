import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import API_CONFIG from './config/api';

const Dashboard = () => {
  const [cabs, setCabs] = useState([]);
  const [selectedCabId, setSelectedCabId] = useState('all');
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch cabs on mount
  useEffect(() => {
    fetchCabs();
    fetchMonthlySummary('all');
  }, []);

  // Fetch daily summary for current month when monthly data loads
  useEffect(() => {
    if (monthlySummary && monthlySummary.monthly_summary.length > 0) {
      const currentMonth = monthlySummary.monthly_summary[0];
      setSelectedMonth(currentMonth.month_number);
      fetchDailySummary(monthlySummary.year, currentMonth.month_number, selectedCabId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlySummary]);

  const fetchCabs = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CABS}`);
      if (!response.ok) throw new Error('Failed to fetch cabs');
      const data = await response.json();
      setCabs(data);
    } catch (err) {
      setError(`Error fetching cabs: ${err.message}`);
    }
  };

  const fetchMonthlySummary = async (cabId) => {
    setLoading(true);
    setError('');
    try {
      const url = cabId === 'all' 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}?cab_id=${cabId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setMonthlySummary(data);
    } catch (err) {
      setError(`Error fetching dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async (year, month, cabId) => {
    setLoading(true);
    setError('');
    try {
      const url = cabId === 'all'
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD_DAILY}?year=${year}&month=${month}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD_DAILY}?year=${year}&month=${month}&cab_id=${cabId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch daily data');
      const data = await response.json();
      setDailySummary(data);
    } catch (err) {
      setError(`Error fetching daily data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCabChange = (cabId) => {
    setSelectedCabId(cabId);
    fetchMonthlySummary(cabId);
    if (selectedMonth && monthlySummary) {
      fetchDailySummary(monthlySummary.year, selectedMonth, cabId);
    }
  };

  const handleMonthClick = (monthNumber) => {
    setSelectedMonth(monthNumber);
    if (monthlySummary) {
      fetchDailySummary(monthlySummary.year, monthNumber, selectedCabId);
    }
  };

  const toggleRowExpansion = (monthNumber) => {
    setExpandedRows((prev) => ({
      ...prev,
      [monthNumber]: !prev[monthNumber],
    }));
    
    // When expanding a row, set it as selected month and fetch daily data
    if (!expandedRows[monthNumber] && monthlySummary) {
      setSelectedMonth(monthNumber);
      fetchDailySummary(monthlySummary.year, monthNumber, selectedCabId);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return parseFloat(num).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Cab Dashboard</h1>
        
        <div className="cab-selector">
          <label htmlFor="cab-select">Select Cab:</label>
          <select
            id="cab-select"
            value={selectedCabId}
            onChange={(e) => handleCabChange(e.target.value)}
          >
            <option value="all">All Cabs</option>
            {cabs.map((cab) => (
              <option key={cab.id} value={cab.id}>
                {cab.service_number} - {cab.driver_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading">Loading dashboard data...</div>}

      {!loading && monthlySummary && (
        <div className="dashboard-content">
          {/* Desktop View: Side by Side */}
          <div className="desktop-view">
            <div className="monthly-summary-section">
              <h2>Monthly Summary - {monthlySummary.year}</h2>
              <div className="table-wrapper">
                <table className="monthly-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Trips</th>
                      <th>Distance</th>
                      <th>Expenses</th>
                      <th>Salaries</th>
                      <th>Payments</th>
                      <th>Net Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySummary.monthly_summary.map((month) => (
                      <tr
                        key={month.month_number}
                        className={selectedMonth === month.month_number ? 'selected' : ''}
                        onClick={() => handleMonthClick(month.month_number)}
                      >
                        <td>{month.month}</td>
                        <td>{month.total_trips || 0}</td>
                        <td>{formatNumber(month.total_distance)} km</td>
                        <td>₹{formatNumber(month.total_expenses)}</td>
                        <td>₹{formatNumber(month.total_salaries)}</td>
                        <td>₹{formatNumber(month.total_payments)}</td>
                        <td className={month.net_income >= 0 ? 'positive' : 'negative'}>
                          ₹{formatNumber(month.net_income)}
                        </td>
                      </tr>
                    ))}
                    {monthlySummary.totals && (
                      <tr className="totals-row">
                        <td><strong>Total</strong></td>
                        <td><strong>{monthlySummary.totals.total_trips || 0}</strong></td>
                        <td><strong>{formatNumber(monthlySummary.totals.total_distance)} km</strong></td>
                        <td><strong>₹{formatNumber(monthlySummary.totals.total_expenses)}</strong></td>
                        <td><strong>₹{formatNumber(monthlySummary.totals.total_salaries)}</strong></td>
                        <td><strong>₹{formatNumber(monthlySummary.totals.total_payments)}</strong></td>
                        <td className={monthlySummary.totals.net_income >= 0 ? 'positive' : 'negative'}>
                          <strong>₹{formatNumber(monthlySummary.totals.net_income)}</strong>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="daily-summary-section">
              <h2>Daily Details - {dailySummary?.month_name || 'Select Month'}</h2>
              {dailySummary && (
                <div className="table-wrapper">
                  <table className="daily-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Trips</th>
                        <th>Distance</th>
                        <th>Expenses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailySummary.daily_summary.map((day, index) => (
                        <tr key={index}>
                          <td>{formatDate(day.date)}</td>
                          <td>{day.total_trips || 0}</td>
                          <td>{formatNumber(day.total_distance)} km</td>
                          <td>₹{formatNumber(day.total_expenses)}</td>
                        </tr>
                      ))}
                      {dailySummary.totals && (
                        <tr className="totals-row">
                          <td><strong>Total</strong></td>
                          <td><strong>{dailySummary.totals.total_trips || 0}</strong></td>
                          <td><strong>{formatNumber(dailySummary.totals.total_distance)} km</strong></td>
                          <td><strong>₹{formatNumber(dailySummary.totals.total_expenses)}</strong></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Mobile View: Expandable Rows */}
          <div className="mobile-view">
            <h2>Monthly Summary - {monthlySummary.year}</h2>
            <div className="mobile-table-wrapper">
              {monthlySummary.monthly_summary.map((month) => (
                <div key={month.month_number} className="mobile-row-container">
                  <div 
                    className="mobile-row"
                    onClick={() => toggleRowExpansion(month.month_number)}
                  >
                    <div className="mobile-row-header">
                      <span className="month-name">{month.month}</span>
                      <span className="expand-icon">
                        {expandedRows[month.month_number] ? '▼' : '▶'}
                      </span>
                    </div>
                    <div className="mobile-row-summary">
                      <div className="summary-item">
                        <span className="label">Trips:</span>
                        <span className="value">{month.total_trips || 0}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Net Income:</span>
                        <span className={`value ${month.net_income >= 0 ? 'positive' : 'negative'}`}>
                          ₹{formatNumber(month.net_income)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedRows[month.month_number] && (
                    <div className="mobile-expanded-content">
                      <div className="expanded-details">
                        <div className="detail-item">
                          <span className="label">Distance:</span>
                          <span className="value">{formatNumber(month.total_distance)} km</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Expenses:</span>
                          <span className="value">₹{formatNumber(month.total_expenses)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Salaries:</span>
                          <span className="value">₹{formatNumber(month.total_salaries)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Payments:</span>
                          <span className="value">₹{formatNumber(month.total_payments)}</span>
                        </div>
                      </div>

                      {/* Daily breakdown for mobile */}
                      {selectedMonth === month.month_number && dailySummary && (
                        <div className="mobile-daily-breakdown">
                          <h3>Daily Breakdown</h3>
                          <table className="mobile-daily-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Trips</th>
                                <th>Distance</th>
                                <th>Expenses</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dailySummary.daily_summary.map((day, index) => (
                                <tr key={index}>
                                  <td>{formatDate(day.date)}</td>
                                  <td>{day.total_trips || 0}</td>
                                  <td>{formatNumber(day.total_distance)}</td>
                                  <td>₹{formatNumber(day.total_expenses)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {monthlySummary.totals && (
                <div className="mobile-totals">
                  <h3>Year Total</h3>
                  <div className="totals-grid">
                    <div className="total-item">
                      <span className="label">Trips:</span>
                      <span className="value">{monthlySummary.totals.total_trips || 0}</span>
                    </div>
                    <div className="total-item">
                      <span className="label">Distance:</span>
                      <span className="value">{formatNumber(monthlySummary.totals.total_distance)} km</span>
                    </div>
                    <div className="total-item">
                      <span className="label">Expenses:</span>
                      <span className="value">₹{formatNumber(monthlySummary.totals.total_expenses)}</span>
                    </div>
                    <div className="total-item">
                      <span className="label">Salaries:</span>
                      <span className="value">₹{formatNumber(monthlySummary.totals.total_salaries)}</span>
                    </div>
                    <div className="total-item">
                      <span className="label">Payments:</span>
                      <span className="value">₹{formatNumber(monthlySummary.totals.total_payments)}</span>
                    </div>
                    <div className="total-item highlight">
                      <span className="label">Net Income:</span>
                      <span className={`value ${monthlySummary.totals.net_income >= 0 ? 'positive' : 'negative'}`}>
                        ₹{formatNumber(monthlySummary.totals.net_income)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
