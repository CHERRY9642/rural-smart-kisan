import { apiRequest } from "./apiClient";

export const marketplaceService = {
  async listProducts(type?: string) {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    return apiRequest<{ products: any[] }>(`/products${query}`, { auth: false });
  },

  async createProduct(product: any) {
    return apiRequest<{ product: any }>("/products", {
      method: "POST",
      body: JSON.stringify(product)
    });
  },

  async addFeedback(productId: string, rating: number, comment: string) {
    return apiRequest<{ feedback: any }>(`/products/${productId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ rating, comment })
    });
  },

  async toggleLike(productId: string, liked: boolean) {
    return apiRequest<{ liked: boolean; likesCount: number }>(`/products/${productId}/like`, {
      method: "POST",
      body: JSON.stringify({ liked })
    });
  },

  async createOrder(order: any) {
    return apiRequest<{ order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(order)
    });
  },

  async listOrders() {
    return apiRequest<{ orders: any[] }>("/orders");
  },

  async createColdStorageRequest(payload: any) {
    return apiRequest<{ request: any }>("/cold-storage/requests", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
