<template>
  <div class="palette-item-controller" :class="baseClassNames">
    <div class="palette-item-controller__label">
      CC <b>{{ channelName }}</b>
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
  opacity: 0.4;

  &__label {
    padding: 0 8px;

    > b {
      position: relative;
      display: inline-block;
      border-top: 2px solid rgba(#fff, 0.3);
      padding-top: 6px;
      font-weight: 600;

      &:first-letter {
        text-transform: uppercase;
      }
    }
  }

  &--active {
    opacity: 1;
  }
}
</style>

<script>
import { range } from '@renderer/utils/array'
import { mapLinear } from '@renderer/utils/math'
import { PaletteControllers } from '@renderer/store/hubs/PaletteControllers'
import InputSelect from '@renderer/components/input/Select'

const CHANNELS = [{
  name: '–',
  index: -1
}].concat(range(64).map((index) => ({
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
    step: Number,
    model: Object,
    prop: String
  },

  data () {
    return {
      isActive: false,
      channels: CHANNELS
    }
  },

  created () {
  },

  beforeDestroy () {
    this.unbindControllerEvents()
  },

  methods: {
    bindControllerEvents () {
      PaletteControllers.on('cc', this.handleControllerMessage)
      this.isActive = true
    },

    unbindControllerEvents () {
      PaletteControllers.off('cc', this.handleControllerMessage)
      this.isActive = false
    },

    handleControllerMessage (cc, value) {
      const { model, prop, channel } = this
      if (channel !== cc) return

      const { min, max, step } = this
      const nextValue = mapLinear(0, 127, min, max, value)
      model[prop] = !step
        ? nextValue
        : (Math.round(nextValue * (1 / step)) * step)
    }
  },

  computed: {
    baseClassNames () {
      const { channel } = this
      return {
        'palette-item-controller--active': channel >= 0
      }
    },

    channelProp () {
      const { prop } = this
      return `${prop}Controller`
    },

    channel () {
      const { model, channelProp } = this
      return model[channelProp]
    },

    channelName () {
      const { channel } = this
      return channel >= 0 ? channel : 'N'
    }
  },

  watch: {
    channel () {
      const { isActive, channel } = this
      if (channel >= 0 && !isActive) {
        this.bindControllerEvents()
      }
      if (channel < 0 && isActive) {
        this.unbindControllerEvents()
      }
    }
  }
}
</script>
