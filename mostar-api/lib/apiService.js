const API_BASE = "https://mostar-payout-api.onrender.com";

export async function registerUser({username, email, password, tier}) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({username, email, password, tier})
  });
  return await res.json();
}

export async function generateAI({prompt, model}, apiKey) {
  const res = await fetch(`${API_BASE}/ai/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({prompt, model})
  });
  return await res.json();
}

export async function getClimateData(apiKey) {
  const res = await fetch(`${API_BASE}/climate/demo`, {
    headers: { "x-api-key": apiKey }
  });
  return await res.json();
}
