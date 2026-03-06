import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, remove } from "firebase/database";

const MissionCard = ({ mission, onEdit, isAdmin }) => { // 🛡️ isAdmin प्रॉप यहाँ जोड़ दिया गया है
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(mission.deadline).getTime() - now;

      if (distance < 0) {
        setTimeLeft("MISSION_EXPIRED");
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${days}D ${hours}H ${mins}M ${secs}S`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mission.deadline]);

  return (
    <div className="mission-card">
      <div className="mission-header">
        <span className="mission-title">{mission.title.toUpperCase()}</span>
        <span className="countdown-timer">{timeLeft}</span>
      </div>
      <div className="progress-container">
        <div className="progress-fill" style={{width: `${mission.progress}%`}}></div>
      </div>
      <div className="mission-footer">
        <span>SYNC_LEVEL: {mission.progress}%</span>
        
        {/* 🛡️ सिर्फ एडमिन के लिए कंट्रोल बटन */}
        {isAdmin && (
          <div>
            <button 
              className="abort-btn" 
              style={{borderColor: '#00f2fe', color: '#00f2fe', marginRight: '10px'}} 
              onClick={() => onEdit(mission)}
            >
              EDIT
            </button>
            <button 
              className="abort-btn" 
              onClick={() => remove(ref(db, `missions/${mission.id}`))}
            >
              ABORT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionCard;
