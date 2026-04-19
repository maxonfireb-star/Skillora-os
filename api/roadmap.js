export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ roadmap: [] });

  try {
    const { skill } = req.body;
    const prompt = `Create a 7-day learning roadmap for: ${skill}. 
    Return ONLY a JSON array of objects. 
    Format: [{"day": "Day 1", "title": "Topic", "tasks": ["Task 1", "Task 2"]}]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // This allows the AI to answer health/weight loss questions without blocking
          safetySettings: [
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ],
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.1 
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.status(500).json({ roadmap: [], error: data.error.message });
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    // Plan B: If the AI wraps the JSON in markdown code blocks, strip them
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    res.status(200).json({ roadmap: JSON.parse(cleanJson) });

  } catch (error) {
    console.error("Server Crash:", error);
    res.status(500).json({ roadmap: [], details: error.message });
  }
}
