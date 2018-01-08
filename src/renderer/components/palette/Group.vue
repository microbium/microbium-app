<template>
  <section class="palette-group"
    :class="[openStateClassNames, mainClassNames]">
    <div class="palette-group__header"
      :class="openStateClassNames">
      <div class="palette-group__title"
        :class="openStateClassNames">
        <slot name="title" />
      </div>
      <div class="palette-group__toggle"
        :class="openStateClassNames"
        @click="toggleOpen"></div>
    </div>
    <div class="palette-group__content"
      :style="contentStyle">
      <div class="palette-group__content-inner"
        :class="openStateClassNames"
        ref="contentInner">
        <slot />
      </div>
    </div>
  </section>
</template>

<style lang="scss">
$base-color: rgba(#000, 0.15);
$toggle-duration: 200ms;

.palette-group {
  position: relative;

  &.hidden {
    display: none;
  }

  &__header {
    position: relative;
    background: $base-color;
    padding: 10px 28px;

    &.nested {
      background: transparent;
      padding: 8px 28px;
    }

    &.open {
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

    &.open {
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

    &.nested {
      font-size: 15px;
    }

    &.open {
      transform: translateX(8px);
    }
  }

  &__content {
    position: relative;
    overflow: hidden;
    transition: height $toggle-duration;
  }

  &__content-inner {
    position: relative;
    left: 0;
    bottom: 0;
    padding: 0 6px 16px;
    width: 100%;
    height: auto;

    &.nested {
      padding: 0 4px 16px 16px;
    }

    &.animating {
      position: absolute;
    }
  }
}
</style>

<script>
export default {
  name: 'palette-group',

  props: {
    open: Boolean,
    hidden: Boolean,
    nested: Boolean
  },

  data () {
    return {
      isOpen: this.open,
      isAnimating: false,
      contentHeight: 0
    }
  },

  mounted () {
    this.updateContentHeight()
  },

  methods: {
    toggleOpen () {
      this.updateContentHeight()
      this.isAnimating = true
      setTimeout(() => {
        this.isOpen = !this.isOpen
        this.resetAnimatingLater(200)
      }, 1)
    },

    updateContentHeight () {
      this.contentHeight = this.$refs.contentInner.clientHeight
    },

    resetAnimatingLater (delay) {
      clearTimeout(this._resetAnimatingLater)
      this._resetAnimatingLater = setTimeout(() => {
        this.isAnimating = false
      }, delay)
    }
  },

  computed: {
    mainClassNames () {
      return {
        'hidden': this.hidden
      }
    },

    openStateClassNames () {
      return {
        'open': this.isOpen,
        'animating': this.isAnimating,
        'nested': this.nested
      }
    },

    contentStyle () {
      const height = this.isOpen
        ? (this.isAnimating ? (this.contentHeight + 'px') : 'auto')
        : '0px'
      return {
        height
      }
    }
  }
}
</script>
