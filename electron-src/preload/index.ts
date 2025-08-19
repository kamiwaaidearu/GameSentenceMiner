import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

// Merge electronAPI with custom IPC methods
const extendedElectronAPI = {
    ...electronAPI,
    ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
        on: (channel: string, func: (...args: any[]) => void) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
        once: (channel: string, func: (...args: any[]) => void) => {
            ipcRenderer.once(channel, (event, ...args) => func(...args));
        },
        removeListener: (channel: string, func: (...args: any[]) => void) => {
            ipcRenderer.removeListener(channel, func);
        },
    },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', extendedElectronAPI);
        contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI;
    // @ts-ignore (define in dts)
    window.api = api;
}
