import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, UploadCloud, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import pb from '@/lib/pocketbase/client'

export default function Onboarding() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    type: 'PJ',
    name: '',
    document: '',
    email: '',
    phone: '',
    bank: '',
    password: '',
    hasGuarantor: false,
    amount: '15000',
    installments: '12',
    calcType: 'Price',
    purpose: '',
  })

  const [simRes, setSimRes] = useState<any>(null)
  const [docFile, setDocFile] = useState<File | null>(null)

  const handleSimulate = () => {
    const amt = Number(formData.amount)
    const inst = Number(formData.installments)
    const r = 0.02 // 2% fixed base rate mock
    const iof = amt * 0.03 // 3% IOF Mock
    const total = amt + iof
    const pmt =
      formData.calcType === 'Price'
        ? (total * r * Math.pow(1 + r, inst)) / (Math.pow(1 + r, inst) - 1)
        : total / inst + total * r

    setSimRes({ iof, total, pmt, cet: 32.5 })
    setStep(3)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await pb.collection('users').create({
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.password,
        name: formData.name,
        role: 'client',
      })
      await pb.collection('users').authWithPassword(formData.email, formData.password)

      const client = await api.clients.create({
        user_id: pb.authStore.record?.id,
        type: formData.type,
        name: formData.name,
        document: formData.document,
        email: formData.email,
        phone: formData.phone,
        bank_number: formData.bank,
      })

      if (docFile) {
        const fd = new FormData()
        fd.append('client_id', client.id)
        fd.append('document_type', 'Identity')
        fd.append('file', docFile)
        await api.documents.create(fd)
      }

      const mockScore = Math.floor(Math.random() * 500) + 450
      await api.proposals.create({
        client_id: client.id,
        amount: Number(formData.amount),
        installments: Number(formData.installments),
        interest_rate: 2.0,
        calculation_type: formData.calcType,
        status: 'Aguardando Documentos',
        operation_date: new Date().toISOString(),
        score: mockScore,
        iof: simRes?.iof || 0,
        cet: simRes?.cet || 0,
        signature_hash: crypto.randomUUID(),
        purpose: formData.purpose,
      })

      toast({ title: 'Sucesso!', description: 'Proposta assinada digitalmente e submetida.' })
      navigate('/customer/dashboard')
    } catch (err: any) {
      setIsSubmitting(false)
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao processar operação.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container max-w-3xl py-12 px-4">
      <div className="mb-8 flex justify-between items-center">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= i ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-400'}`}
          >
            <span className="font-bold">{i}</span>
          </div>
        ))}
      </div>

      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-slate-50/50 border-b pb-6">
          <CardTitle>
            {step === 1 && 'Cadastro e KYC'}
            {step === 2 && 'Simulador de Crédito'}
            {step === 3 && 'Documentação e Garantias'}
            {step === 4 && 'Análise e Assinatura Sandbox'}
          </CardTitle>
          <CardDescription>Preencha os detalhes para submeter a operação digital.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Tipo de Pessoa</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome Completo / Razão Social</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF / CNPJ</Label>
                <Input
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail Corporativo</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Senha para o Portal</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Banco (Código de Compensação)</Label>
                <Input
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  checked={formData.hasGuarantor}
                  onCheckedChange={(c) => setFormData({ ...formData, hasGuarantor: c })}
                />
                <Label>Apresentar Avalista Solidário?</Label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Valor Solicitado (R$)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prazo (Meses)</Label>
                <Input
                  type="number"
                  value={formData.installments}
                  onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Método de Amortização</Label>
                <Select
                  value={formData.calcType}
                  onValueChange={(v) => setFormData({ ...formData, calcType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Price">Tabela Price</SelectItem>
                    <SelectItem value="SAC">Sistema SAC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Finalidade da Operação</Label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              {simRes && (
                <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
                  <h4 className="font-semibold text-emerald-900 mb-3">
                    Memória de Cálculo ({formData.calcType})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-emerald-800">
                    <p>
                      Parcela Inicial: <strong>R$ {simRes.pmt.toFixed(2)}</strong>
                    </p>
                    <p>
                      IOF Retido: <strong>R$ {simRes.iof.toFixed(2)}</strong>
                    </p>
                    <p>
                      Valor Financiado: <strong>R$ {simRes.total.toFixed(2)}</strong>
                    </p>
                    <p>
                      Custo Efetivo Total (CET): <strong>{simRes.cet}% a.a.</strong>
                    </p>
                  </div>
                </div>
              )}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 relative hover:bg-slate-100 transition-colors">
                <UploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">
                  Envie seu Documento Principal (RG/CNH/Contrato)
                </p>
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                />
                {docFile && (
                  <p className="text-xs text-emerald-600 mt-3 bg-emerald-100/50 inline-block px-3 py-1 rounded-full">
                    {docFile.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 bg-slate-50 p-6 rounded-lg animate-fade-in">
              <h4 className="font-bold text-slate-800">Assinatura Eletrônica e Conclusão</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Este ambiente é integrado em Sandbox. O sistema irá registrar uma pontuação de
                crédito Serasa fictícia e aplicar uma assinatura digital de conformidade
                automaticamente usando nossa rotina de testes.
              </p>
              <div className="flex items-center gap-2 mt-4 text-emerald-600 bg-emerald-50 p-3 rounded border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />{' '}
                <span className="font-medium text-sm">Operação pronta para emissão da CCB</span>
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-6 border-t bg-slate-50/50 flex justify-between rounded-b-xl">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          {step === 1 && (
            <Button onClick={() => setStep(2)}>
              Avançar Simulação <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleSimulate}>
              Calcular e Avançar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {step === 3 && (
            <Button onClick={() => setStep(4)}>
              Revisar Sandbox <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Finalizando...' : 'Assinar Digitalmente'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
