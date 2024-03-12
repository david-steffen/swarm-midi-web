import { defineStore } from 'pinia'

export type AppState = {
    isEditing: boolean;
};

export const useAppStore = defineStore('app', {
    state: (): AppState => {
        return {
            isEditing: false,
        }
    },
    actions: {
        setIsEditing(isEditing: boolean) {
            this.isEditing = isEditing
        },
    },
})
