<template>
  <div class="palette-group"
    v-bind:class="elClassNames">
    <div class="palette-group__header">
      <div class="palette-group__title">
        {{title}}
      </div>
      <div class="palette-group__toggle"
        v-on:click="toggleOpen"></div>
    </div>
    <div class="palette-group__content"
      v-bind:style="contentStyle">
      <div class="palette-group__content-inner"
        ref="contentInner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$base-color: rgba(#000, 0.15);
$toggle-duration: 200ms;

.palette-group {
  position: relative;

  &__header {
    position: relative;
    background: $base-color;
    padding: 12px 32px;

    .palette-group--open & {
      background: transparent;
    }
  }

  &__toggle {
    position: absolute;
    top: 0;
    left: 0;
    width: 34px;
    height: 100%;

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;

      background: #fff;
      width: 2px;
      height: calc(100% - 12px);
      transform: translate(-50%, -50%);
      transition: transform $toggle-duration;
    }

    .palette-group--open & {
      &:after {
        transform: translate(-50%, -50%) rotate(45deg);
      }
    }
  }

  &__title {
    position: relative;
    font-size: 17px;
    font-weight: lighter;
    transition: transform $toggle-duration;

    .palette-group--open & {
      transform: translateX(6px);
    }
  }

  &__content {
    position: relative;
    overflow: hidden;
    transition: height $toggle-duration;
  }

  &__content-inner {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 6px 8px;
    width: 100%;
    height: auto;
  }
}
</style>

<script>
export default {
  name: 'palette-group',

  props: ['title'],

  data () {
    return {
      isOpen: true,
      contentHeight: 0
    }
  },

  mounted () {
    this.contentHeight = this.$refs.contentInner.clientHeight
  },

  methods: {
    toggleOpen () {
      this.isOpen = !this.isOpen
    }
  },

  computed: {
    elClassNames () {
      return {
        'palette-group--open': this.isOpen
      }
    },

    contentStyle () {
      const height = this.isOpen ? this.contentHeight : 0
      return {
        height: height + 'px'
      }
    }
  }
}
</script>
