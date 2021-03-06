<template>
  <section class="palette-group"
    :class="openStateClassNames">
    <div class="palette-group__header"
      :class="openStateClassNames">
      <div class="palette-group__toggle"
        :class="openStateClassNames"
        @click="toggleOpen"></div>
      <div class="palette-group__header__inner"
        :class="openStateClassNames">
        <div class="palette-group__title"
          :class="openStateClassNames">
          <slot name="title" />
        </div>
        <div class="palette-group__controls"
          :class="[ openStateClassNames, persistentControls ? 'persistent' : '' ]">
          <slot name="controls" />
        </div>
      </div>
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

  &__header {
    position: relative;
    display: flex;
    align-items: center;

    background: $base-color;
    padding: 0 16px 0 24px;
    height: 40px;

    &.nested {
      background: transparent;
      height: 26px;
    }

    &.open {
      background: transparent;
    }

    &__inner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      transition: transform $toggle-duration;

      &.open {
        transform: translateX(10px);
      }
    }
  }

  &__toggle {
    position: absolute;
    z-index: 1;
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
      height: calc(100% - 16px);
      transform: translate(-10px, -50%);
      transition: transform $toggle-duration;
    }

    &.nested {
      left: 4px;
      width: 26px;

      &:after {
        height: calc(100% - 8px);
      }
    }

    &.open {
      &:after {
        transform: translate(-1px, -50%) rotate(45deg);
      }
    }
  }

  &__title {
    position: relative;
    padding-top: 0.2em;
    font-size: #{(16 / 13)}em;
    font-weight: 300;

    &.open {
      font-weight: 600;
    }

    &.nested {
      font-size: #{(14 / 13)}em;
    }
  }

  &__controls {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    opacity: 0;
    visibility: hidden;
    transition: opacity $toggle-duration,
      visibility $toggle-duration;

    &.open,
    &.persistent {
      opacity: 1;
      visibility: visible;
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
    padding: 0 10px 16px;
    width: 100%;
    height: auto;

    &.nested {
      padding: 0 4px 4px 16px;
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
    nested: Boolean,
    persistentControls: Boolean
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
    openStateClassNames () {
      return {
        open: this.isOpen,
        animating: this.isAnimating,
        nested: this.nested
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
