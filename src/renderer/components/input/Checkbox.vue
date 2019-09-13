<template>
  <div :class="['input-checkbox', type, isChecked ? 'checked' : '']">
    <input type="checkbox" v-model="actualValue" />
  </div>
</template>

<style lang="scss">
.input-checkbox {
  position: relative;
  width: 30px;
  height: 30px;

  > input {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  &:before,
  &:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &:before {
    border: 1px solid #fff;
    border-radius: 2px;
    width: 10px;
    height: 10px;
  }

  &:after {
    background: var(--highlight-color);
    width: 6px;
    height: 6px;
    opacity: 0;
  }

  &.checked {
    &:after {
      opacity: 1;
    }
  }
}

.input-checkbox.small-circle {
  width: 16px;
  height: 16px;

  &:before {
    border-radius: 50%;
  }

  &:after {
    border-radius: 50%;
  }
}
</style>

<script>
export default {
  name: 'input-checkbox',

  props: {
    type: {
      type: String,
      default: 'box'
    },
    value: Boolean
  },

  data () {
    return {
      actualValue: null
    }
  },

  created () {
    this.actualValue = this.value
  },

  computed: {
    isChecked () {
      return !!this.value
    }
  },

  watch: {
    value () {
      this.actualValue = this.value
    },

    actualValue () {
      const value = this.actualValue
      this.$emit('input', value)
    }
  }

}
</script>
