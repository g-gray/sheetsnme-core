'use strict'
const pt = require('path')
const migrate = require('migrate')
const stateStore = require('./pg-state-store')

migrate.load(
  {
    stateStore,
    migrationsDirectory: pt.resolve(__dirname, './migrations'),
  },
  (err, set) => {
    if (err) throw err

    set.on('warning', msg => {
      console.warn('warning', msg)
    })

    set.on('migration', function (migration, direction) {
      console.log(direction, migration.title)
    })

    set.down(err => {
      if (err) throw err
      console.log('Migrations [down] successfully ran')
      process.exit(0)
    })
  }
)
