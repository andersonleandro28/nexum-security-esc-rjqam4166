import pb from '@/lib/pocketbase/client'

export const api = {
  clients: {
    create: (data: any) => pb.collection('clients').create(data),
    update: (id: string, data: any) => pb.collection('clients').update(id, data),
    getByUserId: (userId: string) =>
      pb
        .collection('clients')
        .getFirstListItem(`user_id="${userId}"`)
        .catch(() => null),
    list: () => pb.collection('clients').getFullList({ sort: '-created', expand: 'user_id' }),
  },
  partners: {
    create: (data: any) => pb.collection('partners').create(data),
    listByClient: (clientId: string) =>
      pb.collection('partners').getFullList({ filter: `client_id="${clientId}"` }),
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
    update: (id: string, data: any) => pb.collection('kyc_documents').update(id, data),
    listByClient: (clientId: string) =>
      pb.collection('kyc_documents').getFullList({ filter: `client_id="${clientId}"` }),
  },
  compliance: {
    acceptTerms: (data: any) => pb.collection('terms_acceptance').create(data),
  },
  audit: {
    create: (action: string, details: string) => {
      const uid = pb.authStore.record?.id
      if (uid) {
        return pb.collection('audit_logs').create({ user_id: uid, action, details })
      }
      return Promise.resolve()
    },
    list: () => pb.collection('audit_logs').getFullList({ sort: '-created', expand: 'user_id' }),
  },
}
