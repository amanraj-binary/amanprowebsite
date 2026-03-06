import React, { useState } from 'react';
import { db } from '../../firebase';
import { ref, push, set, update } from "firebase/database";

const AddMissionModal = ({ onClose, existingMission = null }) => {
  const [formData, setFormData] = useState(existingMission || {
    title: "",
    deadline: "",
    progress: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingMission) {
        await update(ref(db, `missions/${existingMission.id}`), formData);
      } else {
        await push(ref(db, 'missions/'), formData);
      }
      onClose();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '400px'}}>
        <h2 className="neon-text" style={{fontSize: '1rem'}}>NEW_MISSION_OBJECTIVE</h2>
        <form onSubmit={handleSubmit} style={{marginTop: '20px'}}>
          <input 
            className="cyber-input" 
            placeholder="Mission Title" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
          <label className="info-label">DEADLINE_SET</label>
          <input 
            type="datetime-local" 
            className="cyber-input"
            value={formData.deadline}
            onChange={e => setFormData({...formData, deadline: e.target.value})}
            required
          />
          <label className="info-label">PROGRESS_SYNC ({formData.progress}%)</label>
          <input 
            type="range" min="0" max="100" 
            style={{width: '100%', margin: '10px 0'}}
            value={formData.progress}
            onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
          />
          <button type="submit" className="g-btn" style={{width: '100%', marginTop: '15px'}}>
            INITIALIZE_MISSION
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMissionModal;
