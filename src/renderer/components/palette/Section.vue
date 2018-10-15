<template>
  <section class="palette-section" :class="mainClassNames">
    <div class="palette-section__header">
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
  }

  &__title {
    font-size: 17px;
    font-weight: normal;
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
    hidden: Boolean
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
