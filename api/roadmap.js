export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ roadmap: [] });
  try {
    const { skill } = req.body;
    const prompt = `Create a 7-day academic roadmap for learning: ${skill}. Return ONLY a JSON array. Format: [{"day": "Day 1", "title": "Intro", "tasks": ["Task 1"]}]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        })
      }
    );

    const data = await response.json();
    
    // DIFFERENTIATE ERRORS
    if (data.error) {
      return res.status(200).json({ roadmap: [], error: `Google API Error: ${data.error.message}. Please check your Vercel API Key.` });
    }
    if (!data.candidates?.[0]?.content) {
      return res.status(200).json({ roadmap: [], error: "AI Safety Block: Try a different topic." });
    }

    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ roadmap: JSON.parse(text) });
  } catch (error) {
    res.status(500).json({ roadmap: [], error: "System Error: " + error.message });
  }
}
