import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import './CyberStatsOverlay.css';

const CyberStatsOverlay = ({ isOpen, onClose, data, onUpgrade }) => {
  if (!isOpen) return null;

/* --- Line 7 से 9 की जगह इसे पेस्ट करें --- */

  const { config } = useSettings(); // 👈 एडमिन पैनल से डेटा खींचने के लिए
  const count = data?.daily_usage?.count || 0;
  const limit = data?.plan === 'pro' ? config.pro_daily_limit : config.free_daily_limit;
  const plan = data?.plan || 'FREE';

  return (
    <div className="cyber-overlay-wrapper">
      <div className="cyber-modal">
        <button className="cyber-close-btn" onClick={onClose}>
        <span className="btn-glitch">✕</span> [ABORT_DIAGNOSTICS]
        </button>
        <div className="scanner-line"></div>
        
        <h2 className="diag-title">SYSTEM_DIAGNOSTICS_v2.0</h2>
        
        <div className="diag-content">
          <div className="diag-item">
            <span className="label">ACCOUNT_STATUS:</span>
            <span className={`value ${plan === 'pro' ? 'pro-glow' : ''}`}>
               {plan === 'pro' ? '🚀 PRO_MEMBER' : 'BASIC_ACCESS'}
            </span>
          </div>

          <div className="diag-item">
            <span className="label">DAILY_USAGE_LOG:</span>
            <div className="usage-bar-container">
              <div 
                className="usage-bar-fill" 
                style={{ width: `${(count / limit) * 100}%` }}
              ></div>
            </div>
            <span className="value">{count} / {limit} UNITS</span>
          </div>

          <div className="diag-item">
            <span className="label">CONNECTION_STABILITY:</span>
            <span className="value status-ok">STABLE_ENCRYPTED</span>
          </div>
          {/* 🚀 नया एलीट लॉजिक: सिर्फ बेसिक यूजर्स के लिए */}
{plan !== 'pro' && (
  <div className="upgrade-protocol-zone">
    <div className="protocol-header">⚠️ LIMIT_RESTRICTION_DETECTED</div>
    <p className="protocol-desc">
  Upgrade to bypass {config.free_daily_limit}-duel limit & unlock {config.pro_daily_limit} calls/day.
</p>
    <button className="protocol-btn" onClick={onUpgrade}>
      [ ACTIVATE_PRO_UPGRADE ]
    </button>
  </div>
)}
        </div>

        <div className="footer-code">CORE_ID: {data.uid?.substring(0, 12)}...</div>
      </div>
    </div>
  );
};

export default CyberStatsOverlay;
