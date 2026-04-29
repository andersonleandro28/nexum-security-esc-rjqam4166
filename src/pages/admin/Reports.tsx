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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import useRealtime from '@/hooks/use-realtime'
import { FileText, Download } from 'lucide-react'

export default function AdminReports() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ supplier: '', amount: '', date: '' })
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const load = async () => {
    const data = await api.expenses.list()
    setExpenses(data)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('expenses', () => {
    load()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('supplier', form.supplier)
      fd.append('amount', form.amount)
      fd.append('date', form.date)
      if (file) fd.append('invoice', file)

      await api.expenses.create(fd)
      await api.audit.create('Contabilidade', `Despesa gerencial registrada: ${form.supplier}`)
      setOpen(false)
      setForm({ supplier: '', amount: '', date: '' })
      setFile(null)
      toast({
        title: 'Despesa Salva',
        description: 'Registro contabilizado com sucesso no sistema.',
      })
    } catch (error) {
      toast({
        title: 'Erro de Gravação',
        description: 'Houve uma falha ao inserir a despesa.',
        variant: 'destructive',
      })
    }
  }

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Contabilidade e Despesas
        </h2>
        <Button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          + Registrar Lançamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium">
              Acumulado em Despesas Administrativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle>Histórico de Contas a Pagar</CardTitle>
          <CardDescription>Consolidação de fornecedores e comprovações de caixa.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="pl-6 font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Credor / Fornecedor</TableHead>
                <TableHead className="font-semibold">Montante</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Comprovante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                    Nenhum lançamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="pl-6 text-slate-600">
                      {new Date(e.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{e.supplier}</TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {formatCurrency(e.amount)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {e.invoice ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => window.open(pb.files.getURL(e, e.invoice), '_blank')}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> NF-e
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Lançamento de Despesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-3">
            <div className="space-y-2">
              <Label>Nome do Credor ou Fornecedor</Label>
              <Input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                required
                className="bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor do Pagamento</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Competência</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="bg-slate-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comprovante ou NF-e</Label>
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-slate-50"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full">
                Gravar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
