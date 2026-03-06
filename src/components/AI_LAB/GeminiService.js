/* --- GeminiService.js: एलीट अपडेट --- */

export const callGemini = async (prompt, apiKey) => {
  if (!apiKey) {
    console.error("CRITICAL: API_KEY_MISSING_IN_ADMIN_PANEL");
    return "ERROR: AI_PROTOCOLS_OFFLINE (Check Admin Panel)";
  }

  try {
    // 🚀 यहाँ है बदलाव: आपकी 2.5/2.0 चाबी के लिए सही URL और v1 वर्जन
    // नोट: अगर 2.5 काम न करे तो gemini-2.0-flash-exp ट्राई करें
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // 🕵️‍♂️ अगर गूगल कोई एरर वापस भेजे
    if (data.error) {
      console.error("GOOGLE_API_ERROR:", data.error.message);
      return `SYSTEM_ERROR: ${data.error.message}`;
    }

    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("NEURAL_LINK_FAILED:", error);
    return "ERROR: CONNECTION_TO_AI_CORE_LOST";
  }
};
