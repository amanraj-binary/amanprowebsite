import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { ref, onValue, remove } from "firebase/database";
import PostInteractions from './PostInteractions';
import '../styles/Hubs.css';

const JobHub = ({ onEdit }) => {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 सर्च स्टेट
  const [sortOrder, setSortOrder] = useState('newest'); // ⏳ सॉर्ट स्टेट
  const [profile, setProfile] = useState(null);
  const user = auth.currentUser;
  
  useEffect(() => {
    if (user) {
      onValue(ref(db, `users/${user.uid}`), (snap) => setProfile(snap.val()));
    }
    const jobsRef = ref(db, 'jobs/');
    onValue(jobsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setJobs(list);
      }
    });
  }, [user]);

  const isAdmin = profile?.username === 'amanraj';

  const deleteJob = (id) => {
    if (window.confirm("TERMINATE_JOB_POST?")) {
      remove(ref(db, `jobs/${id}`));
      remove(ref(db, `interactions/${id}`));
    }
  };

  return (
    <div className="jobs-container" style={{ paddingBottom: '120px' }}>
      <h2 className="neon-text" style={{textAlign: 'center', margin: '40px 0'}}>ROJGAR_RESULT_2.0</h2>

      {/* 🚀 SEARCH & SORT UI */}
      <div className="filter-controls" style={{ marginBottom: '30px', padding: '0 20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <input 
          type="text" 
          placeholder="FIND_JOBS_BY_TITLE..." 
          className="cyber-input search-bar"
          style={{ flex: '1', maxWidth: '400px' }}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select onChange={(e) => setSortOrder(e.target.value)} className="cyber-input sort-select">
          <option value="newest">NEWEST_POSTS</option>
          <option value="oldest">OLDEST_POSTS</option>
        </select>
      </div>

      <div className="hubs-grid">
        {jobs
          .filter(job => (
            job.title?.toLowerCase().includes(searchQuery.toLowerCase())
          ))
          .sort((a, b) => sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp)
          .map(job => (
            <div key={job.id} className="elite-card">
              {isAdmin && (
                <div className="post-admin-actions">
                  <button className="admin-icon-btn" onClick={() => deleteJob(job.id)}>🗑️</button>
                  <button className="admin-icon-btn" onClick={() => onEdit(job)}>✏️</button>
                </div>
              )}
              <div className="card-image-container">
                <img 
                  src={job.image || 'https://via.placeholder.com/400x200?text=NO_IMAGE_UPLOADED'} 
                  className="card-image" 
                  alt="Job Preview" 
                />
              </div>
              <div className="card-content">
                <span className="card-tag">GOVT_JOB</span>
                <h3 style={{margin: '10px 0', color: 'var(--primary)'}}>{job.title}</h3>
                <p style={{fontSize: '12px', opacity: 0.6}}>अंतिम तिथि: {job.deadline || 'N/A'}</p>
                <a href={job.link} target="_blank" rel="noreferrer">
                  <button className="apply-btn" style={{width: '100%', marginTop: '10px'}}>APPLY_NOW</button>
                </a>
                <PostInteractions 
                  postId={job.id} 
                  isAdmin={isAdmin} 
                  username={profile?.username}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default JobHub;
