import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, TrendingUp, FileText, Activity } from 'lucide-react'
import { api } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import useRealtime from '@/hooks/use-realtime'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    proposals: 0,
    portfolioBalance: 0,
    projectedEarnings: 0,
    delinquencyRate: 0,
    revenue: 0,
  })

  const loadData = async () => {
    const proposals = await api.proposals.list()
    const allInstallments = await pb.collection('installments').getFullList()

    const activeProposals = proposals.filter(
      (p: any) => p.status === 'Em Aberto/Ativo' || p.status === 'Pronto para Desembolso',
    )
    const portfolioBalance = activeProposals.reduce(
      (acc: number, p: any) => acc + Number(p.amount),
      0,
    )

    const pendingInstallments = allInstallments.filter((i) => i.status === 'Pendente')
    const projectedEarnings = pendingInstallments.reduce(
      (acc: number, i: any) => acc + Number(i.interest_amount || 0),
      0,
    )

    const activeInstallments = allInstallments.filter(
      (i) => i.status === 'Pendente' || i.status === 'Atrasado',
    )
    const overdueInstallments = allInstallments.filter((i) => i.status === 'Atrasado')
    const delinquencyRate = activeInstallments.length
      ? (overdueInstallments.length / activeInstallments.length) * 100
      : 0

    const currentYear = new Date().getFullYear()
    const thisYearProposals = proposals.filter(
      (p: any) => new Date(p.operation_date).getFullYear() === currentYear,
    )
    const thisYearProposalIds = new Set(thisYearProposals.map((p: any) => p.id))
    const thisYearInstallments = allInstallments.filter((i) =>
      thisYearProposalIds.has(i.proposal_id),
    )
    const totalInterest = thisYearInstallments.reduce(
      (acc: number, i: any) => acc + Number(i.interest_amount || 0),
      0,
    )
    const totalIssuanceFee = thisYearProposals.reduce(
      (acc: number, p: any) => acc + Number(p.issuance_fee || 0),
      0,
    )

    setStats({
      proposals: proposals.length,
      portfolioBalance,
      projectedEarnings,
      delinquencyRate,
      revenue: totalInterest + totalIssuanceFee,
    })
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Activity className="w-4 h-4 mr-2" /> Saldo em Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.portfolioBalance)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> Projeção (Recebimentos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(stats.projectedEarnings)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" /> Inadimplência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{stats.delinquencyRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card
          className={`shadow-sm transition-all ${isBlocked ? 'border-red-200 bg-red-50' : 'border-emerald-100 bg-emerald-50/50'}`}
        >
          <CardHeader className="pb-2">
            <CardTitle
              className={`text-sm font-medium flex items-center ${isBlocked ? 'text-red-800' : 'text-emerald-800'}`}
            >
              <FileText className="w-4 h-4 mr-2" /> Faturamento Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${isBlocked ? 'text-red-700' : 'text-emerald-700'}`}>
              {formatCurrency(stats.revenue)}
            </p>
            <p
              className={`text-[10px] mt-1 font-medium ${isBlocked ? 'text-red-600' : 'text-emerald-600'}`}
            >
              Teto: R$ 4,8 Milhões
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
