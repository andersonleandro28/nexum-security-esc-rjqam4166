import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, PieChart, LogOut, ShieldCheck } from 'lucide-react'
import useMainStore from '@/stores/main'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export function AdminLayout() {
  const { setRole } = useMainStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    setRole('guest')
    navigate('/')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar variant="sidebar" className="border-r bg-slate-900 text-slate-200">
          <SidebarHeader className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
              <span className="text-lg font-bold tracking-tight">Nexum Operações</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-3">
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/admin/dashboard'}
                  className="hover:bg-slate-800 hover:text-white data-[active=true]:bg-slate-800 data-[active=true]:text-emerald-400 transition-colors"
                >
                  <Link to="/admin/dashboard">
                    <LayoutDashboard /> Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith('/admin/proposals')}
                  className="hover:bg-slate-800 hover:text-white data-[active=true]:bg-slate-800 data-[active=true]:text-emerald-400 transition-colors"
                >
                  <Link to="/admin/proposals">
                    <FileText /> Fila de Propostas
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/admin/reports'}
                  className="hover:bg-slate-800 hover:text-white data-[active=true]:bg-slate-800 data-[active=true]:text-emerald-400 transition-colors"
                >
                  <Link to="/admin/reports">
                    <PieChart /> Relatórios Financeiros
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-slate-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Encerrar Sessão
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto flex flex-col">
          <header className="h-16 border-b bg-white flex items-center px-6 sticky top-0 z-10 shadow-sm shrink-0">
            <h1 className="font-semibold text-lg text-slate-800">Mesa de Operações ESC</h1>
          </header>
          <div className="p-6 md:p-8 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
