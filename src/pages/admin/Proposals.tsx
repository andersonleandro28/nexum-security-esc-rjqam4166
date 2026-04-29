import { useEffect, useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/services/api'
import useRealtime from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Edit, UploadCloud, FileText, Eye } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function AdminProposals() {
  const [proposals, setProposals] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [boletoOpen, setBoletoOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const [createForm, setCreateForm] = useState({
    client_id: '',
    amount: '',
    installments: '',
    issuance_fee: '',
    iof: '',
    manual_created_at: '',
    status: 'Em Aberto/Ativo',
    purpose: '',
    grace_period_date: '',
    cet_monthly: '',
    cet_yearly: '',
    drawee_name: '',
    drawee_cpf: '',
    drawee_email: '',
    drawee_phone: '',
  })

  const { toast } = useToast()

  const loadData = async () => {
    const data = await api.proposals.list()
    setProposals(data)
    try {
      const clientsData = await pb.collection('clients').getFullList({ sort: 'name' })
      setClients(clientsData)
    } catch {
      /* intentionally ignored */
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta CCB e todos os registros associados?')) return
    try {
      await api.proposals.delete(id)
      await api.audit.create('Exclusão de CCB', `CCB ${id} removida do sistema.`)
      toast({ title: 'Excluído', description: 'CCB removida com sucesso.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao remover CCB.', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('proposals', () => {
    loadData()
  })

  const handleCreateLegacy = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        client_id: createForm.client_id,
        amount: Number(createForm.amount),
        installments: Number(createForm.installments),
        interest_rate: 2.0,
        calculation_type: 'Price',
        status: createForm.status,
        operation_date: createForm.manual_created_at
          ? createForm.manual_created_at + 'T12:00:00.000Z'
          : new Date().toISOString(),
        manual_created_at: createForm.manual_created_at
          ? createForm.manual_created_at + 'T12:00:00.000Z'
          : new Date().toISOString(),
        issuance_fee: Number(createForm.issuance_fee || 0),
        total_iof: Number(createForm.iof || 0),
        iof: Number(createForm.iof || 0),
        purpose: createForm.purpose,
        grace_period_date: createForm.grace_period_date
          ? createForm.grace_period_date + 'T12:00:00.000Z'
          : '',
        cet_monthly: Number(createForm.cet_monthly || 0),
        cet_yearly: Number(createForm.cet_yearly || 0),
        drawee_name: createForm.drawee_name,
        drawee_cpf: createForm.drawee_cpf,
        drawee_email: createForm.drawee_email,
        drawee_phone: createForm.drawee_phone,
      }

      const p = await api.proposals.create(payload)

      let bal = Number(createForm.amount)
      const pmt = bal / Number(createForm.installments)
      const date = new Date(createForm.manual_created_at || new Date())
      for (let i = 1; i <= Number(createForm.installments); i++) {
        date.setMonth(date.getMonth() + 1)
        await api.installments.create({
          proposal_id: p.id,
          number: i,
          due_date: date.toISOString(),
          amount: pmt,
          status: createForm.status === 'Liquidado' ? 'Pago' : 'Pendente',
          principal_amount: pmt * 0.8,
          interest_amount: pmt * 0.2,
        })
      }

      await api.audit.create('Criação Legado', `CCB ${p.id} inserida manualmente.`)
      setCreateOpen(false)
      toast({ title: 'Sucesso', description: 'Operação legado registrada.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao registrar.', variant: 'destructive' })
    }
  }

  const handleGenerateCCB = async (p: any) => {
    try {
      const partners = await api.partners.listByClient(p.expand?.client_id?.id || p.client_id)
      const partnersText = partners.map((pt: any) => `${pt.name} (CPF: ${pt.cpf})`).join(', ')
      const text = `CÉDULA DE CRÉDITO BANCÁRIO (CCB)\n\nTomador: ${p.expand?.client_id?.name}\nCNPJ/CPF: ${p.expand?.client_id?.document}\nSócios Solidários: ${partnersText || 'N/A'}\n\nDETALHAMENTO FINANCEIRO:\nValor Principal: R$ ${p.amount}\nParcelas: ${p.installments}\nTaxa de Juros: ${p.interest_rate}%\nIOF: R$ ${p.iof || 0}\nCET (Mensal): ${p.cet_monthly || 0}%\nCET (Anual): ${p.cet_yearly || 0}%\n\nSACADO / BENEFICIÁRIO:\nNome: ${p.drawee_name || 'N/A'}\nCPF/CNPJ: ${p.drawee_cpf || 'N/A'}\n\nEmissão: ${new Date().toISOString()}\nHash Assinatura: ${crypto.randomUUID()}`

      const blob = new Blob([text], { type: 'application/pdf' })
      const fd = new FormData()
      fd.append('ccb_file', blob, `ccb_${p.id}.pdf`)
      await pb.collection('proposals').update(p.id, fd)
      await api.audit.create('Gerar CCB', `CCB gerada para proposta ${p.id}`)
      toast({ title: 'Sucesso', description: 'CCB gerada e salva com sucesso.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao gerar CCB.', variant: 'destructive' })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    try {
      await api.proposals.update(selected.id, {
        status: selected.status,
        operation_date: selected.operation_date,
        amount: Number(selected.amount),
      })
      await api.audit.create('Edição de CCB', `CCB ${selected.id} modificada retroativamente.`)
      setEditOpen(false)
      toast({ title: 'Alteração Concluída', description: 'Registro atualizado.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao modificar.', variant: 'destructive' })
    }
  }

  const handleUploadBoleto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !file) return
    try {
      const fd = new FormData()
      fd.append('proposal_id', selected.id)
      fd.append('file', file)
      fd.append('description', 'Boleto Eletrônico Atualizado')
      await api.boletos.create(fd)
      await api.audit.create('Emissão de Boleto', `Documento anexado na CCB ${selected.id}`)
      setBoletoOpen(false)
      setFile(null)
      toast({ title: 'Documento Anexado', description: 'Boleto publicado.' })
    } catch (err) {
      toast({ title: 'Falha', description: 'Não foi possível salvar.', variant: 'destructive' })
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Fila de Operações (CCBs)</h2>
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle>Histórico e Gestão de Contratos</CardTitle>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-slate-900 text-white shadow-sm hover:bg-slate-800"
          >
            + Nova Operação (Legado)
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="pl-6 font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Tomador</TableHead>
                <TableHead className="font-semibold">Principal</TableHead>
                <TableHead className="font-semibold">Situação</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="pl-6 text-slate-600 font-medium">
                    {new Date(p.operation_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-slate-800">
                    {p.expand?.client_id?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    {formatCurrency(p.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        p.status === 'Liquidado'
                          ? 'bg-emerald-100 text-emerald-800 border-none'
                          : ['Em Aberto/Ativo', 'Pronto para Desembolso'].includes(p.status)
                            ? 'bg-blue-100 text-blue-800 border-none'
                            : p.status === 'Inadimplente'
                              ? 'bg-red-100 text-red-800 border-none'
                              : 'bg-slate-100 text-slate-800 border-none'
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(p)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected({ ...p, operation_date: p.operation_date.split('T')[0] })
                          setEditOpen(true)
                        }}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGenerateCCB(p)}
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        <FileText className="w-3.5 h-3.5" /> CCB
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelected(p)
                          setBoletoOpen(true)
                        }}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1" /> Boleto
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edição Retroativa da Operação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label>Data de Emissão (Retroativo)</Label>
              <Input
                type="date"
                value={selected?.operation_date || ''}
                onChange={(e) => setSelected({ ...selected, operation_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status Atual</Label>
              <Select
                value={selected?.status || ''}
                onValueChange={(v) => setSelected({ ...selected, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aguardando Documentos">Aguardando Documentos</SelectItem>
                  <SelectItem value="Em Análise de Crédito">Em Análise de Crédito</SelectItem>
                  <SelectItem value="Pronto para Desembolso">Pronto para Desembolso</SelectItem>
                  <SelectItem value="Em Aberto/Ativo">Em Aberto/Ativo</SelectItem>
                  <SelectItem value="Liquidado">Liquidado</SelectItem>
                  <SelectItem value="Inadimplente">Inadimplente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Aplicar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Visão 360 - Operação</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-slate-500">Tomador</Label>
                  <p className="font-semibold">{selected?.expand?.client_id?.name}</p>
                </div>
                <div>
                  <Label className="text-slate-500">CNPJ</Label>
                  <p className="font-semibold">{selected?.expand?.client_id?.document}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Status</Label>
                  <p className="font-semibold">{selected?.status}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Finalidade</Label>
                  <p className="font-semibold">{selected?.purpose || 'N/A'}</p>
                </div>
              </div>
              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-slate-500">Principal</Label>
                  <p className="font-semibold">{formatCurrency(selected?.amount)}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Parcelas</Label>
                  <p className="font-semibold">{selected?.installments}x</p>
                </div>
                <div>
                  <Label className="text-slate-500">Taxa Juros</Label>
                  <p className="font-semibold">{selected?.interest_rate}%</p>
                </div>
                <div>
                  <Label className="text-slate-500">IOF</Label>
                  <p className="font-semibold">{formatCurrency(selected?.iof)}</p>
                </div>
                <div>
                  <Label className="text-slate-500">CET (Mensal)</Label>
                  <p className="font-semibold">{selected?.cet_monthly || 0}%</p>
                </div>
                <div>
                  <Label className="text-slate-500">CET (Anual)</Label>
                  <p className="font-semibold">{selected?.cet_yearly || 0}%</p>
                </div>
                <div>
                  <Label className="text-slate-500">Carência</Label>
                  <p className="font-semibold">
                    {selected?.grace_period_date
                      ? new Date(selected.grace_period_date).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2 font-semibold text-slate-800">
                  Dados do Sacado (Beneficiário)
                </div>
                <div>
                  <Label className="text-slate-500">Nome</Label>
                  <p className="font-semibold">{selected?.drawee_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-slate-500">CPF/CNPJ</Label>
                  <p className="font-semibold">{selected?.drawee_cpf || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-slate-500">E-mail</Label>
                  <p className="font-semibold">{selected?.drawee_email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Telefone</Label>
                  <p className="font-semibold">{selected?.drawee_phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Boleto Modal */}
      <Dialog open={boletoOpen} onOpenChange={setBoletoOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Anexar Cobrança</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadBoleto} className="space-y-4 pt-3">
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-slate-50 relative hover:bg-slate-100">
              <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">Selecione o PDF</p>
              <Input
                type="file"
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Publicar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Nova Operação (Legado)</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleCreateLegacy} className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={createForm.client_id}
                  onValueChange={(v) => setCreateForm({ ...createForm, client_id: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parcelas</Label>
                  <Input
                    type="number"
                    value={createForm.installments}
                    onChange={(e) => setCreateForm({ ...createForm, installments: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa (R$)</Label>
                  <Input
                    type="number"
                    value={createForm.issuance_fee}
                    onChange={(e) => setCreateForm({ ...createForm, issuance_fee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IOF (R$)</Label>
                  <Input
                    type="number"
                    value={createForm.iof}
                    onChange={(e) => setCreateForm({ ...createForm, iof: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CET Mensal (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={createForm.cet_monthly}
                    onChange={(e) => setCreateForm({ ...createForm, cet_monthly: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CET Anual (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={createForm.cet_yearly}
                    onChange={(e) => setCreateForm({ ...createForm, cet_yearly: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emissão (Retroativo)</Label>
                  <Input
                    type="date"
                    value={createForm.manual_created_at}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, manual_created_at: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carência</Label>
                  <Input
                    type="date"
                    value={createForm.grace_period_date}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, grace_period_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <h4 className="font-semibold text-slate-800 pt-2 border-t">
                Dados do Sacado (Opcional)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome/Razão</Label>
                  <Input
                    value={createForm.drawee_name}
                    onChange={(e) => setCreateForm({ ...createForm, drawee_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF/CNPJ</Label>
                  <Input
                    value={createForm.drawee_cpf}
                    onChange={(e) => setCreateForm({ ...createForm, drawee_cpf: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={createForm.drawee_email}
                    onChange={(e) => setCreateForm({ ...createForm, drawee_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={createForm.drawee_phone}
                    onChange={(e) => setCreateForm({ ...createForm, drawee_phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">
                  Salvar Operação
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
