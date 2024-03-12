import { defineStore } from 'pinia'
import { WebMidi } from 'webmidi';

export enum MidiMessageType {
  CC = "CC",
  RPN = "RPN",
  NRPN = "NRPN"
}

export type MidiState = {
  midiEnabled: boolean;
  selectedInputDevice: string;
  selectedOutputDevice: string;
  inputMidiDevices: string[];
  outputMidiDevices: string[];
};

export const useMidiStore = defineStore('midi', {
  state: (): MidiState => {
    return {
      midiEnabled: false,
      selectedInputDevice: '',
      selectedOutputDevice: '',
      inputMidiDevices: [],
      outputMidiDevices: []
    }
  },

  actions: {
    setMidiEnabled(midiEnabled: boolean) {
      this.midiEnabled = midiEnabled
    },
    setSelectedInputDevice(device: string) {
      this.selectedInputDevice = device
    },
    setSelectedOutputDevice(device: string) {
      this.selectedOutputDevice = device
    },
    setInputMidiDevices(midiDevices: string[]) {
      this.inputMidiDevices = midiDevices
    },
    setOutputMidiDevices(midiDevices: string[]) {

      this.outputMidiDevices = midiDevices
    },
  },
})
