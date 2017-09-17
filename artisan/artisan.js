let program = require('commander')
let chalk = require('chalk')
let fs = require('fs')
let path = require('path')
let Promise = require('bluebird')
let _ = require('underscore')
let sh = require('shelljs')
let {
  isLeafType,
  isOutputType,
  isAbstractType,
  getNullableType,
  getNamedType,
  isCompositeType,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
} = require('graphql')
let CodeGen = require('./codegen')

let schema = require('../src/api/schema/').schema
let SchemaBuilder = require('./schemabuilder')
let ObjectBuilder = require('./objectbuilder')
let ModelBuilder = require('./modelbuilder')
let KeystoneModelBuilder = require('./keystonemodelbuilder')
let ListBuilder = require('./listbuilder')
let MutationBuilder = require('./mutationbuilder')
let IndexBuilder = require('./indexbuilder')
let KeystoneObjectBuilder = require('./keystoneobjectbuilder')
let KeystoneValidatorBuilder = require('./keystonevalidatorbuilder')

class Artisan {

  getNames(singular, plural) {

    return {
      LCSingular: singular.toLowerCase(),
      UCSingular: singular.toUpperCase(),
      UCFCCSingular: `${singular.substring(0, 1).toUpperCase()}${singular.substring(1)}`,
      LCFCCSingular: `${singular.substring(0, 1).toLowerCase()}${singular.substring(1)}`,
      LCPlural: plural.toLowerCase(),
      UCPlural: plural.toUpperCase(),
      UCFCCPlural: `${plural.substring(0, 1).toUpperCase()}${plural.substring(1)}`,
      LCFCCPlural: `${plural.substring(0, 1).toLowerCase()}${plural.substring(1)}`,
    }

  }

  getEntityData(name) {
    let schemaDir = this.getEntitySchemaDirectory(name)
    let schemaFile = `${schemaDir}artisan.json`
    if (!fs.existsSync(schemaFile)) {
      console.log((`***** No artisan.json file found for ${name} *****`))
      throw new Error(`No artisan.json file found for ${name}`)
    }
    return JSON.parse(fs.readFileSync(schemaFile, 'utf-8'))
  }

  setEntityData(name, data) {
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir)
    }
    fs.writeFileSync(`${schemaDir}artisan.json`, JSON.stringify(data, null, 2))
  }

  getEntitySchemaDirectory(name) {
    let directory = sh.pwd().toString()
    let schemaDir = path.join(directory, `./src/api/schema/entities/${name.toLowerCase()}/`)
    return schemaDir
  }

  add(singular, plural, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface) {
    // TODO allow for shema not present during initial build pahse in order to get the entity into the schema
    let entity = this.getNames(singular, plural)
    let itemData = {
      entity: entity,
      interfaceName,
      hasList,
      hasMutations,
      hasSubscription,
      hasDatasource,
      isInterface,
    }
    this.setEntityData(singular, itemData)
    this.buildSchemaFile(entity.UCFCCSingular)
    this.buildObjectFile(entity.UCFCCSingular)
    this.buildModelFile(entity.UCFCCSingular)
    if (hasMutations && !isInterface) {
      this.buildMutationFile(entity.UCFCCSingular)
    } else {
      this.removeMutationFile(entity.UCFCCSingular)
    }
    if (false) { // hasList) {
      this.buildListFile(entity.UCFCCSingular)
    } else {
      this.removeListFile(entity.UCFCCSingular)
    }
    this.buildIndexFile(entity.UCFCCSingular)
    let directory = sh.pwd().toString()
    let entitiesDir = path.join(directory, `./src/api/schema/entities/`)
    let premissionsDir = path.join(directory, `./src/api/schema/supporting/`)
    this.buildSchemaIndex(entitiesDir, premissionsDir)

  }

  removeModelFile(name) {
    let schemaDir = this.getEntitySchemaDirectory(name)
    let file = `${schemaDir}model.js`
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  }

  removeMutationFile(name) {
    let schemaDir = this.getEntitySchemaDirectory(name)
    let file = `${schemaDir}mutations.js`
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  }

  removeListFile(name) {
    let schemaDir = this.getEntitySchemaDirectory(name)
    let file = `${schemaDir}list.js`
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  }

  buildSchemaFile(name) {
    console.log(chalk.blue.bold(`CREATING SCHEMA FILE..............  [${chalk.white(name)}]`))
    let entityData = this.getEntityData(name)
    let schemaBuilder = new SchemaBuilder(schema, entityData)
    let entityCode = schemaBuilder.build()
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir)
    }
    fs.writeFileSync(`${schemaDir}schema.js`, entityCode)
  }

  buildObjectFile(name) {
    console.log(chalk.grey.bold(`CREATING QL OBJECT................  [${chalk.white(name)}]`))
    let entityData = this.getEntityData(name)
    let objectBuilder = new ObjectBuilder(schema, entityData)
    let entityCode = objectBuilder.build()
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir)
    }
    fs.writeFileSync(`${schemaDir}object.js`, entityCode)
  }

  buildModelFile(name) {
    console.log(chalk.red.bold(`CREATING DATA OBJECT..............  [${chalk.white(name)}]`))
    let entityData = this.getEntityData(name)
    let modelBuilder = new KeystoneModelBuilder(schema, entityData)
    let entityCode = modelBuilder.build()
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir)
    }
    fs.writeFileSync(`${schemaDir}model.js`, entityCode)
  }

  buildListFile(name) {
    console.log(chalk.magenta.bold(`CREATING DATA LIST................  [${chalk.white(name)}]`))
    let entityData = this.getEntityData(name)
    let listBuilder = new ListBuilder(schema, entityData)
    let entityCode = listBuilder.build()
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir)
    }
    fs.writeFileSync(`${schemaDir}list.js`, entityCode)
  }

  buildMutationFile(name) {
    console.log(chalk.yellow.bold(`CREATING MUTATIONS................  [${chalk.white(name)}]`))
    let entityData = this.getEntityData(name)
    let mutationBuilder = new MutationBuilder(schema, entityData)
    let entityCode = mutationBuilder.build()
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir)
    }
    fs.writeFileSync(`${schemaDir}mutations.js`, entityCode)
  }

  buildIndexFile(name) {
    console.log(chalk.cyan.bold(`CREATING INDEX....................  [${chalk.white(name)}]`))
    let entityData = this.getEntityData(name)
    let indexBuilder = new IndexBuilder(schema, entityData)
    let entityCode = indexBuilder.build()
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir)
    }
    fs.writeFileSync(`${schemaDir}index.js`, entityCode)
  }

  buildSchemaIndex(entitiesDir, permissionsDir) {
    let items = fs.readdirSync(entitiesDir)
    let exportItems = []
    let permissionItems = []
    let resolverFnctions = []
    let mutationFunctions = []
    _.each(items, (item) => {
      if (fs.lstatSync(`${entitiesDir}${item}`).isDirectory()) {
        if (item === 'data') {
          exportItems.push({
            name: `dataSchema`,
            from: `./data/`,
          })
        } else {
          let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.getEntityData(item)
          exportItems.push({
            name: `${entity.LCFCCSingular}Schema`,
            from: `./${entity.LCSingular}/`,
          })
          if (isInterface) {
            resolverFnctions.push({
              item: entity.UCFCCSingular,
              from: `./${entity.LCSingular}/object`,
            })
          }
          if (hasMutations && !isInterface) {
            mutationFunctions.push({
              item: `${entity.LCFCCSingular}Mutations`,
              from: `./${entity.LCSingular}/mutations`,
            })
          }
          let permissions = [
            {
              key: `${entity.UCPlural}_READ`,
              val: `${entity.LCPlural}-read`,
            }, {
              key: `${entity.UCPlural}_WRITE`,
              val: `${entity.LCPlural}-write`,
            }, {
              key: `${entity.UCPlural}_ALL`,
              val: `${entity.LCPlural}-all`,
            }, {
              key: `${entity.UCPlural}_ONE`,
              val: `${entity.LCPlural}-one`,
            }, {
              key: `${entity.UCPlural}_COUNT`,
              val: `${entity.LCPlural}-count`,
            }, {
              key: `${entity.UCPlural}_ADD`,
              val: `${entity.LCPlural}-add`,
            }, {
              key: `${entity.UCPlural}_UPDATE`,
              val: `${entity.LCPlural}-update`,
            }, {
              key: `${entity.UCPlural}_REMOVE`,
              val: `${entity.LCPlural}-remove`,
            },
          ]
          if (!hasMutations || isInterface) {
            permissions = [
              {
                key: `${entity.UCPlural}_READ`,
                val: `${entity.LCPlural}-read`,
              }, {
                key: `${entity.UCPlural}_ALL`,
                val: `${entity.LCPlural}-all`,
              }, {
                key: `${entity.UCPlural}_ONE`,
                val: `${entity.LCPlural}-one`,
              }, {
                key: `${entity.UCPlural}_COUNT`,
                val: `${entity.LCPlural}-count`,
              },
            ]
          }
          permissionItems.push({
            entity: entity,
            items: permissions,
          })
        }
      }
    })
    let code = new CodeGen()
    code.reset()
    _.each(exportItems, (exportItem) => {
      code.addLine(`let { ${exportItem.name} } = require('${exportItem.from}')`)
    })
    _.each(resolverFnctions, (resolverItem) => {
      code.addLine(`let ${resolverItem.item} = require('${resolverItem.from}')`)
    })
    _.each(mutationFunctions, (mutationItem) => {
      code.addLine(`let ${mutationItem.item} = require('${mutationItem.from}')`)
    })
    code.addLine(``)
    code.addLine(`function getSchemaDefinitions() {`)
    code.addInsetLine(`return \``)
    code.inset()
    _.each(exportItems, (exportItem) => {
      code.addLine(`\${${exportItem.name}.getSchemaDefinitions()}`)
    })
    code.addOutsetLine(`\``)
    code.addOutsetLine(`}`)
    code.addLine(``)
    code.addLine(`function getSchemaMutations() {`)
    code.addInsetLine(`return \``)
    code.inset()
    _.each(exportItems, (exportItem) => {
      code.addLine(`\${${exportItem.name}.getMutationDefinitions()}`)
    })
    code.addOutsetLine(`\``)
    code.addOutsetLine(`}`)
    code.addLine(``)
    code.addLine(`function getSchemaSubscriptions() {`)
    code.addInsetLine(`return \`\``)
    code.addOutsetLine(`}`)
    code.addLine(``)
    code.addLine(`function getResolverFunctions() {`)
    code.addInsetLine('return Object.assign({},')
    code.inset()
    _.each(resolverFnctions, (resolverItem, index) => {
      if (index !== resolverFnctions.length - 1) {
        code.addLine(`${resolverItem.item}.resolver(),`)
      } else {
        code.addLine(`${resolverItem.item}.resolver()`)
      }
    })
    code.addOutsetLine(`)`)
    code.addOutsetLine(`}`)
    code.addLine(``)
    code.addLine(`function getMutationFunctions() {`)
    code.addInsetLine('return Object.assign({},')
    code.inset()
    _.each(mutationFunctions, (mutationItem, index) => {
      if (index !== mutationFunctions.length - 1) {
        code.addLine(`${mutationItem.item},`)
      } else {
        code.addLine(`${mutationItem.item}`)
      }
    })
    code.addOutsetLine(`)`)
    code.addOutsetLine(`}`)
    code.addLine(``)
    code.addLine(`module.exports = {`)
    code.addInsetLine(`getSchemaDefinitions,`)
    code.addLine(`getSchemaMutations,`)
    code.addLine(`getSchemaSubscriptions,`)
    code.addLine(`getResolverFunctions,`)
    code.addLine(`getMutationFunctions,`)
    code.addOutsetLine(`}`)
    let entityCode = code.toString()
    fs.writeFileSync(`${entitiesDir}index.js`, entityCode)

    code.reset()

    _.each(permissionItems, (permission) => {
      code.addLine(`let ${permission.entity.LCFCCSingular}Permissions = {`)
      code.inset()
      _.each(permission.items, ({ key, val }) => {
        code.addLine(`${key}: '${val}',`)
      })
      code.addOutsetLine('}')
      code.addLine(``)
    })
    code.addLine(`let permissions = Object.assign({},`)
    code.inset()
    _.each(permissionItems, (permission, index) => {
      if (index !== permissionItems.length - 1) {
        code.addLine(`${permission.entity.LCFCCSingular}Permissions,`)
      } else {
        code.addLine(`${permission.entity.LCFCCSingular}Permissions`)
      }
    })
    code.addOutsetLine(`)`)
    code.addLine(``)
    code.addLine(`module.exports = permissions`)

    entityCode = code.toString()
    fs.writeFileSync(`${permissionsDir}permissions.js`, entityCode)

    this.buildObjectFile('Data')

  }

  getDefinedSchemaObjects() {
    let types = schema._typeMap
    let returnObjects = {}
    _.each(types, (type, key) => {
      if (!isLeafType(type) && isOutputType(type)) {
        // console.log(key+' IS OBJECT')
        if (key !== 'Data' && key !== 'Query' && key !== 'Mutation' && key !== 'Subscription' && key !== 'Subscriptions' && key.indexOf('__') == -1 && key.indexOf('List') == -1) {
          returnObjects[key] = type
        }
      }
    })
    return returnObjects
  }

  listSchemaObjects() {
    let schemaObjects = this.getDefinedSchemaObjects()
    let index = 1
    let length = 50
    _.each(schemaObjects, (type, key) => {
      if (isAbstractType(type)) {
        let logString = ` [${chalk.white(index)}] - ${chalk.blue(key)} `
        let currentLength = ` ${index} - ${key}`.length
        while (currentLength < length) {
          logString += '.'
          currentLength++
        }
        logString += `[${chalk.grey('INTERFACE')}]`
        console.log(logString)
      } else if (type.getInterfaces().length) {
        let logString = ` [${chalk.white(index)}] - ${chalk.blue(key)} `
        let currentLength = ` ${index} - ${key}`.length
        while (currentLength < length) {
          logString += '.'
          currentLength++
        }
        logString += ''
        let interfaceString = ''
        _.each(type.getInterfaces(), (interfaceType) => {
          if (interfaceString !== '') {
            interfaceString += ', '
          }
          interfaceString += chalk.magenta(interfaceType.name)
        })
        logString += `[${chalk.grey('INHERITS')}: (${interfaceString})]`
        console.log(logString)
      } else {
        let logString = ` [${chalk.white(index)}] - ${chalk.blue(key)} `
        let currentLength = ` ${index} - ${key}`.length
        while (currentLength < length) {
          logString += '.'
          currentLength++
        }
        logString += `[${chalk.cyan('OBJECT')}]`
        console.log(logString)
      }
      index++
    })
  }

  buildAll() {
    let schemaObjects = this.getDefinedSchemaObjects()
    _.each(schemaObjects, (type, key) => {
      let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.getEntityData(key)
      this.buildObjectFile(entity.UCFCCSingular)
      this.buildModelFile(entity.UCFCCSingular)
      if (hasMutations && !isInterface) {
        this.buildMutationFile(entity.UCFCCSingular)
      } else {
        this.removeMutationFile(entity.UCFCCSingular)
      }
      if (false) { // hasList) {
        this.buildListFile(entity.UCFCCSingular)
      } else {
        this.removeListFile(entity.UCFCCSingular)
      }
      this.buildIndexFile(entity.UCFCCSingular)
    })
    let directory = sh.pwd().toString()
    let entitiesDir = path.join(directory, `./src/api/schema/entities/`)
    let premissionsDir = path.join(directory, `./src/api/schema/supporting/`)
    this.buildSchemaIndex(entitiesDir, premissionsDir)
  }

  build(name) {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.getEntityData(name)
    this.buildObjectFile(entity.UCFCCSingular)
    if (hasDatasource) {
      this.buildModelFile(entity.UCFCCSingular)
    }
    if (hasMutations && !isInterface) {
      this.buildMutationFile(entity.UCFCCSingular)
    }
    if (false) { // hasList) {
      this.buildListFile(entity.UCFCCSingular)
    }
    this.buildIndexFile(entity.UCFCCSingular)
    let directory = sh.pwd().toString()
    let entitiesDir = path.join(directory, `./src/api/schema/entities/`)
    let premissionsDir = path.join(directory, `./src/api/schema/supporting/`)
    this.buildSchemaIndex(entitiesDir, premissionsDir)
  }

  buildAllKeystone() {
    let schemaObjects = this.getDefinedSchemaObjects()
    let modelDirectory = `${sh.pwd().toString()}/src/cms/models`
    let validatorDirectory = `${sh.pwd().toString()}/src/common/validators`
    if (!fs.existsSync(modelDirectory)) {
      fs.mkdirSync(modelDirectory)
    }
    if (!fs.existsSync(validatorDirectory)) {
      fs.mkdirSync(validatorDirectory)
    }
    _.each(schemaObjects, (type, key) => {
      let entityData = this.getEntityData(key)
      let modelBuilder = new KeystoneObjectBuilder(schema, entityData)
      let modelCode = modelBuilder.build()
      if (modelCode) {
        fs.writeFileSync(`${modelDirectory}/${key}.js`, modelCode)
      }
      try {
        var stats = fs.statSync(`${validatorDirectory}/${entityData.entity.LCSingular}.js`)
      } catch (e) {
        let validatorBuilder = new KeystoneValidatorBuilder(schema, entityData)
        let validaorCode = validatorBuilder.build()
        if (validaorCode) {
          fs.writeFileSync(`${validatorDirectory}/${entityData.entity.LCSingular}.js`, validaorCode)
        }
      }

    })
  }

  buildKeystone(name) {
    let schemaObjects = this.getDefinedSchemaObjects()
    let modelDirectory = `${sh.pwd().toString()}/src/cms/models`
    let validatorDirectory = `${sh.pwd().toString()}/src/common/validators`
    if (!fs.existsSync(modelDirectory)) {
      fs.mkdirSync(modelDirectory)
    }
    if (!fs.existsSync(validatorDirectory)) {
      fs.mkdirSync(validatorDirectory)
    }
    let entityData = this.getEntityData(name)
    let modelBuilder = new KeystoneObjectBuilder(schema, entityData)
    let modelCode = modelBuilder.build()
    if (modelCode) {
      fs.writeFileSync(`${modelDirectory}/${entityData.entity.UCFCCSingular}.js`, modelCode)
    }
    try {
      var stats = fs.statSync(`${validatorDirectory}/${entityData.entity.LCSingular}.js`)
    } catch (e) {
      let validatorBuilder = new KeystoneValidatorBuilder(schema, entityData)
      let validaorCode = validatorBuilder.build()
      if (validaorCode) {
        fs.writeFileSync(`${validatorDirectory}/${entityData.entity.LCSingular}.js`, validaorCode)
      }
    }
  }

  test() {}

  randomString(size) {
    var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    var randomString = ''
    for (var x = 0; x < size; x++) {
      var charIndex = Math.floor(Math.random() * characters.length)
      randomString += characters.substring(charIndex, charIndex + 1)
    }
    return randomString
  }

  // scrape import export for index files

  generateJWTKey() {
    let envData = fs.readFileSync(sh.pwd().toString()+'/.env', 'utf-8')
    let matches = envData.match(/JWT_KEY=(.*?)/)
    if (matches) {
      envData = envData.replace(/JWT_KEY=(.*?)(:?\n|$)/, `JWT_KEY=${this.randomString(30)}`)
    } else {
      envData += `JWT_KEY=${this.randomString(30)}`
    }
    fs.writeFileSync(sh.pwd().toString()+'/.env', envData)
  }

}

module.exports = Artisan
