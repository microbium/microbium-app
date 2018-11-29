import Vue from 'vue'

export const PaletteControllers = new Vue({
  methods: {
    emit (...args) {
      this.$emit(...args)
    },

    on (...args) {
      this.$on(...args)
    },

    off (...args) {
      this.$off(...args)
    }
  }
})
