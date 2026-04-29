import useMainStore from '@/stores/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function AdminProposals() {
  const { proposals } = useMainStore()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Fila de Propostas</h2>
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle>Todas as Propostas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white">
                <TableHead className="pl-6 font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-medium text-slate-700 pl-6">{p.id}</TableCell>
                  <TableCell className="text-slate-600">{p.customerName}</TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {formatCurrency(p.amount)}
                  </TableCell>
                  <TableCell>
                    {p.status === 'Em Análise' && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-2">
                        {p.status}
                      </Badge>
                    )}
                    {p.status === 'Pendente' && (
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 px-2">
                        {p.status}
                      </Badge>
                    )}
                    {p.status === 'Aprovado' && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-2">
                        {p.status}
                      </Badge>
                    )}
                    {p.status === 'Reprovado' && (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 px-2">
                        {p.status}
                      </Badge>
                    )}
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
