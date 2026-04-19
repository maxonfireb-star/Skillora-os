export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message, skill } = req.body || {};

    const prompt = `You are the AI Coach for a learning app called Skillora. 
    The user is currently learning: ${skill || "a general topic"}.
    User asks: "${message}"
    Give short, highly practical, and encouraging advice in 2–3 sentences.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Keep up the great work! Stay consistent.";

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Coach API Error:", error);
    res.status(500).json({ reply: "I'm having trouble connecting right now. Try again!" });
  }
}
