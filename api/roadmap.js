export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ roadmap: [] });
  try {
    const { skill } = req.body;
    const prompt = `Return a JSON array of objects for a 7-day ${skill} roadmap. Format: [{"day": "Day 1", "title": "...", "tasks": ["...", "..."]}]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    res.status(200).json({ roadmap: JSON.parse(text) });
  } catch (err) {
    res.status(500).json({ roadmap: [] });
  }
}
