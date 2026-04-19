export default async function handler(req, res) {
  try {
    const { message, skill } = req.body;

    const prompt = `
You are Skillora AI, a friendly but focused learning coach.

Skill: ${skill}
User: ${message}

Respond in 2–5 short, practical lines.
Do not be verbose.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      "Keep going — you're improving every day.";

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ reply: "Error connecting to Skillora AI." });
  }
}
