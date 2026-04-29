import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, UploadCloud, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import useMainStore from '@/stores/main'
import { useToast } from '@/hooks/use-toast'

export default function Onboarding() {
  const navigate = useNavigate()
  const { setRole, setProposals, addAuditLog } = useMainStore()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    amount: '15000',
    installments: '12',
    purpose: '',
  })

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      const newProposal = {
        id: `PROP-${Math.floor(Math.random() * 10000)}`,
        userId: `usr-${Date.now()}`,
        customerName: formData.name || 'Novo Cliente',
        cpf: formData.cpf || '000.000.000-00',
        amount: Number(formData.amount),
        installments: Number(formData.installments),
        purpose: formData.purpose || 'Capital de Giro',
        status: 'Em Análise' as const,
        score: Math.floor(Math.random() * 400) + 400,
        createdAt: new Date().toISOString(),
      }
      setProposals((prev) => [newProposal, ...prev])
      setRole('customer')
      addAuditLog(
        'Nova Proposta',
        formData.name || 'Cliente',
        `Solicitação submetida: R$ ${newProposal.amount}`,
      )
      toast({
        title: 'Proposta Enviada com Sucesso!',
        description: 'Sua solicitação está sob análise da nossa mesa de operações.',
      })
      navigate('/customer/dashboard')
    }, 2000)
  }

  return (
    <div className="container max-w-3xl py-12 px-4">
      <div className="mb-10 animate-fade-in">
        <div className="flex justify-between items-center relative px-2">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2" />
          <div
            className="absolute left-0 top-1/2 h-1 bg-emerald-500 -z-10 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white transition-colors duration-300 ${step >= i ? 'border-emerald-500 text-emerald-500 shadow-sm' : 'border-slate-300 text-slate-400'}`}
            >
              {step > i ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <span className="font-semibold">{i}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-medium text-slate-500 mt-3 px-1">
          <span>Informações Iniciais</span>
          <span>KYC e Documentos</span>
          <span>Assinatura Digital</span>
        </div>
      </div>

      <Card className="shadow-elevation border-0 bg-white animate-fade-in-up">
        <CardHeader className="bg-slate-50/50 border-b pb-6">
          <CardTitle className="text-xl">
            {step === 1 && 'Dados do Tomador e Simulação'}
            {step === 2 && 'Validação de Identidade'}
            {step === 3 && 'Termos e Confirmação'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Preencha as informações essenciais para a pré-análise.'}
            {step === 2 && 'Envie fotos legíveis para nossa checagem biométrica de segurança.'}
            {step === 3 && 'Detalhe o uso do crédito e assine digitalmente.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          {step === 1 && (
            <div className="grid gap-5 animate-fade-in">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Razão Social / Nome Completo</Label>
                  <Input
                    placeholder="Sua Empresa LTDA"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ / CPF</Label>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Contato</Label>
                  <Input
                    type="email"
                    placeholder="contato@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone / WhatsApp</Label>
                  <Input placeholder="(00) 90000-0000" />
                </div>
              </div>
              <div className="pt-5 border-t grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Valor Solicitado (R$)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo de Pagamento</Label>
                  <Input
                    type="number"
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <UploadCloud className="h-12 w-12 text-slate-400 group-hover:text-emerald-500 transition-colors mx-auto mb-4" />
                <h4 className="text-base font-semibold text-slate-700">
                  Fotografia (Selfie) com Documento
                </h4>
                <p className="text-sm text-slate-500 mt-2">
                  Clique aqui para abrir a câmera ou selecione um arquivo.
                </p>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <FileText className="h-12 w-12 text-slate-400 group-hover:text-emerald-500 transition-colors mx-auto mb-4" />
                <h4 className="text-base font-semibold text-slate-700">
                  Documento de Identificação (Frente/Verso)
                </h4>
                <p className="text-sm text-slate-500 mt-2">
                  Envie RG, CNH válida ou Contrato Social consolidado.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 space-y-4">
                <h4 className="font-semibold text-emerald-900">Resumo Operacional</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs">Tomador</span>
                    <span className="font-medium text-slate-800">{formData.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Condições</span>
                    <span className="font-medium text-slate-800">
                      R$ {formData.amount} em {formData.installments}x
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Motivação da Operação</Label>
                <Textarea
                  rows={4}
                  placeholder="Ex: Destinado à compra de maquinário, ampliação de estoque, ou equalização de fluxo de caixa."
                  className="resize-none bg-slate-50"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>
              <div className="bg-slate-100 p-4 rounded-lg text-xs text-slate-600 leading-relaxed text-justify">
                Declaro sob as penas da lei que todas as informações e documentos anexados são
                autênticos. Autorizo, neste ato, a{' '}
                <strong>Nexum Security Empresa Simples de Crédito</strong> a realizar consultas em
                bureaus de crédito (SCR/Bacen, Serasa, Boa Vista) visando estritamente a avaliação
                de risco desta operação, em conformidade total com as diretrizes de tratamento da
                Lei Geral de Proteção de Dados (Lei 13.709/2018).
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-6 md:p-8 pt-0 border-t bg-slate-50/30 flex justify-between rounded-b-xl">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
            disabled={step === 1 || isSubmitting}
            className="border-slate-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => Math.min(s + 1, 3))}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Continuar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              {isSubmitting ? 'Processando Envio...' : 'Concordar e Assinar Proposta'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
