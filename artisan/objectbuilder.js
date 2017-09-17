import * as _ from 'underscore'
import {
  isAbstractType,
  getNullableType,
  GraphQLList,
  getNamedType,
  GraphQLEnumType,
} from 'graphql'
import Builder from './builder'
import CodeGen from './codegen'

class ObjectBuilder extends Builder {

  getObjectSchemOptions(name) {

  }

  getObjectSchemaImports(name) {
    let importList = []
    let addToImportList = (item, from) => {
      for (let i = 0; i < importList.length; i++) {
        if (importList[i].item === item && importList[i].from === from) {
          return
        }
      }
      importList.push({
        item: item,
        from: from,
      })
    }
    let fields = this.getSchemaFields(name)
    // console.log(fields)
    _.each(fields, (field) => {
      if (field.definition === 'Relation' || field.definition === 'Embedded') {
        let entityData = this.getEntityData(field.type).entity
        addToImportList(`${entityData.UCFCCSingular}`, `'../${entityData.LCSingular}/data'`)
      }
    })
    let lists = this.getSchemaLists(name)
    _.each(lists, (list) => {
      let entityData = this.getEntityData(list).entity
      addToImportList(`${entityData.UCFCCSingular}`, `'../${entityData.LCSingular}/data'`)
    })

    return importList

  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    code.reset()
    code.addLine(`import * as _ from 'underscore'`)
    let interfaceData = false
    if (interfaceName) {
      interfaceData = this.getEntityData(interfaceName)
      code.addLine(`import ${interfaceData.entity.UCFCCSingular}QL from '../${interfaceData.entity.LCSingular}/object'`)
    } else if (hasDatasource) {
      code.addLine(`import APIParent from '../apiparent'`)
    } else {
      code.addLine(`import APIData from '../apidata'`)
    }

    let imports = this.getObjectSchemaImports(entity.UCFCCSingular)
    let fields = this.getSchemaFields(entity.UCFCCSingular)
    let lists = this.getSchemaLists(entity.UCFCCSingular)

    _.each(imports, (importItem) => {
      code.addLine(`import ${importItem.item} from ${importItem.from}`)
    })

    let extensionName = `APIData`
    if (hasDatasource) {
      extensionName = `APIParent`
    }
    if (false) { // lists.length) {
      let mixinClass = extensionName
      if (interfaceName) {
        mixinClass = `${interfaceData.entity.UCFCCSingular}QL`
      }
      _.each(lists, (list) => {
        let entityData = this.getEntityData(list).entity
        mixinClass = `${entityData.UCFCCSingular}ListMixin(${mixinClass}, '${entityData.LCFCCSingular}')`
      })
      extensionName = mixinClass
    } else if (interfaceName) {
      extensionName = `${interfaceData.entity.UCFCCSingular}QL`
    }
    code.openClass(`${entity.UCFCCSingular}QL`, extensionName)
    // TODO: connect interface children
    // TODO: Add interface resolvers
    code.openFunction(`static create`, `data`)
    if (isInterface) {
      let definedObjects = this.getDefinedSchemaObjects()
      let subTypes = []
      _.each(definedObjects, (type, key) => {
        if (!isAbstractType(type)) {
          if (_.contains(_.map(type.getInterfaces(), 'name'), entity.UCFCCSingular)) {
            subTypes.push(this.getEntityData(key))
          }
        }
      })
      for (let s = 0; s < subTypes.length; s++) {
        code.addLine(`if (data.${entity.LCFCCSingular}Type === '${subTypes[s].entity.LCFCCSingular}') {`)
        code.addInsetLine(`let ${subTypes[s].entity.UCFCCSingular} = require('../${subTypes[s].entity.LCSingular}/data')`)
        code.addLine(`return new ${subTypes[s].entity.UCFCCSingular}(data)`)
        code.addOutsetLine(`}`)
      }
      code.addLine(`return null`)
    } else {
      code.addLine(`return new ${entity.UCFCCSingular}QL(data)`)
    }
    code.closeFunction()

    if (isInterface) {
      let definedObjects = this.getDefinedSchemaObjects()
      let subTypes = []
      _.each(definedObjects, (type, key) => {
        if (!isAbstractType(type)) {
          if (_.contains(_.map(type.getInterfaces(), 'name'), entity.UCFCCSingular)) {
            subTypes.push(this.getEntityData(key))
          }
        }
      })
      code.openFunction(`static resolver`)
      code.addLine(`return {`)
      code.addInsetLine(`${entity.UCFCCSingular}: {`)
      code.addInsetLine(`__resolveType(obj, ctx, info) {`)
      code.inset()
      for (let s = 0; s < subTypes.length; s++) {
        code.addLine(`if (data.${entity.LCFCCSingular}Type === '${subTypes[s].entity.LCFCCSingular}') {`)
        code.addInsetLine(`return '${subTypes[s].entity.UCFCCSingular}'`)
        code.addOutsetLine(`}`)
      }
      code.addLine(`return null`)
      code.addOutsetLine(`}`)
      code.addOutsetLine(`}`)
      code.addOutsetLine(`}`)
      code.closeFunction()
    }

    let fieldDeclerations = []

    if (interfaceName) {
      fieldDeclerations.push({
        dec: `${entity.LCFCCPlural}Type = null`,
        inc: `${entity.LCFCCPlural}Type`,
        ass: `this.${entity.LCFCCPlural}Type = ${entity.LCFCCPlural}Type`,
      })
    }

    _.each(lists, (listItem) => {
      let listEntity = this.getEntityData(listItem)
      if (!listEntity.hasDatasource) {
        let listEntity = this.getEntityData(listItem)
        fieldDeclerations.push({
          dec: `${listEntity.entity.LCFCCPlural} = null`,
          inc: listEntity.entity.LCFCCPlural,
          ass: `this.${listEntity.entity.LCFCCPlural} = ${listEntity.entity.LCFCCPlural}`,
        })
      }
    })

    if (fields.length) {
      _.each(fields, (field) => {
        // console.log(field.name)
        if (field.definition === 'Relation') {
          fieldDeclerations.push({
            dec: `${field.name}Id = null`,
            inc: field.name,
            ass: `this.${field.name}Id = ${field.name}`,
          })
          // code.addLine(`${field.name}Id = null`)
        } else if (field.args.length) {
          fieldDeclerations.push({
            dec: `_${field.name}Id = null`,
            inc: field.name,
            ass: `this._${field.name} = ${field.name}`,
          })
          // code.addLine(`_${field.name} = null`)
        } else if (field.definition === 'Embedded') {
          fieldDeclerations.push({
            dec: `${field.name} = null`,
            inc: field.name,
            ass: `this.${field.name} = ${field.name} && ${field.name} !== 'null' ? ${field.type}.create(${field.name}) : null`,
          })
        } else {
          fieldDeclerations.push({
            dec: `${field.name} = null`,
            inc: field.name,
            ass: `this.${field.name} = ${field.name}`,
          })
          // code.addLine(`${field.name} = null`)
        }
      })
    }
    // console.log(fieldDeclerations)
    // process.exit()

    if (!fieldDeclerations.length) {
      if (hasDatasource) {
        fieldDeclerations = [{
          dec: 'name = null',
          inc: 'name',
          ass: 'this.name = name',
        }, {
          dec: 'createdAt = null',
          inc: 'createdAt',
          ass: 'this.createdAt = createdAt',
        }, {
          dec: 'updatedAt = null',
          inc: 'updatedAt',
          ass: 'this.updatedAt = updatedAt',
        }]
      } else {
        fieldDeclerations = [{
          dec: 'name = null',
          inc: 'name',
          ass: 'this.name = name',
        }]
      }
    }

    _.each(fieldDeclerations, (field) => {
      code.addLine(field.dec)
    })

    code.addLine(``)
    code.openFunction('constructor', 'data')
    code.addLine(`super(data)`)

    let decompilerString = ''
    _.each(fieldDeclerations, (field) => {
      if (decompilerString !== '') {
        decompilerString += ', '
      }
      decompilerString += field.inc
    })
    code.addLine(`let { ${decompilerString} } = data`)
    code.addLine(``)
    _.each(fieldDeclerations, (field) => {
      code.addLine(field.ass)
    })

    code.closeFunction()
    if (fields.length) {
      _.each(fields, (field) => {
        if (field.definition === 'Relation') {
          code.openFunction(field.name, `args, ctx, info`)
          code.addBlock(`
            if (!this.${field.name}Id) {
              return null
            }
            return ${field.type}.one({ _id: this.${field.name}Id }, ctx, info)
          `)
          code.closeFunction()
        } else if (field.args.length) {
          let argsString = ''
          _.each(field.args, (arg) => {
            if (argsString !== '') {
              argsString += ', '
            }
            argsString += arg
          })
          code.openFunction(field.name, `{ ${argsString} }, ctx, info`)
          code.addBlock(`
            return this._${field.name}
          `)
          code.closeFunction()
        }
      })
    } else {
      code.addLine(`// Add your to one relation functions here`)
      code.addLine(``)
    }

    _.each(lists, (listItem) => {
      let listEntity = this.getEntityData(listItem)
      if (listEntity.hasDatasource) {
        let idType = 'this._id'
        let filters = this.getSchemaFilterObject(listEntity.entity.UCFCCSingular)
        if (filters && filters.getFields()[entity.LCFCCSingular]) {
          if (getNullableType(filters.getFields()[entity.LCFCCSingular].type) instanceof GraphQLList) {
            idType = '[this._id]'
          }
        }
        code.addBlock(`
          all${listEntity.entity.UCFCCPlural}(args, ctx, info) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters.${entity.LCFCCSingular} = ${idType}
            return ${listEntity.entity.UCFCCSingular}.list(args, ctx, info)
          }

          one${listEntity.entity.UCFCCSingular}(args, ctx, info) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters.${entity.LCFCCSingular} = ${idType}
            return ${listEntity.entity.UCFCCSingular}.one(args, ctx, info)
          }

          ${listEntity.entity.LCFCCSingular}Count(args, ctx, info) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters.${entity.LCFCCSingular} = ${idType}
            return ${listEntity.entity.UCFCCSingular}.count(args, ctx, info)
          }
        `)
      } else {
        code.addBlock(`
          all${listEntity.entity.UCFCCPlural}({ skip = 0, limit = 1000, filters, order, direction }, ctx, info) {
            let list = _.chain(this.${listEntity.entity.LCFCCPlural})
            .filter((${listEntity.entity.LCFCCSingular}) => {
              return true
            })
            .rest(skip)
            .first(limit)
            .map((${listEntity.entity.LCFCCSingular}) => {
              return ${listEntity.entity.UCFCCSingular}.create(${listEntity.entity.LCFCCSingular})
            })
            .value()
            let total = _.chain(this.${listEntity.entity.LCFCCPlural})
            .filter((${listEntity.entity.LCFCCSingular}) => {
              return true
            })
            .value().length
            return {
              list,
              total,
              skip,
              limit,
            }
          }

          one${listEntity.entity.UCFCCSingular}({ _index }, ctx, info) {
            return ${listEntity.entity.UCFCCSingular}.create(this.${listEntity.entity.LCFCCPlural}[_index])
          }

          ${listEntity.entity.LCFCCSingular}Count(args, ctx, info) {
            return _.chain(this.${listEntity.entity.LCFCCPlural})
            .filter((${listEntity.entity.LCFCCSingular}) => {
              return true
            })
            .value().length
          }
        `)
      }
    })
    code.addLine(``)

    code.closeClass()
    code.addExport(`${entity.UCFCCSingular}QL`)
    // console.log(code.toString())
    // process.exit()
    return code.toString()
  }

}

export default ObjectBuilder
