import { defineStore } from 'pinia';

type ConnexioEstat = 'connectat' | 'desconnectat' | 'reconnectant';

export const useConnexioStore = defineStore('connexio', {
  state: () => ({
    estat: 'desconnectat' as ConnexioEstat,
  }),

  actions: {
    inicialitzar() {
      const { $socket } = useNuxtApp();
      const socket = $socket as {
        on: (event: string, handler: () => void) => void;
        off: (event: string) => void;
      };

      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect_attempt');

      socket.on('connect', () => {
        this.estat = 'connectat';
      });

      socket.on('disconnect', () => {
        this.estat = 'desconnectat';
      });

      socket.on('reconnect_attempt', () => {
        this.estat = 'reconnectant';
      });
    },
  },
});
