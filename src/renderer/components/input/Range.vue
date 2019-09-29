<style lang="scss">
$slider-height: 14px;
$slider-width: 100%;
$rail-height: 6px;
$knob-size: 14px;
$hitbox-size: 30px;
$rail-color: rgba(#000, 0.1);
$rail-fill-color: var(--highlight-color);
$knob-color: transparent;
$knob-border: 2px solid rgba(#fff, 0.85);
$knob-shadow: 0px 1px rgba(#000, 0.1);

@import '~vue-range-slider/dist/vue-range-slider.scss';

.range-slider {
  padding: 0 8px;
}

.range-slider-rail,
.range-slider-fill {
  top: 0;
  transform: none;
}

.range-slider-fill {
  border-radius: 0;
  background-color: transparent;
  background: url('~@renderer/assets/backgrounds/range-fill.png') repeat;
  background-position: left center;
  background-size: auto 8px;
}

.range-slider-knob {
  top: 0;
  border: none;
  border-right: 2px solid #fff;
  border-radius: 0;
  transform: translate(-50%, 0%);
  cursor: default;
  pointer-events: none;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);

    background: $rail-fill-color;
    width: 6px;
    height: 100%;
  }

  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    width: $hitbox-size;
    height: $hitbox-size;
    border-radius: 50%;
    z-index: 10;
    pointer-events: all;
  }

  .range-slider--knob-hidden & {
    display: none;
  }
}
</style>

<script>
// TODO: Switch to vue-slider-component
// https://github.com/NightCatSama/vue-slider-component
import RangeSlider from 'vue-range-slider'
export default RangeSlider
</script>
