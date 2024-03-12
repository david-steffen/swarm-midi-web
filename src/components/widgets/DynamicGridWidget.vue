<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HSliderWidget from '@/components/widgets/sliders/HorizontalSlider.vue';
import VSliderWidget from '@/components/widgets/sliders/VerticalSlider.vue';
import DialWidget from '@/components/widgets/rotary/Dial.vue';
import BiDialWidget from '@/components/widgets/rotary/BiDirectionalDial.vue';
import ButtonWidget from '@/components/widgets/buttons/Button.vue';
import { type WidgetConfig, type DragData, type WidgetDataTransfer } from '@/components/widgets';
import { useGridStore, type MidiData, type WidgetData, type WidgetPosition } from '@/stores/grid';
import { useMidiStore } from '@/stores/midi';
import { calcGridColumn, calcGridRow } from '@/utils'
import { WebMidi } from 'webmidi';


export interface Props {
  widget: WidgetData;
  isEditing: boolean;
  positionIndex: number;
}

const gridStore = useGridStore();
const emit = defineEmits<{
  'dragStart': [payload:WidgetDataTransfer],
  'change': [payload:{midiData: MidiData, positionIndex: number}],
  'dragDrop': [event: DragEvent]
}>()
const props = defineProps<Props>()

const widgetMap =  new Map()
widgetMap.set('horizontal-slider', HSliderWidget)
widgetMap.set('vertical-slider', VSliderWidget)
widgetMap.set('rotary-dial', DialWidget)
widgetMap.set('bi-directional-dial', BiDialWidget)
widgetMap.set('button', ButtonWidget)


const widgetSettings = ref({tileColumnCount:0,tileRowCount:0})

const updateWidgetSettings = (config: WidgetConfig) => {
  widgetSettings.value = config
}

const dragStart = (event: DragEvent & {layerX:number, layerY:number}) => {
  const column = Math.floor(event.layerX / gridStore.tileWidth)
  const row = Math.floor(event.layerY / gridStore.tileHeight)
  const widgetDragData = {
    columnTile: column,
    rowTile: row,
  }
  emit('dragStart', {
    widgetType: props.widget.widgetType,
    positionIndex: props.positionIndex,
    widgetSettings: widgetSettings.value,
    widgetDragData
  })

}

const calcGridIndex = (widget: WidgetData) => {
  let startingIndex = (widget.positionData.rowStart - 1) * gridStore.horizontalGridTileCount + widget.positionData.columnStart
  let calculatedIndexes = []
  for(const x of Array(widget.positionData.rowLength).keys()) {
    for(const y of Array(widget.positionData.columnLength).keys()) {
      calculatedIndexes.push(startingIndex + y + (x * gridStore.horizontalGridTileCount))
    }
  }
  return calculatedIndexes
}
const handleValueChange = (value: number) => {
  const midiData = Object.assign({},props.widget.midiData)
  midiData.messageValue = value
  emit('change', {
    midiData,
    positionIndex: props.positionIndex
  })
}

</script>

<template v-if="widgetMap[props.widget.widgetType] !== null">
  <v-sheet
    class="widget"
    color="grey-darken-3"
    border="md"
    :style="{
      'grid-column-start': widget.positionData.columnStart,
      'grid-column-end': widget.positionData.columnStart + widget.positionData.columnLength,
      'grid-row-start': widget.positionData.rowStart,
      'grid-row-end': widget.positionData.rowStart + widget.positionData.rowLength,
      width: gridStore.tileWidth * widgetSettings.tileColumnCount + 'px',
      height: gridStore.tileHeight * widgetSettings.tileRowCount + 'px'
    }"
    :draggable="isEditing"
    @[isEditing&&`dragstart`]="dragStart"
  >
    <component :is="widgetMap.get(props.widget.widgetType)" v-bind="props" @widgetConfig="updateWidgetSettings" @change="handleValueChange"/>
    <div
      v-if="isEditing"
      class="widget-editing-overlay"
      :style="{
        'grid-template-columns': `repeat(${widgetSettings.tileColumnCount} , ${gridStore.tileWidth}px)`,
        'grid-template-rows' : `repeat(${widgetSettings.tileRowCount} , ${gridStore.tileHeight}px)`
      }"
    >
      <v-sheet
        class="overlay-tile"
        color="transparent"
        v-for="n in calcGridIndex(widget)"
        :key="n"
        :id="'overlay-tile-' + n"
        :data-gridcolumn="calcGridColumn(n, gridStore.horizontalGridTileCount)"
        :data-gridrow="calcGridRow(n, gridStore.horizontalGridTileCount)"
        @[isEditing&&`dragover`].prevent
      ></v-sheet>
    </div>
  </v-sheet>

</template>

<style scoped>
  .widget {
    overflow: hidden;
    position: relative;
    z-index:2;
    user-select: none;
  }
  .widget-editing-overlay {
    display: grid;
    position: absolute;
    top: -2px;
    left: -2px;
    cursor: grab;
    background-color: rgba(var(--v-theme-on-background), 0.5);
  }
</style>
