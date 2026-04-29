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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import useRealtime from '@/hooks/use-realtime'
import { Download } from 'lucide-react'

export default function AdminReports() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])

  const [openExpense, setOpenExpense] = useState(false)
  const [openSupplier, setOpenSupplier] = useState(false)

  const [expenseForm, setExpenseForm] = useState({
    supplier_id: '',
    amount: '',
    date: '',
    description: '',
  })
  const [supplierForm, setSupplierForm] = useState({ name: '', tax_id: '', category: '' })
  const [file, setFile] = useState<File | null>(null)

  const { toast } = useToast()

  const loadExpenses = async () => setExpenses(await api.expenses.list())
  const loadSuppliers = async () => setSuppliers(await api.suppliers.list())

  useEffect(() => {
    loadExpenses()
    loadSuppliers()
  }, [])
  useRealtime('expenses', loadExpenses)
  useRealtime('suppliers', loadSuppliers)

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('supplier_id', expenseForm.supplier_id)
      fd.append('amount', expenseForm.amount)
      fd.append('date', expenseForm.date)
      fd.append('description', expenseForm.description)
      if (file) fd.append('invoice', file)

      await api.expenses.create(fd)
      await api.audit.create('Contabilidade', `Despesa gerencial registrada`)
      setOpenExpense(false)
      setExpenseForm({ supplier_id: '', amount: '', date: '', description: '' })
      setFile(null)
      toast({ title: 'Despesa Salva', description: 'Registro contabilizado com sucesso.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao inserir despesa.', variant: 'destructive' })
    }
  }

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.suppliers.create(supplierForm)
      setOpenSupplier(false)
      setSupplierForm({ name: '', tax_id: '', category: '' })
      toast({ title: 'Fornecedor Salvo', description: 'Fornecedor cadastrado.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao inserir fornecedor.', variant: 'destructive' })
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const today = new Date().toISOString().split('T')[0]
  const currentMonth = today.substring(0, 7)

  const dailyExpenses = expenses
    .filter((e) => e.date.startsWith(today))
    .reduce((a, c) => a + c.amount, 0)
  const monthlyExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((a, c) => a + c.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Contabilidade ERP</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium">Saídas (Hoje)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(dailyExpenses)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium">Saídas (Mês Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="expenses">Lançamentos de Despesas</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Contas a Pagar</CardTitle>
                <CardDescription>Consolidação de despesas e comprovações de caixa.</CardDescription>
              </div>
              <Button
                onClick={() => setOpenExpense(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                + Registrar Despesa
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="pl-6 font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Fornecedor</TableHead>
                    <TableHead className="font-semibold">Descrição</TableHead>
                    <TableHead className="font-semibold">Montante</TableHead>
                    <TableHead className="text-right pr-6 font-semibold">Comprovante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                        Nenhum lançamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="pl-6 text-slate-600">
                          {new Date(e.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">
                          {e.expand?.supplier_id?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-600">{e.description || '-'}</TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {formatCurrency(e.amount)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {e.invoice ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600"
                              onClick={() => window.open(pb.files.getURL(e, e.invoice), '_blank')}
                            >
                              <Download className="w-3.5 h-3.5 mr-1" /> NF-e
                            </Button>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestão de Fornecedores</CardTitle>
                <CardDescription>Empresas prestadoras de serviços.</CardDescription>
              </div>
              <Button
                onClick={() => setOpenSupplier(true)}
                className="bg-slate-900 text-white shadow-sm"
              >
                + Novo Fornecedor
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="pl-6 font-semibold">Nome / Razão Social</TableHead>
                    <TableHead className="font-semibold">CNPJ/CPF</TableHead>
                    <TableHead className="font-semibold">Categoria</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-6 font-medium">{s.name}</TableCell>
                      <TableCell>{s.tax_id}</TableCell>
                      <TableCell>{s.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={openExpense} onOpenChange={setOpenExpense}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Lançamento de Despesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-5 pt-3">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select
                value={expenseForm.supplier_id}
                onValueChange={(v) => setExpenseForm({ ...expenseForm, supplier_id: v })}
                required
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
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
            <DialogFooter>
              <Button type="submit" className="w-full">
                Salvar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openSupplier} onOpenChange={setOpenSupplier}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Novo Fornecedor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSupplierSubmit} className="space-y-5 pt-3">
            <div className="space-y-2">
              <Label>Nome / Razão Social</Label>
              <Input
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                required
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ / CPF</Label>
              <Input
                value={supplierForm.tax_id}
                onChange={(e) => setSupplierForm({ ...supplierForm, tax_id: e.target.value })}
                required
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={supplierForm.category}
                onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                className="bg-slate-50"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
