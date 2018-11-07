<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style>
@import './assets/fonts/fira-sans/index.scss';
@import './assets/fonts/fira-mono/index.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: transparent;
  font: 12px/1 'Fira Sans', sans-serif;
}

#app {
  -webkit-user-select: none;
}

.text-ellipsis {
  display: inline-block;
  padding: 0 0 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

<script>
export default {
  name: 'microbium-app'
}
</script>
