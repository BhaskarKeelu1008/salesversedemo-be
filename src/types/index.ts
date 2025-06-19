export interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
  role: string;
  avatar?: string;
  status?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  subItems?: MenuItem[];
  role?: string;
}

export interface SidebarSection {
  title: string;
  items: MenuItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    showingFrom: number;
    showingTo: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}
