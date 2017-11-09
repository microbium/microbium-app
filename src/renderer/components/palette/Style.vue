<template>
  <div class="palette-style">
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ model.tintHex }}
          <input-color v-model="model.tintHex" :range="1"></input-color>
        </b> stroke tint
      </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import InputColor from '@/components/input/Color'

export default {
  name: 'palette-style',

  components: {
    InputColor
  },

  props: {
    model: Object
  }
}
</script>
