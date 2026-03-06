import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { useSettings } from './SettingsContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { config } = useSettings();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const isPro = user.email === 'royalrajaamanraj@gmail.com';
        
        // 🔄 यूजर का डेटा और आज की लिमिट ट्रैक करना
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val() || {};
          const dailyUsage = data.usage?.[today] || 0;
          
          setUserData({
            uid: user.uid,
            email: user.email,
            isPro: isPro,
            dailyUsage: dailyUsage,
            limit: isPro ? (config.pro_daily_limit || 50) : (config.free_daily_limit || 5),
            today: today
          });
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [config]);

  // ✍️ इस्तेमाल बढ़ाने का फंक्शन
  const incrementUsage = async () => {
    if (!userData) return;
    const usageRef = ref(db, `users/${userData.uid}/usage`);
    await update(usageRef, { [userData.today]: userData.dailyUsage + 1 });
  };

  return (
    <UserContext.Provider value={{ userData, loading, incrementUsage }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
