migrate(
  (app) => {
    const clients = new Collection({
      name: 'clients',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'type', type: 'select', required: true, values: ['PF', 'PJ'], maxSelect: 1 },
        { name: 'name', type: 'text', required: true },
        { name: 'document', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'bank_number', type: 'text' },
        { name: 'spouse_data', type: 'json' },
        { name: 'guarantor_data', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(clients)

    const proposals = new Collection({
      name: 'proposals',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'client_id',
          type: 'relation',
          required: true,
          collectionId: clients.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'amount', type: 'number', required: true },
        { name: 'installments', type: 'number', required: true },
        { name: 'interest_rate', type: 'number', required: true },
        {
          name: 'calculation_type',
          type: 'select',
          required: true,
          values: ['Price', 'SAC'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Pendente', 'Em Análise', 'Aprovado', 'Reprovado', 'Assinado', 'Liquidado'],
          maxSelect: 1,
        },
        { name: 'operation_date', type: 'date', required: true },
        { name: 'score', type: 'number' },
        { name: 'signature_hash', type: 'text' },
        { name: 'purpose', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(proposals)

    const installments = new Collection({
      name: 'installments',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (proposal_id.client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (proposal_id.client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'proposal_id',
          type: 'relation',
          required: true,
          collectionId: proposals.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'number', type: 'number', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Pendente', 'Pago', 'Atrasado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(installments)

    const kyc_documents = new Collection({
      name: 'kyc_documents',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'client_id',
          type: 'relation',
          required: true,
          collectionId: clients.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'document_type',
          type: 'select',
          required: true,
          values: ['Identity', 'Contract', 'Proof of Address'],
          maxSelect: 1,
        },
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(kyc_documents)

    const boletos = new Collection({
      name: 'boletos',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (proposal_id.client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (proposal_id.client_id.user_id = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'proposal_id',
          type: 'relation',
          required: true,
          collectionId: proposals.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'file', type: 'file', required: true, maxSelect: 1, maxSize: 5242880 },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(boletos)

    const expenses = new Collection({
      name: 'expenses',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'supplier', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'invoice', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(expenses)

    const audit_logs = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'action', type: 'text', required: true },
        { name: 'details', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(audit_logs)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('audit_logs'))
    app.delete(app.findCollectionByNameOrId('expenses'))
    app.delete(app.findCollectionByNameOrId('boletos'))
    app.delete(app.findCollectionByNameOrId('kyc_documents'))
    app.delete(app.findCollectionByNameOrId('installments'))
    app.delete(app.findCollectionByNameOrId('proposals'))
    app.delete(app.findCollectionByNameOrId('clients'))
  },
)
