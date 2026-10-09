import React from 'react';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to Web Spy</h1>
        <p className="welcome-subtitle">
          Your advanced analytics and monitoring platform is ready.
        </p>
        <button className="welcome-button">Get Started</button>
      </div>
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  );
};

export default Welcome;
