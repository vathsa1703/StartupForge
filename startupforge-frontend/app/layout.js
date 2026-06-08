import './globals.css'

export const metadata = {
  title: 'StartupForge — Simulate Before You Build',
  description: 'AI-powered startup simulation. Test your idea before wasting months.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
