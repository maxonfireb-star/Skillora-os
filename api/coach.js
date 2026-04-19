export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Denied" });

  try {
    const { message, skill } = req.body || {};
    const prompt = `You are a helpful AI learning coach for Skillora. 
    User is learning: ${skill || "General Skills"}.
    User asks: "${message}"
    Give a short, helpful, 2-sentence answer.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Keep pushing forward!";
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "I'm offline for a moment!" });
  }
}
