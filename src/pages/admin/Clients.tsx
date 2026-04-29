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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Eye } from 'lucide-react'

export default function AdminClients() {
  const [clients, setClients] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [docs, setDocs] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const { toast } = useToast()

  const loadClients = async () => {
    const res = await api.clients.list()
    setClients(res)
  }

  const loadDetails = async (client: any) => {
    setSelected(client)
    const p = await api.partners.listByClient(client.id)
    setPartners(p)
    const d = await api.documents.listByClient(client.id)
    setDocs(d)
  }

  useEffect(() => {
    loadClients()
  }, [])

  const updateClientStatus = async (status: string) => {
    if (!selected) return
    await api.clients.update(selected.id, { status })
    await api.audit.create(
      'KYC Cliente',
      `Status do cliente ${selected.name} alterado para ${status}`,
    )
    toast({ title: 'Status Atualizado', description: `Cliente marcado como ${status}` })
    loadClients()
    setSelected({ ...selected, status })
  }

  const updateDocStatus = async (docId: string, status: string, reason = '') => {
    await api.documents.update(docId, { status, rejection_reason: reason })
    toast({ title: 'Documento Avaliado', description: `O documento foi marcado como ${status}` })
    const d = await api.documents.listByClient(selected.id)
    setDocs(d)
  }

  const handleUpdateField = async (field: string, val: string) => {
    await api.clients.update(selected.id, { [field]: val })
    await api.audit.create('Edição Manual', `Campo ${field} de ${selected.name} alterado.`)
    setSelected({ ...selected, [field]: val })
    loadClients()
    toast({ title: 'Campo Atualizado' })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">KYC & Gestão de Clientes B2B</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Faturamento</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-6 font-medium">{c.name}</TableCell>
                  <TableCell>{c.document}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={c.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-700' : ''}
                    >
                      {c.status || 'Novo'}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {c.billing?.toLocaleString('pt-BR') || 0}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="outline" size="sm" onClick={() => loadDetails(c)}>
                      <Eye className="w-4 h-4 mr-2" /> Analisar 360
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Análise 360 - {selected?.name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="dados" className="flex-1 overflow-auto">
            <TabsList>
              <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
              <TabsTrigger value="socios">Quadro Societário</TabsTrigger>
              <TabsTrigger value="docs">Documentos (KYC)</TabsTrigger>
              <TabsTrigger value="decisao">Decisão Final</TabsTrigger>
            </TabsList>
            <TabsContent value="dados" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Razão Social</Label>
                  <Input
                    value={selected?.name}
                    onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                    onBlur={(e) => handleUpdateField('name', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>CNPJ</Label>
                  <Input
                    value={selected?.document}
                    onChange={(e) => setSelected({ ...selected, document: e.target.value })}
                    onBlur={(e) => handleUpdateField('document', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Inscrição Estadual</Label>
                  <Input
                    value={selected?.state_registration}
                    onChange={(e) =>
                      setSelected({ ...selected, state_registration: e.target.value })
                    }
                    onBlur={(e) => handleUpdateField('state_registration', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Faturamento</Label>
                  <Input
                    value={selected?.billing}
                    onChange={(e) => setSelected({ ...selected, billing: e.target.value })}
                    onBlur={(e) => handleUpdateField('billing', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Chave Pix</Label>
                  <Input
                    value={selected?.pix_key || ''}
                    onChange={(e) => setSelected({ ...selected, pix_key: e.target.value })}
                    onBlur={(e) => handleUpdateField('pix_key', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="socios" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>% Part</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.cpf}</TableCell>
                      <TableCell>{p.phone || '-'}</TableCell>
                      <TableCell>{p.equity_percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="docs" className="pt-4 space-y-4">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-semibold text-sm">{d.document_type}</p>
                    <Badge
                      variant={
                        d.status === 'Aprovado'
                          ? 'default'
                          : d.status === 'Rejeitado'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {d.status || 'Pendente'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(pb.files.getURL(d, d.file), '_blank')}
                    >
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600"
                      onClick={() => updateDocStatus(d.id, 'Aprovado')}
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Motivo da rejeição:')
                        if (reason !== null) updateDocStatus(d.id, 'Rejeitado', reason)
                      }}
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="decisao" className="pt-4 space-y-4">
              <div className="p-4 bg-slate-50 border rounded-lg">
                <h4 className="font-semibold mb-2">Decisão de Conformidade (KYC)</h4>
                <p className="text-sm text-slate-500 mb-4">
                  Após analisar os dados, parceiros e documentos, emita seu parecer final.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => updateClientStatus('Aprovado')}
                    className="bg-emerald-600 w-full hover:bg-emerald-700"
                  >
                    Aprovar Cliente
                  </Button>
                  <Button
                    onClick={() => updateClientStatus('Rejeitado')}
                    variant="destructive"
                    className="w-full"
                  >
                    Rejeitar Cadastro
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
