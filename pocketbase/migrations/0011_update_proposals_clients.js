migrate(
  (app) => {
    const clients = app.findCollectionByNameOrId('clients')
    if (!clients.fields.getByName('pix_key')) {
      clients.fields.add(new TextField({ name: 'pix_key' }))
      app.save(clients)
    }

    const proposals = app.findCollectionByNameOrId('proposals')
    if (!proposals.fields.getByName('grace_period_date')) {
      proposals.fields.add(new DateField({ name: 'grace_period_date' }))
    }
    if (!proposals.fields.getByName('drawee_name')) {
      proposals.fields.add(new TextField({ name: 'drawee_name' }))
    }
    if (!proposals.fields.getByName('drawee_cpf')) {
      proposals.fields.add(new TextField({ name: 'drawee_cpf' }))
    }
    if (!proposals.fields.getByName('drawee_email')) {
      proposals.fields.add(new EmailField({ name: 'drawee_email' }))
    }
    if (!proposals.fields.getByName('drawee_phone')) {
      proposals.fields.add(new TextField({ name: 'drawee_phone' }))
    }
    if (!proposals.fields.getByName('purpose')) {
      proposals.fields.add(new TextField({ name: 'purpose' }))
    }
    if (!proposals.fields.getByName('cet_monthly')) {
      proposals.fields.add(new NumberField({ name: 'cet_monthly' }))
    }
    if (!proposals.fields.getByName('cet_yearly')) {
      proposals.fields.add(new NumberField({ name: 'cet_yearly' }))
    }

    const statusField = proposals.fields.getByName('status')
    if (statusField && !statusField.values.includes('Inadimplente')) {
      statusField.values.push('Inadimplente')
    }
    app.save(proposals)
  },
  (app) => {
    const clients = app.findCollectionByNameOrId('clients')
    clients.fields.removeByName('pix_key')
    app.save(clients)

    const proposals = app.findCollectionByNameOrId('proposals')
    proposals.fields.removeByName('grace_period_date')
    proposals.fields.removeByName('drawee_name')
    proposals.fields.removeByName('drawee_cpf')
    proposals.fields.removeByName('drawee_email')
    proposals.fields.removeByName('drawee_phone')
    const statusField = proposals.fields.getByName('status')
    if (statusField) {
      statusField.values = statusField.values.filter((v) => v !== 'Inadimplente')
    }
    app.save(proposals)
  },
)
