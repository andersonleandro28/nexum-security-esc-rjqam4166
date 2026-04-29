import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, TrendingDown, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

export default function Index() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState([15000])
  const [installments, setInstallments] = useState([12])

  const interestRate = 0.025
  const cet = 0.028

  const monthlyInstallment = useMemo(() => {
    const p = amount[0]
    const i = interestRate
    const n = installments[0]
    return (p * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1)
  }, [amount, installments])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const features = [
    {
      icon: Clock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      title: 'Aprovação Ágil',
      desc: 'Análise automatizada e liberação rápida para contas validadas no sistema.',
    },
    {
      icon: TrendingDown,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      title: 'Taxas Competitivas',
      desc: 'Operamos com capital próprio, permitindo condições melhores que bancos tradicionais.',
    },
    {
      icon: ShieldCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      title: 'Segurança Jurídica',
      desc: 'Conformidade 100% com a LC 167/19 e registros formais na CERC.',
    },
  ]

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/1080?q=office&color=black')] opacity-20 bg-cover bg-center" />
        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 backdrop-blur-sm">
              <ShieldCheck className="mr-2 h-4 w-4" /> Adequado à LC 167/2019
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Crédito Rápido e Seguro para sua Empresa
            </h1>
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              A Nexum Security é a sua Empresa Simples de Crédito parceira. Financie capital de giro
              e expanda seu negócio sem burocracia excessiva.
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md text-white">
              <CardHeader>
                <CardTitle className="text-2xl">Simulador de Crédito</CardTitle>
                <CardDescription className="text-slate-300">
                  Descubra as condições ideais para você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-300">De quanto precisa?</label>
                    <span className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(amount[0])}
                    </span>
                  </div>
                  <Slider
                    value={amount}
                    onValueChange={setAmount}
                    max={50000}
                    min={1000}
                    step={1000}
                    className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>R$ 1k</span>
                    <span>R$ 50k</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-300">
                      Em quantas parcelas?
                    </label>
                    <span className="text-2xl font-bold text-emerald-400">{installments[0]}x</span>
                  </div>
                  <Slider
                    value={installments}
                    onValueChange={setInstallments}
                    max={24}
                    min={1}
                    step={1}
                    className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1x</span>
                    <span>24x</span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900/50 p-5 space-y-3 border border-slate-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Taxa de Juros (a.m.)</span>
                    <span className="font-medium">{(interestRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">CET (a.m.)</span>
                    <span className="font-medium">{(cet * 100).toFixed(1)}%</span>
                  </div>
                  <div className="pt-3 mt-1 border-t border-slate-700 flex justify-between items-center">
                    <span className="font-semibold text-slate-200">Parcela Mensal</span>
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(monthlyInstallment)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  size="lg"
                  onClick={() => navigate('/onboarding')}
                >
                  Solicitar Análise <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Por que escolher a Nexum?</h2>
            <p className="text-slate-600 text-lg">
              Nosso modelo de negócios prioriza a velocidade e o relacionamento com o micro e
              pequeno empreendedor de nossa região.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Card
                key={i}
                className="border-slate-100 shadow-elevation hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <CardContent className="pt-8 pb-8 px-6">
                  <div
                    className={`h-14 w-14 rounded-xl ${f.bg} flex items-center justify-center mb-6`}
                  >
                    <f.icon className={`h-7 w-7 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
