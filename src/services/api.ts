import pb from '@/lib/pocketbase/client'

export const api = {
  clients: {
    create: (data: any) => pb.collection('clients').create(data),
    getByUserId: (userId: string) =>
      pb
        .collection('clients')
        .getFirstListItem(`user_id="${userId}"`)
        .catch(() => null),
  },
  proposals: {
    create: (data: any) => pb.collection('proposals').create(data),
    update: (id: string, data: any) => pb.collection('proposals').update(id, data),
    list: (filter?: string) =>
      pb
        .collection('proposals')
        .getFullList({ expand: 'client_id,client_id.user_id', filter, sort: '-created' }),
    delete: (id: string) => pb.collection('proposals').delete(id),
  },
  installments: {
    create: (data: any) => pb.collection('installments').create(data),
    update: (id: string, data: any) => pb.collection('installments').update(id, data),
    listByProposal: (proposalId: string) =>
      pb
        .collection('installments')
        .getFullList({ filter: `proposal_id="${proposalId}"`, sort: 'number' }),
  },
  boletos: {
    create: (data: FormData) => pb.collection('boletos').create(data),
    listByProposal: (proposalId: string) =>
      pb
        .collection('boletos')
        .getFullList({ filter: `proposal_id="${proposalId}"`, sort: '-created' }),
  },
  suppliers: {
    create: (data: any) => pb.collection('suppliers').create(data),
    list: () => pb.collection('suppliers').getFullList({ sort: 'name' }),
  },
  expenses: {
    create: (data: FormData | any) => pb.collection('expenses').create(data),
    list: () => pb.collection('expenses').getFullList({ expand: 'supplier_id', sort: '-date' }),
  },
  documents: {
    create: (data: FormData) => pb.collection('kyc_documents').create(data),
  },
  audit: {
    create: (action: string, details: string) =>
      pb.collection('audit_logs').create({ user_id: pb.authStore.record?.id, action, details }),
  },
}
