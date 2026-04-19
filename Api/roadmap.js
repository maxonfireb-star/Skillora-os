export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ roadmap: [] });
  }

  try {
    const { skill } = req.body || {};

    if (!skill) {
      return res.status(400).json({ roadmap: [] });
    }

    const prompt = `
Create a simple 7-day learning roadmap for: ${skill}

Return ONLY a JSON array like:
["Day 1 task", "Day 2 task", ..., "Day 7 task"]
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

    let roadmap;

    try {
      roadmap = JSON.parse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text
      );
    } catch {
      roadmap = [
        "Learn basics",
        "Practice fundamentals",
        "Build small project",
        "Improve skills",
        "Advanced practice",
        "Mini project",
        "Final challenge"
      ];
    }

    res.status(200).json({ roadmap });

  } catch (err) {
    res.status(500).json({
      roadmap: [
        "Learn basics",
        "Practice fundamentals",
        "Build small project",
        "Improve skills",
        "Advanced practice",
        "Mini project",
        "Final challenge"
      ]
    });
  }
}
