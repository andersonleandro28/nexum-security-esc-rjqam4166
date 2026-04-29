import { Download, CheckCircle2, Clock, AlertCircle, TrendingUp, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import useMainStore from '@/stores/main'
import { useToast } from '@/hooks/use-toast'

export default function CustomerDashboard() {
  const { proposals, loans, installments } = useMainStore()
  const { toast } = useToast()

  const activeLoan = loans[0]
  const pendingProposal = proposals.find(
    (p) => p.status === 'Em Análise' || p.status === 'Pendente',
  )

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  if (!activeLoan && !pendingProposal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in max-w-lg mx-auto">
        <div className="bg-slate-100 p-6 rounded-full mb-6 ring-8 ring-slate-50">
          <TrendingUp className="h-12 w-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Expanda seu negócio hoje</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Você não tem contratos ativos. Realize uma simulação digital e peça uma proposta de
          crédito estruturada para sua empresa.
        </p>
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => (window.location.href = '/')}
        >
          Acessar Simulador
        </Button>
      </div>
    )
  }

  if (!activeLoan && pendingProposal) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Olá, {pendingProposal.customerName.split(' ')[0]}
        </h2>
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white shadow-sm">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 text-lg">Proposta em Validação</h3>
                <p className="text-sm text-amber-700/80 mt-1 max-w-md leading-relaxed">
                  Sua solicitação de crédito no valor de {formatCurrency(pendingProposal.amount)}{' '}
                  está sob revisão do nosso comitê. Em breve atualizaremos este painel.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-300 text-amber-700 bg-white px-3 py-1 font-medium shadow-sm"
            >
              Em Processamento
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  const paidInst = installments.filter((i) => i.status === 'Pago').length
  const progressPercent = (paidInst / activeLoan.installments) * 100

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-1">
          Painel do Contrato
        </h2>
        <p className="text-slate-500">Módulo de visualização e emissão de cobranças</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              Saldo Devedor Projetado
            </CardTitle>
            <Info className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {formatCurrency(activeLoan.totalAmount - paidInst * installments[0].amount)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Valor Total: {formatCurrency(activeLoan.totalAmount)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50/30 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Próxima Obrigação
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
                new Date(activeLoan.nextPaymentDate),
              )}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Boleto Registrado: {formatCurrency(installments[1].amount)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Adimplência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {paidInst}{' '}
              <span className="text-lg font-normal text-slate-400">
                / {activeLoan.installments} pacelas
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="mt-3 h-2 bg-slate-100 [&>div]:bg-emerald-500"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle>Composição de Parcelas</CardTitle>
          <CardDescription>
            Acompanhe o cronograma e faça o download de guias atualizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white">
                <TableHead className="pl-6 font-semibold">Cota</TableHead>
                <TableHead className="font-semibold">Vencimento Original</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Status de Quitação</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Emissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((inst) => (
                <TableRow key={inst.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-medium text-slate-700 pl-6">
                    {inst.number} / {activeLoan.installments}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Intl.DateTimeFormat('pt-BR').format(new Date(inst.dueDate))}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {formatCurrency(inst.amount)}
                  </TableCell>
                  <TableCell>
                    {inst.status === 'Pago' && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-none px-2">
                        <CheckCircle2 className="w-3 h-3 mr-1.5" /> Liquidada
                      </Badge>
                    )}
                    {inst.status === 'Pendente' && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-2">
                        <Clock className="w-3 h-3 mr-1.5" /> Em Aberto
                      </Badge>
                    )}
                    {inst.status === 'Atrasado' && (
                      <Badge
                        variant="destructive"
                        className="bg-red-100 text-red-800 border-none px-2"
                      >
                        <AlertCircle className="w-3 h-3 mr-1.5" /> Inadimplente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={inst.status === 'Pago'}
                      onClick={() =>
                        toast({
                          title: 'Emissão de Guia',
                          description: `Boleto atualizado da cota ${inst.number} gerado.`,
                        })
                      }
                      className="bg-white shadow-sm border-slate-200"
                    >
                      <Download className="w-4 h-4 mr-2 text-slate-500" /> Baixar PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
