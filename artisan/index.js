#!/usr/bin/env node
let program = require('commander')
let Artisan = require('./artisan')

let artisan = new Artisan()

program
.command('object <singularName> <pluralName>')
.option('-l, --hasList', 'List')
.option('-m, --hasMutations', 'Mutation')
.option('-s, --hasSubscription', 'Subscription')
.option('-d, --hasDatasource', 'Datasource')
.action((singularName, pluralName, options) => {
  artisan.add(singularName, pluralName, null, options.hasList, options.hasMutations, options.hasSubscription, options.hasDatasource, false)
})

program
.command('interface <singularName> <pluralName>')
.option('-l, --hasList', 'List')
.option('-m, --hasMutations', 'Mutation')
.option('-s, --hasSubscription', 'Subscription')
.option('-d, --hasDatasource', 'Datasource')
.action((singularName, pluralName, options) => {
  artisan.add(singularName, pluralName, null, options.hasList, options.hasMutations, options.hasSubscription, options.hasDatasource, true)
})

program
.command('child <singularName> <pluralName> <interfaceName>')
.option('-l, --hasList', 'List')
.option('-m, --hasMutations', 'Mutation')
.option('-s, --hasSubscription', 'Subscription')
.option('-d, --hasDatasource', 'Datasource')
.action((singularName, pluralName, interfaceName, options) => {
  artisan.add(singularName, pluralName, interfaceName, options.hasList, options.hasMutations, options.hasSubscription, options.hasDatasource, false)
})

program
.command('list entities')
.action(() => {
  artisan.listSchemaObjects()
})

program
.command('build <type>')
.action((type) => {
  artisan.build(type)
})

program
.command('buildall')
.action(() => {
  artisan.buildAll()
})

program
.command('keystoneall')
.action(() => {
  artisan.buildAllKeystone()
})

program
.command('keystone <type>')
.action((type) => {
  artisan.buildKeystone(type)
})

program
.command('test')
.action(() => {
  artisan.test()
})

program
.command('genkey')
.action(() => {
  artisan.generateJWTKey()
})

program.parse(process.argv)
