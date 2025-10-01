import React, { useState, useEffect } from 'react';
import './CabDataForm.css';

const API_BASE_URL = 'http://localhost:3000/api';

const CabDataForm = () => {
  // State for selectors
  const [cabs, setCabs] = useState([]);
  const [selectedCab, setSelectedCab] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedType, setSelectedType] = useState('trips');

  // State for form data
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch cabs on component mount
  useEffect(() => {
    fetchCabs();
  }, []);

  // Fetch form data when selectors change
  useEffect(() => {
    if (selectedCab && selectedDate && selectedType) {
      fetchFormData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCab, selectedDate, selectedType]);

  const fetchCabs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cabs`);
      if (!response.ok) throw new Error('Failed to fetch cabs');
      const data = await response.json();
      setCabs(data);
      if (data.length > 0) {
        setSelectedCab(data[0].service_number);
      }
    } catch (err) {
      setError(`Error fetching cabs: ${err.message}`);
    }
  };

  const fetchFormData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/cab-data?type=${selectedType}&date=${selectedDate}&cab_number=${selectedCab}`
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(`Error fetching form data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        type: selectedType,
        cab_number: selectedCab,
        date: selectedDate,
        ...formData,
        updated_by: 'user'
      };

      // If no id, it's a new record
      if (!formData.id) {
        payload.created_by = 'user';
      }

      const response = await fetch(`${API_BASE_URL}/cab-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit data');
      }

      await response.json();
      setSuccessMessage(formData.id ? 'Data updated successfully!' : 'Data created successfully!');
      
      // Refresh the form data
      fetchFormData();
    } catch (err) {
      setError(`Error submitting data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case 'trips':
        return (
          <>
            <div className="form-group">
              <label htmlFor="total_trips">Total Trips</label>
              <input
                type="number"
                id="total_trips"
                value={formData.total_trips || 0}
                onChange={(e) => handleInputChange('total_trips', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="distance_km">Distance (KM)</label>
              <input
                type="number"
                step="0.01"
                id="distance_km"
                value={formData.distance_km || 0}
                onChange={(e) => handleInputChange('distance_km', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </>
        );

      case 'fuel':
        return (
          <>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                step="0.01"
                id="amount"
                value={formData.amount || 0}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subtype">Fuel Subtype</label>
              <select
                id="subtype"
                value={formData.subtype || 'petrol'}
                onChange={(e) => handleInputChange('subtype', e.target.value)}
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                value={formData.comments || ''}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paid_by">Paid By</label>
              <input
                type="text"
                id="paid_by"
                value={formData.paid_by || ''}
                onChange={(e) => handleInputChange('paid_by', e.target.value)}
              />
            </div>
          </>
        );

      case 'payments':
        return (
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              step="0.01"
              id="amount"
              value={formData.amount || 0}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
        );

      case 'salaries':
        return (
          <>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                step="0.01"
                id="amount"
                value={formData.amount || 0}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="paid_by">Paid By</label>
              <input
                type="text"
                id="paid_by"
                value={formData.paid_by || ''}
                onChange={(e) => handleInputChange('paid_by', e.target.value)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cab-data-form-container">
      <h1>Cab Data Management</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="selectors-section">
        <h2>Select Parameters</h2>
        
        <div className="selectors-grid">
          <div className="form-group">
            <label htmlFor="cab">Cab</label>
            <select
              id="cab"
              value={selectedCab}
              onChange={(e) => setSelectedCab(e.target.value)}
              disabled={cabs.length === 0}
            >
              {cabs.length === 0 ? (
                <option>Loading cabs...</option>
              ) : (
                cabs.map((cab) => (
                  <option key={cab.id} value={cab.service_number}>
                    {cab.service_number} - {cab.driver_name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="trips">Trips</option>
              <option value="fuel">Expense (Fuel)</option>
              <option value="payments">Payments</option>
              <option value="salaries">Salary</option>
            </select>
          </div>
        </div>
      </div>

      {selectedCab && selectedDate && (
        <form onSubmit={handleSubmit} className="data-form-section">
          <h2>
            {formData.id ? 'Update' : 'Create'} {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Data
          </h2>
          
          {loading && <div className="loading">Loading...</div>}
          
          {!loading && (
            <>
              {renderFormFields()}
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : (formData.id ? 'Update' : 'Create')}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default CabDataForm;
