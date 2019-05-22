<template>
  <section class="palette-section" :class="mainClassNames">
    <div v-if="!collapseHeader" class="palette-section__header">
      <div class="palette-section__title">
        <slot name="title" />
      </div>
    </div>
    <div class="palette-section__content">
      <slot />
    </div>
  </section>
</template>

<style lang="scss">
.palette-section {
  $base-color: rgba(#000, 0.15);

  &__header {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;

    background: $base-color;
    padding: 0 18px;
    height: 26px;
    -webkit-app-region: drag;
  }

  &__title {
    font-size: #{(20 / 13)}em;
    font-weight: 700;
  }

  &__content {
  }

  &.hidden {
    display: none;
  }
}
</style>

<script>
export default {
  name: 'palette-section',

  props: {
    hidden: Boolean,
    collapseHeader: Boolean
  },

  computed: {
    mainClassNames () {
      return {
        'hidden': this.hidden
      }
    }
  }
}
</script>
