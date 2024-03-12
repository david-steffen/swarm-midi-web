import { defineStore } from 'pinia'
import { MidiMessageType } from './midi'
import type { WidgetDataTransfer } from '@/components/widgets';
export interface WidgetPosition {
  columnStart: number;
  rowStart: number;
  columnLength: number;
  rowLength: number;
}

export type MidiData = {
  messageType: MidiMessageType;
  messageNumber: number;
  messageValue: number;
  messageMin: number;
  messageMax: number;
}

export type WidgetData = {
  widgetType: string;
  widgetTitle: string;
  positionData: WidgetPosition;
  midiData: MidiData;
}
export type GridState = {
  widgetData: WidgetData[];
  verticalGridTileCount: number;
  horizontalGridTileCount: number;
  tileWidth: number;
  tileHeight: number;
};

export type NewWidgetData = {
  widgetType: string;
  positionData: WidgetPosition;
  positionIndex: number;
}
export const useGridStore = defineStore('grid', {
  persist: {
    paths: ['widgetData']
  },
  state: (): GridState => {
    return {

      widgetData: [],
      verticalGridTileCount: 12,
      horizontalGridTileCount: 32,
      tileWidth: 80,
      tileHeight: 80,
    }
  },
  getters: {
    newPositionIndex: (state) => state.widgetData.length
  },
  actions: {
    setVerticalGridCount(verticalGridCount: number) {
      this.verticalGridTileCount = verticalGridCount
    },
    createWidget({ positionData, positionIndex, widgetType }: NewWidgetData) {
      const widgetData = {
        widgetType: widgetType,
        widgetTitle: `New ${this.newPositionIndex}`,
        positionData: {
          columnStart: 1,
          rowStart: 1,
          columnLength: 1,
          rowLength: 1,
        },
        midiData: {
          messageType: MidiMessageType.CC,
          messageNumber: 1,
          messageValue: 0,
          messageMin: 0,
          messageMax: 127
        }
      }

      widgetData.positionData.columnStart = positionData.columnStart
      widgetData.positionData.rowStart = positionData.rowStart
      widgetData.positionData.columnLength = positionData.columnLength
      widgetData.positionData.rowLength = positionData.rowLength
      this.widgetData[positionIndex] = widgetData
    },
    updateWidgetGridPosition({ positionData, positionIndex }: { positionData: WidgetPosition, positionIndex: number }) {
      const widgetData = this.widgetData[positionIndex]
      widgetData.positionData.columnStart = positionData.columnStart
      widgetData.positionData.rowStart = positionData.rowStart
      widgetData.positionData.columnLength = positionData.columnLength
      widgetData.positionData.rowLength = positionData.rowLength
      this.widgetData[positionIndex] = widgetData
    },
    updateWidgetMidiData(payload: { midiData: MidiData, positionIndex: number }) {
      const widgetData = this.widgetData[payload.positionIndex]
      widgetData.midiData.messageType = payload.midiData.messageType
      widgetData.midiData.messageNumber = +payload.midiData.messageNumber
      widgetData.midiData.messageValue = +payload.midiData.messageValue
      this.widgetData[payload.positionIndex] = widgetData
    },
    updateWidgetData(payload: WidgetData, positionIndex: number) {
      this.widgetData[positionIndex] = payload
    },
    deleteWidget(positionIndex: number) {
      this.widgetData.splice(positionIndex, 1)
    },
    setWidgetData(widgetData: WidgetData[]) {
      this.widgetData = widgetData
    }
  },
})
