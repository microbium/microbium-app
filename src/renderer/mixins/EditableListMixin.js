export default {
  methods: {
    // TODO: Enable removing item anywhere in list
    // TODO: Ensure removed item doesn't have dependent data (geometry segments)
    removeListItem (item) {
      const { list } = this
      const { index } = item
      if (index !== list.length - 1) return
      list.splice(index, 1)
    },

    duplicateListItem (item) {
      const { list } = this
      const { name } = item
      const nameCount = list.reduce((accum, c) => {
        return accum + (c.name.indexOf(name) === 0 ? 1 : 0)
      }, 0)

      const duplicate = Object.assign({}, item, {
        index: list.length,
        name: `${name} ${1 + nameCount}`
      })
      list.push(duplicate)
    }
  }
}
