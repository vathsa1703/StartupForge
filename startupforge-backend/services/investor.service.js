const { callGroqWithHistory } = require('./groq.service')
const { getInvestorPrompt } = require('../prompts/investorChat.prompt')

const chatWithInvestor = async (
  investor,
  startup,
  simulation,
  messageHistory
) => {

  const systemPrompt =
    getInvestorPrompt(
      investor,
      startup,
      simulation
    )

  return await callGroqWithHistory(
    systemPrompt,
    messageHistory,
    0.85
  )
}

module.exports = {
  chatWithInvestor
}