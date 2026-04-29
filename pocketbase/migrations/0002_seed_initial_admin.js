migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail(users, 'andersonleandro28@gmail.com')
      return // User already exists, skip
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('andersonleandro28@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('role', 'admin')
    record.set('name', 'Admin Nexum')

    app.save(record)
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      const record = app.findAuthRecordByEmail(users, 'andersonleandro28@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
