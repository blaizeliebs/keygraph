let _ = require('underscore')
let CodeGen = require('./codegen')
let Builder = require('./builder')

class SchemaBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entityFile, entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    code.reset()
    let exportItems = []
    code.addLine(`const schemaDefinitions = \``)
    code.inset()
    code.addLine(``)
    if (hasList) {
      code.addBlock(`
        enum ${entity.UCFCCSingular}OrderEnum {
          # Add your order options here
          NAME # remove if not needed
          CTIME
          MTIME
        }
      `)
      code.addLine(``)
    }
    if ((hasMutations && !isInterface) || interfaceName) {
      code.addBlock(`
        input Add${entity.UCFCCSingular}Input {
          # Add your insert inputs here
          name: String! # remove if not needed
        }

        input Update${entity.UCFCCSingular}Input {
          # Add your update inputs here
          name: String # remove if not needed
        }
      `)
      code.addLine(``)
    }
    if (hasList) {
      code.addBlock(`
        input ${entity.UCFCCSingular}Filters {
          query: String
          # Add your filters here
          minCtime: Date
          maxCtime: Date
          minMtime: Date
          maxMtime: Date
        }

        type ${entity.UCFCCSingular}List {
          list: [${entity.UCFCCSingular}]!
          total: Int!
          skip: Int!
          limit: Int!
        }
      `)
      code.addLine(``)
    }
    if (isInterface) {
      code.addBlock(`
        interface ${entity.UCFCCSingular} {
          _id: ID!
          # Add your entity parameters here
          name: String! # remove if not needed
          createdAt: Date!
          updatedAt: Date!
        }
      `)
    } else if (interfaceName) {
      code.addLine(`type ${entity.UCFCCSingular} implements ${interfaceName} {`)
      code.inset()
      let interfaceSchema = this.getSchemaData(interfaceName)
      code.addLine(`# Must reflect all ${interfaceName} parameters`)
      _.each(interfaceSchema.getFields(), (field, key) => {
        if (field.args.length) {
          let argString = ''
          _.each(field.args, (arg) => {
            if (argString !== '') {
              argString += ', '
            }
            argString += `${arg.name}:${arg.type}`
          })
          code.addLine(`${field.name}(${argString}): ${field.type}`)
        } else {
          code.addLine(`${field.name}: ${field.type}`)
        }
      })
      code.addLine(`# Add extra entity parameters here`)
      code.addOutsetLine(`}`)
    } else if (hasDatasource) {
      code.addBlock(`
        type ${entity.UCFCCSingular} {
          _id: ID!
          # Add your entity parameters here
          name: String! # remove if not needed
          createdAt: Date!
          updatedAt: Date!
        }
      `)
    } else {
      code.addBlock(`
        type ${entity.UCFCCSingular} {
          # Add your entity parameters here
          name: String! # remove if not needed
        }
      `)
    }
    code.addLine(``)
    code.addOutsetLine(`\``)
    code.addLine(``)
    if (hasList) {
      if (!hasDatasource) {
        code.addBlock(`
          const listDefinitions = \`
            all${entity.UCFCCPlural}(skip:Int, limit:Int, filters:${entity.UCFCCSingular}Filters, order:${entity.UCFCCSingular}OrderEnum, direction:OrderDirectionEnum): ${entity.UCFCCSingular}List
            one${entity.UCFCCSingular}(_index: Int!): ${entity.UCFCCSingular}
            ${entity.LCFCCSingular}Count(filters:${entity.UCFCCSingular}Filters): Int!
          \`
        `)
      } else {
        code.addBlock(`
          const listDefinitions = \`
            all${entity.UCFCCPlural}(skip:Int, limit:Int, filters:${entity.UCFCCSingular}Filters, order:${entity.UCFCCSingular}OrderEnum, direction:OrderDirectionEnum): ${entity.UCFCCSingular}List
            one${entity.UCFCCSingular}(_id: ID!): ${entity.UCFCCSingular}
            ${entity.LCFCCSingular}Count(filters:${entity.UCFCCSingular}Filters): Int!
          \`
        `)
      }
    } else {
      code.addLine(`const listDefinitions = \`\``)
    }
    code.addLine(``)

    if ((hasMutations && !isInterface) || interfaceName) {
      code.addBlock(`
        const mutationDefinitions = \`
          add${entity.UCFCCSingular}(input: Add${entity.UCFCCSingular}Input!): ${entity.UCFCCSingular}!
          update${entity.UCFCCSingular}(_id: ID!, input: Update${entity.UCFCCSingular}Input!): ${entity.UCFCCSingular}!
          remove${entity.UCFCCSingular}(_id: ID!): ID!
        \`
      `)
    } else {
      code.addLine(`const mutationDefinitions = \`\``)
    }
    code.addLine(``)
    code.addBlock(`
      const ${entity.LCFCCSingular}Schema = {
        getSchemaDefinitions: () => schemaDefinitions,
        getListDefinitions: () => listDefinitions,
        getMutationDefinitions: () => mutationDefinitions,
      }
    `)
    code.addLine(``)
    code.addLine(`module.exports = ${entity.LCFCCSingular}Schema`)

    return code.toString()
  }

}

module.exports = SchemaBuilder
