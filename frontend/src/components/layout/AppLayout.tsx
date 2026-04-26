import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { Footer } from './Footer'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <TopNav />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
