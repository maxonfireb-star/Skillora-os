export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ roadmap: [] });

  try {
    const { skill } = req.body;
    
    // We explicitly tell it to be a JSON-only machine
    const prompt = `Create a 7-day learning roadmap for: "${skill}". 
    Output must be a valid JSON array of objects. 
    Format: [{"day": "Day 1", "title": "Topic", "tasks": ["A", "B"]}]
    Return ONLY the JSON. No markdown, no intro text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            // This tells Google to FORCE the output into JSON format
            responseMimeType: "application/json",
            temperature: 0.1 
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(200).json({ roadmap: [], error: "AI Safety Block. Try a broader topic." });
    }

    // THE CLEANER: This removes any backticks or "json" labels the AI might add
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    res.status(200).json({ roadmap: JSON.parse(cleanJson) });

  } catch (error) {
    console.error("Roadmap Crash:", error);
    res.status(500).json({ roadmap: [], error: "Format Error: " + error.message });
  }
}
