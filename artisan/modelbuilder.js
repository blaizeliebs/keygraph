let _ = require('underscore')
let {
  isAbstractType,
  getNullableType,
  getNamedType,
  GraphQLList,
  GraphQLID,
} = require('graphql')
let Builder = require('./builder')
let CodeGen = require('./codegen')

class ModelBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    let fields = this.getSchemaFields(entity.UCFCCSingular)

    code.reset()

    code.addBlock(`
      let _ = require('underscore')
      let Promise = require('bluebird')
      let permissions = require('../../supporting/permissions')
      let Model = require('../../../lib/apimodel')
    `)
    code.openClass(`${entity.UCFCCSingular}Model`, `APIModel`)
    if (hasDatasource) {
      let interfaceData = false
      if (interfaceName) {
        interfaceData = this.getEntityData(interfaceName)
        code.addLine(`static collectionName = '${interfaceData.entity.LCPlural}'`)
      } else {
        code.addLine(`static collectionName = '${entity.LCPlural}'`)
      }
      if (hasMutations && !isInterface) {
        code.addLine(``)
        code.openFunction(`static add`, '{ input }, ctx')
        code.addBlock(`
          return new Promise((resolve, reject) => {
            let requiredPermissions = [{
              permission: permissions.${entity.UCPlural}_WRITE,
              id: null,
            }, {
              permission: permissions.${entity.UCPlural}_ADD,
              id: null,
            }]
            if (!ctx.user.hasAnyPermission(requiredPermissions)) {
              throw new Error(JSON.stringify({ message: 'You do not have permission to add ${entity.UCFCCPlural}', code: 401 }))
            }
            ${interfaceName ? `input.${interfaceData.entity.LCFCCSingular}Type = '${entity.LCFCCSingular}'` : ''}
            input.createdAt = new Date()
            input.updatedAt = new Date()
            ${entity.UCFCCSingular}Model.getConnection()
            .then((db) => {
              let collection = db.collection(${entity.UCFCCSingular}Model.collectionName)
              collection.insert([input])
              .then((response) => {
                return ${entity.UCFCCSingular}Model.one({ _id: response.insertedIds[0] }, ctx)
              })
              .then((${entity.LCFCCSingular}) => {
                resolve(${entity.LCFCCSingular})
              })
              .catch(reject)
              .finally(() => {
                db.close()
              })
            })
            .catch(reject)
          })
        `)
        code.closeFunction()
        code.openFunction(`static update`, `{ _id, input }, ctx`)
        code.addBlock(`
          return new Promise((resolve, reject) => {
            let requiredPermissions = [{
              permission: permissions.${entity.UCPlural}_WRITE,
              id: null,
            }, {
              permission: permissions.${entity.UCPlural}_UPDATE,
              id: _id,
            }]
            if (!ctx.user.hasAnyPermission(requiredPermissions)) {
              throw new Error(JSON.stringify({ message: 'You do not have permission to update ${entity.UCFCCPlural}', code: 401 }))
            }
            input.updatedAt = new Date()
            ${entity.UCFCCSingular}Model.getConnection()
            .then((db) => {
              let collection = db.collection(${entity.UCFCCSingular}Model.collectionName)
              collection.update({ _id: ${entity.UCFCCSingular}Model.objectId(_id) }, { $set: input })
              .then((response) => {
                return ${entity.UCFCCSingular}Model.one({ _id }, ctx)
              })
              .then((${entity.LCFCCSingular}) => {
                resolve(${entity.LCFCCSingular})
              })
              .catch(reject)
              .finally(() => {
                db.close()
              })
            })
            .catch(reject)
          })
        `)
        code.closeFunction()
        code.openFunction(`static remove`, `{ _id }, ctx`)
        code.addBlock(`
          return new Promise((resolve, reject) => {
            let requiredPermissions = [{
              permission: permissions.${entity.UCPlural}_WRITE,
              id: null,
            }, {
              permission: permissions.${entity.UCPlural}_REMOVE,
              id: _id,
            }]
            if (!ctx.user.hasAnyPermission(requiredPermissions)) {
              throw new Error(JSON.stringify({ message: 'You do not have permission to remove ${entity.UCFCCPlural}', code: 401 }))
            }
            ${entity.UCFCCSingular}Model.getConnection()
            .then((db) => {
              let collection = db.collection(${entity.UCFCCSingular}Model.collectionName)
              collection.remove({ _id: ${entity.UCFCCSingular}Model.objectId(_id) }, ctx)
              .then((response) => {
                return resolve(_id)
              })
              .catch(reject)
              .finally(() => {
                db.close()
              })
            })
            .catch(reject)
          })
        `)
        code.closeFunction()
      }
      code.openFunction(`static one`, `{ _id }, ctx`)
      code.addBlock(`
        return new Promise((resolve, reject) => {
          let requiredPermissions = [{
            permission: permissions.${entity.UCPlural}_READ,
            id: null,
          }, {
            permission: permissions.${entity.UCPlural}_ONE,
            id: _id,
          }]
          if (!ctx.user.hasAnyPermission(requiredPermissions)) {
            throw new Error(JSON.stringify({ message: 'You do not have permission to access this ${entity.UCFCCSingular}', code: 401 }))
          }
          ${entity.UCFCCSingular}Model.getConnection()
          .then((db) => {
            let collection = db.collection(${entity.UCFCCSingular}Model.collectionName)
            collection.findOne({ _id: ${entity.UCFCCSingular}Model.objectId(_id) })
            .then((one) => {
              return resolve(${entity.UCFCCSingular}Model.create(one))
            })
            .catch(reject)
            .finally(() => {
              db.close()
            })
          })
          .catch(reject)
        })
      `)
      code.closeFunction()
      code.openFunction(`static list`, `{ skip = 0, limit = 1000, filters, order, direction }, ctx`)
      code.addBlock(`
        let where = ${entity.UCFCCSingular}Model.getFilters({}, filters)
        let sort = ${entity.UCFCCSingular}Model.getOrder({}, order, direction)
        return new Promise((resolve, reject) => {
          let requiredPermissions = [{
            permission: permissions.${entity.UCPlural}_READ,
            id: null,
          }, {
            permission: permissions.${entity.UCPlural}_ALL,
            id: null,
          }]
          if (!ctx.user.hasAnyPermission(requiredPermissions)) {
            throw new Error(JSON.stringify({ message: 'You do not have permission to access ${entity.UCFCCSingular}s', code: 401 }))
          }
          ${entity.UCFCCSingular}Model.getConnection()
          .then((db) => {
            let collection = db.collection(${entity.UCFCCSingular}Model.collectionName)
            Promise.resolve()
            .then(() => {
              return [
                collection.find(where).skip(skip).limit(limit).sort(sort).toArray(),
                collection.count(where)
              ]
            })
            .spread((list, count) => {
              return resolve({
                list: _.map(list, (item) => {
                  return ${entity.UCFCCSingular}Model.create(item)
                }),
                total: count,
                skip: skip,
                limit: limit
              })
            })
            .catch(reject)
            .finally(() => {
              db.close()
            })
          })
          .catch(reject)
        })
      `)
      code.closeFunction()
      code.openFunction(`static all`, `{ skip = 0, limit = 1000, filters, order, direction }, ctx`)
      code.addBlock(`
        return new Promise((resolve, reject) => {
          let requiredPermissions = [{
            permission: permissions.${entity.UCPlural}_READ,
            id: null,
          }, {
            permission: permissions.${entity.UCPlural}_ALL,
            id: null,
          }]
          if (!ctx.user.hasAnyPermission(requiredPermissions)) {
            throw new Error(JSON.stringify({ message: 'You do not have permission to access ${entity.UCFCCSingular}s', code: 401 }))
          }
          ${entity.UCFCCSingular}Model.getConnection()
          .then((db) => {
            let collection = db.collection(${entity.UCFCCSingular}Model.collectionName)
            let where = ${entity.UCFCCSingular}Model.getFilters({}, filters)
            let sort = ${entity.UCFCCSingular}Model.getOrder({}, order, direction)
            collection.find(where).skip(skip).limit(limit).sort(sort).toArray()
            .then((all) => {
              resolve(_.map(all, (item) => {
                return ${entity.UCFCCSingular}Model.create(item)
              }))
            })
            .catch(reject)
            .finally(() => {
              db.close()
            })
          })
          .catch(reject)
        })
      `)
      code.closeFunction()
      code.openFunction(`static count`, `{ filters }, ctx`)
      code.addBlock(`
        return new Promise((resolve, reject) => {
          let requiredPermissions = [{
            permission: permissions.${entity.UCPlural}_READ,
            id: null,
          }, {
            permission: permissions.${entity.UCPlural}_COUNT,
            id: null,
          }]
          if (!ctx.user.hasAnyPermission(requiredPermissions)) {
            throw new Error(JSON.stringify({ message: 'You do not have permission to count ${entity.UCFCCSingular}s', code: 401 }))
          }
          ${entity.UCFCCSingular}Model.getConnection()
          .then((db) => {
            let collection = db.collection(${entity.UCFCCSingular}Model.collectionName)
            let where = ${entity.UCFCCSingular}Model.getFilters({}, filters)
            collection.count(where)
            .then((count) => {
              return resolve(count)
            })
            .catch(reject)
            .finally(() => {
              db.close()
            })
          })
          .catch(reject)
        })
      `)
      code.closeFunction()
      code.openFunction(`static getOrder`, `order, parameter = 'CTIME', direction = 'ASC'`)
      code.addBlock(`
        let directionNumber = direction == 'ASC' || !direction ? 1 : -1
        if (parameter == 'CTIME' || !parameter) {
          order['createdAt'] = directionNumber
        }
        return order
      `)
      code.closeFunction()
      code.openFunction(`static getFilters`, `where, filters`)
      code.addLine(`// Add your list/count filter logic here`)
      if (interfaceName) {
        let interfaceData = this.getEntityData(interfaceName)
        code.addLine(`where.${interfaceData.entity.LCFCCSingular}Type = '${entity.LCFCCSingular}'`)
      } else {
        code.addLine(`if (!filters) {`)
        code.addInsetLine(`return where`)
        code.addOutsetLine(`}`)
      }
      let filters = this.getSchemaFilterObject(entity.UCFCCSingular)
      let standardFilters = ['minCtime', 'maxCtime', 'minMtime', 'maxMtime', 'query']
      let relationExclustions = []
      if (filters) {
        relationExclustions = _.map(filters.getFields(), (definition, key) => {
          return key
        })
      }

      if (fields.length) {
        let deconstructorString = `let { query, minCtime, maxCtime, minMtime, maxMtime`
        _.each(fields, (field) => {
          if (field.definition == 'Relation' && !_.contains(relationExclustions, field.name)) {
            deconstructorString += `, ${field.name}`
          }
        })
        if (filters) {
          _.each(filters.getFields(), (definition, key) => {
            if (!_.contains(standardFilters, key)) {
              deconstructorString += `, ${key}`
            }
          })
        }
        deconstructorString += ' } = filters'
        code.addLine(deconstructorString)
        code.addLine(``)
        _.each(fields, (field) => {
          if (field.definition == 'Relation' && !_.contains(relationExclustions, field.name)) {
            code.addLine(`if (${field.name}) {`)
            code.addInsetLine(`where.${field.name} = ${field.name}`)
            code.addOutsetLine(`}`)
          }
        })
      } else {
        code.addLine(`let { query, minCtime, maxCtime, minMtime, maxMtime } = filters`)
      }
      if (filters) {
        _.each(filters.getFields(), (definition, key) => {
          if (!_.contains(standardFilters, key)) {
            if (getNullableType(definition.type) instanceof GraphQLList && getNamedType(definition.type) == GraphQLID) {
              code.addBlock(`
                if (${key}) {
                  where.${key} = {
                    $in: _.map(${key}, (item) => {
                      return ${entity.UCFCCSingular}Model.objectId(item)
                    })
                  }
                }
              `)
            } else if (getNamedType(definition.type) == GraphQLID) {
              code.addBlock(`
                if (${key}) {
                  where.${key} = ${entity.UCFCCSingular}Model.objectId(${key})
                }
              `)
            } else {
              code.addBlock(`
                if (${key}) {
                  // TODO
                }
              `)
            }
          }
        })
      }
      code.addBlock(`
        if (query) {
          // TODO
        }
        if (minCtime) {
          where.createdAt = { $gte: minCtime }
        }
        if (maxCtime) {
          where.createdAt = { $lt: maxCtime }
        }
        if (minMtime) {
          where.updatedAt = { $gte: minMtime }
        }
        if (maxMtime) {
          where.updatedAt = { $lt: maxMtime }
        }
        return where
      `)

      code.closeFunction()
    }

    code.closeClass()
    code.addExport(`${entity.UCFCCSingular}Model`)
    // console.log(code.toString())
    // process.exit()
    return code.toString()
  }

}

module.exports = ModelBuilder
