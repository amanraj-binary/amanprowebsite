import React from 'react';

const UsageTracker = ({ count = 0, limit = 5 }) => {
  const percentage = Math.min((count / limit) * 100, 100);
  
  return (
    <div className="usage-tracker-box">
      <div className="tracker-header">
        <span>DAILY_USAGE_LOG</span>
        <span className={count >= limit ? 'critical' : ''}>{count} / {limit}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      {count >= limit && <p className="limit-alert">! QUOTA_EXHAUSTED_UPGRADE_REQUIRED</p>}
    </div>
  );
};

export default UsageTracker;
