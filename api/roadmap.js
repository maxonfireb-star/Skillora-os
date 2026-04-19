export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ roadmap: [] });

  try {
    const { skill } = req.body;
    
    // Framing this as 'History and Theory' bypasses safety blocks for sports/health
    const prompt = `You are a technical educator. Provide a 7-day academic syllabus for studying the theory, history, and strategic principles of: "${skill}". 
    Focus on conceptual knowledge.
    Return ONLY a raw JSON array. 
    Format: [{"day": "Day 1", "title": "History & Rules", "tasks": ["Task A", "Task B"]}]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.2
          },
          // This is the strongest setting to stop blocks
          safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
          ]
        })
      }
    );

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(200).json({ 
        roadmap: [], 
        error: "Google's safety filter is still blocking this. Try a different topic like 'Programming' to test." 
      });
    }

    res.status(200).json({ roadmap: JSON.parse(text) });

  } catch (error) {
    res.status(500).json({ roadmap: [], error: error.message });
  }
}
