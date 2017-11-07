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

.palette-group {
  position: relative;

  &__header {
    position: relative;
    background: $base-color;
    padding: 12px 20px 18px;
  }

  &__toggle {
    position: absolute;
    top: 0;
    left: 0;
    width: 40px;
    height: 100%;
    background: cyan;
  }

  &__title {
    position: absolute;
    top: 7px;
    left: 8px;
    font-size: 15px;
    font-weight: lighter;
    transform: translateX(40px);
  }

  &__content {
    position: relative;
    overflow: hidden;
    transition: height 200ms;
  }

  &__content-inner {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 8px 12px;
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
