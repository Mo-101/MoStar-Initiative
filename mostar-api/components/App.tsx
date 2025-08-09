"use client";
import React, { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Load external CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles.css';
    document.head.appendChild(link);

    // Load Font Awesome
    const fontAwesome = document.createElement('link');
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    fontAwesome.rel = 'stylesheet';
    document.head.appendChild(fontAwesome);

    // Load Chart.js
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    document.body.appendChild(chartScript);

    // Load custom script
    const customScript = document.createElement('script');
    customScript.src = '/script.js';
    // Make sure to load after Chart.js
    chartScript.onload = () => {
      document.body.appendChild(customScript);
    };

    // Cleanup function
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontAwesome);
      document.body.removeChild(chartScript);
      if (document.body.contains(customScript)) {
        document.body.removeChild(customScript);
      }
    };
  }, []);

  return (
    <>
      <div className="bg-animation"></div>
      <div className="particles" id="particles"></div>

      <div className="container">
        <div className="header">
          <h1>🚀 MoStar Industries</h1>
          <p>Advanced AI Platform • Futuristic Intelligence • Limitless Possibilities</p>
        </div>

        <div id="accountStatus" className="glass-card hidden">
          <div className="card-header">
            <h2 className="card-header h2">Mission Control Dashboard</h2>
            <button className="btn btn-secondary" onClick={() => window.logout()}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value" id="creditsRemaining">-</div>
              <div className="stat-label">Credits Remaining</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" id="totalCalls">-</div>
              <div className="stat-label">API Calls (30d)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" id="creditsUsed">-</div>
              <div className="stat-label">Credits Used (30d)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" id="userTierName">-</div>
              <div className="stat-label">Current Plan</div>
            </div>
          </div>
          <div className="usage-chart-container">
            <canvas id="usageChart"></canvas>
          </div>
        </div>

        <div id="authSection" className="glass-card">
          <div className="character-container">
            <div className="character" id="authCharacter">
              <div className="character-face">
                <div className="character-eyes">
                  <div className="eye" id="leftEye"></div>
                  <div className="eye" id="rightEye"></div>
                </div>
                <div className="character-mouth"></div>
              </div>
            </div>
          </div>
          <h2 className="welcome-heading">
            Welcome to the Future
          </h2>
          <div className="tab-nav">
            <button className="tab-btn active" id="registerTab" onClick={() => window.showRegister()}>
              <i className="fas fa-user-plus"></i> Join Mission
            </button>
            <button className="tab-btn" id="loginTab" onClick={() => window.showLogin()}>
              <i className="fas fa-rocket"></i> Launch Access
            </button>
          </div>

          <div id="registerForm" className="form-container">
            <div className="form-group">
              <label><i className="fas fa-user"></i> Agent Codename</label>
              <input type="text" id="username" className="form-control" placeholder="Enter your codename" />
            </div>
            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Communication Channel</label>
              <input type="email" id="email" className="form-control" placeholder="agent@future.ai" />
            </div>
            <div className="form-group">
              <label><i className="fas fa-lock"></i> Security Phrase</label>
              <div className="password-wrapper">
                <input 
                  type="password" 
                  id="password" 
                  className="form-control" 
                  placeholder="Enter security phrase" 
                  onFocus={() => window.closeCharacterEyes?.()} 
                  onBlur={() => window.openCharacterEyes?.()} 
                />
                <i className="fas fa-eye password-toggle" onClick={() => window.togglePassword?.('password')}></i>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="tier"><i className="fas fa-shield-alt"></i> Mission Tier</label>
              <select id="tier" className="form-control" aria-label="Select mission tier" title="Select your preferred mission tier">
                <option value="free">🚀 Explorer (Free - 100 credits/month)</option>
                <option value="basic">⭐ Voyager ($9.99 - 1,000 credits/month)</option>
                <option value="pro">🌟 Commander ($49.99 - 10,000 credits/month)</option>
                <option value="enterprise">👑 Admiral ($199.99 - 100,000 credits/month)</option>
              </select>
            </div>
            <button className="btn full-width-btn" onClick={() => window.register?.()}>
              <i className="fas fa-rocket"></i> Initialize Mission
            </button>
          </div>

          <div id="loginForm" className="form-container hidden">
            <div className="form-group">
              <label><i className="fas fa-key"></i> Access Key</label>
              <div className="password-wrapper">
                <input 
                  type="password" 
                  id="apiKey" 
                  className="form-control" 
                  placeholder="ms_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                  onFocus={() => window.closeCharacterEyes?.()} 
                  onBlur={() => window.openCharacterEyes?.()} 
                />
                <i className="fas fa-eye password-toggle" onClick={() => window.togglePassword?.('apiKey')}></i>
              </div>
            </div>
            <button className="btn full-width-btn" onClick={() => window.login?.()}>
              <i className="fas fa-sign-in-alt"></i> Access Granted
            </button>
          </div>
        </div>

        <div id="aiServices" className="glass-card hidden">
          <h2 className="service-heading">
            <i className="fas fa-brain"></i> AI Command Center
          </h2>
          <div className="grid">
            <div>
              <h3 className="text-generator-heading">
                <i className="fas fa-robot"></i> Neural Text Generator
              </h3>
              <div className="form-group">
                <label>Mission Prompt</label>
                <textarea id="aiPrompt" className="form-control" rows={3} placeholder="Describe your AI mission..."></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="aiModel">AI Model</label>
                <select id="aiModel" className="form-control" aria-label="Select AI model" title="Select AI model type">
                  <option value="standard">Standard AI (1 credit)</option>
                  <option value="advanced">Advanced AI (5 credits)</option>
                </select>
              </div>
              <button className="btn full-width-btn" onClick={() => window.generateAI?.()}>
                <i className="fas fa-magic"></i> Generate Response
              </button>
              <div id="aiResponse" className="api-response hidden"></div>
            </div>

            <div>
              <h3 className="climate-oracle-heading">
                <i className="fas fa-globe"></i> Climate Oracle
              </h3>
              <p className="climate-description">
                Advanced climate prediction using quantum AI algorithms.
              </p>
              <button className="btn btn-success full-width-btn" onClick={() => window.getClimateData?.()}>
                <i className="fas fa-cloud-sun"></i> Predict Climate (2 credits)
              </button>
              <div id="climateResponse" className="api-response hidden"></div>
            </div>
          </div>
        </div>

        <div id="creditPurchase" className="glass-card hidden">
          <h2 className="credit-exchange-heading">
            <i className="fas fa-coins"></i> Credit Exchange Station
          </h2>
          <div className="grid">
            <div className="pricing-card">
              <div className="blue-icon pricing-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <div className="price">$4.99</div>
              <div className="tier-name blue-icon">Starter Pack</div>
              <ul className="features">
                <li>500 Credits</li>
                <li>Standard AI Models</li>
                <li>Email Support</li>
                <li>Basic Analytics</li>
              </ul>
              <button className="btn full-width-btn" onClick={() => window.purchaseCredits?.('starter')}>
                <i className="fas fa-shopping-cart"></i> Purchase
              </button>
            </div>

            <div className="pricing-card featured">
              <div className="pink-icon pricing-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="price price-pink">$9.99</div>
              <div className="tier-name pink-icon">Voyager Pack</div>
              <ul className="features">
                <li>1,200 Credits</li>
                <li>All AI Models</li>
                <li>Priority Support</li>
                <li>Advanced Analytics</li>
                <li>API Documentation</li>
              </ul>
              <button className="btn full-width-btn" onClick={() => window.purchaseCredits?.('standard')}>
                <i className="fas fa-crown"></i> Most Popular
              </button>
            </div>

            <div className="pricing-card">
              <div className="green-icon pricing-icon">
                <i className="fas fa-gem"></i>
              </div>
              <div className="price price-green">$19.99</div>
              <div className="tier-name green-icon">Commander Pack</div>
              <ul className="features">
                <li>3,000 Credits</li>
                <li>All AI Models</li>
                <li>Dedicated Support</li>
                <li>Custom Integrations</li>
              </ul>
              <button className="btn full-width-btn" onClick={() => window.purchaseCredits?.('pro')}>
                <i className="fas fa-shopping-cart"></i> Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
