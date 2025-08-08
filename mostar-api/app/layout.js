'use client'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
