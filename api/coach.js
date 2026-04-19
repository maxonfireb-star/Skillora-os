export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Error" });

  try {
    const { message, skill } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: `You are an expert AI Coach for Skillora. The user is learning: ${skill}. Answer this question briefly: ${message}` }] 
          }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        reply: `Coach Error: ${data.error.message}. Verify your project-linked API key.` 
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "The coach is currently offline.";
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "Connection lost. Please refresh." });
  }
}
