<template>
  <div class="palette-item-controller">
    <div class="palette-item-controller__label">
      <b>CC {{ channelName }}</b>
      <input-select v-model="channel">
        <option v-for="channel in channels" :value="channel.index">
          {{ channel.name }}
        </option>
      </input-select>
    </div>
  </div>
</template>

<style lang="scss">
.palette-item-controller {
  position: absolute;
  right: 0;
  bottom: 6px;

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
    // model: Object
  },

  data () {
    return {
      channel: -1,
      channels: CHANNELS
    }
  },

  computed: {
    channelName () {
      const { channel } = this
      return channel >= 0 ? channel : '–'
    }
  }
}
</script>
