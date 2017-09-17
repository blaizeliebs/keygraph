let fs = require('fs')
let path = require('path')
let _ = require('underscore')
let sh = require('shelljs')

let {
  getNullableType,
  getNamedType,
  isInputType,
  isOutputType,
  isLeafType,
  isCompositeType,
  isAbstractType,
  GraphQLNonNull,
  GraphQLEnumType,
} = require('graphql')

class Builder {

  constructor(schema, entityData) {
    this.schema = schema
    this.entityData = entityData
  }

  getEntitySchemaDirectory(name) {
    let directory = sh.pwd().toString()
    let schemaDir = path.join(directory, `./src/api/schema/entities/${name.toLowerCase()}/`)
    return schemaDir
  }

  getEntityData(name) {
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(`${schemaDir}artisan.json`)) {
      console.log((`***** No artisan.json file found for ${name} *****`))
      throw new Error(`No artisan.json file found for ${name}`)
    }
    return JSON.parse(fs.readFileSync(`${schemaDir}artisan.json`, 'utf-8'))
  }

  setEntityData(name, data) {
    let schemaDir = this.getEntitySchemaDirectory(name)
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir)
    }
    fs.writeFileSync(`${schemaDir}artisan.json`, JSON.stringify(data, null, 2))
  }

  getSchemaData(name) {
    if (this.schema._typeMap[name]) {
      return this.schema._typeMap[name]
    }
    return null
    // throw new Error(`No schema definition found for ${name}`)
  }

  getDefinedSchemaObjects() {
    let types = this.schema._typeMap
    let returnObjects = {}
    _.each(types, (type, key) => {
      if (!isLeafType(type) && isOutputType(type)) {
        // console.log(key+' IS OBJECT')
        if (key !== 'Data' && key !== 'Query' && key !== 'Mutation' && key !== 'Subscription' && key.indexOf('__') === -1 && key.indexOf('List') === -1) {
          returnObjects[key] = type
        }
      }
    })
    return returnObjects
  }

  getSchemaFilterObject(entity) {
    let types = this.schema._typeMap
    if (types[`${entity}Filters`]) {
      return types[`${entity}Filters`]
    }
    return false
  }

  getSchemaLists(name) {
    let schemData = this.getSchemaData(name)
    let lists = []
    if (!schemData) {
      return lists
    }
    // return lists
    _.each(schemData.getFields(), (field, key) => {
      // console.log(`\n\n*******************************************************`)
      // console.log(field.name)
      // console.log(key)
      // console.log(`*******************************************************`)
      // console.log(`isInputType: ${isInputType(getNamedType(field.type))}`)
      // console.log(`isOutputType: ${isOutputType(getNamedType(field.type))}`)
      // console.log(`isLeafType: ${isLeafType(getNamedType(field.type))}`)
      // console.log(`isCompositeType: ${isCompositeType(getNamedType(field.type))}`)
      // console.log(`isAbstractType: ${isAbstractType(getNamedType(field.type))}`)
      if (isCompositeType(getNamedType(field.type))) {
        // console.log('IS COMPOSITE')
        // console.log(getNullableType(field.type).getFields())
        if (getNullableType(field.type).getFields()['list'] !== undefined &&
          getNullableType(field.type).getFields()['total'] !== undefined &&
          getNullableType(field.type).getFields()['skip'] !== undefined &&
          getNullableType(field.type).getFields()['limit'] !== undefined) {
          // console.log('HAS LIST KEYS')
          let relationName = getNamedType(getNullableType(field.type).getFields().list.type).name
          lists.push(relationName)
        }
      }
      // console.log(`*******************************************************\n\n`)
    })
    return lists
  }

  getSchemaChildren(name) {
    let objects = this.getDefinedSchemaObjects()
    let children = []
    _.each(objects, (type, key) => {
      if (!isAbstractType(type)) {
        if (_.contains(_.map(type.getInterfaces(), 'name'), name)) {
          children.push(key)
        }
      }
    })
    return children
  }

  // TODO: clean this up
  getSchemaFields(name, withLists = false) {
    let schemData = this.getSchemaData(name)
    let fields = []
    if (!schemData) {
      return fields
    }
    let excludedFields = []
    let lists = this.getSchemaLists(name)
    _.each(lists, (list) => {
      let listData = this.getEntityData(list).entity
      excludedFields.push(`all${listData.UCFCCPlural}`)
      excludedFields.push(`one${listData.UCFCCSingular}`)
      excludedFields.push(`${listData.LCFCCSingular}Count`)
    })
    _.each(schemData.getFields(), (field, key) => {
      if (field.name !== '_id') {
        if (field.type.name === 'Date') {
          fields.push({
            name: key,
            type: field.type.name,
            definition: 'Date',
            required: field.type.name instanceof GraphQLNonNull,
            args: _.map(field.args, (arg) => {
              return arg.name
            }),
          })
        } else if (isLeafType(getNullableType(field.type))) {
          if (_.contains(excludedFields, field.name)) {
            if (withLists) {
              if (getNullableType(field.type) instanceof GraphQLEnumType) {
                fields.push({
                  name: key,
                  type: getNamedType(field.type).name,
                  definition: 'Enum',
                  required: field.type.name instanceof GraphQLNonNull,
                  options: _.map(getNullableType(field.type).getValues(), (option) => {
                    return {
                      value: option.value,
                      label: this.snakeCaseToSentence(option.name),
                    }
                  }),
                  args: _.map(field.args, (arg) => {
                    return arg.name
                  }),
                })
              } else {
                fields.push({
                  name: key,
                  type: getNamedType(field.type).name,
                  definition: 'Leaf',
                  required: field.type.name instanceof GraphQLNonNull,
                  args: _.map(field.args, (arg) => {
                    return arg.name
                  }),
                })
              }
            }
          } else {
            if (getNullableType(field.type) instanceof GraphQLEnumType) {
              fields.push({
                name: key,
                type: getNamedType(field.type).name,
                definition: 'Enum',
                required: field.type.name instanceof GraphQLNonNull,
                options: _.map(getNullableType(field.type).getValues(), (option) => {
                  return {
                    value: option.value,
                    label: this.snakeCaseToSentence(option.name),
                  }
                }),
                args: _.map(field.args, (arg) => {
                  return arg.name
                }),
              })
            } else {
              fields.push({
                name: key,
                type: getNamedType(field.type).name,
                definition: 'Leaf',
                required: field.type.name instanceof GraphQLNonNull,
                args: _.map(field.args, (arg) => {
                  return arg.name
                }),
              })
            }
          }
        } else {
          if (_.contains(excludedFields, field.name)) {
            if (withLists) {
              // console.log(`EMBEDDED ONE: ${field.name}`)
              fields.push({
                name: key,
                type: getNamedType(field.type).name,
                definition: 'Embedded',
                required: field.type.name instanceof GraphQLNonNull,
                args: _.map(field.args, (arg) => {
                  return arg.name
                }),
              })
            }
          } else {
            let isEnumArray = getNamedType(field.type) instanceof GraphQLEnumType
            let fieldData
            if (!isEnumArray) {
              fieldData = this.getEntityData(getNamedType(field.type).name)
            }
            if (!isEnumArray && fieldData.hasDatasource) {
              fields.push({
                name: key,
                type: getNamedType(field.type).name,
                definition: 'Relation',
                required: field.type.name instanceof GraphQLNonNull,
                args: _.map(field.args, (arg) => {
                  return arg.name
                }),
              })
            } else if (isEnumArray) {
              fields.push({
                name: key,
                type: getNamedType(field.type).name,
                definition: 'EnumArray',
                required: field.type.name instanceof GraphQLNonNull,
                options: _.map(getNamedType(field.type).getValues(), (option) => {
                  return {
                    value: this.snakeCaseToCamelCase(option.value),
                    label: this.snakeCaseToSentence(option.name),
                  }
                }),
                args: _.map(field.args, (arg) => {
                  return arg.name
                }),
              })
            } else {
              fields.push({
                name: key,
                type: getNamedType(field.type).name,
                definition: 'Embedded',
                required: field.type.name instanceof GraphQLNonNull,
                args: _.map(field.args, (arg) => {
                  return arg.name
                }),
              })
            }
          }
        }
      }
    })
    return fields
  }

  camelCaseToSentence(camelCase) {
    let newString = ''
    for (let i = 0; i < camelCase.length; i++) {
      if (i === 0) {
        newString += camelCase.substr(i, 1).toUpperCase()
      } else if (this.isUpperCase(camelCase.substr(i, 1))) {
        newString += ` ${camelCase.substr(i, 1)}`
      } else {
        newString += camelCase.substr(i, 1)
      }
    }
    return newString
  }

  snakeCaseToSentence(snakeCase) {
    let newString = ''
    let shouldCastToUpper = true
    for (let i = 0; i < snakeCase.length; i++) {
      if (shouldCastToUpper) {
        newString += snakeCase.substr(i, 1).toUpperCase()
        shouldCastToUpper = false
      } else if (snakeCase.substr(i, 1) === '_') {
        newString += ' '
        shouldCastToUpper = true
      } else {
        newString += snakeCase.substr(i, 1).toLowerCase()
      }
    }
    return newString
  }

  snakeCaseToCamelCase(snakeCase) {
    let newString = ''
    let shouldCastToUpper = false
    for (let i = 0; i < snakeCase.length; i++) {
      if (shouldCastToUpper) {
        newString += snakeCase.substr(i, 1).toUpperCase()
        shouldCastToUpper = false
      } else if (snakeCase.substr(i, 1) === '_') {
        shouldCastToUpper = true
      } else {
        newString += snakeCase.substr(i, 1).toLowerCase()
      }
    }
    return newString
  }

  isUpperCase(char) {
    return char === char.toUpperCase()
  }

}

module.exports = Builder
