export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ roadmap: [] });

  try {
    const { skill } = req.body;
    const prompt = `Generate a 7-day learning roadmap for ${skill}. 
    Return ONLY a JSON array. 
    Format: [{"day": "Day 1", "title": "Topic", "tasks": ["Task 1", "Task 2"]}]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7,
            responseMimeType: "application/json" 
          }
        })
      }
    );

    const data = await response.json();
    
    // Safety check: log the data to Vercel logs so you can see it
    console.log("Gemini Raw Response:", JSON.stringify(data));

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ roadmap: [], error: "No candidates from AI" });
    }

    let rawText = data.candidates[0].content.parts[0].text;
    
    // Clean potential markdown backticks just in case
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    
    res.status(200).json({ roadmap: JSON.parse(cleanJson) });

  } catch (err) {
    console.error("Roadmap API Error:", err);
    res.status(500).json({ roadmap: [], details: err.message });
  }
}
