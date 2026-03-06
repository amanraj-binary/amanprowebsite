/* --- UniversalAIService.js (Ultra Robust Version) --- */

export const callUniversalAI = async (prompt, config) => {
  const { provider, model, key, url } = config;

  if (!key || !url || !provider) {
    return "ERROR: CONFIG_INCOMPLETE (Check Provider, URL and Key in Admin Panel)";
  }

  // 🔄 URL के अंदर {MODEL_NAME} और {API_KEY} को असली डेटा से बदलना
  let finalUrl = url
    .replace("{MODEL_NAME}", model)
    .replace("{API_KEY}", key);

  // 🧪 Google Gemini के लिए खास चेकिंग
  if (provider === "GOOGLE" && !finalUrl.includes("key=")) {
    finalUrl += (finalUrl.includes("?") ? "&" : "?") + `key=${key}`;
  }

  let body = {};
  let headers = { "Content-Type": "application/json" };

  // 🏗️ प्रोवाइडर के हिसाब से बॉडी का ढांचा (Format)
  if (provider === "GOOGLE") {
    // गूगल अब 'role' मांगता है, तो हमने उसे भी जोड़ दिया है
    body = { 
      contents: [{ 
        role: "user", 
        parts: [{ text: prompt }] 
      }] 
    };
  } 
  else if (provider === "OPENAI" || provider === "GROK") {
    headers["Authorization"] = `Bearer ${key}`;
    body = { 
      model: model, 
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7 
    };
  } 
  else if (provider === "ANTHROPIC") {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
    body = { 
      model: model, 
      messages: [{ role: "user", content: prompt }], 
      max_tokens: 1024 
    };
  }

  try {
    const response = await fetch(finalUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // 🕵️‍♂️ अगर कंपनी की तरफ से कोई एरर आए
    if (data.error) {
      console.error(`AI_PROVIDER_ERROR (${provider}):`, data.error);
      return `SYSTEM_ERROR: ${data.error.message || "Invalid Request"}`;
    }

    // 🎁 जवाब बाहर निकालना
    if (provider === "GOOGLE") return data.candidates[0].content.parts[0].text;
    if (provider === "OPENAI" || provider === "GROK") return data.choices[0].message.content;
    if (provider === "ANTHROPIC") return data.content[0].text;

    return "ERROR: UNKNOWN_PROVIDER_LOGIC";

  } catch (error) {
    console.error("NETWORK_FATAL:", error);
    return `ERROR: ${provider}_CONNECTION_FAILED (Check URL or Internet)`;
  }
};
