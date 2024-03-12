<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { useGridStore, type MidiData } from '@/stores/grid'
import { useMidiStore } from '@/stores/midi'
import { useAppStore } from '@/stores/app';
import DynamicGridWidget from '@/components/widgets/DynamicGridWidget.vue'
import { type WidgetDataTransfer } from '@/components/widgets'
import { calcGridColumn ,calcGridRow } from '@/utils'
import { WebMidi } from 'webmidi';
import { inject } from 'vue'

type DragPosition = {
  top: number;
  left: number;
  x: number;
  y: number;
}

const gridStore = useGridStore();
const midiStore = useMidiStore();
const appStore = useAppStore()
const isScrollDragging = ref<boolean>(false);
const dragScrollPosition = ref<DragPosition>({ top: 0, left: 0, x: 0, y: 0 });
const grid = ref<HTMLElement | null>(null);
const emit = defineEmits<{
  'selectWidget': [positionIndex: number],
}>()

const dragScrollStart = (event: MouseEvent) => {
  isScrollDragging.value = true
  if(grid.value) {
    dragScrollPosition.value = {
        // The current scroll
        left: grid.value?.scrollLeft,
        top: grid.value?.scrollTop,
        // Get the current mouse position
        x: event.clientX,
        y: event.clientY,
    }
  }
}

const dragScrollGrid = (event: MouseEvent) => {
  if(isScrollDragging.value) {
    const dx = event.clientX - dragScrollPosition.value.x;
    const dy = event.clientY - dragScrollPosition.value.y;
    if(grid.value) {
      grid.value.scrollTop = dragScrollPosition.value.top - dy;
      grid.value.scrollLeft = dragScrollPosition.value.left - dx;
    }

  }
}

const dragScrollEnd = () => {
  isScrollDragging.value = false
}

const toggleEdit = () => {
  appStore.setIsEditing(!appStore.isEditing)
}

const dragData = ref<WidgetDataTransfer | null>(null);
const { newDragData, clearNewDragData }: {newDragData:Ref<WidgetDataTransfer | null>, clearNewDragData: () => void;} = inject('newWidgetData', {
  newDragData: ref(null),
  clearNewDragData: () => {}
})

const handleDragStart = (data: WidgetDataTransfer) => {
  dragData.value = data
}
const handleDragDrop = (event: DragEvent & { target: HTMLElement}) => {
  const { target } = event
  if(!target.dataset.gridcolumn || !target.dataset.gridrow ) return
  const {gridcolumn, gridrow} = target.dataset
  if(newDragData && newDragData.value) {
    const { positionIndex, widgetSettings, widgetDragData, widgetType } = newDragData.value
    gridStore.createWidget({
      positionIndex,
      widgetType,
      positionData: {
        columnStart: +gridcolumn - widgetDragData.columnTile,
        rowStart: +gridrow - widgetDragData.rowTile,
        columnLength: widgetSettings.tileColumnCount,
        rowLength: widgetSettings.tileRowCount
      },
    })
    clearNewDragData()
    emit('selectWidget', positionIndex)
  } else if (dragData.value) {
    const { positionIndex, widgetSettings, widgetDragData } = dragData.value
    gridStore.updateWidgetGridPosition({
      positionIndex: positionIndex,
      positionData: {
        columnStart: +gridcolumn - widgetDragData.columnTile,
        rowStart: +gridrow - widgetDragData.rowTile,
        columnLength: widgetSettings.tileColumnCount,
        rowLength: widgetSettings.tileRowCount
      }
    })
  }
  dragData.value = null
}

const handleChange = (data: {midiData: MidiData, positionIndex: number}) => {
  gridStore.updateWidgetMidiData(data)
  try {
    WebMidi.getOutputByName(midiStore.selectedOutputDevice)?.sendControlChange(data.midiData.messageNumber, data.midiData.messageValue)
  } catch (error) {
    console.log(error)
  }
}
const handleClick =(positionIndex: number) => {
  emit('selectWidget', positionIndex)
}
onMounted(() => {
  if(WebMidi.enabled) {
    WebMidi.getInputByName(midiStore.selectedInputDevice)?.addListener("midimessage", e => {
      console.log(e);
    })
  }
})
const handleSave = () => {
  const data = localStorage.getItem('grid')
  if(!data) return
  const a = document.createElement("a");
  const file = new Blob([data], {type: "application/json"});
  a.href = URL.createObjectURL(file);
  a.download = 'project.json';
  a.click();
  URL.revokeObjectURL(a.href)
}
const handleLoad = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = '.json,application/json';
  input.addEventListener("change", (event: Event & { target: HTMLInputElement & { files: FileList | null}}) => {
    const reader = new FileReader();
    reader.addEventListener("load", (event: ProgressEvent) => {
      const { result } = event.target as FileReader
      if(!result || result instanceof ArrayBuffer) return
      const data = JSON.parse(result);
      gridStore.setWidgetData(data.widgetData)
    })
    if(!event.target.files) return
    reader.readAsText(event.target.files[0]);
  })
  input.click();
}
</script>

<template>
  <v-main>
    <v-toolbar
      dense
      floating
    >
      <v-spacer></v-spacer>
      <v-btn icon="mdi-content-save" @click="handleSave"></v-btn>
      <v-btn icon="mdi-upload" @click="handleLoad"></v-btn>
      <v-btn icon="mdi-pencil" @click="toggleEdit"></v-btn>
    </v-toolbar>
    <v-container
      class="grid-wrap"
      ref="grid"
      fluid
    >
      <div
        ref="gridContainer"
        :class="{'grid-tile-wrap': true, dragging: isScrollDragging}"
        :style="{
          'grid-template-columns': `repeat(${gridStore.horizontalGridTileCount} , ${gridStore.tileWidth}px)`,
          'grid-template-rows' : `repeat(${gridStore.verticalGridTileCount} , ${gridStore.tileHeight}px)`
        }"
      >
        <v-sheet
          class="grid-tile"
          border="md"
          v-for="n in gridStore.verticalGridTileCount * gridStore.horizontalGridTileCount"
          :key="`tile-key-${n}`"
          :style="{
            'grid-column': calcGridColumn(n, gridStore.horizontalGridTileCount),
            'grid-row': calcGridRow(n, gridStore.horizontalGridTileCount),
          }"
          :data-gridcolumn="calcGridColumn(n, gridStore.horizontalGridTileCount)"
          :data-gridrow="calcGridRow(n, gridStore.horizontalGridTileCount)"
          @[appStore.isEditing&&`drop`]="handleDragDrop"
          @[appStore.isEditing&&`dragover`].prevent
        ></v-sheet>
        <DynamicGridWidget
          v-for="(widget, index) in gridStore.widgetData"
          :key="index"
          :widget="widget"
          :positionIndex="index"
          :isEditing="appStore.isEditing"
          @[appStore.isEditing&&`dragStart`]="handleDragStart"
          @[appStore.isEditing&&`drop`]="handleDragDrop"
          @change="handleChange"
          @[appStore.isEditing&&`click`]="handleClick(index)"
        />
      </div>
  </v-container>
  </v-main>

</template>

<style scoped>
section {
  margin: 0 20px;
}
.toolbar {
  display: flex;
  justify-content: end;
  padding: 20px 0;
}
.grid-wrap {
  margin-top: 20px;
  overflow-x: scroll;
  padding: 0;
  width: calc(100vw - 40px);
}
.grid-tile-wrap {
  display: grid;
}
.dragging {
  cursor: grabbing;
  user-select: none;
}
.grid-tile {
  user-select: none;
}
</style>