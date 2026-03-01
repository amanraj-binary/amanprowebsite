import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; // ✅ 1. इसे जोड़ें

const firebaseConfig = {
  apiKey: "AIzaSyCO0WF_Bbkqx_7-_TfQigs-uyUSRTgnR0w",
  authDomain: "amanprowebsite.firebaseapp.com",
  projectId: "amanprowebsite",
  databaseURL: "https://amanprowebsite-default-rtdb.firebaseio.com", // आपके प्रोजेक्ट की डेटाबेस URL
  storageBucket: "amanprowebsite.firebasestorage.app",
  messagingSenderId: "979805967392",
  appId: "1:979805967392:web:e5d46d7d023f747de7d845",
  measurementId: "G-YS6M616DTJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // ✅ 2. इसे यहाँ चालू करें

export { db, auth }; // ✅ 3. यहाँ 'auth' को बाहर भेजें (Export करें)
