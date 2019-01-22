<style lang="scss">
$slider-height: 13px;
$slider-width: 100%;
$rail-height: 2px;
$knob-size: 13px;
$hitbox-size: 30px;
$rail-color: rgba(#000, 0.1);
$rail-fill-color: var(--highlight-color);
$knob-color: transparent;
$knob-border: 2px solid rgba(#fff, 0.85);
$knob-shadow: 0px 1px rgba(#000, 0.1);

@import '~vue-range-slider/dist/vue-range-slider.scss';

.range-slider-knob {
  border-radius: 0;
  transform: translate(-50%, -50%) rotate(45deg);
  cursor: default;
  pointer-events: none;

  &:before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;

    background: $rail-fill-color;
    width: 5px;
    height: 5px;
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
