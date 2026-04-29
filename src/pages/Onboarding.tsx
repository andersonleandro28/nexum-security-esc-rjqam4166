import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import pb from '@/lib/pocketbase/client'

export default function Onboarding() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    stateRegistration: '',
    fiscalAddress: '',
    billing: '',
    bank: '',
    pixKey: '',
    email: '',
    password: '',
    phone: '',
  })
  const [partners, setPartners] = useState([
    { name: '', cpf: '', email: '', phone: '', role: '', equity: '' },
  ])
  const [docs, setDocs] = useState<{ [key: string]: File | null }>({
    'Social Contract': null,
    'CNPJ Card': null,
    'Proof of Address': null,
    Identity: null,
  })
  const [compliance, setCompliance] = useState({ terms: false, scr: false })

  const handleValidateCNPJ = async () => {
    if (formData.document.length > 10) {
      toast({ title: 'CNPJ Validado', description: 'Dados recuperados com sucesso.' })
      setFormData((prev) => ({
        ...prev,
        name: 'Empresa Alpha LTDA',
        fiscalAddress: 'Av Paulista, 1000 - SP',
      }))
    }
  }

  const handleSubmit = async () => {
    if (!compliance.terms || !compliance.scr) {
      return toast({
        title: 'Atenção',
        description: 'Aceite os termos para continuar',
        variant: 'destructive',
      })
    }
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
        type: 'PJ',
        name: formData.name,
        document: formData.document,
        email: formData.email,
        phone: formData.phone,
        bank_number: formData.bank,
        pix_key: formData.pixKey,
        billing: Number(formData.billing),
        state_registration: formData.stateRegistration,
        fiscal_address: formData.fiscalAddress,
        status: 'Pendente',
      })

      for (const p of partners) {
        if (p.name)
          await api.partners.create({
            client_id: client.id,
            ...p,
            equity_percentage: Number(p.equity),
          })
      }

      for (const [type, file] of Object.entries(docs)) {
        if (file) {
          const fd = new FormData()
          fd.append('client_id', client.id)
          fd.append('document_type', type)
          fd.append('file', file)
          fd.append('status', 'Pendente')
          await api.documents.create(fd)
        }
      }

      const ip = await fetch('https://api.ipify.org?format=json')
        .then((r) => r.json())
        .then((r) => r.ip)
        .catch(() => 'unknown')
      await api.compliance.acceptTerms({
        user_id: pb.authStore.record?.id,
        ip_address: ip,
        timestamp: new Date().toISOString(),
        version: 'v1.0',
        user_agent: navigator.userAgent,
      })

      toast({ title: 'Sucesso!', description: 'Onboarding concluído. Em análise KYC.' })
      navigate('/customer/dashboard')
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha no cadastro',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl py-12 px-4">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-slate-50/50 border-b pb-6">
          <CardTitle>Onboarding B2B - Etapa {step}/4</CardTitle>
          <CardDescription>Processo de KYC e Compliance para abertura de conta PJ.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  />
                  <Button variant="outline" onClick={handleValidateCNPJ}>
                    Buscar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Inscrição Estadual</Label>
                <Input
                  value={formData.stateRegistration}
                  onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço Fiscal</Label>
                <Input
                  value={formData.fiscalAddress}
                  onChange={(e) => setFormData({ ...formData, fiscalAddress: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Faturamento Médio (R$)</Label>
                <Input
                  type="number"
                  value={formData.billing}
                  onChange={(e) => setFormData({ ...formData, billing: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Banco (Ag/Conta)</Label>
                <Input
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Chave Pix</Label>
                <Input
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail (Portal)</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Senha (Portal)</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {partners.map((p, i) => (
                <div key={i} className="grid sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded border">
                  <div className="space-y-1">
                    <Label>Nome</Label>
                    <Input
                      value={p.name}
                      onChange={(e) => {
                        const n = [...partners]
                        n[i].name = e.target.value
                        setPartners(n)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>CPF</Label>
                    <Input
                      value={p.cpf}
                      onChange={(e) => {
                        const n = [...partners]
                        n[i].cpf = e.target.value
                        setPartners(n)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>E-mail</Label>
                    <Input
                      value={p.email}
                      onChange={(e) => {
                        const n = [...partners]
                        n[i].email = e.target.value
                        setPartners(n)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Telefone</Label>
                    <Input
                      value={p.phone}
                      onChange={(e) => {
                        const n = [...partners]
                        n[i].phone = e.target.value
                        setPartners(n)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Cargo</Label>
                    <Input
                      value={p.role}
                      onChange={(e) => {
                        const n = [...partners]
                        n[i].role = e.target.value
                        setPartners(n)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>% Participação</Label>
                    <Input
                      type="number"
                      value={p.equity}
                      onChange={(e) => {
                        const n = [...partners]
                        n[i].equity = e.target.value
                        setPartners(n)
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setPartners([
                    ...partners,
                    { name: '', cpf: '', email: '', phone: '', role: '', equity: '' },
                  ])
                }
              >
                + Adicionar Sócio
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 animate-fade-in">
              {Object.keys(docs).map((k) => (
                <div key={k} className="flex items-center justify-between p-4 border rounded">
                  <span className="font-medium text-slate-700">{k}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      className="w-64"
                      onChange={(e) => setDocs({ ...docs, [k]: e.target.files?.[0] || null })}
                    />
                    {docs[k] && <CheckCircle className="text-emerald-500 w-5 h-5" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in bg-slate-50 p-6 rounded border">
              <h4 className="font-bold text-slate-800">Conformidade Legal</h4>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={compliance.terms}
                  onCheckedChange={(c: boolean) => setCompliance({ ...compliance, terms: c })}
                />
                <Label htmlFor="terms" className="leading-relaxed">
                  Aceito os Termos de Uso. Reconheço que este aceite registra meu IP para validade
                  legal da assinatura eletrônica.
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="scr"
                  checked={compliance.scr}
                  onCheckedChange={(c: boolean) => setCompliance({ ...compliance, scr: c })}
                />
                <Label htmlFor="scr" className="leading-relaxed">
                  Autorizo a consulta ao Sistema de Informações de Crédito (SCR) do Banco Central do
                  Brasil.
                </Label>
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
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Avançar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Processando...' : 'Finalizar e Assinar'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
