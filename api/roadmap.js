export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ roadmap: [] });

  try {
    const { skill } = req.body;
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{
          role: "user",
          content: `Create a 7-day academic roadmap for: ${skill}. Return ONLY a JSON array. Format: [{"day": "Day 1", "title": "Subject", "tasks": ["Task 1", "Task 2"]}]`
        }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ roadmap: [], error: `Groq Error: ${data.error.message}` });
    }

    // Groq returns data inside choices[0].message.content
    const content = JSON.parse(data.choices[0].message.content);
    res.status(200).json({ roadmap: content.roadmap || content });

  } catch (error) {
    res.status(500).json({ roadmap: [], error: "System Error: " + error.message });
  }
}
