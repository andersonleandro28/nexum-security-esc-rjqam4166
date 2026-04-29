migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const terms = new Collection({
      name: 'terms_acceptance',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'ip_address', type: 'text' },
        { name: 'timestamp', type: 'date' },
        { name: 'version', type: 'text' },
        { name: 'user_agent', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(terms)

    const proposals = app.findCollectionByNameOrId('proposals')
    proposals.fields.add(
      new FileField({
        name: 'ccb_file',
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ['application/pdf', 'text/plain'],
      }),
    )
    app.save(proposals)
  },
  (app) => {
    // rollback
  },
)
