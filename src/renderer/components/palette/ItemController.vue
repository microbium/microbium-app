<template>
  <div class="palette-item-controller" :class="baseClassNames">
    <input-checkbox type="small-circle" v-model="shouldLoop" />
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
  display: flex;
  align-items: flex-end;
  opacity: 0.4;

  &__label {
    position: relative;
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
import InputCheckbox from '@renderer/components/input/Checkbox'
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
    InputCheckbox,
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
      isRecording: false,
      shouldLoop: false,
      channels: CHANNELS,
      lastRecordingTime: 0,
      recording: [],
      loopTick: 0,
      loopTickDelta: 0
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
      PaletteControllers.on('tick', this.handleControllerTick)
      this.isActive = true
    },

    unbindControllerEvents () {
      PaletteControllers.off('cc', this.handleControllerMessage)
      PaletteControllers.off('tick', this.handleControllerTick)
      this.isActive = false
    },

    handleControllerMessage (cc, value) {
      const { model, prop, channel } = this
      if (channel !== cc) return

      const {
        shouldLoop,
        min, max, step
      } = this

      let nextValue = mapLinear(0, 127, min, max, value)
      nextValue = model[prop] = !step
        ? nextValue
        : (Math.round(nextValue * (1 / step)) * step)

      if (shouldLoop) {
        this.updateLoopRecording(nextValue)
      }
    },

    handleControllerTick (delta, time) {
      const { isRecording, shouldLoop, lastRecordingTime } = this

      if (shouldLoop && lastRecordingTime > 0) {
        const timeDiff = time - lastRecordingTime

        if (timeDiff > 3000) {
          if (isRecording) this.isRecording = false
          this.updateLoopTick(delta, time)
        }
      }
    },

    updateLoopRecording (value) {
      const { isRecording, recording } = this
      const time = Date.now()

      if (!isRecording) {
        recording.length = 0
        this.loopTime = 0
        this.loopTick = 0
      }

      this.isRecording = true
      this.lastRecordingTime = time

      recording.push({
        time,
        value
      })
    },

    updateLoopTick (delta, time) {
      const {
        recording, loopTick, loopTickDelta,
        model, prop
      } = this

      const nextTick = (loopTick < recording.length - 1) ? (loopTick + 1) : 0
      const nextTickDelta = nextTick === 0 ? 0 : (recording[nextTick].time - recording[loopTick].time)

      const shouldAdvance = (loopTickDelta + delta) > nextTickDelta
      const currentTick = shouldAdvance ? nextTick : loopTick

      if (shouldAdvance) {
        this.loopTick = nextTick
        this.loopTickDelta = 0
      } else {
        this.loopTickDelta += delta
      }

      model[prop] = recording[currentTick].value
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
