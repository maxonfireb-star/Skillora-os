export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message, skill } = req.body || {};

    const prompt = `
You are Skillora AI coach.

Skill: ${skill || "general"}
User: ${message}

Give short, practical, actionable advice in 2–4 lines.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Stay consistent and keep learning.";

    res.status(200).json({ reply });

  } catch {
    res.status(500).json({ reply: "AI error" });
  }
}
