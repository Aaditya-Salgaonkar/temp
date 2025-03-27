export async function generateResponse(prompt) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    return data?.candidates?.[0]?.output || "Error generating response";
}
