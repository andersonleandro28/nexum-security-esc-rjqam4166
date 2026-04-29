import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, TrendingUp, FileText, Activity } from 'lucide-react'
import { api } from '@/services/api'
import useRealtime from '@/hooks/use-realtime'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ proposals: 0, activeLoans: 0, revenue: 0 })

  const loadData = async () => {
    const proposals = await api.proposals.list()
    const active = proposals.filter((p: any) => p.status === 'Assinado' || p.status === 'Liquidado')
    const revenue = active.reduce((acc: number, p: any) => acc + Number(p.amount), 0)
    setStats({ proposals: proposals.length, activeLoans: active.length, revenue })
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('proposals', () => {
    loadData()
  })

  const REVENUE_LIMIT = 4800000
  const isBlocked = stats.revenue >= REVENUE_LIMIT

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Monitor Operacional</h2>

      {isBlocked && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-900 shadow-sm animate-fade-in"
        >
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-bold">Bloqueio Preventivo Ativado</AlertTitle>
          <AlertDescription className="text-red-700 font-medium">
            O teto de Receita Bruta Anual para Empresa Simples de Crédito (R$ 4.800.000,00) foi
            atingido. Emissão de novas Cédulas de Crédito Bancário bloqueada.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <FileText className="w-4 h-4 mr-2" /> Volume de Propostas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{stats.proposals}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Activity className="w-4 h-4 mr-2" /> Operações Consolidadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.activeLoans}</p>
          </CardContent>
        </Card>
        <Card
          className={`shadow-sm transition-all ${isBlocked ? 'border-red-200 bg-red-50' : 'border-emerald-100 bg-emerald-50/50'}`}
        >
          <CardHeader className="pb-2">
            <CardTitle
              className={`text-sm font-medium flex items-center ${isBlocked ? 'text-red-800' : 'text-emerald-800'}`}
            >
              <TrendingUp className="w-4 h-4 mr-2" /> Faturamento Contábil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${isBlocked ? 'text-red-700' : 'text-emerald-700'}`}>
              {formatCurrency(stats.revenue)}
            </p>
            <p
              className={`text-xs mt-1 font-medium ${isBlocked ? 'text-red-600' : 'text-emerald-600'}`}
            >
              Limite Legal: R$ 4,8 Milhões
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
