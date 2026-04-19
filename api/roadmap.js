export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ roadmap: [] });
  }

  try {
    const { skill } = req.body || {};

    const prompt = `
Create a detailed 7-day learning roadmap for ${skill}.

Each day must include:
- title
- 2-4 specific tasks (very practical)

Return ONLY JSON:

[
  {
    "day": "Day 1",
    "title": "...",
    "tasks": ["...", "..."]
  }
]
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

    let roadmap;

    try {
      roadmap = JSON.parse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text
      );
    } catch {
      roadmap = [
        {
          day: "Day 1",
          title: "Basics",
          tasks: ["Learn fundamentals", "Watch intro video"]
        }
      ];
    }

    res.status(200).json({ roadmap });

  } catch {
    res.status(500).json({ roadmap: [] });
  }
}
