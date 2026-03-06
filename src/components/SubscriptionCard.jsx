import React from 'react';

const SubscriptionCard = ({ plan, onUpgrade }) => {
  return (
    <div className={`elite-subscription-card ${plan === 'pro' ? 'active-pro' : ''}`}>
      <div className="card-header">
        <span className="glow-text">{plan === 'pro' ? '🚀 PRO_MEMBER' : '🛡️ FREE_PLAN'}</span>
      </div>
      
      <div className="plan-details">
        <h3>{plan === 'pro' ? 'Unlimited High Speed' : 'Daily Limit: 5 Duels'}</h3>
        <p>{plan === 'pro' ? '500 AI calls/day unlocked.' : 'Upgrade for 500 calls/day.'}</p>
      </div>

      {plan !== 'pro' ? (
        <button className="g-btn upgrade-action" onClick={onUpgrade}>
          ACTIVATE_PRO_₹99
        </button>
      ) : (
        <div className="pro-status">PREMIUM_ACCESS_GRANTED</div>
      )}
    </div>
  );
};

export default SubscriptionCard;
