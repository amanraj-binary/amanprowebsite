// src/components/AI_LAB/HistoryDrawer.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const HistoryDrawer = ({ isOpen, onClose, onLoadDuel }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const historyRef = ref(db, 'ai_duels');
        // Real-time listener: जैसे ही नया Duel सेव होगा, यहाँ अपने आप आ जाएगा
        onValue(historyRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // ऑब्जेक्ट को एरे में बदलना और समय के हिसाब से सॉर्ट करना
                const list = Object.entries(data).map(([id, value]) => ({
                    id, ...value
                })).reverse(); // लेटेस्ट सबसे ऊपर
                setHistory(list);
            }
        });
    }, []);

    return (
        <div className={`cyber-drawer ${isOpen ? 'open' : ''}`}>
            <div className="drawer-header">
                <h3>Vault_History</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="history-list">
                {history.length > 0 ? (
                    history.map((item) => (
                        <div key={item.id} className="history-item" onClick={() => {onLoadDuel(item); onClose();}}>
                            <span className="history-prompt">{item.prompt.substring(0, 30)}...</span>
                            <span className="history-time">
                                {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="no-data">No memories found...</p>
                )}
            </div>
        </div>
    );
};

export default HistoryDrawer;
