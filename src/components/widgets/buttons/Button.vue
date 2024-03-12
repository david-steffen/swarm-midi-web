<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useGridStore } from '@/stores/grid'
import { type WidgetConfig } from '@/components/widgets';
import { type Props } from '../DynamicGridWidget.vue';

const gridStore = useGridStore()
const props = defineProps<Props>()
const emit = defineEmits<{
  widgetConfig: [payload: WidgetConfig]
  change: [payload: number]
}>()
const update = (value: number) => {
  emit('change', value)
}
onMounted(() => {
  emit("widgetConfig", config)
})

const isActive = computed(() => {
  return props.widget.midiData.messageValue > props.widget.midiData.messageMin
})
const handleToggle = () => {
  if (props.widget.midiData.messageValue == props.widget.midiData.messageMax) {
    update(props.widget.midiData.messageMin)
  } else {
    update(props.widget.midiData.messageMax)
  }
}
</script>

<script lang="ts">

const config: WidgetConfig = {
  tileColumnCount: 1,
  tileRowCount: 1
}
export default {}
</script>

<template>
  <div class="widget-container" :style="{
    // width: gridStore.tileWidth * config.tileColumnCount + 'px',
    // height: gridStore.tileHeight * config.tileRowCount + 'px'
  }">
    <div class="widget-title">{{ props.widget.widgetTitle }}</div>
    <div class="button-wrap">
      <div :class="{indicator: true, active: isActive}"></div>
      <v-btn
      size="x-small"
      density="compact"
      :ripple="false"
      height="20"
      max-width="20"
      :flat="true"
      color="primary"
      @click="handleToggle"
      ></v-btn>
    </div>
  </div>
</template>

<style scoped>
  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 100%;
    background-color: rgb(var(--v-theme-surface));
    box-shadow: 0px 0px 5px rgb(var(--v-theme-surface));
    margin: 5px auto 5px;
  }
  .indicator.active {
    background-color: rgba(var(--v-theme-primary), 0.7);
    box-shadow: 0px 0px 5px rgb(var(--v-theme-primary));
  }
  .widget-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
</style>