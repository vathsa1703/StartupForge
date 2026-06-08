import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Startup
export const createStartup = (data) => API.post('/api/startup/create', data)
export const getStartup = (id) => API.get(`/api/startup/${id}`)
export const getAllStartups = () => API.get('/api/startup')

// Persona chat
export const chatWithPersona = (data) => API.post('/api/persona/chat', data)
export const getChatHistory = (startupId, personaId) =>
  API.get(`/api/persona/history/${startupId}/${personaId}`)

// Simulation
export const runMonth = (data) => API.post('/api/simulation/run-month', data)
export const getSimulation = (startupId) => API.get(`/api/simulation/${startupId}`)
export const pitchInvestor = (data) => API.post('/api/simulation/pitch', data)
export const getPostMortem = (startupId) => API.get(`/api/simulation/postmortem/${startupId}`)

export default API
