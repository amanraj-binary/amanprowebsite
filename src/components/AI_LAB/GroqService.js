/* --- GroqService.js --- */

export const callGroq = async (prompt, apiKey) => {
  if (!apiKey) return "ERROR: FUTURE_AI_KEY_MISSING (Check Admin Panel)";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile", // यह मॉडल सुपरफास्ट और फ्री है
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("GROQ_LINK_FAILED:", error);
    return "ERROR: NEURAL_LINK_TO_FUTURE_AI_LOST";
  }
};
