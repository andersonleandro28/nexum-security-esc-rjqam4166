import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart } from 'lucide-react'

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Relatórios Financeiros</h2>
      <Card className="shadow-sm border-dashed border-2">
        <CardHeader>
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
            <PieChart className="w-6 h-6 text-slate-400" />
          </div>
          <CardTitle>Módulo em Desenvolvimento</CardTitle>
          <CardDescription>
            Os relatórios detalhados de fluxo de caixa e inadimplência estarão disponíveis na
            próxima atualização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Enquanto isso, você pode acompanhar os indicadores principais diretamente pelo
            Dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
