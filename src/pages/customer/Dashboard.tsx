import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import useRealtime from '@/hooks/use-realtime'
import { Download, Clock, TrendingUp } from 'lucide-react'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [client, setClient] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [boletos, setBoletos] = useState<any[]>([])

  const loadData = async () => {
    if (!user) return
    const c = await api.clients.getByUserId(user.id)
    if (c) {
      setClient(c)
      const props = await pb
        .collection('proposals')
        .getFullList({ filter: `client_id="${c.id}"`, sort: '-created' })
      setProposals(props)
      if (props.length > 0) {
        const bols = await api.boletos.listByProposal(props[0].id)
        setBoletos(bols)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('proposals', () => {
    loadData()
  })
  useRealtime('boletos', () => {
    loadData()
  })

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  if (!proposals.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in max-w-lg mx-auto">
        <div className="bg-slate-100 p-6 rounded-full mb-6 ring-8 ring-slate-50">
          <TrendingUp className="h-12 w-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Nenhuma operação ativa</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Você ainda não possui Cédulas de Crédito vinculadas. Realize uma nova simulação 100%
          digital em nosso portal.
        </p>
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
          onClick={() => (window.location.href = '/onboarding')}
        >
          Nova Simulação de Crédito
        </Button>
      </div>
    )
  }

  const active = proposals[0]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-1">
          Central do Tomador
        </h2>
        <p className="text-slate-500">Gestão documental para {client?.name}</p>
      </div>

      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white shadow-sm">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-amber-100 rounded-full">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 text-lg">
                Contrato Vigente ({active.calculation_type})
              </h3>
              <p className="text-sm text-amber-700/80 mt-1 max-w-md leading-relaxed font-medium">
                Principal: {formatCurrency(active.amount)} &middot; Em {active.installments}{' '}
                parcelas mensais.
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-amber-300 text-amber-700 bg-white px-4 py-1.5 font-bold shadow-sm text-sm"
          >
            Status: {active.status}
          </Badge>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle>Central de Guias e Boletos</CardTitle>
          <CardDescription>
            Acesse facilmente suas guias de recolhimento atualizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="pl-6 font-semibold">Data da Geração</TableHead>
                <TableHead className="font-semibold">Descrição do Título</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Arquivo Original</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boletos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                    As guias serão disponibilizadas aqui em breve.
                  </TableCell>
                </TableRow>
              ) : (
                boletos.map((b) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="pl-6 font-medium text-slate-600">
                      {new Date(b.created).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-slate-800">
                      {b.description || 'Boleto Eletrônico (Ficha de Compensação)'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="shadow-sm bg-white hover:bg-slate-100"
                        onClick={() => window.open(pb.files.getURL(b, b.file), '_blank')}
                      >
                        <Download className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Transferir PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
