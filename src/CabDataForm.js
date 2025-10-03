import React, { useState, useEffect } from 'react';
import './CabDataForm.css';
import API_CONFIG from './config/api';

const CabDataForm = () => {
  // State for selectors
  const [cabs, setCabs] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCab, setSelectedCab] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // State for form data
  const [formData, setFormData] = useState({});
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [existingAmount, setExistingAmount] = useState(0);
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
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
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CABS}`);
      if (!response.ok) throw new Error('Failed to fetch cabs');
      const data = await response.json();
      setCabs(data);
    } catch (err) {
      setError(`Error fetching cabs: ${err.message}`);
    }
  };

  const fetchFormData = async () => {
    setLoading(true);
    setError('');
    try {
      // Map selectedType to API category for fetching data
      // Use 'expenses' as category for all expense types (fuel, maintenance, others)
      const apiType = selectedType === 'expenses' ? 'expenses' : selectedType;
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CAB_DATA}?category=${apiType}&date=${selectedDate}&cab_number=${selectedCab}`
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      
      // Check if this is an existing entry (has valid ID from database)
      const hasExisting = data.id && data.id !== null && data.id !== '';
      setHasExistingEntry(hasExisting);
      
      if (hasExisting) {
        // Store existing amount for display and summation
        setExistingAmount(data.amount || data.total_trips || 0);
        // Clear additional amount when loading existing data
        setAdditionalAmount('');
      } else {
        setExistingAmount(0);
        setAdditionalAmount('');
      }
      
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
      // Map selectedType to API category for submission
      // Use 'expenses' as category for all expense types (fuel, maintenance, others)
      // For other categories, use the selectedType directly
      const apiType = selectedType === 'expenses' ? 'expenses' : selectedType;
      
      // Handle amount summation for existing entries
      let finalAmount = formData.amount || 0;
      let finalTrips = formData.total_trips || 0;
      
      if (hasExistingEntry && (additionalAmount !== '' && additionalAmount !== null && additionalAmount !== undefined)) {
        if (selectedType === 'trips') {
          finalTrips = parseInt(existingAmount || 0) + parseInt(additionalAmount);
        } else {
          finalAmount = parseInt(existingAmount || 0) + parseInt(additionalAmount);
        }
      }
      
      // Auto-generate comments for expense submissions
      let updatedComments = formData.comments || '';
      if (selectedType === 'expenses') {
        const expenseType = formData.type || 'Unknown';
        const amount = hasExistingEntry && additionalAmount ? finalAmount : (formData.amount || 0);
        
        // Generate comment entry
        let commentEntry = '';
        if (expenseType === 'fuel' && formData.subtype) {
          // Format: "Fuel (Petrol): ₹500"
          commentEntry = `${expenseType.charAt(0).toUpperCase() + expenseType.slice(1)} (${formData.subtype.charAt(0).toUpperCase() + formData.subtype.slice(1)}): ₹${amount}`;
        } else {
          // Format: "Maintenance: ₹300"
          commentEntry = `${expenseType.charAt(0).toUpperCase() + expenseType.slice(1)}: ₹${amount}`;
        }
        
        // Append to existing comments with proper formatting
        if (updatedComments.trim()) {
          updatedComments = updatedComments.trim() + '; ' + commentEntry;
        } else {
          updatedComments = commentEntry;
        }
      }
      
      const payload = {
        ...formData,
        // Ensure selector values take precedence over formData
        category: apiType,
        cab_number: selectedCab,
        date: selectedDate,
        // Override with summed amounts if applicable
        ...(selectedType === 'trips' ? { total_trips: finalTrips } : { amount: finalAmount }),
        // Include auto-generated comments for expenses
        comments: updatedComments,
        updated_by: 'user'
      };

      // If no id, it's a new record
      if (!formData.id) {
        payload.created_by = 'user';
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CAB_DATA}`, {
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
              {hasExistingEntry ? (
                <div className="existing-entry-container">
                  <div className="existing-amount">
                    <span className="label">Existing:</span>
                    <span className="value">{existingAmount}</span>
                  </div>
                  <input
                    type="number"
                    id="additional_trips"
                    value={additionalAmount}
                    onChange={(e) => setAdditionalAmount(e.target.value)}
                    placeholder="Additional trips to add"
                  />
                  {additionalAmount && (
                    <div className="total-preview">
                      <span className="label">New Total:</span>
                      <span className="value">{parseInt(existingAmount || 0) + (parseInt(additionalAmount) || 0)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="number"
                  id="total_trips"
                  value={formData.total_trips === 0 ? 0 : (formData.total_trips || '')}
                  onChange={(e) => handleInputChange('total_trips', e.target.value === '' ? '' : parseInt(e.target.value))}
                />
              )}
            </div>
            <div className="form-group">
              <label htmlFor="distance_km">Distance (KM)</label>
              <input
                type="number"

                id="distance_km"
                value={formData.distance_km === 0 ? 0 : (formData.distance_km || '')}
                onChange={(e) => handleInputChange('distance_km', e.target.value === '' ? '' : parseFloat(e.target.value))}
              />
            </div>
          </>
        );

      case 'expenses':
        return (
          <>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              {hasExistingEntry ? (
                <div className="existing-entry-container">
                  <div className="existing-amount">
                    <span className="label">Existing:</span>
                    <span className="value">₹{existingAmount}</span>
                  </div>
                  <input
                    type="number"
    
                    id="additional_amount"
                    value={additionalAmount}
                    onChange={(e) => setAdditionalAmount(e.target.value)}
                    placeholder="Additional amount to add"
                  />
                  {additionalAmount && (
                    <div className="total-preview">
                      <span className="label">New Total:</span>
                      <span className="value">₹{parseInt(existingAmount || 0) + (parseInt(additionalAmount) || 0)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="number"
  
                  id="amount"
                  value={formData.amount === 0 ? 0 : (formData.amount || '')}
                  onChange={(e) => handleInputChange('amount', e.target.value === '' ? '' : parseInt(e.target.value))}
                />
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Expense Type</label>
              <select
                id="type"
                value={formData.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="fuel">Fuel</option>
                <option value="maintenance">Maintenance</option>
                <option value="others">Others</option>
              </select>
            </div>

            {formData.type === 'fuel' && (
              <div className="form-group">
                <label htmlFor="subtype">Fuel Subtype</label>
                <select
                  id="subtype"
                  value={formData.subtype || ''}
                  onChange={(e) => handleInputChange('subtype', e.target.value)}
                >
                  <option value="">Select Fuel Type</option>
                  <option value="petrol">Petrol</option>
                  <option value="cng">CNG</option>
                </select>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                value={formData.comments || ''}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows="3"
                placeholder="Optional comments..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="paid_by">Paid By</label>
              <input
                type="text"
                id="paid_by"
                value={formData.paid_by || ''}
                onChange={(e) => handleInputChange('paid_by', e.target.value)}
                placeholder="Who paid for this expense?"
              />
            </div>
          </>
        );

      case 'payments':
        return (
          <div className="form-group">
            <label htmlFor="amount">Payment Amount</label>
            {hasExistingEntry ? (
              <div className="existing-entry-container">
                <div className="existing-amount">
                  <span className="label">Existing:</span>
                  <span className="value">₹{existingAmount}</span>
                </div>
                <input
                  type="number"
  
                  id="additional_amount"
                  value={additionalAmount}
                  onChange={(e) => setAdditionalAmount(e.target.value)}
                  placeholder="Additional payment to add"
                />
                {additionalAmount && (
                  <div className="total-preview">
                    <span className="label">New Total:</span>
                    <span className="value">₹{(existingAmount || 0) + (parseInt(additionalAmount) || 0)}</span>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="number"

                id="amount"
                value={formData.amount === 0 ? 0 : (formData.amount || '')}
                onChange={(e) => handleInputChange('amount', e.target.value === '' ? '' : parseInt(e.target.value))}
              />
            )}
          </div>
        );

      case 'salaries':
        return (
          <>
            <div className="form-group">
              <label htmlFor="amount">Salary Amount</label>
              {hasExistingEntry ? (
                <div className="existing-entry-container">
                  <div className="existing-amount">
                    <span className="label">Existing:</span>
                    <span className="value">₹{existingAmount}</span>
                  </div>
                  <input
                    type="number"
    
                    id="additional_amount"
                    value={additionalAmount}
                    onChange={(e) => setAdditionalAmount(e.target.value)}
                    placeholder="Additional salary to add"
                  />
                  {additionalAmount && (
                    <div className="total-preview">
                      <span className="label">New Total:</span>
                      <span className="value">₹{parseInt(existingAmount || 0) + (parseInt(additionalAmount) || 0)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="number"
  
                  id="amount"
                  value={formData.amount === 0 ? 0 : (formData.amount || '')}
                  onChange={(e) => handleInputChange('amount', e.target.value === '' ? '' : parseInt(e.target.value))}
                />
              )}
            </div>
            <div className="form-group">
              <label htmlFor="paid_by">Paid By</label>
              <input
                type="text"
                id="paid_by"
                value={formData.paid_by || ''}
                onChange={(e) => handleInputChange('paid_by', e.target.value)}
                placeholder="Who paid the salary?"
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
            <label htmlFor="cab">Cab</label>
            <select
              id="cab"
              value={selectedCab}
              onChange={(e) => setSelectedCab(e.target.value)}
              disabled={cabs.length === 0}
            >
              <option value="">Select Cab</option>
              {cabs.length === 0 ? (
                <option disabled>Loading cabs...</option>
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
            <label htmlFor="type">Category</label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="trips">Trips</option>
              <option value="expenses">Expenses</option>
              <option value="payments">Payments</option>
              <option value="salaries">Salaries</option>
            </select>
          </div>
        </div>
      </div>

      {selectedCab && selectedDate && selectedType && (
        <form onSubmit={handleSubmit} className="data-form-section">
          <h2>
            {formData.id ? 'Update' : 'Create'} {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Entry
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
