<template>
  <div class="palette-controllers">
    <palette-group open>
      <h2 slot="title">Midi</h2>

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
      <hr />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import InputSelect from '@renderer/components/input/Select'
import PaletteGroup from '@renderer/components/palette/Group'

export default {
  name: 'palette-tool',

  components: {
    InputSelect,
    PaletteGroup
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
