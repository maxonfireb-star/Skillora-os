export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message, skill } = req.body || {};

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const prompt = `
You are Skillora AI, a helpful learning coach.

Skill: ${skill || "general"}
User: ${message}

Reply in 2-4 short helpful lines.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Keep going — consistency wins.";

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ reply: "Server error in coach API" });
  }
}
