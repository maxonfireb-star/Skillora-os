export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Error" });

  try {
    const { message, skill } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // High-speed model for chat
        messages: [{
          role: "system",
          content: `You are the Skillora AI Coach. Be insightful and supportive. The user is learning ${skill}.`
        }, {
          role: "user",
          content: message
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ reply: `Coach Error: ${data.error.message}` });
    }

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "Coach is resting. Try again in a moment." });
  }
}
