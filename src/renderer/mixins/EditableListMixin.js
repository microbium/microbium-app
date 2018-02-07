const noop = () => {}

export default {
  methods: {
    getItemIndex (item) {
      return this.list.indexOf(item)
    },

    createDuplicateItem (item, index) {
      const { name } = item
      const nameCount = this.list.reduce((accum, c) => {
        return accum + (c.name.indexOf(name) === 0 ? 1 : 0)
      }, 0)

      return Object.assign({}, item, {
        index,
        name: `${name} ${1 + nameCount}`
      })
    },

    // TODO: Enable removing item anywhere in list
    // TODO: Ensure removed item doesn't have dependent data (geometry segments)
    removeListItem (item) {
      const { list } = this
      const index = this.getItemIndex(item)
      if (index !== list.length - 1) return

      this.willRemoveListItem(item, index)
      list.splice(index, 1)
      this.didRemoveListItem(item, index)
    },

    willRemoveListItem: noop,
    didRemoveListItem: noop,

    duplicateListItem (item) {
      const { list } = this
      const index = list.length
      const duplicate = this.createDuplicateItem(item)

      this.willDuplicateListItem(duplicate, index)
      list.push(duplicate)
      this.didDuplicateListItem(duplicate, index)
    },

    willDuplicateListItem: noop,
    didDuplicateListItem: noop
  }
}
