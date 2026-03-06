import React, { useState } from 'react';
import { db, storage } from '../firebase'; //
import { ref as dbRef, push, set } from "firebase/database";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import NotificationBell from './NotificationBell'
import '../styles/Admin.css'; 

const AdminPanel = ({ editingItem, setEditingItem, setView }) => {
  const [type, setType] = useState('job'); // 'job' या 'research'
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.target);
    
    try {
      let imageUrl = "";
      if (image) {
        const imageRef = sRef(storage, `uploads/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // डेटाबेस का रास्ता टाइप के हिसाब से तय होगा
      const path = type === 'job' ? 'jobs/' : 'research/';
      const postRef = editingItem 
  ? dbRef(db, `${path}${editingItem.id}`) 
  : push(dbRef(db, path)); 

      const commonData = {
        title: f.get('title'),
        image: imageUrl,
        timestamp: Date.now(),
        category: type === 'job' ? 'job' : f.get('category')
      };

      const specificData = type === 'job' 
        ? { link: f.get('link'), deadline: f.get('deadline') }
        : { content: f.get('content') };

      await set(postRef, { ...commonData, ...specificData, id: postRef.key || editingItem.id });
if(editingItem) setEditingItem(null); // एडिट पूरा होने पर क्लीन करें

      alert("SYSTEM_SYNC_COMPLETE: " + type.toUpperCase() + " PUBLISHED");
      e.target.reset();
      setImage(null);
    } catch (err) {
      alert("ERROR: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-panel">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <NotificationBell />
      </div>
      <div className="type-switcher" style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button type="button" onClick={() => setType('job')} className={type === 'job' ? 'active-tab' : 'inactive-tab'}>JOB_MODE</button>
        <button type="button" onClick={() => setType('research')} className={type === 'research' ? 'active-tab' : 'inactive-tab'}>RESEARCH_MODE</button>
      </div>

      <h3 className="neon-text">{`>> COMMAND: ADD_${type.toUpperCase()}`}</h3>
      
      <form onSubmit={handlePublish}>
        <input name="title" className="cyber-input" placeholder="TITLE_HERE..." defaultValue={editingItem?.title} required />
        
        {type === 'job' ? (
          <>
            <input name="deadline" className="cyber-input" placeholder="LAST_DATE (e.g. 15 March)" defaultValue={editingItem?.deadline} />
            <input name="link" className="cyber-input" placeholder="APPLY_URL_LINK" defaultValue={editingItem?.link} required />
          </>
        ) : (
          <>
            <select name="category" className="cyber-input">
              <option value="science">SCIENCE</option>
              <option value="astrology">ASTROLOGY</option>
              <option value="history">HISTORY</option>
              <option value="psychology">PSYCHOLOGY</option>
            </select>
            <textarea name="content" className="cyber-input" placeholder="WRITE_BLOG_CONTENT_HERE..." style={{minHeight: '150px'}} defaultValue={editingItem?.content} required></textarea>
          </>
        )}
        
        <label className="file-label">
          {image ? `READY: ${image.name}` : "📁 CHOOSE_ILLUSTRATION_PHOTO"}
          <input type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
        </label>

        <button type="submit" className="g-btn" style={{width: '100%'}} disabled={loading}>
          {loading ? "PROCESSING_CORE_DATA..." : "EXECUTE_PUBLISH"}
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;