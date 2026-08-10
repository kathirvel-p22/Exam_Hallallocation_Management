import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeUrl(url: string) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      riskScore: 50,
      riskLevel: 'medium',
      threats: ['API Key Missing'],
      details: 'Gemini API key is not configured.'
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following URL for cybersecurity threats: ${url}. 
      Provide a JSON response with:
      - riskScore (0-100)
      - riskLevel (low, medium, high, critical)
      - threats (array of strings)
      - details (string summary)
      - features (object with boolean flags for: phishing, malware, suspicious_domain, ssl_valid, unusual_port, homograph_attack)`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      riskScore: 0,
      riskLevel: 'low',
      threats: ['Analysis Failed'],
      details: 'Could not complete AI analysis.'
    };
  }
}
