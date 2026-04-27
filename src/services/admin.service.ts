import apiClient from '@/lib/apiClient';

// ── Admin Profile ──────────────────────────────────────────────────────────────
export interface AdminProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_orders: number;
  total_products: number;
  total_customers: number;
  total_revenue: number;
}

export interface ChartPoint {
  date: string;
  orders: number;
}

export interface AdminTransaction {
  id: string;
  user: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

// ── Orders ─────────────────────────────────────────────────────────────────────
export interface AdminOrderItem {
  name: string;
  image: string;
  size: string;
  color: string;
  qty: number;
  price: number;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  customer: string;
  date: string;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  tracking_number: string;
  items: AdminOrderItem[];
}

export interface PaginatedOrders {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminOrder[];
}

// ── Products ───────────────────────────────────────────────────────────────────
export interface ProductVariant {
  size: string;
  stock: number;
}

export interface AdminProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  inventory: number;
  image: string;
  variants: ProductVariant[];
}

export interface PaginatedProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminProduct[];
}

// ── Customers ──────────────────────────────────────────────────────────────────
export interface CustomerOrderHistory {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Shipped' | 'Pending' | 'Cancelled';
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joined: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  order_history: CustomerOrderHistory[];
}

export interface PaginatedCustomers {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminCustomer[];
}

// ── Service Object ─────────────────────────────────────────────────────────────
export const adminService = {
  // Profile
  getProfile(): Promise<AdminProfile> {
    return apiClient.get<AdminProfile>('/api/admin/profile/').then(r => r.data);
  },

  updateProfile(data: FormData): Promise<AdminProfile> {
    return apiClient
      .patch<AdminProfile>('/api/admin/profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  // Dashboard
  getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/api/admin/dashboard/stats/').then(r => r.data);
  },

  getChartData(period = 'week'): Promise<ChartPoint[]> {
    return apiClient.get<ChartPoint[]>('/api/admin/dashboard/chart/', { params: { period } }).then(r => r.data);
  },

  getTransactions(limit = 5): Promise<AdminTransaction[]> {
    return apiClient
      .get<AdminTransaction[]>('/api/admin/dashboard/transactions/', { params: { limit } })
      .then(r => r.data);
  },

  // Orders
  getOrders(page = 1, pageSize = 10, status?: string): Promise<PaginatedOrders> {
    return apiClient
      .get<PaginatedOrders>('/api/admin/orders/', {
        params: { page, page_size: pageSize, ...(status ? { status } : {}) },
      })
      .then(r => r.data);
  },

  updateOrderStatus(orderId: string, status: 'Shipped' | 'Delivered' | 'Cancelled'): Promise<AdminOrder> {
    return apiClient
      .patch<AdminOrder>(`/api/admin/orders/${orderId}/`, { status })
      .then(r => r.data);
  },

  // Products
  getProducts(page = 1, pageSize = 10): Promise<PaginatedProducts> {
    return apiClient
      .get<PaginatedProducts>('/api/admin/products/', { params: { page, page_size: pageSize } })
      .then(r => r.data);
  },

  createProduct(data: FormData): Promise<AdminProduct> {
    return apiClient
      .post<AdminProduct>('/api/admin/products/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  updateProduct(id: number, data: FormData): Promise<AdminProduct> {
    return apiClient
      .patch<AdminProduct>(`/api/admin/products/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  deleteProduct(id: number): Promise<void> {
    return apiClient.delete(`/api/admin/products/${id}/`).then(() => undefined);
  },

  // Customers
  getCustomers(page = 1, pageSize = 10): Promise<PaginatedCustomers> {
    return apiClient
      .get<PaginatedCustomers>('/api/admin/customers/', { params: { page, page_size: pageSize } })
      .then(r => r.data);
  },

  updateCustomer(id: number, data: { name: string; email: string; phone: string }): Promise<AdminCustomer> {
    return apiClient.patch<AdminCustomer>(`/api/admin/customers/${id}/`, data).then(r => r.data);
  },

  deleteCustomer(id: number): Promise<void> {
    return apiClient.delete(`/api/admin/customers/${id}/`).then(() => undefined);
  },

  // Notifications
  getNotifications(): Promise<AdminNotification[]> {
    return apiClient.get<AdminNotification[]>('/api/admin/notifications/').then(r => r.data);
  },

  markNotificationsRead(): Promise<void> {
    return apiClient.post('/api/admin/notifications/mark-read/').then(() => undefined);
  },

  // Blog
  getBlogPosts(page = 1, pageSize = 10): Promise<PaginatedBlogPosts> {
    return apiClient
      .get<PaginatedBlogPosts>('/api/admin/blog/', { params: { page, page_size: pageSize } })
      .then(r => r.data);
  },

  getBlogCategories(): Promise<AdminBlogCategory[]> {
    return apiClient.get<AdminBlogCategory[]>('/api/admin/blog/categories/').then(r => r.data);
  },

  createBlogPost(data: FormData): Promise<AdminBlogPost> {
    return apiClient
      .post<AdminBlogPost>('/api/admin/blog/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  updateBlogPost(id: number, data: FormData): Promise<AdminBlogPost> {
    return apiClient
      .patch<AdminBlogPost>(`/api/admin/blog/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  deleteBlogPost(id: number): Promise<void> {
    return apiClient.delete(`/api/admin/blog/${id}/`).then(() => undefined);
  },
};

export interface AdminNotification {
  id: number;
  title: string;
  body: string;
  type: 'order' | 'payment' | 'stock' | 'system';
  unread: boolean;
  time: string;
}

// ── Blog ───────────────────────────────────────────────────────────────────────
export interface AdminBlogCategory {
  id: number;
  name: string;
  slug: string;
}

export interface AdminBlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  category: { id: number; name: string; slug: string } | null;
  category_slug: string | null;
  published_date: string;
  author: string;
}

export interface PaginatedBlogPosts {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminBlogPost[];
}
