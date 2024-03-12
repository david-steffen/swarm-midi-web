<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useGridStore } from '@/stores/grid'
import { type WidgetConfig } from '@/components/widgets'
import Rotary from '@/components/icons/RotaryDial.vue'
import { type Props } from '../DynamicGridWidget.vue';

const gridStore = useGridStore()
const props = defineProps<Props>()
const emit = defineEmits<{
  widgetConfig: [payload: WidgetConfig]
  change: [payload: number]
}>()
const baseBackgroundCanvas = ref<HTMLCanvasElement | null>(null)
const baseCanvas = ref<HTMLCanvasElement | null>(null)
const backgroundCtx = ref<CanvasRenderingContext2D | null>(null)
const foregroundCtx = ref<CanvasRenderingContext2D | null>(null)

const angle = ref(-125)
const minDegree = -125
const maxDegree = 125
const totalDegrees = 250
const tau = 2 * Math.PI
const minAngleRadian = tau - (215 * Math.PI / 180)
const maxAngleRadian = 35 * Math.PI / 180

const update = (value: number) => {
  emit('change', value)
  drawUpdateArc(value)
}

const handleChange = (event: MouseEvent) => {

  if (angle.value >= minDegree && angle.value <= maxDegree) {
    let value = angle.value - event.movementY
    if(value < minDegree) {
      value = minDegree
    } else if(value > maxDegree) {
      value = maxDegree
    }
    angle.value = value
  }
  let max = props.widget.midiData.messageMax
  let positiveAngleValue = angle.value + maxDegree
  update((max / totalDegrees) * positiveAngleValue)
}

const handleEnd = () => {
  window.removeEventListener('mousemove', handleChange);
  window.removeEventListener('mouseup', handleEnd);
}
const handleStart = () => {
  window.addEventListener('mousemove',handleChange);
  window.addEventListener('mouseup',handleEnd);
}
const handleReset = () => {
  update(props.widget.midiData.messageMin)
  angle.value = minDegree
}
const theme = useTheme()
const drawArc = () => {
  if(!backgroundCtx.value) return
  backgroundCtx.value.save();
  backgroundCtx.value.beginPath();
  backgroundCtx.value.arc(39, 25, 23, minAngleRadian, maxAngleRadian);
  backgroundCtx.value.lineWidth = 4;

  backgroundCtx.value.strokeStyle = theme.computedThemes.value.customDark.colors.primary
  backgroundCtx.value.globalAlpha = 0.38;
  backgroundCtx.value.stroke();
  backgroundCtx.value.restore();
}
const drawUpdateArc = (newValue: number) => {
  if(!baseCanvas.value || !foregroundCtx.value) return
  foregroundCtx.value.clearRect(0, 0, baseCanvas.value.width, baseCanvas.value.height)
  foregroundCtx.value.beginPath();
  foregroundCtx.value.lineWidth = 4;
  foregroundCtx.value.strokeStyle = theme.computedThemes.value.customDark.colors.primary
  const endAngle = ((totalDegrees * Math.PI / 180) / props.widget.midiData.messageMax) * newValue
  foregroundCtx.value.arc(39, 25, 23, minAngleRadian, minAngleRadian + endAngle);
  foregroundCtx.value.stroke();
}

onMounted(() => {
  emit("widgetConfig", config)
  if(!baseCanvas.value || !baseBackgroundCanvas.value) return
  backgroundCtx.value = baseBackgroundCanvas.value.getContext("2d");
  foregroundCtx.value = baseCanvas.value.getContext("2d");
  drawArc()
  drawUpdateArc(props.widget.midiData.messageValue)
  angle.value = Math.round(props.widget.midiData.messageValue * (totalDegrees / props.widget.midiData.messageMax)) - maxDegree
})

</script>

<script lang="ts">

const config: WidgetConfig = {
  tileColumnCount: 1,
  tileRowCount: 1
}
export default {}
</script>

<template>
  <div class="widget-container">
    <div class="widget-title">{{ props.widget.widgetTitle }}</div>
    <div
      class="dial-wrap"
    >
      <canvas
        ref="baseBackgroundCanvas"
        :width="gridStore.tileWidth * config.tileColumnCount -2"
        :height="gridStore.tileHeight * config.tileRowCount -25"
      ></canvas>
      <canvas
        ref="baseCanvas"
        :width="gridStore.tileWidth * config.tileColumnCount -2"
        :height="gridStore.tileHeight * config.tileRowCount -25"
      ></canvas>
      <Rotary
        class="rotary-dial"
        :style="{
          width: (gridStore.tileWidth * config.tileColumnCount) - 44 + 'px',
          height: (gridStore.tileHeight * config.tileRowCount) - 44 + 'px',
          transform: `rotate(${angle}deg)`,
        }"
        tabindex="0"
        @mousedown="handleStart"
        @dblclick="handleReset"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .widget-container {
    display: flex;
    flex-direction: column;
    justify-content: center;

    text-align: center;
  }
  .dial-wrap {
    position: relative;
    padding-top: 5px;
  }
  canvas {
    position: absolute;
    top: 0;
    left: -1px;
    
  }
  .rotary-dial {
    position: absolute;
    top: 7px;
    left: 20px;
    color: rgb(var(--v-theme-primary));
  }
  .hidden {
    display: none
  }
  .mdi-knob {
    font-size: 2.5rem;
    border-radius: 50%;
    
    &:focus-visible {
      outline-width: 0;
      outline: none;
      border: 8px solid rgba(var(--v-theme-surface-variant), 0.3);
    }
  }
</style>