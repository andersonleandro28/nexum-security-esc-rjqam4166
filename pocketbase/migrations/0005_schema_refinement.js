migrate(
  (app) => {
    // 1. Update clients
    const clients = app.findCollectionByNameOrId('clients')
    clients.fields.add(new NumberField({ name: 'serasa_score' }))
    app.save(clients)

    // 2. Update proposals
    const proposals = app.findCollectionByNameOrId('proposals')
    proposals.fields.add(new NumberField({ name: 'fine_rate' }))
    proposals.fields.add(new NumberField({ name: 'grace_period' }))
    proposals.fields.add(new NumberField({ name: 'iof' }))
    proposals.fields.add(new NumberField({ name: 'cet' }))

    const statusField = proposals.fields.getByName('status')
    statusField.values = [
      'Aguardando Documentos',
      'Em Análise de Crédito',
      'Aguardando Assinatura',
      'Pronto para Desembolso',
      'Em Aberto/Ativo',
      'Liquidado',
      'Pendente',
      'Em Análise',
      'Aprovado',
      'Reprovado',
      'Assinado',
    ]
    app.save(proposals)

    // 3. Update installments
    const installments = app.findCollectionByNameOrId('installments')
    installments.fields.add(new NumberField({ name: 'principal_amount' }))
    installments.fields.add(new NumberField({ name: 'interest_amount' }))
    installments.fields.add(new NumberField({ name: 'mora_interest' }))
    app.save(installments)

    // 4. Create suppliers
    const suppliers = new Collection({
      name: 'suppliers',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'tax_id', type: 'text', required: true },
        { name: 'category', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(suppliers)

    // 5. Update expenses
    const expenses = app.findCollectionByNameOrId('expenses')
    expenses.fields.removeByName('supplier')
    expenses.fields.add(
      new RelationField({ name: 'supplier_id', collectionId: suppliers.id, maxSelect: 1 }),
    )
    expenses.fields.add(new TextField({ name: 'description' }))
    app.save(expenses)
  },
  (app) => {
    // empty down
  },
)
