<script setup lang="ts">
import { readonly, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useGridStore, type WidgetData } from '@/stores/grid';
import { useMidiStore, MidiMessageType } from '@/stores/midi';
import { useAppStore } from '@/stores/app';
import { onMounted } from 'vue';
import { WebMidi, type Event } from 'webmidi';
import DynamicGridWidget from '@/components/widgets/DynamicGridWidget.vue'
import { calcGridColumn ,calcGridRow } from '@/utils'
import { provide } from 'vue'
import type { WidgetDataTransfer } from './components/widgets';

const gridStore = useGridStore()
const midiStore = useMidiStore()
const appStore = useAppStore()
const drawer = ref(false)
const bottomDrawer = ref(false)
const isEditingWidget = ref(false)
const selectedWidgetIndex = ref(0)
const selectedWidgetData = ref<WidgetData | null>(null)

const editWidget = (index: number) => {
  isEditingWidget.value = true
  selectedWidgetIndex.value = index
  selectedWidgetData.value = Object.assign({}, gridStore.widgetData[index])
}

const saveWidgetMidiData = () => {
  if(selectedWidgetData.value) {
    gridStore.updateWidgetData(selectedWidgetData.value, selectedWidgetIndex.value)
  }
  closeWidgetMidiData()
}

const closeWidgetMidiData = () => {
  selectedWidgetData.value = null
  isEditingWidget.value = false
}
const deleteWidget = () => {
  gridStore.deleteWidget(selectedWidgetIndex.value)
  closeWidgetMidiData()
}
onMounted(() => {
  WebMidi
  .enable()

  WebMidi.addListener('midiaccessgranted', (event: Event) => {
    const webMidi = event.target as typeof WebMidi
    midiStore.setMidiEnabled(webMidi.enabled)
  })

  WebMidi.addListener('connected', (event: Event) => {
    const webMidi = event.target as typeof WebMidi
    midiStore.setInputMidiDevices(webMidi.inputs.map((device) => device.name))
    midiStore.setOutputMidiDevices(webMidi.outputs.map((device) => device.name))
  })
})
const widgets = [
  {type:'horizontal-slider', columnStart: 2, rowStart: 1, columnLength: 3, rowLength: 1},
  {type:'vertical-slider', columnStart: 1, rowStart: 1, columnLength: 1, rowLength: 3},
  {type:'rotary-dial', columnStart: 2, rowStart: 2, columnLength: 1, rowLength: 1},
  {type:'bi-directional-dial', columnStart: 3, rowStart: 2, columnLength: 1, rowLength: 1},
  {type:'button', columnStart: 4, rowStart: 2, columnLength: 1, rowLength: 1}
]

const initWidgetData = ref<WidgetData[]>(widgets.map((widget) => {
    return {
        widgetTitle: 'none',
        widgetType: widget.type,
        positionData: {
          columnStart: widget.columnStart,
          rowStart: widget.rowStart,
          columnLength: widget.columnLength,
          rowLength: widget.rowLength,
        },
        midiData: {
          messageType: MidiMessageType.CC,
          messageNumber: 1,
          messageValue: 0,
          messageMin: 0,
          messageMax: 127
        }
  }}))
const columnCount = 20
const rowCount = 3
const newDragData = ref<WidgetDataTransfer | null>(null)
const clearNewDragData = () => {
  newDragData.value = null
}
provide('newWidgetData', {
  newDragData: readonly(newDragData),
  clearNewDragData
})
const handleDragStart = (data: WidgetDataTransfer) => {
  newDragData.value = data
}

</script>

<template>
  <v-app id="inspire">
    <v-app-bar density="compact" elevation="0">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>SwarmMIDI</v-toolbar-title>

    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      temporary
    >
      <v-list density="compact" nav>
        <v-list-item title="Grid" :to="'/'"></v-list-item>
        <v-list-item title="About" :to="'/about'"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-if="appStore.isEditing"
      location="right"
      floating
      permanent
      width="400"
    >
    
        <v-list>
          <v-list-item title="Midi In">
            <v-select
              label="Select"
              density="compact"
              flat
              :items="midiStore.inputMidiDevices"
              @update:modelValue="midiStore.setSelectedInputDevice"
            ></v-select>
          </v-list-item>

          <v-list-item title="Midi Out">
            <v-select
              label="Select"
              density="compact"
              flat
              :items="midiStore.outputMidiDevices"
              @update:modelValue="midiStore.setSelectedOutputDevice"
            ></v-select>
          </v-list-item>
        </v-list>
        <v-list lines="two" density="compact">
          <v-list-subheader>
            Controls
            <v-btn
            @click.stop="bottomDrawer = !bottomDrawer"
            prepend-icon="mdi-plus"
            >Add
            </v-btn>

          </v-list-subheader>
          <v-list-item
            v-for="(widget, index) in gridStore.widgetData"
            :key="'menu-widget-' + index"
            :title="widget.widgetTitle"
            :subtitle="`${widget.midiData.messageType} - ${widget.midiData.messageNumber}`"
            @click="editWidget(index)"
            ></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-navigation-drawer
        v-if="appStore.isEditing && isEditingWidget && selectedWidgetData"
        permanent
        floating
        location="right"
        >
        <v-list>
          <v-list-item>
            <v-text-field label="Title" v-model="selectedWidgetData.widgetTitle"></v-text-field>
          </v-list-item>
          <v-list-item>
            <v-select
              label="Message type"
              density="compact"
              flat
              v-model="selectedWidgetData.midiData.messageType"
              :items="[MidiMessageType.CC, MidiMessageType.RPN, MidiMessageType.NRPN]"
            ></v-select>
          </v-list-item>

          <v-list-item>
            <v-text-field
              v-model="selectedWidgetData.midiData.messageNumber"
              label="Message number" 
              type="number"></v-text-field>
          </v-list-item>
          <v-list-item>
            <v-text-field
              v-model="selectedWidgetData.midiData.messageMin"
              label="Message min value" 
              type="number"></v-text-field>
          </v-list-item>
          <v-list-item>
            <v-text-field
              v-model="selectedWidgetData.midiData.messageMax"
              label="Message max value" 
              type="number"></v-text-field>
          </v-list-item>
          <v-list-item>
            <v-btn @click="closeWidgetMidiData">Cancel</v-btn>
            <v-btn @click="saveWidgetMidiData">Save</v-btn>
            <v-btn @click="deleteWidget">Delete</v-btn>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-navigation-drawer
        v-if="appStore.isEditing"
        v-model="bottomDrawer"
        location="bottom"
        permanent
      >
      <v-container
        class="grid-wrap"
        fluid
      >
        <div
          ref="gridContainer"
          :class="{'grid-tile-wrap': true}"
          :style="{
            'grid-template-columns': `repeat(${columnCount}, ${gridStore.tileWidth}px)`,
            'grid-template-rows' : `repeat(${rowCount} , ${gridStore.tileHeight}px)`
          }"
        >
          <v-sheet
            class="grid-tile"
            v-for="n in 20 * 3"
            :key="`tile-key-${n}`"
            :style="{
              'grid-column': calcGridColumn(n, columnCount),
              'grid-row': calcGridRow(n, columnCount),
            }"
            :data-gridcolumn="calcGridColumn(n, columnCount)"
            :data-gridrow="calcGridRow(n, columnCount)"
            @[appStore.isEditing&&`dragover`].prevent
          ></v-sheet>
          <DynamicGridWidget
            v-for="widget in initWidgetData"
            :key="widget.widgetType"
            :widget="widget"
            :positionIndex="gridStore.newPositionIndex"
            :isEditing="true"
            @dragStart="handleDragStart"
           />
        </div>
      </v-container>
    </v-navigation-drawer>
    <RouterView v-if="midiStore.midiEnabled" @selectWidget="editWidget"/>
    <v-main v-else>
      <v-layout full-height class="justify-center align-center">
        <v-card title="Waiting for Midi to be enabled...">
          <v-card-text class="text-center">
          <v-progress-circular
            :size="70"
            color="grey"
            indeterminate
          ></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-layout>
    </v-main>
  </v-app>
</template>

<style scoped>
.grid-wrap {
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
  z-index: 1;
}
</style>
