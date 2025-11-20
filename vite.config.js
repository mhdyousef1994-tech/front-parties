import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// محاولة قراءة شهادات SSL إذا كانت موجودة
let httpsConfig = undefined
try {
  const keyPath = path.resolve(__dirname, '../../NewParties/ssl/server.key')
  const certPath = path.resolve(__dirname, '../../NewParties/ssl/server.cert')

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const key = fs.readFileSync(keyPath)
    const cert = fs.readFileSync(certPath)
    httpsConfig = { key, cert }
    console.log('✅ HTTPS enabled with SSL certificates')
  } else {
    console.log('⚠️ SSL certificates not found, running in HTTP mode')
  }
} catch (error) {
  console.log('⚠️ Could not load SSL certificates, running in HTTP mode')
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: httpsConfig,
    host: '0.0.0.0', // يجعل السيرفر متاحًا عبر الشبكة المحلية
    port: 5173,      // نفس البورت الذي تستخدمه
  },
})
