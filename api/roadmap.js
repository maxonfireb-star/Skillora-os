export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ roadmap: [] });

  try {
    const { skill } = req.body || {};
    const prompt = `Create a 7-day learning roadmap for: ${skill}. 
    Return a JSON array of objects. Each object must have: 
    "day" (string like "Day 1"), "title" (string), "tasks" (array of strings).`;

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
    const roadmap = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]");

    res.status(200).json({ roadmap });
  } catch (error) {
    res.status(500).json({ roadmap: [] });
  }
}
