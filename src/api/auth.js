// Auth API - mocked for frontend-only usage
import api from './apiClient'

function getPasswordsMap(){
  try{ return JSON.parse(localStorage.getItem('passwords')||'{}') }catch{ return {} }
}
function setPasswordsMap(map){ localStorage.setItem('passwords', JSON.stringify(map)) }

export async function login(phone, password){
  try{
    const res = await api.post('/auth/login', { phone, password })
    const data = res.data
    if(data?.tokens?.accessToken){
      localStorage.setItem('access_token', data.tokens.accessToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  }catch(err){
    throw err
  }
}

export async function register(payload){
  try{
    const res = await api.post('/auth/register', payload)
    return res.data
  }catch(err){
    throw err
  }
}

export function setPassword(phone, newPassword){
  // Local helper until backend reset is wired
  try{
    const map = JSON.parse(localStorage.getItem('passwords')||'{}')
    map[phone] = newPassword
    localStorage.setItem('passwords', JSON.stringify(map))
  }catch{}
}
// Get current user info from backend
export async function getMe(){
  try{
    const res = await api.get('/auth/me')
    return res.data
  }catch(err){
    throw err
  }
}

export async function updateprofile(payload){
  try{
    const res = await api.put('/auth/profile', payload)
    // Update local storage with new user data
    if(res.data?.user){
      localStorage.setItem('user', JSON.stringify(res.data.user))
    }
    return res.data
  }catch(err){
    throw err
  }
}

export async function logout(){
  try{
    await api.get('/auth/logout')
  }catch(e){
    console.error('Logout error:', e)
  }
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
}

export function getToken(){ return localStorage.getItem('access_token') }
export function getUser(){ try{return JSON.parse(localStorage.getItem('user'))}catch{return null} }
