<template>
  <div class="palette-item-controller">
    <div class="palette-item-controller__label">
      <b>CC {{ channelName }}</b>
      <input-select v-model="model[channelProp]">
        <option v-for="channel in channels" :value="channel.index">
          {{ channel.name }}
        </option>
      </input-select>
    </div>
  </div>
</template>

<style lang="scss">
.palette-item-controller {
  &__label {
    padding: 0 8px;

    > b {
      position: relative;
      display: inline-block;
      border-top: 2px solid rgba(#fff, 0.1);
      padding-top: 6px;
      font-weight: 600;

      &:first-letter {
        text-transform: uppercase;
      }
    }
  }
}
</style>

<script>
import { range } from '@renderer/utils/array'
import { mapLinear } from '@renderer/utils/math'
import { PaletteControllers } from '@renderer/components/PaletteControllers'
import InputSelect from '@renderer/components/input/Select'

const CHANNELS = [{
  name: '–',
  index: -1
}].concat(range(16).map((index) => ({
  name: `${index}`,
  index
})))

export default {
  name: 'palette-item-controller',

  components: {
    InputSelect
  },

  props: {
    min: Number,
    max: Number,
    model: Object,
    prop: String
  },

  data () {
    return {
      controllerValue: null,
      channels: CHANNELS
    }
  },

  created () {
    this.controllerValue = this.value
    this.bindControllerEvents()
  },

  beforeDestroy () {
    this.unbindControllerEvents()
  },

  methods: {
    bindControllerEvents () {
      PaletteControllers.on('cc', this.handleControllerMessage)
    },

    unbindControllerEvents () {
      PaletteControllers.off('cc', this.handleControllerMessage)
    },

    handleControllerMessage (cc, value) {
      const { model, channelProp } = this
      const channel = model[channelProp]
      if (channel !== cc) return

      const { prop, min, max } = this
      model[prop] = mapLinear(0, 127, min, max, value)
    }
  },

  computed: {
    channelProp () {
      const { prop } = this
      return `${prop}Controller`
    },

    channelName () {
      const { model, channelProp } = this
      const channel = model[channelProp]
      return channel >= 0 ? channel : '–'
    }
  }
}
</script>
