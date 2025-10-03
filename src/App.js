import React, { useState } from 'react';
import './App.css';
import CabDataForm from './CabDataForm';
import Dashboard from './Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editContext, setEditContext] = useState(null);

  const handleEditEntry = (date, cabNumber) => {
    setEditContext({ date, cabNumber });
    setActiveTab('entries');
  };

  const clearEditContext = () => {
    setEditContext(null);
  };

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      component: <Dashboard onEditEntry={handleEditEntry} /> 
    },
    { 
      id: 'entries', 
      label: 'Daily Entries', 
      component: <CabDataForm editContext={editContext} onClearContext={clearEditContext} /> 
    }
  ];

  return (
    <div className="App">
      <div className="tab-container">
        <div className="tab-header">
          <div className="tab-list">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="tab-content">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
}

export default App;
