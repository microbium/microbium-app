<template>
  <div class="palette-controllers">
    <palette-group open>
      <h2 slot="title">Midi Input</h2>
      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ midiInputName }}
            <input-select v-model="model.midi.activeInput">
              <option v-for="item in midiAvailableInputs" :value="item.name">
                {{ item.name }}
              </option>
            </input-select>
          </b> active input
        </div>
      </div>
    </palette-group>

    <palette-channel-list :list="model.midi.channels" />
  </div>
</template>

<style lang="scss">
</style>

<script>
import InputSelect from '@renderer/components/input/Select'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteChannelList from '@renderer/components/palette/ChannelList'

export default {
  name: 'palette-controllers',

  components: {
    InputSelect,
    PaletteGroup,
    PaletteChannelList
  },

  props: {
    model: Object
  },

  computed: {
    midiInputName () {
      const { activeInput } = this.model.midi
      return activeInput || 'None'
    },

    midiAvailableInputs () {
      const { availableInputs } = this.model.midi
      return [
        { name: 'None' },
        ...availableInputs
      ]
    }
  }
}
</script>
