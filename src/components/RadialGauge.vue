<template>
  <canvas id="gauge-id" :class="[logo+'-logo', gray ? 'gray' : '']"></canvas>
</template>

<script>
import * as gauge from 'canvas-gauges'
const defaultOptions = {
  width: 200,
  height: 200,
  value: 0,
  minValue: 0,
  maxValue: 10,
  exactTicks: true,
  majorTicks: 0,
  minorTicks: 1,
  strokeTicks: false,
  animationRule: 'bounce',
  animationDuration: 500,
  fontValue: 'Led',
  animatedValue: true,
  colorValueBoxBackground: 'rgba(255,255,255,1)',
  colorValueBoxRect: 'rgba(255,255,255,0)',
  colorValueBoxRectEnd: 'rgba(255,255,255,0)',
  colorValueBoxShadow: 'rgba(255,255,255,0)',
  valueInt: 0,
  valueDec: 0,
  fontValueSize: 64,
  colorPlate: 'rgba(255,255,255,0)',
  highlights: '',
  colorNeedle: 'rgba(0,0,0,1)',
  colorNeedleEnd: 'rgba(50,0,0,1)',
  needleWidth: 8
}
export default {
  props: {
    options: { required: true },
    value: { required: true },
    logo: { default: 'pdm' },
    gray: { default: false }
  },
  watch: {
    value (val) {
      this.radial.value = val
      this.radial.draw()
    },
    options (newVal, oldVal) {
      const changedOpts = {}
      for (var key of Object.keys(newVal)) {
        if (newVal[key] !== oldVal[key]) {
          changedOpts[key] = newVal[key]
        }
      }
      this.radial.update({ ...changedOpts })
      this.radial.draw()
    }
  },
  mounted () {
    const opts = {
      renderTo: 'gauge-id',
      ...defaultOptions,
      ...this.options
    }
    this.radial = new gauge.RadialGauge(opts)
    this.radial.draw()
  }
}
</script>

<style scoped>
canvas {
  background-color: rgba(255, 255, 255, 1);
  background-repeat: no-repeat;
  background-position: 50%, 50%;
  border-radius: 100px;
}

.solidworks-logo {
  background-image: url("../assets/swlicmgr.png");
  background-size: 40% 40%;
}

.pdm-logo {
  background-image: url("../assets/epdm_logo.png");
  background-size: 40%;
}

.gray {
  filter: grayscale(80%);
}
</style>
