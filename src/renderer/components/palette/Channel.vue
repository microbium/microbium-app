<template>
  <div class="palette-channel">
    <!-- Prop Type -->
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ typeName }}
          <input-select v-model="model.prop">
            <option v-for="item in channelTypes" :value="item.prop">
              {{ item.name }}
            </option>
          </input-select>
        </b> prop
      </div>
    </div>

    <!-- Range Scale -->
    <div class="palette-item">
      <input-range min="0" max="1" step="0.05" v-model="model.scale" />
      <div class="palette-item__label">
        <b>{{ scaleName }}</b> scale
      </div>
    </div>
    <hr />
  </div>
</template>

<style lang="scss">
</style>

<script>
import {
  CONTROLLER_CHANNEL_PROPS,
  CONTROLLER_CHANNEL_PROPS_MAP
} from '@renderer/constants/controller-channels'

import { roundToPlaces } from '@renderer/utils/number'
import InputRange from '@renderer/components/input/Range'
import InputSelect from '@renderer/components/input/Select'

export default {
  name: 'palette-channel',

  components: {
    InputRange,
    InputSelect
  },

  props: {
    model: Object
  },

  data () {
    return {
      channelTypes: CONTROLLER_CHANNEL_PROPS
    }
  },

  computed: {
    typeName () {
      const { prop } = this.model
      const { name } = CONTROLLER_CHANNEL_PROPS_MAP[prop]
      return name
    },

    scaleName () {
      const { scale } = this.model
      return `${roundToPlaces(scale, 2)}x`
    }
  }
}
</script>
