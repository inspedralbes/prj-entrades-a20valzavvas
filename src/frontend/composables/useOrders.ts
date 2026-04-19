import { useAuthStore } from "~/stores/auth";

export interface OrderEvent {
  id: string;
  name: string;
  slug: string;
  date: string;
  venue: string;
  image_url: string | null;
}

export interface OrderSeat {
  id: string;
  row: string;
  number: number;
  price_category: { name: string } | null;
  event: OrderEvent | null;
}

export interface OrderItem {
  id: string;
  price: string;
  seat: OrderSeat;
}

export interface OrderWithDetails {
  id: string;
  total_amount: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export function useOrders() {
  const orders = ref<OrderWithDetails[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchOrders() {
    const authStore = useAuthStore();
    isLoading.value = true;
    error.value = null;
    try {
      orders.value = await $fetch<OrderWithDetails[]>("/api/orders", {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      error.value = apiError?.data?.message ?? "Error en carregar les entrades";
    } finally {
      isLoading.value = false;
    }
  }

  return { orders, isLoading, error, fetchOrders };
}
