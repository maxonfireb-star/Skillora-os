export default async function handler(req, res) {
  // PASTE YOUR ACTUAL KEY DIRECTLY HERE FOR ONE TEST
  const TEMP_KEY = "YOUR_ACTUAL_KEY_HERE"; 

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${TEMP_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Are you working?" }] }] })
      }
    );

    const data = await response.json();
    
    if (data.error) {
        return res.status(200).json({ reply: "Google says: " + data.error.message });
    }
    
    return res.status(200).json({ reply: "IT WORKS! Response: " + data.candidates[0].content.parts[0].text });
  } catch (e) {
    return res.status(200).json({ reply: "Fetch Error: " + e.message });
  }
}
