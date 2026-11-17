require('dotenv').config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("NO API KEY FOUND IN ENV");
    return;
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
      console.error("HTTP ERROR:", res.status, await res.text());
      return;
    }
    const data = await res.json();
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => console.log(m.name));
  } catch (err) {
    console.error("REQUEST ERROR:", err);
  }
}
run();
