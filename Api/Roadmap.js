export default async function handler(req, res) {
  try {
    const { skill } = req.body;

    const prompt = `
You are Skillora AI.

Create a 7-day beginner to intermediate roadmap for learning: ${skill}

Return ONLY a JSON array like:
["Day 1 task", "Day 2 task", ... "Day 7 task"]

No explanation, no extra text.
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

    let roadmap;

    try {
      roadmap = JSON.parse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text
      );
    } catch (e) {
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
