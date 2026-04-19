export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ roadmap: [] });
  }

  try {
    const { skill } = req.body || {};

    const prompt = `Create a detailed 7-day learning roadmap for the skill: ${skill}. 
    Return an array of objects. Each object must have: 
    "day" (string, e.g., "Day 1"), 
    "title" (string), 
    "tasks" (array of 2-4 practical task strings).`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // THIS IS THE MAGIC FIX: Forces pure JSON output
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      }
    );

    const data = await response.json();
    
    // Safely parse the guaranteed JSON string
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const roadmap = JSON.parse(rawText);

    res.status(200).json({ roadmap });

  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    res.status(500).json({ 
      roadmap: [{ day: "Error", title: "Generation Failed", tasks: ["Please try generating again."] }] 
    });
  }
}
