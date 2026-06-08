const getSimulationPrompt = (startup, metrics, actionsChosen, currentMonth) => ({
  system: `You are a startup simulation engine. Return ONLY valid JSON. No markdown, no explanation.`,

  user: `Calculate the outcome of this startup's monthly decisions.

Startup: ${startup.name} — ${startup.description}
Industry: ${startup.industry}
Current Month: ${currentMonth}

Current Metrics:
- MRR: ₹${metrics.MRR}
- Active Users: ${metrics.activeUsers}
- Burn Rate: ₹${metrics.burnRate}/month
- Runway: ${metrics.runway} months
- Churn: ${metrics.churn}%
- Total Funding: ₹${metrics.totalFunding}

Actions Taken This Month:
${actionsChosen.join('\n')}

Return this exact JSON:
{
  "updatedMetrics": {
    "MRR": number,
    "ARR": number,
    "activeUsers": number,
    "burnRate": number,
    "runway": number,
    "churn": number,
    "totalFunding": number
  },
  "eventFired": null or {
    "title": "event title",
    "description": "what happened",
    "options": ["option1", "option2", "option3"]
  },
  "narrative": "2-3 sentence story of what happened this month"
}

Fire a random event 40% of the time. Make metrics realistic — good decisions should show modest improvement, bad decisions should hurt. Churn above 25% is dangerous.`,
});

const getInvestorPrompt = (investor, startup, metrics, pitch) => ({
  system: `You are ${investor.name}, a ${investor.type}. Return ONLY valid JSON. No markdown.`,

  user: `A founder is pitching you their startup. Evaluate it honestly based on your investment criteria.

Your profile:
${getInvestorProfile(investor.name)}

Startup: ${startup.name} — ${startup.description}
Industry: ${startup.industry}

Current Metrics (Month ${metrics.currentMonth}):
- MRR: ₹${metrics.MRR}
- Active Users: ${metrics.activeUsers}  
- Churn: ${metrics.churn}%
- Runway: ${metrics.runway} months

Founder's Pitch:
"${pitch}"

Return this exact JSON:
{
  "status": "rejected" or "soft_pass" or "counter_offer" or "invested",
  "response": "your response as this investor, 3-4 sentences, in character",
  "amountOffered": number or null,
  "equity": number or null,
  "keyFeedback": "one sentence on the main reason for your decision"
}`,
});

const getInvestorProfile = (name) => {
  const profiles = {
    'Arjun Mehta': 'Angel investor. Cheques: ₹25L-₹75L. Cares about founder story and early traction. Warm but probing.',
    'Sequoia Scout': 'Early stage VC. Cheques: ₹1Cr-₹5Cr. Cares about growth rate and retention. Cold and data-driven.',
    'Meera Iyer': 'Impact investor. Cheques: ₹50L-₹2Cr. Cares about social impact. Values-first.',
    'Raj Kapoor': 'Serial entrepreneur. Cheques: ₹30L-₹1Cr. Cares about founder-market fit. Blunt, hates BS.',
    'Tiger Global Associate': 'Growth stage fund. Cheques: ₹10Cr+. Only talks numbers and scalability. Ruthless.',
  };
  return profiles[name] || '';
};

const getPostMortemPrompt = (startup, simulation) => ({
  system: `You are a startup mentor giving a brutal honest post-mortem. Return ONLY valid JSON.`,

  user: `Analyze this startup simulation and give a complete post-mortem.

Startup: ${startup.name} — ${startup.description}
Final Status: ${simulation.status}
Months Survived: ${simulation.currentMonth}

Final Metrics:
- MRR: ₹${simulation.metrics.MRR}
- Active Users: ${simulation.metrics.activeUsers}
- Churn: ${simulation.metrics.churn}%
- Runway: ${simulation.metrics.runway} months

Monthly History:
${simulation.monthlyHistory.map(m => 
  `Month ${m.month}: Actions: ${m.actionsChosen.join(', ')}. ${m.narrative}`
).join('\n')}

Return this exact JSON:
{
  "verdict": "one brutal honest sentence on why this startup succeeded or failed",
  "founderScore": {
    "productInstinct": number 1-10,
    "financialDiscipline": number 1-10,
    "marketAwareness": number 1-10,
    "resilience": number 1-10,
    "pitchQuality": number 1-10
  },
  "realWorldProbability": number 0-100,
  "summary": "3-4 sentence summary of what happened and what a top founder would have done differently"
}`,
});

module.exports = { getSimulationPrompt, getInvestorPrompt, getPostMortemPrompt };