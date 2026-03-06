import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { ref, onValue } from "firebase/database";
import EditProfileModal from './EditProfileModal';
import MissionCard from './Missions/MissionCard'; 
import AddMissionModal from './Missions/AddMissionModal'; 
import '../styles/Profile.css';
import '../styles/Mission.css'; 
import CyberStatsOverlay from './Effects/CyberStatsOverlay';

const Profile = ({ data, onUpgrade, SubscriptionCard, UsageTracker, setView }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [stats, setStats] = useState({ blogs: 0, jobs: 0 });
  const [missions, setMissions] = useState([]);
  const [showDiag, setShowDiag] = useState(false);
  
  const user = auth.currentUser;

  // 🛡️ एडमिन चेक: आपकी App.jsx के लॉजिक के अनुसार
  const isAdmin = data?.username === 'amanraj';

  useEffect(() => {
    onValue(ref(db, 'research/'), (snap) => setStats(prev => ({ ...prev, blogs: snap.exists() ? Object.keys(snap.val()).length : 0 })));
    onValue(ref(db, 'jobs/'), (snap) => setStats(prev => ({ ...prev, jobs: snap.exists() ? Object.keys(snap.val()).length : 0 })));

    const missionRef = ref(db, 'missions/');
    onValue(missionRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const list = Object.entries(val).map(([id, data]) => ({ id, ...data }));
        setMissions(list.reverse());
      } else {
        setMissions([]);
      }
    });
  }, []);

  if (!data) return <div className="loading">SYNCING_CORE...</div>;

    return (
    <div className="profile-container">
      {/* --- 👤 एलीट प्रोफाइल कार्ड --- */}
      <div className="dev-card">
        <button className="edit-core-btn" onClick={() => setShowEdit(true)}>[RECONFIGURE]</button>
        
        <div className="avatar-ring">
          <div className="avatar-inner">{data.name?.substring(0, 2).toUpperCase()}</div>
        </div>
        <h2 className="dev-name">{data.name?.toUpperCase()}</h2>
        <p className="dev-role">@{data.username}</p>
        <button 
          className="g-btn" 
          style={{fontSize: '8px', padding: '2px 10px', marginTop: '5px', borderColor: '#00f2ff', color: '#00f2ff'}} 
          onClick={() => setShowDiag(true)}
        >
          [ RUN_DIAGNOSTICS ]
        </button>
        {/* Profile.jsx के अंदर */}
{(data?.email === 'royalrajaamanraj@gmail.com' || user?.email === 'royalrajaamanraj@gmail.com') && (
  <button 
    className="g-btn admin-btn" 
    style={{
      fontSize: '8px', 
      padding: '2px 10px', 
      marginTop: '5px', 
      borderColor: '#ff00ff', 
      color: '#ff00ff', 
      marginLeft: '5px',
      boxShadow: '0 0 5px #ff00ff' // थोड़ा और ग्लो!
    }}
    onClick={() => setView('core-control')}
  >
    [ ACCESS_ADMIN_CORE ]
  </button>
)}

        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-value">{stats.blogs}</span>
            <span className="stat-label">ARCHIVES</span>
          </div>
          <div className="stat-item" style={{borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 20px'}}>
            <span className="stat-value">{stats.jobs}</span>
            <span className="stat-label">OPENINGS</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">LVL 1</span>
            <span className="stat-label">EXP</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">LOC_ORIGIN</span>
            <span className="info-value">{data.location || 'Unknown'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">BIO_DATA (G/DOB)</span>
            <span className="info-value">{data.gender || 'M'} / {data.dob || '00-00-0000'}</span>
          </div>
          <div className="info-item" style={{gridColumn: 'span 2'}}>
            <span className="info-label">SKILL_MODULES</span>
            <div className="badge-container">
              {(data.skills || "New User").split(',').map((skill, i) => (
                <span key={i} className="skill-badge">{skill.trim()}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="social-links">
          {data.github && <a href={data.github} target="_blank" rel="noreferrer" className="social-icon">GITHUB</a>}
          {data.codeforces && <a href={data.codeforces} target="_blank" rel="noreferrer" className="social-icon">CODEFORCES</a>}
          {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" className="social-icon">LINKEDIN</a>}
        </div>

        <button className="g-btn logout-btn" onClick={() => auth.signOut()}>TERMINATE_SESSION</button>
      </div>

      {/* --- 🚀 मिशन कंट्रोल सेक्शन --- */}
      <div className="mission-grid">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
          <h3 className="neon-text" style={{fontSize: '0.9rem'}}>MISSION_CONTROL</h3>
          {isAdmin && (
            <button 
              className="g-btn" 
              style={{fontSize: '8px', padding: '5px 10px'}}
              onClick={() => { setEditingMission(null); setShowMissionModal(true); }}
            >
              + START_NEW_MISSION
            </button>
          )}
        </div>

        {missions.length === 0 ? (
          <p style={{fontSize: '10px', opacity: 0.3, textAlign: 'center'}}>[NO_ACTIVE_MISSIONS]</p>
        ) : (
          missions.map(m => (
            <MissionCard 
              key={m.id} 
              mission={m} 
              isAdmin={isAdmin} 
              onEdit={(mission) => { setEditingMission(mission); setShowMissionModal(true); }} 
            />
          ))
        )}
      </div>

      {/* --- 🛡️ मोडल्स --- */}
      {showEdit && <EditProfileModal user={user} data={data} onClose={() => setShowEdit(false)} />}
      
      {showMissionModal && (
        <AddMissionModal 
          existingMission={editingMission} 
          onClose={() => setShowMissionModal(false)} 
        />
      )}

      <CyberStatsOverlay 
        isOpen={showDiag} 
        onClose={() => setShowDiag(false)} 
        data={data} 
        onUpgrade={onUpgrade}
      />

    </div> 
  );
};

export default Profile;