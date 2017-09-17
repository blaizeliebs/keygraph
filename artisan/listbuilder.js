let _ = require('underscore')
let {
  isAbstractType,
} = require('graphql')
let Builder = require('./builder')
let CodeGen = require('./codegen')

class ListBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    code.reset()
    code.addBlock(`
      let ${entity.UCFCCSingular} = require('./data')

      let ${entity.UCFCCSingular}ListMixin = (superclass, filterName = false) => class extends superclass {

        constructor(data) {
          super(data)
        }
        all${entity.UCFCCPlural}(args, ctx, info) {
          if (filterName) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters[filterName] = this._id
          }
          return ${entity.UCFCCSingular}.list(args, ctx, info)
        }
        one${entity.UCFCCSingular}(args, ctx, info) {
          if (filterName) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters[filterName] = this._id
          }
          return ${entity.UCFCCSingular}.one(args, ctx, info)
        }
        ${entity.LCFCCSingular}Count(args, ctx, info) {
          if (filterName) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters[filterName] = this._id
          }
          return ${entity.UCFCCSingular}.count(args, ctx, info)
        }
      }

      module.exports = ${entity.UCFCCSingular}ListMixin
    `)

    return code.toString()
  }

}

module.exports = ListBuilder
