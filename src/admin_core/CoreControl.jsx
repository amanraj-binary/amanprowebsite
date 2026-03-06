import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import './CoreControl.css';

const CoreControl = ({ setView }) => {
  const { config, updateConfig } = useSettings();
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    try {
      await updateConfig(localConfig);
      alert("⚡ SYSTEM_CORE_SYNCED: All AI protocols updated.");
    } catch (err) {
      alert("❌ SYNC_ERROR: Connection to Firebase core lost.");
    }
  };

  return (
    <div className="core-admin-container">
      <div className="core-header">
        <div className="glitch-title" data-text="MASTER_CORE_CONTROL">MASTER_CORE_CONTROL</div>
        <button className="exit-btn" onClick={() => setView('home')}>[ EXIT_TO_LAB ]</button>
      </div>

      <div className="core-grid">
        {/* 🏷️ DYNAMIC_RENAME SECTION */}
        <div className="core-section">
          <h3><span className="icon">🏷️</span> DYNAMIC_RENAME</h3>
          <div className="input-group">
            <label>GEMINI_CORE_ALIAS</label>
            <input 
              type="text" 
              value={localConfig.ai_names?.gemini}
              onChange={(e) => setLocalConfig({...localConfig, ai_names: {...localConfig.ai_names, gemini: e.target.value}})}
            />
          </div>
          <div className="input-group">
            <label>FUTURE_AI_ALIAS</label>
            <input 
              type="text" 
              value={localConfig.ai_names?.future}
              onChange={(e) => setLocalConfig({...localConfig, ai_names: {...localConfig.ai_names, future: e.target.value}})}
            />
          </div>
        </div>

        {/* 🚀 WING_1_CORE (AMAN AI) */}
        <div className="core-section">
          <h3><span className="icon">🛰️</span> WING_1_CORE (Left)</h3>
          
          <div className="input-group">
            <label>AI_PROVIDER</label>
            <select 
              value={localConfig.wing1_provider} 
              onChange={(e) => setLocalConfig({...localConfig, wing1_provider: e.target.value})}
            >
              <option value="GOOGLE">Google Gemini</option>
              <option value="OPENAI">OpenAI ChatGPT</option>
              <option value="GROK">xAI Grok</option>
              <option value="ANTHROPIC">Anthropic Claude</option>
            </select>
          </div>

          <div className="input-group">
            <label>MODEL_NAME</label>
            <input 
              placeholder="e.g. gemini-2.5-flash" 
              value={localConfig.wing1_model} 
              onChange={(e) => setLocalConfig({...localConfig, wing1_model: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>ENDPOINT_URL</label>
            <input 
              placeholder="https://generativelanguage.googleapis..." 
              value={localConfig.wing1_url} 
              onChange={(e) => setLocalConfig({...localConfig, wing1_url: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <label>API_KEY</label>
            <input 
              type="password"
              placeholder="PASTE_KEY_HERE" 
              value={localConfig.wing1_key} 
              onChange={(e) => setLocalConfig({...localConfig, wing1_key: e.target.value})}
            />
          </div>
        </div>

        {/* 🚀 WING_2_CORE (FUTURE AI) */}
        <div className="core-section">
          <h3><span className="icon">🛰️</span> WING_2_CORE (Right)</h3>
          
          <div className="input-group">
            <label>AI_PROVIDER</label>
            <select 
              value={localConfig.wing2_provider} 
              onChange={(e) => setLocalConfig({...localConfig, wing2_provider: e.target.value})}
            >
              <option value="GOOGLE">Google Gemini</option>
              <option value="OPENAI">OpenAI ChatGPT</option>
              <option value="GROK">xAI Grok</option>
              <option value="ANTHROPIC">Anthropic Claude</option>
            </select>
          </div>

          <div className="input-group">
            <label>MODEL_NAME</label>
            <input 
              placeholder="e.g. llama-3.3-70b-versatile" 
              value={localConfig.wing2_model} 
              onChange={(e) => setLocalConfig({...localConfig, wing2_model: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>ENDPOINT_URL</label>
            <input 
              placeholder="https://api.groq.com/openai..." 
              value={localConfig.wing2_url} 
              onChange={(e) => setLocalConfig({...localConfig, wing2_url: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <label>API_KEY</label>
            <input 
              type="password"
              placeholder="PASTE_KEY_HERE" 
              value={localConfig.wing2_key} 
              onChange={(e) => setLocalConfig({...localConfig, wing2_key: e.target.value})}
            />
          </div>
        </div>

        {/* 💳 FINANCIAL_SYNC SECTION */}
        <div className="core-section">
          <h3><span className="icon">💳</span> FINANCIAL_SYNC</h3>
          <div className="input-group">
            <label>RAZORPAY_KEY_ID (Live/Test)</label>
            <input 
              type="text" 
              value={localConfig.razorpay_id}
              onChange={(e) => setLocalConfig({...localConfig, razorpay_id: e.target.value})}
              placeholder="rzp_test_... or rzp_live_..."
            />
          </div>
          <div className="input-group">
            <label>PRO_PLAN_PRICE (₹)</label>
            <input 
              type="number" 
              value={localConfig.pro_price}
              onChange={(e) => setLocalConfig({...localConfig, pro_price: parseInt(e.target.value)})}
            />
          </div>
          {/* 🛡️ नई लिमिट्स यहाँ हैं */}
          <div className="input-group" style={{marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px'}}>
            <label style={{color: '#00ffff'}}>FREE_USER_LIMIT (Daily)</label>
            <input 
              type="number" 
              value={localConfig.free_daily_limit ?? 5} 
              onChange={(e) => setLocalConfig({...localConfig, free_daily_limit: parseInt(e.target.value)})}
            />
          </div>

          <div className="input-group">
            <label style={{color: '#ffd700'}}>PRO_USER_LIMIT (Daily)</label>
            <input 
              type="number" 
              value={localConfig.pro_daily_limit ?? 50}
              onChange={(e) => setLocalConfig({...localConfig, pro_daily_limit: parseInt(e.target.value)})}
            />
          </div>
          <div className="status-indicator" style={{fontSize: '10px', marginTop: '10px'}}>
            SYSTEM_MODE: <span style={{color: localConfig.razorpay_id?.includes('test') ? '#ffff00' : '#00ff00', fontWeight: 'bold'}}>
              {localConfig.razorpay_id?.includes('test') ? '>> TEST_ACTIVE' : '>> LIVE_PRODUCTION'}
            </span>
          </div>
        </div>
      </div>

      <div className="core-actions">
        <button className="save-btn" onClick={handleSave}>EXECUTE_SYSTEM_UPDATE</button>
        <button className="legacy-btn" onClick={() => setView('admin')}>
          GO_TO_LEGACY_ADMIN (Job/Research) ➔
        </button>
      </div>

      <div className="core-footer">
        SERVER_STATUS: <span className="pulse-text">ACTIVE_ENCRYPTED</span>
      </div>
    </div>
  );
};

export default CoreControl;
