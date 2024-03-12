<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useGridStore } from '@/stores/grid'
import { type WidgetConfig } from '@/components/widgets';
import { type Props } from '../DynamicGridWidget.vue';

const gridStore = useGridStore()
const props = defineProps<Props>()
const emit = defineEmits<{
  widgetConfig: [payload: WidgetConfig]
  change: [payload: number]
}>()
onMounted(() => {
  emit("widgetConfig", config)
})

const update = (value: number) => {
  emit('change', value)
}

</script>

<script lang="ts">

const config: WidgetConfig = {
  tileColumnCount: 3,
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
    <v-slider
      :model-value="props.widget.midiData.messageValue"
      :min="props.widget.midiData.messageMin"
      :max="props.widget.midiData.messageMax"
      :step="1"
      class="align-center"
      color="primary"
      @update:modelValue="update"
    >
    </v-slider>
  </div>
</template>

<style scoped>
  .widget-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 5px 5px 0 10px;
  }
</style>