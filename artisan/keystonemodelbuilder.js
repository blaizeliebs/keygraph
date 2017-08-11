import * as _ from 'underscore'
import {
  isAbstractType,
} from 'graphql'
import Builder from './builder'
import CodeGen from './codegen'

class KeystoneModelBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  addFields(code, fields, lists) {
    code.inset()
    _.each(fields, (field) => {
      if (field.name === 'createdAt') {
        code.addBlock(`
          createdAt: {
            type: Types.Date,
            default: new Date(),
            required: false,
            initial: false,
            noedit: true,
          },
        `)
      } else if (field.name === 'updatedAt') {
        code.addBlock(`
          updatedAt: {
            type: Types.Date,
            default: new Date(),
            required: false,
            initial: false,
            noedit: true,
          },
        `)
      } else if (field.definition === 'Relation') {
        code.addLine(`${field.name}: {`)
        code.addInsetLine(`type: Types.Relationship,`)
        code.addLine(`ref: '${field.type}',`)
        code.addLine(`required: ${field.required},`)
        code.addLine(`initial: ${field.required},`)
        if (field.requiredValue) {
          code.addLine(`dependsOn: { ${field.requiredKey}: '${field.requiredValue}' },`)
        }
        if (field.noedit) {
          code.addLine(`noedit: true,`)
        }
        if (field.isListType) {

        }
        code.addOutsetLine(`},`)
      } else if (field.definition === 'Embedded') {
        let embeddedFields = this.getSchemaFields(field.type)
        let embeddedLists = this.getSchemaLists(field.type)
        code.addLine(`${field.name} :{`)
        this.addFields(code, embeddedFields, embeddedLists)
        if (field.requiredValue) {
          code.inset()
          code.addLine(`dependsOn: { ${field.requiredKey}: '${field.requiredValue}' },`)
          code.outset()
        }
        if (field.noedit) {
          code.inset()
          code.addLine(`noedit: true,`)
          code.outset()
        }
        code.addLine('},')
      } else if (field.type === 'Select' || field.definition === 'Enum') {
        code.addLine(`${field.name}: {`)
        code.addInsetLine(`type: Types.Select,`)
        if (!field.requiredValue) {
          code.addLine(`required: ${field.required},`)
          code.addLine(`initial: ${field.required},`)
        }
        if (field.requiredValue) {
          code.addLine(`dependsOn: { ${field.requiredKey}: '${field.requiredValue}' },`)
        }
        if (field.noedit) {
          code.addLine(`noedit: true,`)
        }
        code.addLine(`options: [`)
        code.inset()
        _.each(field.options, (option) => {
          code.addBlock(`
            {
              value: '${option.value}',
              label: '${option.label}'
            },
          `)
        })
        code.addOutsetLine(`]`)
        code.addOutsetLine(`},`)
      } else if (field.type === 'Int' || field.type === 'Float') {
        code.addLine(`${field.name}: {`)
        code.addInsetLine(`type: Types.Number,`)
        code.addLine(`required: ${field.required},`)
        code.addLine(`initial: ${field.required},`)
        if (field.requiredValue) {
          code.addLine(`dependsOn: { ${field.requiredKey}: '${field.requiredValue}' },`)
        }
        if (field.noedit) {
          code.addLine(`noedit: true,`)
        }
        code.addOutsetLine(`},`)
      } else if (field.type === 'String' || field.type === 'Boolean') {
        code.addLine(`${field.name}: {`)
        code.addInsetLine(`type: ${field.type},`)
        code.addLine(`required: ${field.required},`)
        code.addLine(`initial: ${field.required},`)
        if (field.requiredValue) {
          code.addLine(`dependsOn: { ${field.requiredKey}: '${field.requiredValue}' },`)
        }
        if (field.noedit) {
          code.addLine(`noedit: true,`)
        }
        code.addOutsetLine(`},`)
      } else if (field.definition === 'EnumArray') {
        code.addLine(`${field.name}: {`)
        code.inset()
        _.each(field.options, (option) => {
          code.addLine(`${option.value}: {`)
          code.inset()
          code.addLine(`type: Types.Boolean`)
          if (field.requiredValue) {
            code.addLine(`dependsOn: { ${field.requiredKey}: '${field.requiredValue}' },`)
          }
          if (field.noedit) {
            code.addLine(`noedit: true,`)
          }
          code.addOutsetLine(`},`)
        })
        code.addOutsetLine(`},`)
      } else {
        code.addLine(`${field.name}: {`)
        code.addInsetLine(`type: Types.${field.type},`)
        code.addLine(`required: ${field.required},`)
        code.addLine(`initial: ${field.required},`)
        if (field.requiredValue) {
          code.addLine(`dependsOn: { ${field.requiredKey}: '${field.requiredValue}' },`)
        }
        if (field.noedit) {
          code.addLine(`noedit: true,`)
        }
        code.addOutsetLine(`},`)
      }
    })
    // _.each(lists, (list) => {
    //   let entityData = this.getEntityData(list.name)
    //   code.addLine(`${entityData.entity.LCFCCSingular}: {`)
    //   code.addInsetLine(`type: Types.Relationship,`)
    //   code.addLine(`ref: '${entityData.entity.UCFCCSingular}',`)
    //   code.addLine(`many: true,`)
    //   if (list.requiredValue) {
    //     code.addLine(`dependsOn: { ${list.requiredKey}: '${list.requiredValue}' },`)
    //   }
    //   code.addOutsetLine(`},`)
    // })
    code.outset()
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    if (interfaceName || !hasDatasource) {
      return
    }
    let code = new CodeGen()
    let fields = this.getSchemaFields(entity.UCFCCSingular)
    let lists = _.map(this.getSchemaLists(entity.UCFCCSingular), (list) => {
      return {
        name: list,
      }
    })
    // console.log(fields)
    // console.log(lists)
    code.reset()
    code.addLine(`let keystone = require('keystone')`)
    code.addLine(`let validate${entity.UCFCCSingular} = require('../../common/validators/${entity.LCSingular}')`)
    code.addLine(`let Types = keystone.Field.Types`)
    code.addLine(``)
    code.addBlock(`
      var ${entity.UCFCCSingular} = new keystone.List('${entity.UCFCCSingular}', {
        singular: '${entity.UCFCCSingular}',
        plural: '${entity.UCFCCPlural}'
      })
    `)
    code.addLine(``)
    code.addLine(`${entity.UCFCCSingular}.add({`)
    if (isInterface) {
      let childItems = this.getSchemaChildren(entity.UCFCCSingular)
      let optionItems = []
      // console.log(childItems)
      // console.log(fields)
      _.each(childItems, (child) => {
        let childFields = this.getSchemaFields(child)
        let childData = this.getEntityData(child)
        // console.log(childFields)
        optionItems.push({
          value: childData.entity.LCFCCSingular,
          label: this.camelCaseToSentence(childData.entity.UCFCCSingular),
        })
        let embeddedLists = _.map(this.getSchemaLists(child), (list) => {
          return {
            name: list,
          }
        })
        for (var c = 0; c < childFields.length; c++) {
          let found = false
          for (var f = 0; f < fields.length; f++) {
            if (childFields[c].name === fields[f].name && childFields[c].type === fields[f].type && childFields[c].definition === fields[f].definition) {
              found = true
              break
            }
          }
          if (!found) {
            let entityData = this.getEntityData(child)
            childFields[c].requiredValue = entityData.entity.LCFCCSingular
            childFields[c].requiredKey = `${entity.LCFCCSingular}Type`
            fields.push(childFields[c])
          }
        }
      })
      fields.push({
        name: `${entity.LCFCCSingular}Type`,
        type: 'Select',
        definition: 'Leaf',
        required: true,
        options: optionItems,
      })
      this.addFields(code, fields, lists)
    } else {
      this.addFields(code, fields, lists)
    }

    code.addLine('})')
    code.addLine(``)

    code.addBlock(`
      ${entity.UCFCCSingular}.schema.pre('save', function(next) {
        this.updatedAt = new Date()
        let model = this
        validate${entity.UCFCCSingular}(model, true)
        .then(() => {
          next()
        })
        .catch((err) => {
          next(err)
        })
      })
    `)

    code.addLine(`${entity.UCFCCSingular}.register()`)

    return code.toString()
  }

}

export default KeystoneModelBuilder
