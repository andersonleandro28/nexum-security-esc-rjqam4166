import { Outlet, Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, LogOut, Home } from 'lucide-react'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'

export function CustomerLayout() {
  const { setRole } = useMainStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    setRole('guest')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/customer/dashboard" className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-slate-800 tracking-tight">Nexum Portal</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6">
            <Link
              to="/customer/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 hidden sm:flex items-center gap-2 transition-colors"
            >
              <Home className="h-4 w-4" /> Início
            </Link>
            <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
    </div>
  )
}
