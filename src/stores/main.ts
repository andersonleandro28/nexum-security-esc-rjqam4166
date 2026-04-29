import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Role = 'guest' | 'customer' | 'admin'

export interface Proposal {
  id: string
  userId: string
  customerName: string
  cpf: string
  amount: number
  installments: number
  purpose: string
  status: 'Pendente' | 'Em Análise' | 'Aprovado' | 'Reprovado'
  score: number
  createdAt: string
}

export interface Loan {
  id: string
  proposalId: string
  userId: string
  amount: number
  totalAmount: number
  installments: number
  status: 'Ativo' | 'Quitado'
  nextPaymentDate: string
}

export interface Installment {
  id: string
  loanId: string
  number: number
  amount: number
  dueDate: string
  status: 'Pendente' | 'Pago' | 'Atrasado'
}

export interface AuditLog {
  id: string
  action: string
  user: string
  date: string
  details: string
}

interface MainStore {
  role: Role
  setRole: (role: Role) => void
  proposals: Proposal[]
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>
  loans: Loan[]
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>
  installments: Installment[]
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>
  auditLogs: AuditLog[]
  addAuditLog: (action: string, user: string, details: string) => void
}

export const MainContext = createContext<MainStore | null>(null)

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'PROP-1001',
    userId: 'usr-1',
    customerName: 'Roberto Silva',
    cpf: '123.456.789-00',
    amount: 25000,
    installments: 12,
    purpose: 'Capital de Giro para Estoque',
    status: 'Em Análise',
    score: 750,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'PROP-1002',
    userId: 'usr-2',
    customerName: 'Carlos Oliveira',
    cpf: '987.654.321-11',
    amount: 5000,
    installments: 6,
    purpose: 'Compra de Equipamentos',
    status: 'Pendente',
    score: 480,
    createdAt: '2026-10-05T14:30:00Z',
  },
]

const MOCK_LOANS: Loan[] = [
  {
    id: 'LOAN-2001',
    proposalId: 'PROP-0999',
    userId: 'usr-0',
    amount: 20000,
    totalAmount: 26000,
    installments: 24,
    status: 'Ativo',
    nextPaymentDate: '2026-11-10',
  },
]

const MOCK_INSTALLMENTS: Installment[] = [
  {
    id: 'INST-3001',
    loanId: 'LOAN-2001',
    number: 1,
    amount: 1083.33,
    dueDate: '2026-10-10',
    status: 'Pago',
  },
  {
    id: 'INST-3002',
    loanId: 'LOAN-2001',
    number: 2,
    amount: 1083.33,
    dueDate: '2026-11-10',
    status: 'Pendente',
  },
  {
    id: 'INST-3003',
    loanId: 'LOAN-2001',
    number: 3,
    amount: 1083.33,
    dueDate: '2026-12-10',
    status: 'Pendente',
  },
]

const MOCK_AUDIT: AuditLog[] = [
  {
    id: 'AUD-1',
    action: 'Sistema Iniciado',
    user: 'Admin',
    date: '2026-10-01T08:00:00Z',
    details: 'Mesa de operações ativada',
  },
]

export function MainProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('guest')
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS)
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS)
  const [installments, setInstallments] = useState<Installment[]>(MOCK_INSTALLMENTS)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT)

  const addAuditLog = (action: string, user: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      action,
      user,
      date: new Date().toISOString(),
      details,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  return React.createElement(
    MainContext.Provider,
    {
      value: {
        role,
        setRole,
        proposals,
        setProposals,
        loans,
        setLoans,
        installments,
        setInstallments,
        auditLogs,
        addAuditLog,
      },
    },
    children,
  )
}

export default function useMainStore() {
  const context = useContext(MainContext)
  if (!context) throw new Error('useMainStore must be used within MainProvider')
  return context
}
