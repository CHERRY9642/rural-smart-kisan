import { apiRequest, AuthUser, session } from "./apiClient";

type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  state: string;
  district: string;
  language: string;
  plan: string;
  role: string;
};

export const authService = {
  async signup(payload: SignupPayload) {
    const result = await apiRequest<AuthResponse>("/auth/signup", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload)
    });
    session.set(result.token, result.user);
    return result.user;
  },

  async login(email: string, password: string) {
    const result = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password })
    });
    session.set(result.token, result.user);
    return result.user;
  },

  async me() {
    const result = await apiRequest<{ user: AuthUser }>("/auth/me");
    session.setUser(result.user);
    return result.user;
  },

  async updateMe(payload: Partial<AuthUser>) {
    const result = await apiRequest<{ user: AuthUser }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    session.setUser(result.user);
    return result.user;
  },

  logout() {
    session.clear();
  }
};
