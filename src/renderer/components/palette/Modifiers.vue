<template>
  <div class="palette-modifiers">
    <div class="palette-item">
      <input-range min="1" max="12" v-model="model.curveSubDivisions"></input-range>
      <div class="palette-item__label">
        <b>{{ curveSubDivisionsName }}</b> curve subdivisions
      </div>
    </div>
    <div class="palette-item">
      <input-range min="1" max="32" v-model="model.polarIterations"></input-range>
      <div class="palette-item__label">
        <b>{{ polarIterationsName }}</b> polar iterations
      </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { numberToWords } from '@/utils/number'
import InputRange from '@/components/input/Range'

export default {
  name: 'palette-modifiers',

  components: {
    InputRange
  },

  props: {
    model: Object
  },

  computed: {
    curveSubDivisionsName () {
      const { curveSubDivisions } = this.model
      return numberToWords(curveSubDivisions)
    },

    polarIterationsName () {
      const { polarIterations } = this.model
      return numberToWords(polarIterations)
    }
  }
}
</script>
