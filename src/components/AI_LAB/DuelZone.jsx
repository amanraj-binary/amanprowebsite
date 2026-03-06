// src/components/AI_LAB/DuelZone.jsx
import React, { useState } from 'react';
import './DuelZone.css';
import MatrixLoader from '../Effects/MatrixLoader';
import { callUniversalAI } from './UniversalAIService';
import MarkdownRenderer from './MarkdownRenderer';
import { db } from '../../firebase'; // अपनी फाइल का सही पाथ चेक कर लें
import { ref, push, serverTimestamp } from "firebase/database";
import HistoryDrawer from './HistoryDrawer';
import { useSettings } from '../../context/SettingsContext'; 
import { useUser } from '../../context/UserContext'; 

const DuelZone = ({ vault, clearVault, deleteFromVault, addToVault, isDrawerOpen, setIsDrawerOpen, onDuelComplete }) => {
    const { config } = useSettings();
    const { userData, incrementUsage } = useUser();
    const [input, setInput] = useState(''); // प्रोम्प्ट के लिए
    const [leftLoading, setLeftLoading] = useState(false);
    const [rightLoading, setRightLoading] = useState(false);
    const [leftDisplay, setLeftDisplay] = useState('');
    const [rightDisplay, setRightDisplay] = useState('');

    const typeEffect = (text, setter) => {
        let index = 0;
        setter('');
        const interval = setInterval(() => {
            if (index < text.length) {
                setter((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 30);
    };
    const loadPastDuel = (data) => {
    // ⏳ टाइम मशीन एक्टिव: डेटा बॉक्सेस में लोड करें
    setLeftDisplay(data.gemini_response);
    setRightDisplay(data.future_response);
    setInput(data.prompt);
    
    // 🚪 एलीट मूव: क्लिक करते ही वॉल्ट का दरवाजा खुद बंद हो जाएगा
    setIsDrawerOpen(false);
};

const handleExecute = async () => {
  if (!input.trim() || leftLoading) return;

  // 🛡️ 1. सुरक्षा चेक: क्या आज की लिमिट बची है?
  if (userData && userData.dailyUsage >= userData.limit) {
    alert(`🛑 SYSTEM_LIMIT: आज की लिमिट खत्म हो गई है (${userData.dailyUsage}/${userData.limit})। \n\nकल फिर आएं या एलीट प्लान लें!`);
    return;
  }

  setLeftLoading(true);
  setRightLoading(true);

  try {
    // 📈 2. एआई को कॉल करने से पहले डेटाबेस में इस्तेमाल +1 करें
    await incrementUsage();

    // 🌐 विंग 1: एआई कॉल
    const res1 = await callUniversalAI(input, {
      provider: config.wing1_provider,
      model: config.wing1_model,
      key: config.wing1_key,
      url: config.wing1_url
    });
    setLeftLoading(false);
    typeEffect(res1, setLeftDisplay);

    // 🌐 विंग 2: एआई कॉल
    const res2 = await callUniversalAI(input, {
      provider: config.wing2_provider,
      model: config.wing2_model,
      key: config.wing2_key,
      url: config.wing2_url
    });
    setRightLoading(false);
    typeEffect(res2, setRightDisplay);

    // 💾 वॉल्ट में डेटा सेव करना
    await addToVault({
      prompt: input,
      gemini_response: res1, 
      future_response: res2, 
      timestamp: new Date().toLocaleTimeString()
    });

    if (onDuelComplete) onDuelComplete();

  } catch (error) {
    console.error("AI_LAB_CRITICAL_FAILURE:", error);
  } finally {
    setLeftLoading(false);
    setRightLoading(false);
  }
};
/* --- DuelZone.jsx: Line 96 के पास डालें --- */
const handleCopy = (text, btnId) => {
  navigator.clipboard.writeText(text);
  const btn = document.getElementById(btnId);
  const originalText = btn.innerText;
  
  btn.innerText = ">> DATA_COPIED";
  btn.classList.add('copied');
  
  setTimeout(() => {
    btn.innerText = originalText;
    btn.classList.remove('copied');
  }, 2000);
};

    return (
        <div className="ai-lab-container">
        {/* 🚀 साइबरपंक ग्लिच एनीमेशन यहाँ चमकेगा */}
        {(leftLoading || rightLoading) && (
            <MatrixLoader text="EXTRACTING_AI_KNOWLEDGE..." />
        )}
<div className="prompt-area">
    {/* 1. सबसे ऊपर सवाल का डिब्बा */}
    <textarea
        className="cyber-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="ENTER COMMAND..."
        rows="1"
    />

    {/* 2. बीच में VAULT बटन */}
    <button 
        className="history-toggle-btn" 
        onClick={() => setIsDrawerOpen(true)}
    >
        📜 VAULT
    </button>

    {/* 3. सबसे नीचे START_DUEL बटन */}
    <button 
        className="g-btn" 
        onClick={handleExecute} 
        disabled={leftLoading}
    >
        {leftLoading ? 'SYNCING...' : 'START_DUEL'}
    </button>
</div>

            <div className="duel-arena">
                <div className="ai-wing left">
<div className="wing-header">
  {config.ai_names?.gemini || 'AMAN_AI'}
  <button id="copy-left" className="cyber-copy-btn" onClick={() => handleCopy(leftDisplay, 'copy-left')}>
    [COPY_LOG]
  </button>
</div>

                    <div className="response-box">
                        {leftLoading ? (
                            <div className="loading-state">
                                <span className="waiting-text">NEURAL_SCANNING...</span>
                                <div className="cyber-pulse"></div>
                            </div>
                        ) : (
                            <MarkdownRenderer content={leftDisplay} />
                        )}
                    </div>
                </div>

                <div className="ai-wing right">
<div className="wing-header">
  {config.ai_names?.future || 'FUTURE_AI'}
  <button id="copy-right" className="cyber-copy-btn" onClick={() => handleCopy(rightDisplay, 'copy-right')}>
    [COPY_LOG]
  </button>
</div>
                    <div className="response-box">
                        {rightLoading ? (
                            <div className="loading-state">
                                <span className="waiting-text">ANALYZING_GEMINI...</span>
                                <div className="cyber-pulse"></div>
                            </div>
                        ) : (
                            <MarkdownRenderer content={rightDisplay || 'WAITING_FOR_UPGRADE...'} />
                        )}
                    </div>
                </div>
               {/* --- [लाइन 132 से 136 की जगह इसे पेस्ट करें] --- */}
<div className={`vault-drawer ${isDrawerOpen ? 'open' : ''}`}>
    <div className="vault-header">
        <h3>📂 CYBER_VAULT</h3>
        {/* अगर Vault में कुछ है, तभी CLEAR ALL दिखेगा */}
        {vault && vault.length > 0 && (
            <button className="clear-all-btn" onClick={clearVault}>🗑️ CLEAR ALL</button>
        )}
        <button className="close-btn" onClick={() => setIsDrawerOpen(false)}>✕</button>
    </div>

    <div className="vault-list">
        {vault && vault.map((item) => (
            <div key={item.id} className="vault-item-wrapper">
                {/* पुराने लोड फंक्शन 'loadPastDuel' का इस्तेमाल करें */}
                <div className="vault-item" onClick={() => loadPastDuel(item)}>
                    <span className="timestamp">{item.timestamp}</span>
                    <p className="preview-text">{item.prompt}</p>
                </div>
                
                {/* ⚡ डिलीट बटन */}
                <button 
                    className="item-delete-btn" 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        deleteFromVault(item.id);
                    }}
                >
                    ✕
                </button>
            </div>
        ))}
    </div>
</div>
            </div>
        </div>
    );
};

export default DuelZone;
