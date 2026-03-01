import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; // ✅ 'auth' जोड़ना सबसे ज़रूरी है

// 🛡️ AUTH IMPORTS: इनके बिना सिस्टम लॉगिन करते ही क्रैश हो जाएगा
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signOut 
} from "firebase/auth";

// 📊 DATABASE IMPORTS: यहाँ 'get' जोड़ना ब्लैंक स्क्रीन फिक्स करने के लिए अनिवार्य है
import { ref, onValue, push, set, remove, update, get } from "firebase/database";

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(0);
  const [liveUsers, setLiveUsers] = useState(1);
  const [goal, setGoal] = useState({ title: '', deadline: '', active: false });
  const [activeGoal, setActiveGoal] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [newModule, setNewModule] = useState({ name: '', info: '' });
  const [showProgressHub, setShowProgressHub] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeBook, setActiveBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // पन्ना नंबर याद रखने के लिए
  const [likes, setLikes] = useState({}); // हर आइटम के लाइक्स स्टोर करने के लिए
  const [comments, setComments] = useState({}); // सिस्टम लॉग् स्टो र करनेके लिए
  const [user, setUser] = useState(null); // लॉगिन यूजर की बेसिक जानकारी
  const [userProfile, setUserProfile] = useState(null); // RTDB से 4 जानकारियाँ (Name, Gender, DOB, Location)
  const [showProfileModal, setShowProfileModal] = useState(false); // फॉर्म दिखाने के लिए
  const [authLoading, setAuthLoading] = useState(true); // सिस्टम लोडिंग को ट्रैक करने के लिए

  // --- लाइक्स की गिनती बढ़ाने का फंक्शन ---
  // --- ⚡ एलीट टॉगल फंक्शन: लाइन 25 से 42 को इससे बदलें ---
  const handleLike = (itemId) => {
    const alreadyLiked = localStorage.getItem(`liked_${itemId}`);
    const currentLikes = likes[itemId] || 0;

    if (alreadyLiked) {
      // अगर पहले से लाइक है, तो 1 घटाओ (Unlike)
      const newLikes = Math.max(0, currentLikes - 1);
      set(ref(db, `likes/${itemId}`), newLikes);
      localStorage.removeItem(`liked_${itemId}`); // याददाश्त से हटाओ
    } else {
      // अगर लाइक नहीं है, तो 1 बढ़ाओ (Like)
      set(ref(db, `likes/${itemId}`), currentLikes + 1);
      localStorage.setItem(`liked_${itemId}`, "true"); // याददाश्त में जोड़ो
    }
  };
  
  const handleAddLog = (itemId, text) => {
    if (!text.trim()) return;
    
    // Firebase में एक नया यूनिक लॉग जोड़ना
    const logRef = ref(db, `comments/${itemId}`);
    const newLog = {
      text: text,
      timestamp: new Date().toLocaleTimeString(),
      id: Math.random().toString(36).substr(2, 5)
    };
    
    // push का इस्तेमाल करके लिस्ट में जोड़ना
    push(ref(db, `comments/${itemId}`), newLog);
  };
  // --- 🌐 गूगल लॉगिन: एक क्लिक में एंट्री ---
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // लॉगिन सफल होने पर Auth Listener बाकी काम संभालेगा
    } catch (error) {
      console.error("Login Failed:", error.message);
    }
  };
  // --- 📱 फोन लॉगिन: OTP सिस्टम ---
  const [confirmObj, setConfirmObj] = useState(null); // OTP वेरिफिकेशन ऑब्जेक्ट

  const setUpRecaptcha = (number) => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {});
    recaptchaVerifier.render();
    return signInWithPhoneNumber(auth, number, recaptchaVerifier);
  };

  const onSignInSubmit = async (e) => {
    e.preventDefault();
    const phoneNumber = e.target.phone.value;
    try {
      const response = await setUpRecaptcha(phoneNumber);
      setConfirmObj(response);
      alert("OTP Sent to " + phoneNumber);
    } catch (err) {
      console.error(err.message);
    }
  };

  const onOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;
    try {
      await confirmObj.confirm(otp);
      setConfirmObj(null); // सफल होने पर साफ़ करें
    } catch (err) {
      alert("Invalid OTP!");
    }
  };

  // --- 📝 एलीट प्रोफाइल सेव: 4 जानकारियाँ RTDB में भेजना ---
  const saveProfileData = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      gender: formData.get('gender'),
      dob: formData.get('dob'),
      location: formData.get('location'),
      username: formData.get('username') || "", 
      joinedAt: new Date().toISOString()
    };

    // रियलटाइम डेटाबेस में स्टोर करना
    set(ref(db, `users/${user.uid}`), data);
    setUserProfile(data);
    setShowProfileModal(false);
  };

  // डेटा लोड करने वाले useEffect के अंदर (लाइन 20-34 के बीच)
  useEffect(() => {
    // पिछला इतिहास लोड करना
    onValue(ref(db, 'history'), (snap) => {
      const data = snap.val();
      if(data) {
        const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        setHistory(list.reverse().slice(0, 3)); // सिर्फ ताज़ा 3 आइटम
      }
    });
  }, []);

    // हिस्सा 1: डेटा लोड करने के लिए (यह सिर्फ एक बार चलेगा)
  useEffect(() => {
    // --- 🛡️ अपडेटेड मास्टर ऑथ लिसनर (Identity Detection) ---
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // चेक करें कि क्या डेटाबेस में प्रोफाइल है
        onValue(ref(db, `users/${currentUser.uid}`), (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.val()); // पुराना डेटा लोड करें
            setShowProfileModal(false); // फॉर्म छिपा दें
          } else {
            setShowProfileModal(true); // नया यूजर है, फॉर्म दिखाएं
          }
          setAuthLoading(false); // ✅ सिग्नल 1: चेकिंग खत्म
        });
      } else {
        // अगर लॉगिन नहीं है, तो सब साफ़ करें
        setUser(null);
        setUserProfile(null);
        setShowProfileModal(false);
        setAuthLoading(false); // ✅ सिग्नल 2: लॉगिन नहीं है, तब भी लोडिंग रोकें
      }
    });

    // Cleanup function
    return () => {
      unsubscribeAuth();
    };

    // लाइव प्रेजेंस
    const userRef = ref(db, 'presence/' + Math.random().toString(36).substr(2, 9));
    set(userRef, true);
    onValue(ref(db, 'presence'), (snap) => setLiveUsers(snap.numChildren()));

    // डेटा लोड करना (Interests)
    onValue(ref(db, 'interests'), (snap) => {
      const data = snap.val();
      setTopics(data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : []);
    });

    // मिशन लोड करना
    onValue(ref(db, 'activeGoal'), (snap) => {
      setActiveGoal(snap.val());
    });
        // --- लाइक्स लोड करने का नया हिस्सा ---
    onValue(ref(db, 'likes'), (snap) => {
      if (snap.exists()) {
        setLikes(snap.val());
      } else {
        setLikes({});
      }
    });
    // --- सिस्टम लॉग्स (Comments) लोड करना ---
    onValue(ref(db, 'comments'), (snap) => {
      if (snap.exists()) setComments(snap.val());
      else setComments({}); // अगर कोई कमेंट न हो तो खाली ऑब्जेक्ट सेट करें
    });

  }, []); // यहाँ खाली ब्रैकेट [] रहेगा ताकि बार-बार लोड न हो

  // हिस्सा 2: सिर्फ काउंटडाउन टाइमर के लिए
  useEffect(() => {
    if (!activeGoal || !activeGoal.deadline) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      // तारीख को साफ़ करना (Space को T से बदलना)
      const cleanDate = activeGoal.deadline.replace(' ', 'T');
      const distance = new Date(cleanDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeGoal]); // यह सिर्फ तभी चलेगा जब नया मिशन सेट होगा

  // शब्द गिनने का लॉजिक
  // --- फतेह 💯: एलीट साइबर डेक सिस्टम ---
  const renderResearch = (item) => {
    const text = item.info.trim();
    const wordCount = text.split(/\s+/).length;

    // 1. Static Strip Update (< 100 Words)
    if (wordCount <= 100) {
      return (
        <div key={item.id} className="cyber-deck static-strip">
          <div className="deck-accent"></div>
          <div className="static-content">
            <span className="module-tag">DATA_NODE</span>
            <p className="static-text">
              <strong style={{color: 'var(--primary)'}}>{item.name}:</strong> {text}
            </p>
          </div>
        </div>
      );
    }

    // 2. Smart Paging (Newton के लिए 1-2 पेज ही बनेंगे)
    const chunks = text.match(/[\s\S]{1,1400}(?=\s|$)/g) || [text];
    const isExpanded = activeBook === item.id;

    return (
      <div key={item.id} className={`cyber-deck ${isExpanded ? 'expanded' : 'strip'}`}>
        {!isExpanded ? (
          /* इंटरेक्टिव पट्टी */
          <div className="deck-strip-content">
            <div className="strip-info-group">
              <span className="module-tag">ARCHIVE_SYSTEM</span>
              <h3 className="strip-title">{item.name}</h3>
            </div>
            <button className="deck-open-btn" onClick={() => { setActiveBook(item.id); setCurrentPage(0); }}>
              ACCESS DATA
            </button>
          </div>
        ) : (
          /* प्रीमियम विस्तारित बॉक्स */
          <div className="deck-expanded-content">
            <div className="deck-header">
              <div className="header-titles">
                <span className="module-tag pulse">SYSTEM_ACTIVE</span>
                <h2 className="deck-title">{item.name}</h2>
              </div>
                      {/* --- लाइन 144 की जगह यह नया ग्रुप डालें --- */}
        <div className="interaction-group">
          {/* साइबर लाइक बटन (नया) */}
                   {/* --- ⚡ स्मार्ट और स्टाइलिश बटन: लाइन 159-161 की जगह --- */}
          <button 
            className={`cyber-like-btn ${localStorage.getItem(`liked_${item.id}`) ? 'liked' : ''}`} 
            onClick={() => handleLike(item.id)}
          >
            {localStorage.getItem(`liked_${item.id}`) ? '✅ GIVEN' : `⚡ ${likes[item.id] || 0} UNITS`}
          </button>
          
          {/* आपका पुराना क्लोज बटन */}
          <button className="deck-close-btn" onClick={() => setActiveBook(null)}>
            TERMINATE
          </button>
        </div>

            </div>
            
            <div className="deck-body">
              <p className="page-text-justified">{chunks[currentPage]}</p>
            </div>
            {/* --- एलीट सिस्टम लॉग सेक्शन --- */}
            <div className="system-log-area">
              <h4 className="log-header">{" >> TERMINAL_LOGS "}</h4>
              <div className="log-list">
                {comments[item.id] ? Object.values(comments[item.id]).map(log => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-msg">{log.text}</span>
                  </div>
                )) : <div className="log-entry empty">NO_LOGS_FOUND...</div>}
              </div>
              
                          {/* --- अपडेटेड इनपुट ग्रुप: लाइन 208-219 की जगह --- */}
            <div className="log-input-group">
              <input 
                id={`log-input-${item.id}`} // हर मॉड्यूल के लिए अलग ID
                type="text" 
                placeholder="Enter system log..." 
                onKeyDown={(e) => {
                  if(e.key === 'Enter') {
                    handleAddLog(item.id, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              {/* नया एलीट सबमिट बटन */}
              <button className="log-submit-btn" onClick={() => {
                const inputEl = document.getElementById(`log-input-${item.id}`);
                handleAddLog(item.id, inputEl.value);
                inputEl.value = '';
              }}>
                SEND_LOG
              </button>
            </div>

            </div>

            <div className="deck-footer">
              <button className="nav-arrow-cyber" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}>
                &lt; PREV_LOG
              </button>
              
              <div className="page-counter-cyber">
                <span className="count-label">SEC_PAGE:</span>
                <span className="count-val">{currentPage + 1} / {chunks.length}</span>
              </div>
              
              <button className="nav-arrow-cyber" disabled={currentPage === chunks.length - 1} onClick={() => setCurrentPage(prev => prev + 1)}>
                NEXT_LOG &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* 1. सिस्टम लोडिंग चेक */}
      {authLoading ? (
        <div className="loading-screen" style={{color: 'var(--primary)', padding: '100px', textAlign: 'center', fontFamily: 'Orbitron'}}>
          {">> INITIALIZING_SECURE_SYSTEM..."}
        </div>
      ) : (
        <>
          {/* 2. अगर लॉगिन नहीं है, तो लॉगिन गेट दिखाएं */}
          {!user ? (
            <div className="login-gate">
              <div className="login-card">
                <h3>{">> AUTHENTICATION_REQUIRED"}</h3>
                <button className="google-login-btn" onClick={handleGoogleLogin}>SIGN_IN_WITH_GMAIL</button>
                <div className="divider">OR</div>
                {!confirmObj ? (
                  <form onSubmit={onSignInSubmit} className="phone-form">
                    <input name="phone" placeholder="+91 0000000000" required />
                    <div id="recaptcha-container"></div>
                    <button type="submit" className="cyber-btn-small">SEND_OTP</button>
                  </form>
                ) : (
                  <form onSubmit={onOtpSubmit} className="phone-form">
                    <input name="otp" placeholder="Enter 6-digit OTP" required />
                    <button type="submit" className="cyber-btn-small">VERIFY_OTP</button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 3. अगर लॉगिन है पर प्रोफाइल नहीं है, तो फॉर्म दिखाएं */}
              {showProfileModal && (
                <div className="cyber-modal-overlay">
                  <div className="cyber-modal">
                    <h3>{">> INITIALIZE_USER_PROFILE"}</h3>
                    <form onSubmit={saveProfileData}>
                      <input name="name" placeholder="Full Name" defaultValue={user?.displayName} required />
                      <input name="username" placeholder="Unique Username" required />
                      <select name="gender" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <input name="dob" type="date" required />
                      <input name="location" placeholder="Location" required />
                      <button type="submit" className="cyber-btn-primary">SYNC_TO_DATABASE</button>
                    </form>
                  </div>
                </div>
              )}

              {/* 4. आपकी असली लाइब्रेरी का कंटेंट */}
              <div className="main-content">
                {activeBook ? renderResearch(activeBook) : (
                  <div className="library-welcome">
                    <h2 style={{color: 'var(--primary)', textAlign: 'center'}}>Welcome, {userProfile?.username || user.displayName}</h2>
                    {/* यहाँ आपके पुराने ACCESS DATA वाले कार्ड्स का कोड आएगा */}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* 5. एडमिन ट्रिगर (सिर्फ एक बार) */}
      <div className="admin-trigger" onClick={() => {
        if(prompt("Security Code:") === "Tekari#Dev#99") setShowAdmin(true);
      }}></div>

      {/* Hidden Admin Trigger */}
       {/* Admin Hidden Trigger & Dashboard */}
      <div className="admin-trigger" onClick={() => {
        if(prompt("Security Code:") === "Tekari#Dev#99") setShowAdmin(true);
      }}></div>

      {showAdmin && (
        <div className="admin-overlay">
          <div className="admin-panel">
            <h2 className="cyber-title" style={{marginBottom: '25px'}}>SYSTEM CONTROL</h2>
            
                        {/* नया मिशन कंट्रोल बटन */}
            <button className="admin-opt" onClick={() => setShowProgressHub(true)}>
              1. OPEN MISSION CONTROL (SYNC & HISTORY)
            </button>

            
            {/* यह बटन अब सीधे प्रॉम्प्ट नहीं, बल्कि तुम्हारा नया एडिटर खोलेगा */}
            <button className="admin-opt" onClick={() => setShowEditor(true)}>
              2. OPEN CYBER-EDITOR (FOR LARGE CONTENT)
            </button>

            <button className="admin-opt" onClick={() => {
              const title = prompt("Mission Name:");
              const date = prompt("Deadline (YYYY-MM-DD HH:MM:SS):");
              if(title && date) set(ref(db, 'activeGoal'), { title, deadline: date });
            }}>3. INITIATE NEW MISSION</button>

            <button className="close-admin" onClick={() => setShowAdmin(false)} style={{
              width: '100%', marginTop: '20px', padding: '10px', background: '#ff0055', 
              color: 'white', border: 'none', borderRadius: '5px', fontFamily: 'Orbitron'
            }}>EXIT SYSTEM</button>
          </div>
        </div>
      )}
      
      {/* --- जादुई साइबर एडिटर --- */}
      {showEditor && (
        <div className="admin-overlay editor-mode">
          <div className="admin-panel editor-large">
            <h2 className="cyber-title">CONTENT ARCHITECT</h2>
            
            <input 
              className="cyber-input"
              placeholder="MODULE NAME (e.g. Life of Newton)"
              value={newModule.name}
              onChange={(e) => setNewModule({...newModule, name: e.target.value})}
            />

            <textarea 
              className="cyber-textarea"
              placeholder="PASTE YOUR LARGE CONTENT HERE..."
              value={newModule.info}
              onChange={(e) => setNewModule({...newModule, info: e.target.value})}
            ></textarea>

            <div className="editor-actions">
              <button className="admin-opt save-btn" onClick={() => {
                if(newModule.name && newModule.info) {
                  push(ref(db, 'interests'), newModule);
                  setNewModule({ name: '', info: '' });
                  setShowEditor(false);
                  alert("MODULE SYNCED TO LIBRARY!");
                }
              }}>SYNC TO LIBRARY</button>
              
              <button className="close-admin" onClick={() => setShowEditor(false)}>ABORT</button>
            </div>
          </div>
        </div>
      )}
      {/* --- Mission Control Hub (History & Edit) --- */}
      {showProgressHub && (
        <div className="admin-overlay">
          <div className="admin-panel editor-large">
            <h2 className="cyber-title">MISSION CONTROL</h2>
            
            <div className="hub-section">
              <h3 style={{color: 'var(--secondary)', marginBottom: '10px'}}>ACTIVE MISSION</h3>
              {activeGoal ? (
                <div className="active-control-card">
                  <p style={{marginBottom: '10px'}}>{activeGoal.title}</p>
                  <button className="admin-opt" style={{background: '#ff0055', color: '#fff'}} onClick={() => {
                    const finalP = prompt("Final Progress % (0-100):");
                    if(finalP) {
                      push(ref(db, 'history'), { ...activeGoal, progress: finalP, date: new Date().toLocaleDateString() });
                      set(ref(db, 'activeGoal'), null);
                      setShowProgressHub(false);
                      alert("MISSION STOPPED & ARCHIVED!");
                    }
                  }}>STOP MISSION & SUBMIT PROGRESS</button>
                </div>
              ) : <p style={{color: '#666'}}>No Active Mission Detected</p>}
            </div>

            <div className="hub-section" style={{marginTop: '30px'}}>
              <h3 style={{color: 'var(--primary)', marginBottom: '10px'}}>RECENT LOGS (LAST 3)</h3>
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div style={{flex: 1}}>
                    <span style={{color: 'var(--secondary)'}}>[{item.progress}%]</span> {item.title}
                    <div style={{fontSize: '0.6rem', color: '#555'}}>{item.date}</div>
                  </div>
                  <button className="edit-mini" onClick={() => {
                    const newTitle = prompt("Edit Mission Name:", item.title);
                    const newP = prompt("Edit Progress %:", item.progress);
                    if(newTitle && newP) update(ref(db, `history/${item.id}`), { title: newTitle, progress: newP });
                  }}>EDIT</button>
                </div>
              ))}
            </div>

            <button className="close-admin" onClick={() => setShowProgressHub(false)} style={{marginTop: '20px'}}>EXIT SYSTEM</button>
          </div>
        </div>
      )}

      <header style={{textAlign: 'center', marginBottom: '40px'}}>
        <h1 style={{fontFamily: 'Orbitron', letterSpacing: '5px'}}>AMAN<span style={{color: 'var(--primary)'}}>PRO</span></h1>
        <div style={{fontSize: '0.7rem', color: 'var(--secondary)'}}>● {liveUsers} CYBER-READERS ONLINE</div>
      </header>

      {/* Conditional Content Rendering */}
      {activeTab === 'home' && (
        <div className="hero-section" style={{textAlign: 'center'}}>
          <h2 style={{fontSize: '3rem', fontWeight: '800'}}>Digital Future<br/>Architect</h2>
          <p style={{color: '#888', marginTop: '20px'}}>Tekari, IN | Competitive Programmer</p>
        </div>
      )}

      {activeTab === 'research' && (
        <div className="research-container">
          {topics.map(item => <div key={item.id} style={{marginBottom: '30px'}}>{renderResearch(item)}</div>)}
        </div>
      )}
             {/* मिशन स्क्रीन - यहाँ आपकी घड़ी दिखेगी */}
      {activeTab === 'goals' && (
        <div className="mission-hub">
          <h2 className="cyber-title">CURRENT MISSION</h2>
          {activeGoal ? (
            <div className="mission-card">
              <h3>{activeGoal.title}</h3>
              {timeLeft ? (
                <div className="timer-grid">
                  <div className="time-box"><span className="time-val">{timeLeft.d}</span>DAYS</div>
                  <div className="time-box"><span className="time-val">{timeLeft.h}</span>HRS</div>
                  <div className="time-box"><span className="time-val">{timeLeft.m}</span>MIN</div>
                  <div className="time-box"><span className="time-val">{timeLeft.s}</span>SEC</div>
                </div>
              ) : (
                <div className="review-needed">MISSION ENDED. WAITING FOR REVIEW...</div>
              )}
            </div>
          ) : <p style={{color: '#444'}}>NO ACTIVE MISSIONS. STANDBY.</p>}
        </div>
      )}

      {/* Navigation Dock */}
      <nav className="nav-dock">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>System</div>
        <div className={`nav-item ${activeTab === 'research' ? 'active' : ''}`} onClick={() => setActiveTab('research')}>Library</div>
        <div className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>Mission</div>
        <div className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Data</div>
      </nav>
    </div>
  );
}

export default App;
