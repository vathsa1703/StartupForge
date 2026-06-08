const getMarketAnalysisPrompt = (startup) => ({
  system: `You are an expert startup market analyst with 20 years of experience. 
You analyze startup ideas and return brutally honest, realistic assessments.
Return ONLY valid JSON. No markdown, no backticks, no explanation. Just raw JSON.`,

  user: `Analyze this startup and return a JSON object with this exact structure:
{
  "TAM": "string describing total addressable market with number",
  "SAM": "string describing serviceable addressable market with number", 
  "SOM": "string describing serviceable obtainable market with number",
  "competitors": [
    {
      "name": "competitor name",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"]
    }
  ],
  "risks": [
    {
      "title": "risk title",
      "description": "detailed description of this risk"
    }
  ],
  "personas": [
    {
      "name": "realistic Indian name",
      "age": 25,
      "occupation": "job title",
      "income": "monthly income range in INR",
      "painPoints": ["pain1", "pain2", "pain3"],
      "willingnessToPay": "max amount per month in INR they would pay",
      "personality": "2-3 sentence personality description for AI roleplay"
    }
  ]
}

Startup Details:
Name: ${startup.name}
Description: ${startup.description}
Industry: ${startup.industry}
Target Audience: ${startup.targetAudience}

Generate exactly 3 competitors, 3 risks, and 3 personas. Be realistic and specific to the Indian market.`,
});

module.exports = { getMarketAnalysisPrompt };