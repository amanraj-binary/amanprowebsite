/* --- main.jsx: पूरी फाइल को इससे बदलें --- */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// 🧠 एलीट मास्टर ब्रेन इम्पोर्ट करें
import { SettingsProvider } from './context/SettingsContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 🚀 पूरी लैब को सेटिंग्स की शक्ति दें */}
    <SettingsProvider> 
      <App />
    </SettingsProvider>
  </StrictMode>,
)
