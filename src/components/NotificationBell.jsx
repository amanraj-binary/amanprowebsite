import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, update, remove } from "firebase/database";

const NotificationBell = () => {
  const [notifs, setNotifs] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    onValue(ref(db, 'notifications/'), (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      setNotifs(list.sort((a, b) => b.timestamp - a.timestamp));
    });
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="notif-wrapper" style={{ position: 'relative' }}>
      <button className="g-btn" onClick={() => setShow(!show)} style={{ padding: '8px' }}>
        🔔 {unreadCount > 0 && <span className="red-dot"></span>}
      </button>

      {show && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h4 className="neon-text" style={{ fontSize: '10px', padding: '0', margin: '0' }}>
              SYSTEM_ALERTS
            </h4>
            <button 
              className="close-notif-btn" 
              onClick={() => setShow(false)} // क्लिक करते ही लिस्ट बंद हो जाएगी
            >
              ×
            </button>
          </div>
          {notifs.length === 0 ? <p style={{ fontSize: '8px', padding: '10px', textAlign: 'center' }}>NO_NEW_ALERTS</p> : 
            notifs.map(n => (
              <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`} 
                onClick={() => update(ref(db, `notifications/${n.id}`), { read: true })}>
                <p><strong>{n.username}</strong> commented on a post</p>
                <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          }
          <button className="abort-btn" style={{ width: '100%', fontSize: '8px' }} onClick={() => remove(ref(db, 'notifications/'))}>CLEAR_ALL</button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
