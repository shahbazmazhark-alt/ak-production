import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ToastProvider from '@/components/Toast'

export const metadata = { title: 'AK Production System', description: 'Ayesha Khurram – Production Management' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-nunito">
        <AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider>
      </body>
    </html>
  )
}
