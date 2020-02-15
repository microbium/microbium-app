<template>
  <div class="palette-item-controller" :class="baseClassNames">
    <div :class="['palette-item-controller__record', isRecording ? 'recording' : '']">
      <input-checkbox type="small-circle" v-model="shouldLoop" />
    </div>
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

  &__record {
    position: relative;

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      border: 2px solid var(--highlight-color);
      border-radius: 50%;
      width: 12px;
      height: 12px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0;
    }

    &.recording {
      &:after {
        opacity: 1;
      }
    }
  }

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
      recordingTimeout: 1 * 1000,
      recordingDelta: 1000 / 60,
      loopTick: 0,
      loopTickDelta: 0
    }
  },

  mounted () {
    this.updateControllerBinding()
  },

  beforeDestroy () {
    this.unbindControllerEvents()
  },

  methods: {
    updateControllerBinding () {
      const { isActive, channel } = this
      if (channel >= 0 && !isActive) {
        this.bindControllerEvents()
      }
      if (channel < 0 && isActive) {
        this.unbindControllerEvents()
      }
    },

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

      const { shouldLoop, min, max, step } = this

      let nextValue = mapLinear(0, 127, min, max, value)
      nextValue = model[prop] = !step
        ? nextValue
        : (Math.round(nextValue * (1 / step)) * step)

      if (shouldLoop) {
        this.updateLoopRecording(nextValue)
      }
    },

    handleControllerTick (delta, time) {
      const { channel } = this
      if (channel < 0) return

      const {
        isRecording, shouldLoop,
        lastRecordingTime, recordingTimeout
      } = this

      // TODO: Adapt recording timeout to previous input speed
      if (shouldLoop && lastRecordingTime > 0 &&
        (!isRecording || (time - lastRecordingTime > recordingTimeout))
      ) {
        if (isRecording) this.isRecording = false
        this.updateLoopTick(delta, time)
      }
    },

    updateLoopRecording (value) {
      const { isRecording, recording, recordingDelta } = this
      const time = Date.now()

      if (!isRecording) {
        recording.length = 0
        this.loopTime = 0
        this.loopTick = 0
        this.lastRecordingTime = time
        this.isRecording = true
      }

      const delta = time - this.lastRecordingTime

      if (delta > recordingDelta) {
        this.lastRecordingTime = time
        recording.push({
          time,
          delta,
          value
        })
      }
    },

    updateLoopTick (delta, time) {
      const { recording, model, prop } = this

      let shouldAdvance = true
      let currentTick = null
      while (shouldAdvance) {
        const { loopTick, loopTickDelta } = this
        const nextTick = (loopTick < recording.length - 1) ? (loopTick + 1) : 0
        const nextTickDelta = recording[nextTick].delta

        shouldAdvance = (loopTickDelta + delta) > nextTickDelta
        currentTick = shouldAdvance ? nextTick : loopTick

        if (shouldAdvance) {
          delta = 0
          this.loopTick = nextTick
          this.loopTickDelta = 0
        } else {
          this.loopTickDelta += delta
        }
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
      this.updateControllerBinding()
    }
  }
}
</script>
