import React, { useState } from 'react';
import './App.css';
import CabDataForm from './CabDataForm';
import Dashboard from './Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: <Dashboard /> },
    { id: 'entries', label: 'Daily Entries', component: <CabDataForm /> }
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
