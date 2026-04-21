import { io } from 'socket.io-client';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const wsUrl = new URL(config.public.wsUrl as string);
  const socket = io(wsUrl.origin, {
    path: wsUrl.pathname + '/socket.io',
    autoConnect: false,
    auth: (cb: (data: { token: string | null }) => void) => {
      const auth = useAuthStore();
      cb({ token: auth.token });
    },
  });

  return {
    provide: {
      socket,
    },
  };
});
