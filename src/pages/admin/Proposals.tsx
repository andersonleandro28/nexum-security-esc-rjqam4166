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
import { api } from '@/services/api'
import useRealtime from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Edit, UploadCloud } from 'lucide-react'

export default function AdminProposals() {
  const [proposals, setProposals] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [boletoOpen, setBoletoOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const data = await api.proposals.list()
    setProposals(data)
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
      toast({
        title: 'Alteração Concluída',
        description: 'Registro de CCB atualizado com sucesso.',
      })
    } catch (err) {
      toast({
        title: 'Erro de Edição',
        description: 'Ocorreu uma falha ao modificar a operação.',
        variant: 'destructive',
      })
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
      toast({
        title: 'Documento Anexado',
        description: 'O boleto já está disponível no painel do cliente.',
      })
    } catch (err) {
      toast({
        title: 'Falha no Upload',
        description: 'Não foi possível salvar o arquivo.',
        variant: 'destructive',
      })
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Fila de Operações (CCBs)</h2>
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle>Histórico e Gestão de Contratos</CardTitle>
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
                        ['Liquidado'].includes(p.status)
                          ? 'bg-emerald-100 text-emerald-800 border-none'
                          : ['Em Aberto/Ativo', 'Pronto para Desembolso'].includes(p.status)
                            ? 'bg-blue-100 text-blue-800 border-none'
                            : ['Em Análise de Crédito'].includes(p.status)
                              ? 'bg-amber-100 text-amber-800 border-none'
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
                          setSelected({ ...p, operation_date: p.operation_date.split('T')[0] })
                          setEditOpen(true)
                        }}
                        className="shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelected(p)
                          setBoletoOpen(true)
                        }}
                        className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1" /> Boleto
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        className="shadow-sm"
                      >
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edição Retroativa da Operação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-5 pt-3">
            <div className="space-y-2">
              <Label>Data de Emissão (Retroativo)</Label>
              <Input
                type="date"
                value={selected?.operation_date || ''}
                onChange={(e) => setSelected({ ...selected, operation_date: e.target.value })}
                required
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Status Atual</Label>
              <Select
                value={selected?.status || ''}
                onValueChange={(v) => setSelected({ ...selected, status: v })}
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aguardando Documentos">Aguardando Documentos</SelectItem>
                  <SelectItem value="Em Análise de Crédito">Em Análise de Crédito</SelectItem>
                  <SelectItem value="Aguardando Assinatura">Aguardando Assinatura</SelectItem>
                  <SelectItem value="Pronto para Desembolso">Pronto para Desembolso</SelectItem>
                  <SelectItem value="Em Aberto/Ativo">Em Aberto/Ativo</SelectItem>
                  <SelectItem value="Liquidado">Liquidado</SelectItem>
                  <SelectItem value="Pendente">Pendente (Legado)</SelectItem>
                  <SelectItem value="Assinado">Assinado (Legado)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full">
                Aplicar Ajustes no Livro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={boletoOpen} onOpenChange={setBoletoOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Anexar Cobrança (Boleto)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadBoleto} className="space-y-5 pt-3">
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-slate-50 relative hover:bg-slate-100 transition-colors">
              <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">Selecione o arquivo PDF</p>
              <Input
                type="file"
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              {file && (
                <p className="text-xs text-emerald-600 mt-2 font-semibold truncate px-2">
                  {file.name}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-slate-900 text-white">
                Publicar no Portal do Cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
