/* --- SettingsContext.jsx: 'Realtime' फिक्स --- */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase'; // ✅ आपकी src/firebase.js से
import { ref, onValue, update } from 'firebase/database'; // ✅ Realtime Database वाले फंक्शन्स

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [config, setConfig] = useState({
    wing1_provider: 'GOOGLE',
    wing1_model: 'gemini-2.5-flash',
    wing1_url: '',
    wing1_key: '',
    wing2_provider: 'GROK',
    wing2_model: 'llama-3.3-70b-versatile',
    wing2_url: '',
    wing2_key: '',
    ai_names: { gemini: 'AMAN_AI', future: 'FUTURE_AI' },
    razorpay_id: '',
    pro_price: 199,
    free_daily_limit: 5,
    pro_daily_limit: 50 
  });

  const [loading, setLoading] = useState(true);

  // 🔄 REAL_TIME_SYNC: Firebase Realtime Database से डेटा लेना
  useEffect(() => {
    try {
      const configRef = ref(db, 'system_config'); // Realtime Path
      const unsubscribe = onValue(configRef, (snapshot) => {
        if (snapshot.exists()) {
          setConfig(snapshot.val()); // Realtime डेटा फॉर्मेट
        }
        setLoading(false); // ✅ अब स्क्रीन दिखेगी!
      }, (error) => {
        console.error("DATABASE_ERROR:", error);
        setLoading(false); // एरर आए तब भी लोडिंग बंद करें ताकि स्क्रीन ब्लैंक न रहे
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("SETTING_CONTEXT_FATAL:", err);
      setLoading(false);
    }
  }, []);

  const updateConfig = async (newConfig) => {
    try {
      const configRef = ref(db, 'system_config');
      await update(configRef, newConfig);
    } catch (error) {
      console.error("SYNC_ERROR:", error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ config, updateConfig, loading }}>
      {!loading && children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
