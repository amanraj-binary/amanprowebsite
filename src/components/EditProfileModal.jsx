import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, update, get } from "firebase/database";

const EditProfileModal = ({ user, data, onClose }) => {
  const [formData, setFormData] = useState({
    name: data.name || "",
    username: data.username || "",
    dob: data.dob || "",
    gender: data.gender || "Not Specified",
    location: data.location || "",
    skills: data.skills || "",
    github: data.github || "",
    codeforces: data.codeforces || "",
    linkedin: data.linkedin || ""
  });

  const [isUsernameLocked, setIsUsernameLocked] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // एडमिन चेक (ईमेल के आधार पर)
  const isAdminEmail = user?.email === 'royalrajaamanraj@gmail.com';

  useEffect(() => {
    if (isAdminEmail) {
      // एडमिन के लिए यूजरनेम हमेशा लॉक रहेगा
      setIsUsernameLocked(true);
    } else if (data.usernameLastChanged) {
      // यूजरनेम लॉक लॉजिक (60 दिन)
      const lastChanged = data.usernameLastChanged;
      const now = Date.now();
      const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
      const timePassed = now - lastChanged;

      if (timePassed < sixtyDaysInMs) {
        setIsUsernameLocked(true);
        setDaysRemaining(Math.ceil((sixtyDaysInMs - timePassed) / (1000 * 60 * 60 * 24)));
      }
    }
  }, [data, isAdminEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updates = { ...formData };
      
      // अगर यूजरनेम बदला गया है, तो टाइमस्टैम्प अपडेट करें
      if (formData.username !== data.username) {
        updates.usernameLastChanged = Date.now();
      }

      await update(ref(db, `users/${user.uid}`), updates);
      alert("CORE_IDENTITY_UPDATED!");
      onClose();
    } catch (err) {
      alert("SYNC_ERROR: " + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto'}}>
        <h2 className="neon-text" style={{fontSize: '1.2rem', marginBottom: '20px'}}>RECONFIGURE_CORE</h2>
        
        <form onSubmit={handleSubmit}>
          {/* USERNAME SECTION */}
          <div style={{marginBottom: '15px'}}>
            <label className="info-label">
              USERNAME {isUsernameLocked && `(LOCKED: ${isAdminEmail ? 'PERMANENT' : daysRemaining + ' DAYS LEFT'})`}
            </label>
            <input 
              className="cyber-input" 
              value={formData.username}
              disabled={isUsernameLocked}
              onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
              style={isUsernameLocked ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
              placeholder="set_username"
            />
          </div>

          <div className="info-grid" style={{gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <div>
              <label className="info-label">DISPLAY_NAME</label>
              <input className="cyber-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label className="info-label">GENDER</label>
              <select className="cyber-input" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="info-grid" style={{gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px'}}>
            <div>
              <label className="info-label">DATE_OF_BIRTH</label>
              <input type="date" className="cyber-input" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} required />
            </div>
            <div>
              <label className="info-label">LOCATION</label>
              <input className="cyber-input" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
            </div>
          </div>

          <label className="info-label" style={{marginTop: '10px', display: 'block'}}>SKILL_MODULES</label>
          <input className="cyber-input" placeholder="C++, DSA, React" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} />

          <label className="info-label" style={{marginTop: '10px', display: 'block'}}>SOCIAL_UPLINKS</label>
          <input className="cyber-input" placeholder="GitHub URL" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} />
          <input className="cyber-input" placeholder="Codeforces URL" value={formData.codeforces} onChange={(e) => setFormData({...formData, codeforces: e.target.value})} />
          <input className="cyber-input" placeholder="LinkedIn URL" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} />

          <button type="submit" className="g-btn" style={{width: '100%', marginTop: '20px'}}>EXECUTE_UPDATE</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
