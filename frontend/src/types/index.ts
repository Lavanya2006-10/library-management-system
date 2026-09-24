export type Role = 'admin' | 'librarian' | 'student';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  avatar_url?: string;
  student_id?: string;
  created_at?: string;
  student_profile?: Student;
}

export interface Student {
  id: number;
  student_id: string;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  year: number;
  max_borrow_limit: number;
  currently_borrowed: number;
  total_borrowed: number;
  outstanding_fines: number;
  created_at?: string;
  active_loans?: Transaction[];
  history?: Transaction[];
  fines?: Fine[];
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
  books_count?: number;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color_code?: string;
  books_count?: number;
  created_at?: string;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author_id: number;
  author_name: string;
  category_id: number;
  category_name: string;
  category_color?: string;
  publisher?: string;
  publication_year?: number;
  description?: string;
  cover_url?: string;
  total_copies: number;
  available_copies: number;
  shelf_location: string;
  status: 'available' | 'unavailable' | 'reserved';
  created_at?: string;
  history?: Transaction[];
}

export interface Transaction {
  id: number;
  student_id: number;
  student_number: string;
  student_name: string;
  student_email: string;
  student_department: string;
  book_id: number;
  book_isbn: string;
  book_title: string;
  book_author: string;
  book_cover?: string;
  issued_by: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  late_days: number;
  notes?: string;
  fine?: Fine;
  created_at?: string;
}

export interface Fine {
  id: number;
  transaction_id: number;
  student_id: number;
  student_name?: string;
  student_number?: string;
  student_email?: string;
  book_title?: string;
  book_isbn?: string;
  due_date?: string;
  return_date?: string;
  amount: number;
  late_days: number;
  status: 'pending' | 'paid' | 'waived';
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  created_at?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert' | 'due_soon' | 'overdue';
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  kpis: {
    total_titles: number;
    total_copies: number;
    available_copies: number;
    issued_books: number;
    total_students: number;
    overdue_books: number;
    total_fines_unpaid: number;
    utilization_rate: number;
  };
  monthly_trends: {
    month: string;
    issued: number;
    returned: number;
  }[];
  category_distribution: {
    name: string;
    count: number;
    color: string;
  }[];
  popular_books: (Book & { borrow_count: number })[];
  recent_transactions: Transaction[];
  overdue_transactions: Transaction[];
  recent_activity: ActivityLog[];
  student_stats?: {
    currently_borrowed: number;
    max_limit: number;
    total_borrowed_history: number;
    unpaid_fines: number;
    active_loans: Transaction[];
  };
}

export interface ActivityLog {
  id: number;
  user_name: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  created_at: string;
}

export interface SystemSettings {
  library_name: string;
  fine_per_day: string;
  borrow_duration_days: string;
  max_borrow_limit: string;
  allow_self_renewal: string;
}
