import React from 'react';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, toggleSidebar, history, deleteHistoryItem }) => {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={toggleSidebar}></div>
      
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSidebar}>✖</button>
        
        <div className="sidebar-header">
          <img src={logo} alt="Curalink Logo" className="sidebar-logo" />
          <h2>Curalink AI</h2>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>🕒 Recent Queries (Last 5)</h3>
            {history.length === 0 ? (
              <p className="empty-text">No recent queries.</p>
            ) : (
              <ul className="history-list">
                {history.map((item, index) => (
                  <li key={index}>
                    <span className="history-text" title={item}>{item}</span>
                    <button className="delete-history-btn" onClick={() => deleteHistoryItem(index)}>🗑️</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <hr className="divider" />
        </div>
      </div>
    </>
  );
};

export default Sidebar;