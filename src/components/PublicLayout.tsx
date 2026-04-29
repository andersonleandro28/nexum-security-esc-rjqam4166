import { Outlet, Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, UserCircle, ShieldAlert } from 'lucide-react'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'

export function PublicLayout() {
  const { setRole, addAuditLog } = useMainStore()
  const navigate = useNavigate()

  const handleLoginCustomer = () => {
    setRole('customer')
    addAuditLog('Login', 'Cliente', 'Acesso ao portal do cliente')
    navigate('/customer/dashboard')
  }

  const handleLoginAdmin = () => {
    setRole('admin')
    addAuditLog('Login', 'Admin', 'Acesso à mesa de operações')
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <ShieldCheck className="h-8 w-8 text-primary group-hover:text-emerald-500 transition-colors" />
            <span className="text-xl font-bold text-primary tracking-tight">Nexum Security</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleLoginCustomer}
              className="hidden sm:flex hover:text-emerald-600"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Portal do Cliente
            </Button>
            <Button
              variant="outline"
              onClick={handleLoginAdmin}
              className="border-primary/20 hover:bg-primary/5"
            >
              <ShieldAlert className="mr-2 h-4 w-4 text-emerald-600" />
              Mesa de Operações
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-slate-900 text-slate-300 py-12">
        <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold">Nexum Security ESC</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Soluções financeiras seguras e transparentes, em total conformidade com a Lei
              Complementar 167/2019. Trabalhamos exclusivamente com capital próprio para fomento
              local.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Conformidade LC 167/2019
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>contato@nexumsecurity.com.br</li>
              <li>0800 123 4567</li>
              <li>São Paulo, SP - Brasil</li>
            </ul>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
          &copy; {new Date().getFullYear()} Nexum Security Empresa Simples de Crédito. Todos os
          direitos reservados.
        </div>
      </footer>
    </div>
  )
}
