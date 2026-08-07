

  import {GoogleGenAI} from '@google/genai';
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY!});

export async function getAiSuggestions(service: string, environment: string, severity: string, logs: any){
     const prompt = `You are a Senior Site Reliability Engineer (SRE).

A production incident has been detected in an application. Analyze the incident based on the logs provided.

Incident Details:
- Service: {${service}}
- Environment: {${environment}}
- Severity: {${severity}}

Logs:
{${logs}}

Your task is to:

1. Summarize the incident in 2-3 sentences.
2. Identify the most likely root cause.
3. List the evidence from the logs that supports your conclusion.
4. Suggest 3-5 actionable steps to resolve or mitigate the issue.
5. Mention any assumptions or uncertainties if the logs are insufficient.

Return your response strictly in the following JSON format:

{
  "summary": "...",
  "rootCause": "...",
  "evidence": "",
  "recommendation":"",
  "confidence": 0-100
}

Do not include markdown, code blocks, or any text outside the JSON object.`
   
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  if (!response.text) {
    throw new Error('AI response did not include text');
  }
  const result = JSON.parse(response.text);
  if (Array.isArray(result.recommendation)) {
    result.recommendation = result.recommendation.join("\n");
  }
  if (result.recommendation && typeof result.recommendation !== "string") {
    result.recommendation = String(result.recommendation);
  }
  result.model = "gemini-2.5-flash";
   return result;
};