import deepcopy from 'deepcopy'

class Sequence {

  originalValue = {}
  defaultValues = {}
  steps = {}
  currentStep = 0

  constructor(originalValue = {}) {
    this.reset(originalValue)
  }

  reset(originalValue) {
    this.currentStep = 0
    if (originalValue) {
      this.originalValue = deepcopy(originalValue)
    }
    this.defaultValues = deepcopy(this.originalValue)
  }

  isComplete() {
    if (this.currentStep === this.steps.length - 1) {
      return true
    }
    return false
  }

  nextStep() {
    this.currentStep++
    let step = this.getObjectIndexKey(this.steps, this.currentStep)
    let defaultValues = deepcopy(this.defaultValues)
    let data = deepcopy(this.defaultValues)
    let duration = this.step(this.steps[step], defaultValues, data)
    this.defaultValues = deepcopy(data)
    return {
      duration,
      defaultValues,
      data,
    }
  }

  steps(step, defaultValues, data) {
    throw new Error('Steps Function must be over-written')
  }

  getObjectIndexKey(obj, index) {
    let i = 0
    let key
    for (key in obj) {
      if (i === index) {
        return key
      }
      i++
    }
    return null
  }

  getObjectKeyIndex(obj, keyToFind) {
    let i = 0
    let key
    for (key in obj) {
      if (key === keyToFind) {
        return i
      }
      i++
    }
    return 0
  }

}

export default Sequence
