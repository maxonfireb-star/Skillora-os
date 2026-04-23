export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Error" });

  try {
    const { message, skill, roadmap, currentDay } = req.body;

    // Build roadmap context string
    const roadmapContext = roadmap && roadmap.length > 0
      ? roadmap.map((d, i) =>
          `${d.day} — ${d.title}:\n${d.tasks.map(t => `  • ${t}`).join('\n')}`
        ).join('\n\n')
      : "No roadmap available.";

    const currentDayInfo = roadmap && roadmap[currentDay]
      ? `The user is currently on ${roadmap[currentDay].day}: "${roadmap[currentDay].title}".`
      : "";

    const systemPrompt = `You are the Aevon Coach — a sharp, direct, and energizing learning coach embedded in an AI-powered learning app called Aevon.

The user is learning: ${skill || "an unspecified skill"}.

Here is their full 7-day roadmap:
${roadmapContext}

${currentDayInfo}

YOUR COACHING STYLE:
- Be direct, warm, and human — like a knowledgeable friend, not a textbook
- Keep responses SHORT and punchy — 3 to 6 lines max unless they explicitly ask for a deep dive
- Use bullet points sparingly, only when listing actual steps or comparisons
- Never write long paragraphs. Break things up.
- Reference their specific roadmap tasks when relevant — you know exactly what they're studying
- Be encouraging without being cheesy
- If they're stuck on something in the roadmap, speak directly to that day's content
- Avoid filler phrases like "Great question!" or "Certainly!" — just answer
- Occasionally use one-line quips to keep energy up, but don't overdo it`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 300,
        temperature: 0.75,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: `Coach error: ${data.error.message}` });
    }

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "Coach is offline for a sec. Try again." });
  }
}
