<template>
  <div class="editor-compositor">
    <div class="editor-compositor__scene" :class="sceneClassNames" ref="scene"></div>
    <!-- OPTIM: Investigate perf issues with stats rendering -->
    <div class="editor-compositor__stats" :class="statsClassNames" v-if="viewport">
      <ul class="editor-compositor__stats__group">
        <li>
          <b>{{ viewport.resolution[0] }}</b>w
          <b>{{ viewport.resolution[1] }}</b>h
          (<b>{{ controls.viewport.pixelRatio.toFixed(2) }}</b>x)
          <span v-if="(viewport.pixelRatioClamped != controls.viewport.pixelRatio)">
            [<b>{{ viewport.pixelRatioClamped.toFixed(2) }}</b>x]
          </span>
        </li>
      </ul><ul class="editor-compositor__stats__group">
        <li title="Pin Constraints"><b>{{ simulation.pinConstraintCount || '-' }}</b> pns</li>
        <li title="Local Constraints"><b>{{ simulation.localConstraintCount || '-' }}</b> lcs</li>
        <li title="Forces"><b>{{ simulation.forcesCount || '-' }}</b> frcs</li>
      </ul><ul class="editor-compositor__stats__group">
        <li title="Vertices"><b>{{ renderer.verticesCount }}</b> vrts</li>
        <li title="Line Segments"><b>{{ renderer.segmentsCount }}</b> sgs</li>
      </ul><ul class="editor-compositor__stats__group">
        <li title="Line Quads"><b>{{ renderer.lineQuads }}</b> qds</li>
        <li title="Draw Calls"><b>{{ renderer.drawCalls }}</b> drw cls</li>
        <li title="Full Screen Passes"><b>{{ renderer.fullScreenPasses }}</b> pss</li>
      </ul>
      <ul class="editor-compositor__stats__group" v-if="DEBUG_PERF">
        <li>update physics: {{ timer.get('updatePhysics', 6) }} ms</li>
        <li>update lines: {{ timer.get('updateLines', 6) }} ms</li>
        <li>render lines: {{ timer.get('renderLines', 6) }} ms</li>
        <li>render bloom: {{ timer.get('renderBloom', 6) }} ms</li>
        <li>render banding: {{ timer.get('renderBanding', 6) }} ms</li>
        <li>render edges: {{ timer.get('renderEdges', 6) }} ms</li>
        <li>render composite: {{ timer.get('renderComposite', 6) }} ms</li>
      </ul>
      <ul class="editor-compositor__stats__group" v-if="DEBUG_RENDER_HASH">
        <li>hash: {{ renderer.lastRenderHash }}</li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.editor-compositor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &__scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;

    > canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    &.mode--simulate { cursor: none; }
    &.mode--edit { cursor: none; }
    &.navigate--will-pan { cursor: -webkit-grab; }
    &.navigate--pan { cursor: -webkit-grabbing; }
    &.navigate--will-zoom { cursor: -webkit-zoom-in; }
    &.navigate--zoom { cursor: -webkit-zoom-in; }
  }

  &__stats {
    position: absolute;
    bottom: 0;
    left: 0;

    border-top: 1px solid #000;
    background: #1f1f1f;
    padding: 10px;
    width: 100%;

    color: #eee;
    font: 10px/1.6 'Fira Mono', Monaco, monospace;
    font-weight: 500;
    text-align: center;
    cursor: default;

    opacity: 0;
    visibility: hidden;
    transform: translateY(30%);
    transition: opacity 200ms,
      visibility 200ms,
      transform 200ms;

    &__group {
      display: inline-block;
      padding: 0;
      list-style: none;

      > li {
        display: inline-block;

        &:not(:last-child):after {
          content: " /";
        }
      }

      &:not(:last-child):after {
        content: "•";
        position: relative;
        display: inline-block;
        margin: 0;
        width: 24px;
        text-align: center;
      }
    }

    b {
      font-weight: 600;
    }

    &.stats--show {
      opacity: 1;
      visibility: visible;
      transform: none;
    }
  }
}
</style>

<script>
import { timer } from '@renderer/utils/timer'
import { mountCompositor } from './compositor/index'

// import { createTextureManager } from '@renderer/utils/texture'
const DEBUG_RENDER_HASH = false
const DEBUG_PERF = false

export default {
  name: 'editor-compositor',

  props: {
    observeMessage: Function,
    sendMessage: Function,
    updateCursor: Function
  },

  components: {},

  data () {
    return {
      DEBUG_RENDER_HASH,
      DEBUG_PERF,
      timer,
      tasks: null,
      drag: null,
      renderer: null,
      simulation: null,
      viewport: null,
      controls: null
    }
  },

  mounted () {
    const { $el, $refs } = this
    const actions = {
      observeMessage: this.observeMessage,
      sendMessage: this.sendMessage,
      updateCursor: this.updateCursor
    }
    const { tasks, state } = mountCompositor($el, $refs, actions)

    timer.enable(DEBUG_PERF)

    this.tasks = tasks
    this.drag = state.drag
    this.renderer = state.renderer
    this.simulation = state.simulation
    this.viewport = state.viewport
    this.controls = state.controls
  },

  watch: {
    // TODO: Improve method for resizing main canvas
    'controls.viewport.pixelRatio' () {
      this.tasks.requestSync('viewport.resize')
    }
  },

  computed: {
    sceneClassNames () {
      const { simulation, drag } = this
      if (!(drag || simulation)) return

      return {
        'mode--edit': !simulation.isRunning,
        'mode--simulate': simulation.isRunning && !simulation.isPaused,
        'navigate--will-pan': drag.shouldNavigate && !drag.shouldZoom,
        'navigate--pan': drag.isPanning,
        'navigate--will-zoom': drag.shouldNavigate && drag.shouldZoom && !drag.isPanning,
        'navigate--zoom': drag.isZooming
      }
    },

    statsClassNames () {
      const { viewport } = this
      if (!viewport) return

      return {
        'stats--show': viewport.showStats
      }
    }
  }
}
</script>
