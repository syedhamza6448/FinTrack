import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DashboardData, Transaction, TransactionRequest, TransactionListResponse,
  TransactionSummary, PaginationParams, Category, CategoryRequest,
  Budget, BudgetRequest, BudgetOverview, SavingsGoal, SavingsGoalRequest,
  InvestmentPortfolio, Investment, InvestmentRequest, DebtListResponse,
  Debt, DebtRequest, NotificationListResponse, MonthlyReport, CategoryReport,
  NetWorthReport, UserSettings, ProfileUpdateRequest, PreferencesUpdateRequest,
  ChangePasswordRequest, EducationModule, EducationArticle, EducationGuide
} from '../models/models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) { }
  get(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${API}/dashboard`);
  }
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private url = `${API}/transactions`;
  constructor(private http: HttpClient) { }

  getAll(params?: PaginationParams): Observable<TransactionListResponse> {
    let p = new HttpParams();
    if (params?.page) p = p.set('page', params.page);
    if (params?.pageSize) p = p.set('pageSize', params.pageSize);
    if (params?.type) p = p.set('type', params.type);
    if (params?.categoryId) p = p.set('categoryId', params.categoryId);
    if (params?.search) p = p.set('search', params.search);
    if (params?.month) p = p.set('month', params.month);
    return this.http.get<TransactionListResponse>(this.url, { params: p });
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.url}/${id}`);
  }

  getSummary(month?: string): Observable<TransactionSummary> {
    let p = new HttpParams();
    if (month) p = p.set('month', month);
    return this.http.get<TransactionSummary>(`${this.url}/summary`, { params: p });
  }

  create(data: TransactionRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.url, data);
  }

  update(id: number, data: TransactionRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private url = `${API}/categories`;
  constructor(private http: HttpClient) { }

  getAll(type?: string): Observable<Category[]> {
    let p = new HttpParams();
    if (type) p = p.set('type', type);
    return this.http.get<Category[]>(this.url, { params: p });
  }

  create(data: CategoryRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.url, data);
  }

  update(id: number, data: CategoryRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private url = `${API}/budget`;
  constructor(private http: HttpClient) { }

  getAll(month?: string): Observable<Budget[]> {
    let p = new HttpParams();
    if (month) p = p.set('month', month);
    return this.http.get<Budget[]>(this.url, { params: p });
  }

  getOverview(): Observable<BudgetOverview> {
    return this.http.get<BudgetOverview>(`${this.url}/overview`);
  }

  create(data: BudgetRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.url, data);
  }

  update(id: number, data: BudgetRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class SavingsService {
  private url = `${API}/savings`;
  constructor(private http: HttpClient) { }

  getAll(status?: string): Observable<SavingsGoal[]> {
    let p = new HttpParams();
    if (status) p = p.set('status', status);
    return this.http.get<SavingsGoal[]>(this.url, { params: p });
  }

  create(data: SavingsGoalRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.url, data);
  }

  update(id: number, data: SavingsGoalRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  deposit(id: number, amount: number): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/deposit`, { amount });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class InvestmentService {
  private url = `${API}/investments`;
  constructor(private http: HttpClient) { }

  getAll(assetType?: string): Observable<InvestmentPortfolio> {
    let p = new HttpParams();
    if (assetType) p = p.set('assetType', assetType);
    return this.http.get<InvestmentPortfolio>(this.url, { params: p });
  }

  getById(id: number): Observable<Investment> {
    return this.http.get<Investment>(`${this.url}/${id}`);
  }

  create(data: InvestmentRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.url, data);
  }

  update(id: number, data: InvestmentRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class DebtService {
  private url = `${API}/debt`;
  constructor(private http: HttpClient) { }

  getAll(priority?: string): Observable<DebtListResponse> {
    let p = new HttpParams();
    if (priority) p = p.set('priority', priority);
    return this.http.get<DebtListResponse>(this.url, { params: p });
  }

  getById(id: number): Observable<Debt> {
    return this.http.get<Debt>(`${this.url}/${id}`);
  }

  create(data: DebtRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.url, data);
  }

  update(id: number, data: DebtRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  recordPayment(id: number, amount: number): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/payment`, { amount });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${API}/notifications`;
  constructor(private http: HttpClient) { }

  getAll(unreadOnly = false): Observable<NotificationListResponse> {
    let p = new HttpParams();
    if (unreadOnly) p = p.set('unreadOnly', true);
    return this.http.get<NotificationListResponse>(this.url, { params: p });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.url}/unread-count`);
  }

  markRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${this.url}/read-all`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private url = `${API}/reports`;
  constructor(private http: HttpClient) { }

  getMonthly(year?: number): Observable<MonthlyReport[]> {
    let p = new HttpParams();
    if (year) p = p.set('year', year);
    return this.http.get<MonthlyReport[]>(`${this.url}/monthly`, { params: p });
  }

  getByCategory(month?: string, type = 'Expense'): Observable<CategoryReport[]> {
    let p = new HttpParams().set('type', type);
    if (month) p = p.set('month', month);
    return this.http.get<CategoryReport[]>(`${this.url}/by-category`, { params: p });
  }

  getDaily(month?: string): Observable<any[]> {
    let p = new HttpParams();
    if (month) p = p.set('month', month);
    return this.http.get<any[]>(`${this.url}/daily`, { params: p });
  }

  getNetWorth(): Observable<NetWorthReport> {
    return this.http.get<NetWorthReport>(`${this.url}/net-worth`);
  }
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private url = `${API}/expenses`;
  constructor(private http: HttpClient) { }

  getAll(month?: string, categoryId?: number): Observable<any> {
    let p = new HttpParams();
    if (month) p = p.set('month', month);
    if (categoryId) p = p.set('categoryId', categoryId);
    return this.http.get<any>(this.url, { params: p });
  }

  getTopCategories(month?: string): Observable<CategoryReport[]> {
    let p = new HttpParams();
    if (month) p = p.set('month', month);
    return this.http.get<CategoryReport[]>(`${this.url}/top-categories`, { params: p });
  }
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private url = `${API}/settings`;
  constructor(private http: HttpClient) { }

  get(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.url);
  }

  updateProfile(data: ProfileUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/profile`, data);
  }

  updatePreferences(data: PreferencesUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/preferences`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/password`, data);
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.url}/account`);
  }
}

@Injectable({ providedIn: 'root' })
export class EducationService {
  private url = `${API}/education`;
  constructor(private http: HttpClient) {}

  // Articles / Tips
  getArticles(category?: string): Observable<EducationArticle[]> {
    let p = new HttpParams();
    if (category) p = p.set('category', category);
    return this.http.get<EducationArticle[]>(`${this.url}/articles`, { params: p });
  }

  getArticleById(id: number): Observable<EducationArticle> {
    return this.http.get<EducationArticle>(`${this.url}/articles/${id}`);
  }

  getArticleCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/articles/categories`);
  }

  // Learning Modules
  getModules(): Observable<EducationModule[]> {
    return this.http.get<EducationModule[]>(`${this.url}/modules`);
  }

  getModuleById(id: number): Observable<EducationModule> {
    return this.http.get<EducationModule>(`${this.url}/modules/${id}`);
  }

  // Goal Guides
  getGuides(): Observable<EducationGuide[]> {
    return this.http.get<EducationGuide[]>(`${this.url}/guides`);
  }

  getGuideById(id: number): Observable<EducationGuide> {
    return this.http.get<EducationGuide>(`${this.url}/guides/${id}`);
  }
}