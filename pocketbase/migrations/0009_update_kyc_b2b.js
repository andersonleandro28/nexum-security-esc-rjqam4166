migrate(
  (app) => {
    const clients = app.findCollectionByNameOrId('clients')
    clients.fields.add(new NumberField({ name: 'billing' }))
    clients.fields.add(new TextField({ name: 'state_registration' }))
    clients.fields.add(new TextField({ name: 'fiscal_address' }))
    clients.fields.add(
      new SelectField({
        name: 'status',
        values: ['Pendente', 'Em Análise', 'Aprovado', 'Rejeitado'],
        maxSelect: 1,
      }),
    )
    app.save(clients)

    const partners = new Collection({
      name: 'partners',
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
        { name: 'name', type: 'text', required: true },
        { name: 'cpf', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'equity_percentage', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(partners)

    const kycDocs = app.findCollectionByNameOrId('kyc_documents')
    const dt = kycDocs.fields.getByName('document_type')
    if (dt) {
      dt.values = [
        'Identity',
        'Contract',
        'Proof of Address',
        'CNPJ Card',
        'Social Contract',
        'Others',
      ]
    }
    kycDocs.fields.add(
      new SelectField({
        name: 'status',
        values: ['Pendente', 'Aprovado', 'Rejeitado'],
        maxSelect: 1,
      }),
    )
    kycDocs.fields.add(new TextField({ name: 'rejection_reason' }))
    app.save(kycDocs)
  },
  (app) => {
    // rollback
  },
)
