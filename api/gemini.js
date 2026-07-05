// Vercel serverless function — proxies requests to Gemini so the API key
// never ships to the browser. Deployed automatically by Vercel from this
// /api folder; no extra config needed beyond setting the GEMINI_API_KEY
// environment variable in the Vercel project settings.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing GEMINI_API_KEY. Set it in Vercel project settings." });
    return;
  }

  const { systemInstruction, contents } = req.body || {};
  if (!contents) {
    res.status(400).json({ error: "Missing 'contents' in request body" });
    return;
  }

  const model = "gemini-2.5-flash";

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      res.status(geminiRes.status).json({ error: "Gemini API error", detail: errText });
      return;
    }

    const data = await geminiRes.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!replyText) {
      res.status(502).json({ error: "Gemini returned no usable reply" });
      return;
    }

    res.status(200).json({ reply: replyText });
  } catch (err) {
    res.status(500).json({ error: "Failed to reach Gemini", detail: String(err) });
  }
}
