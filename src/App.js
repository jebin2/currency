import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="header">
        Currency Rates
    </div>
    <div className="container">
        <div className="card" id="apiCard">
            <div id="loading" className="loading">Loading...</div>
            <div className="exchange-rate" id="exchangeRate"></div>
            <div className="form-group">
                <select id="fromSelect">
                </select>
                <input type="number" id="fromAmount" min="0" />
            </div>
            <div className="form-group">
                <select id="toSelect">
                </select>
                <input type="number" id="toAmount" min="0" />
            </div>
        </div>
        <div id="updateInfoDiv" className='updateInfoDiv'>
        </div>
    </div>
    <div className="footer">
        <a href="https://github.com/jebin2/apis" target="_blank" rel="noopener noreferrer">
            <img src="/github-mark-white.png" />
        </a>
    </div>
    </div>
  );
}

export default App;