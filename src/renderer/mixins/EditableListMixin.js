const noop = () => {}

export default {
  methods: {
    // TODO: Enable removing item anywhere in list
    // TODO: Ensure removed item doesn't have dependent data (geometry segments)
    removeListItem (item) {
      const { list } = this
      const { index } = item
      if (index !== list.length - 1) return

      this.willRemoveListItem(item, index)
      list.splice(index, 1)
      this.didRemoveListItem(item, index)
    },

    willRemoveListItem: noop,
    didRemoveListItem: noop,

    duplicateListItem (item) {
      const { list } = this
      const { name } = item
      const nameCount = list.reduce((accum, c) => {
        return accum + (c.name.indexOf(name) === 0 ? 1 : 0)
      }, 0)

      const index = list.length
      const duplicate = Object.assign({}, item, {
        index,
        name: `${name} ${1 + nameCount}`
      })

      this.willDuplicateListItem(duplicate, index)
      list.push(duplicate)
      this.didDuplicateListItem(duplicate, index)
    },

    willDuplicateListItem: noop,
    didDuplicateListItem: noop
  }
}
