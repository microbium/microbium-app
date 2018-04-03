<template>
  <div class="microbium-embed">
    <viewer :rawSceneData="rawSceneData" />
  </div>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font: 13px/1 Helvetica Neue, sans-serif;
}

.microbium-embed {
  -webkit-user-select: none;
}
</style>

<script>
import Viewer from './components/Viewer'

export default {
  name: 'microbium-embed',

  components: {
    Viewer
  },

  props: {
    rawSceneData: String
  }
}
</script>
