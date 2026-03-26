import React from 'react';
import '../App.css';


const Presentation = ({ goToLogin, goToRegister }) => {
  return (
    <div className="presentation-container">
      <div className="content-wrapper">
        
        {/* App Icon */}
        <div className="app-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="white" 
            strokeWidth="1.5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" 
            />
          </svg>
        </div>

        {/* Text */}
        <h1 className="title">Expense Tracker</h1>
        <p className="subtitle">Manage your expenses effortlessly</p>

        {/* Buttons */}
        <div className="button-group">
          <button 
            className="btn-primary"
            onClick={goToLogin}
          >
            Login
          </button>

          <button 
            className="btn-secondary"
            onClick={goToRegister}
          >
            Register
          </button>
        </div>

      </div>
    </div>
  );
};

export default Presentation;