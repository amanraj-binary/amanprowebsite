import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';
import React, { useState, useEffect } from 'react';
import { useSettings } from './context/SettingsContext';
import { auth, db } from './firebase'; //
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { ref, onValue, get, set, push } from "firebase/database"; // ✅ 'get' और 'set' यहाँ होने चाहिए
import DuelZone from './components/AI_LAB/DuelZone';
import './App.css';
import JobHub from './components/JobHub';
import AdminPanel from './components/AdminPanel';
import ResearchHub from './components/ResearchHub';
import './styles/Navbar.css';
import Profile from './components/Profile';
import CoreControl from './admin_core/CoreControl';
/* --- [इन 3 लाइनों को Line 13 के नीचे जोड़ें] --- */
import { initiateSubscription } from './services/paymentService';
import SubscriptionCard from './components/SubscriptionCard';
import UsageTracker from './components/UsageTracker';
import { update, serverTimestamp } from "firebase/database"; // 'update' की ज़रूरत पड़ेगी

function App() {
  const { config } = useSettings();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('home'); // 'home', 'research', 'jobs'
  const [editingItem, setEditingItem] = useState(null);
  // लाइन 17 के नीचे
  // अब डेटा सीधा Firebase से आएगा, LocalStorage से नहीं
  const [vault, setVault] = useState([]); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
    // 🛡️ CYBER_SHIELD: सुरक्षा कवच यहाँ से शुरू
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    const handleKeyDown = (e) => {
      if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  // 🛡️ सुरक्षा कवच यहाँ खत्म

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 1. यूजर की प्रोफाइल डेटाबेस से चेक करें
        onValue(ref(db, `users/${currentUser.uid}`), (snap) => {
          setProfile(snap.val() || null);
          setLoading(false);
        });

        // 2. ⚡ एलीट हिस्ट्री सिंकिंग (Cloud Sync)
        onValue(ref(db, `users/${currentUser.uid}/vault`), (snap) => {
            const data = snap.val();
            if (data) {
                const vaultList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).reverse();
                setVault(vaultList);
            } else {
                setVault([]);
            }
        });

      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert("Login Error: " + err.message);
    }
  };
  // --- [VAULT CLEANING LOGIC] ---

// 1. क्लाउड से डिलीट करना
const deleteFromVault = (id) => {
    if (user) {
        set(ref(db, `users/${user.uid}/vault/${id}`), null);
    }
};

// 2. पूरी क्लाउड हिस्ट्री साफ़ करना
const clearVault = () => {
    if (window.confirm("क्या आप पूरी क्लाउड हिस्ट्री साफ़ करना चाहते हैं?") && user) {
        set(ref(db, `users/${user.uid}/vault`), null);
    }
};

// 3. क्लाउड में सेव करना
const addToVault = (newEntry) => {
    if (user) {
        const vaultRef = ref(db, `users/${user.uid}/vault`);
        const newVaultRef = push(vaultRef); // नया ऑटो-जेनरेटेड ID
        set(newVaultRef, newEntry);
    }
};

/* --- [इसे Line 81 के नीचे addToVault के बाद पेस्ट करें]--- */
/* --- [इसे handleUpgrade के ठीक ऊपर पेस्ट करें] --- */
const updateUsage = async () => {
    if (!user) return;
    const currentCount = profile?.daily_usage?.count || 0;
    const userRef = ref(db, `users/${user.uid}/daily_usage`);
    
    // ✅ ये लाइन डेटाबेस में गिनती को 1 से बढ़ा देगी
    await set(userRef, {
        count: currentCount + 1,
        last_used: new Date().toISOString()
    });
};

/* --- App.jsx: Line 112 से 129 को पूरी तरह से इससे बदलें --- */

const handleUpgrade = () => {
  // 🛡️ मास्टर कंट्रोल (Admin Panel) से डायनामिक डेटा उठाना
  const options = {
    key: config.razorpay_id, // 👈 यह एडमिन पैनल से rzp_test या rzp_live उठाएगा
    amount: config.pro_price * 100, // 👈 एडमिन पैनल वाली कीमत (पैसे में बदलने के लिए * 100)
    currency: "INR",
    name: "AMAN_PRO_LAB",
    description: "ACTIVATE_ELITE_ACCESS",
    handler: async (response) => {
      // ✅ पेमेंट सफल होने के बाद डेटाबेस अपडेट करना
      try {
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, {
          plan: 'pro',
          payment_id: response.razorpay_payment_id,
          upgradedAt: serverTimestamp()
        });
        alert("🚀 मिशन सफल! आप अब PRO यूजर हैं!");
      } catch (err) {
        console.error("DATABASE_SYNC_ERROR:", err);
        alert("डेटाबेस सिंक में समस्या आई!");
      }
    },
    prefill: {
      email: user?.email,
      name: profile?.name
    },
    theme: { color: "#ff00ff" } // आपकी लैब की गुलाबी वाइब!
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

  if (loading) return <div className="loading">{">> INITIALIZING_SECURE_SYSTEM..."}</div>;

  return (
    <div className="app-container">
      {!user ? (
        /* --- लॉगिन गेट --- */
        <div className="login-gate">
          <div className="login-card">
            <h1>AMAN<span className="cyan">PRO</span></h1>
            <p>ACCESS_RESTRICTED: PLEASE_IDENTIFY</p>
            <button className="g-btn" onClick={handleLogin}>SIGN_IN_WITH_GMAIL</button>
          </div>
        </div>
      ) : !profile ? (
        /* --- 🛡️ एलीट प्रोफाइल सेटअप (Locked Username Logic) --- */
        <div className="setup-screen">
          <div className="setup-card">
            <h2>{">> INITIALIZE_IDENTITY"}</h2>
            <p>सिस्टम में आपकी पहचान दर्ज की जा रही है...</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.target);
              const uname = f.get('username').toLowerCase().trim();
              
              // यूजरनेम की यूनिकनेस चेक करना
              const uSnap = await get(ref(db, `usernames/${uname}`));
              if(uSnap.exists()) return alert("⚠️ यह यूजरनेम पहले से किसी और का है!");

              const data = {
                name: f.get('name'),
                dob: f.get('dob'),
                gender: f.get('gender'),
                location: f.get('location'),
                username: uname,
                role: 'user',
                joinedAt: new Date().toISOString()
              };

              // डेटाबेस में लॉक करना
              await set(ref(db, `users/${user.uid}`), data);
              await set(ref(db, `usernames/${uname}`), user.uid);
              setProfile(data);
            }}>
              <input name="name" placeholder="Full Name" defaultValue={user.displayName} required />
              <input name="username" placeholder="Create Unique @Username" required />
              <div className="form-row">
                <input name="dob" type="date" required />
                <select name="gender" required>
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <input name="location" placeholder="Your City/Location" required />
              <button type="submit" className="g-btn">SYNC_TO_DATABASE</button>
            </form>
          </div>
        </div>
      ) : (
        /* --- असली वेबसाइट (Dashboard) --- */
                <div className="dashboard">

          <main className="content-area">
            {/* 🚀 HOME: एलीट प्रोफाइल कार्ड */}
            {view === 'home' && (
    <Profile 
        data={profile} 
        onUpgrade={handleUpgrade} 
        setView={setView}
        SubscriptionCard={SubscriptionCard} 
        UsageTracker={UsageTracker} 
    />
)}

            {/* 📚 LIBRARY: रिसर्च हब */}
            {view === 'research' && <ResearchHub onEdit={(item) => { setEditingItem(item); setView('admin'); }} />}

            {/* 💼 JOBS: रोजगार हब */}
            {view === 'jobs' && <JobHub onEdit={(item) => { setEditingItem(item); setView('admin'); }} />}

            {/* ⚙️ ADMIN: सिर्फ कोर एक्सेस के लिए */}
            {view === 'admin' && <AdminPanel editingItem={editingItem} setEditingItem={setEditingItem} setView={setView} />}
            {view === 'core-control' && <CoreControl setView={setView} />}
            {/* 🧬 AI_LAB: आपका नया सीक्रेट सेक्शन (Direct View Logic) */}
{view === 'ai-lab' && (
    <DuelZone 
        vault={vault} 
        profile={profile}
        onDuelComplete={updateUsage}
        clearVault={clearVault} 
        deleteFromVault={deleteFromVault}
        addToVault={addToVault}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
    />
)}
          </main>

          {/* --- 🛡️ कोर एडमिन एक्सेस बटन (सिर्फ आपके लिए) --- */}
          {user && profile?.username === 'amanraj' && view !== 'admin' && (
            <button 
              onClick={() => setView('admin')} 
              className="core-access-btn"
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                fontSize: '9px',
                opacity: 0.4,
                background: 'none',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              [CORE_ACCESS]
            </button>
          )}

          {/* --- 🚀 द न्यू एलीट फ्लोटिंग नेविगेशन --- */}
          <nav className="floating-nav">
            <button 
              type="button"
              className={`nav-item ${view === 'home' ? 'active' : ''}`} 
              onClick={() => setView('home')}
            >
              HOME
            </button>
            
            <button 
              type="button"
              className={`nav-item ${view === 'research' ? 'active' : ''}`} 
              onClick={() => setView('research')}
            >
              LIBRARY
            </button>
            
            <button 
              type="button"
              className={`nav-item ${view === 'jobs' ? 'active' : ''}`} 
              onClick={() => setView('jobs')}
            >
              JOBS
            </button>
            
            <button 
              type="button"
              className={`nav-item ${view === 'ai-lab' ? 'active' : ''}`} 
              onClick={() => setView('ai-lab')}
            >
              AI_LAB
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

/* --- App.jsx: Line 311 की जगह इसे पेस्ट करें --- */
export default () => (
  <SettingsProvider>
    <UserProvider>
      <App />
    </UserProvider>
  </SettingsProvider>
);
