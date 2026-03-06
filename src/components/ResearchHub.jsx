import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { ref, onValue, remove } from "firebase/database";
import BlogModal from './BlogModal'; // 🛡️ नया कॉम्पोनेंट इम्पोर्ट किया
import PostInteractions from './PostInteractions';
import '../styles/Hubs.css';

const ResearchHub = ({ onEdit }) => {
  const [topics, setTopics] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' या 'oldest'
  const [activeBlog, setActiveBlog] = useState(null); // 🛡️ खोलने के लिए स्टेट
  const [profile, setProfile] = useState(null);
  const user = auth.currentUser;
  useEffect(() => {
    if (user) {
      onValue(ref(db, `users/${user.uid}`), (snap) => setProfile(snap.val()));
    }
    const researchRef = ref(db, 'research/');
    onValue(researchRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setTopics(list.reverse());
      }
    });
  }, [user]);
  const isAdmin = profile?.username === 'amanraj';
  const deletePost = (id) => {
    if (window.confirm("TERMINATE_RECORD?")) {
      remove(ref(db, `research/${id}`));
      remove(ref(db, `interactions/${id}`)); // इंटरैक्शन डेटा भी साफ करें
    }
  };

  return (
    <div className="research-container" style={{ paddingBottom: '120px' }}>
      <div className="hub-header" style={{ textAlign: 'center', margin: '40px 0' }}>
        <h2 className="neon-text">KNOWLEDGE_ARCHIVE</h2>
        <p style={{ fontSize: '10px', opacity: 0.6 }}>SYSTEM_SYNC_ACTIVE</p>
      </div>

<div className="filter-bar" style={{ padding: '0 20px', marginBottom: '30px' }}>
  <div className="filter-controls">
    {/* सर्च बार */}
    <input 
      type="text" 
      placeholder="SEARCH_BY_TITLE..." 
      className="cyber-input search-bar"
      onChange={(e) => setSearchQuery(e.target.value)}
    />

    {/* केटेगरी फिल्टर */}
    <select onChange={(e) => setSelectedCat(e.target.value)} className="cyber-input">
      <option value="all">ALL_RECORDS</option>
      <option value="science">SCIENCE</option>
      <option value="astrology">ASTROLOGY</option>
      <option value="history">HISTORY</option>
      <option value="psychology">PSYCHOLOGY</option>
    </select>

    {/* सॉर्ट ड्रॉपडाउन */}
    <select onChange={(e) => setSortOrder(e.target.value)} className="cyber-input sort-select">
      <option value="newest">NEWEST_FIRST</option>
      <option value="oldest">OLDEST_FIRST</option>
    </select>
  </div>
</div>

      <div className="hubs-grid">
        {topics
  .filter(t => (
    t.title && 
    (selectedCat === 'all' || t.category === selectedCat) &&
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content?.toLowerCase().includes(searchQuery.toLowerCase()))
  ))
  .sort((a, b) => sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp)
  .map(item => (
    // ... आपका कार्ड कोड यहाँ रहेगा
          <div key={item.id} className="elite-card">
            {isAdmin && (
    <div className="post-admin-actions">
      <button className="admin-icon-btn" onClick={() => deletePost(item.id)}>🗑️</button>
      <button className="admin-icon-btn" onClick={() => onEdit(item)}>✏️</button>
    </div>
  )}
            <div className="card-image-container">
              <img src={item.image || 'https://via.placeholder.com/400x200'} className="card-image" alt="Preview" />
            </div>
            <div className="card-content">
              <span className="card-tag">{item.category}</span>
              <h3 style={{ color: 'var(--primary)', margin: '10px 0' }}>{item.title}</h3>
              <p style={{ fontSize: '0.8rem', height: '60px', overflow: 'hidden', opacity: 0.7 }}>
                {item.content}
              </p>
              
              {/* 🛡️ बटन पर क्लिक करते ही ब्लॉग सेट हो जाएगा */}
              <button 
                className="g-btn" 
                style={{ marginTop: '15px', width: '100%' }}
                onClick={() => setActiveBlog(item)}
              >
                READ_FULL_ACCESS
              </button>
            <PostInteractions 
      postId={item.id} 
      isAdmin={isAdmin} 
      username={profile?.username}
    />
            </div>
          </div>
        ))}
      </div>

      {/* 🛡️ अगर कोई ब्लॉग एक्टिव है, तो मोडल दिखाओ */}
      {activeBlog && (
        <BlogModal topic={activeBlog} onClose={() => setActiveBlog(null)} />
      )}
    </div>
  );
};

export default ResearchHub;
