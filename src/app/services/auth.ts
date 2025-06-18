import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://reqres.in/api';
  private apiKey = 'reqres-free-v1';  // Cheia API primită

  // Signal pentru utilizatorul curent - cerința pentru signals
  public currentUser = signal<User | null>(null);
  // Signal pentru starea de login - cerința pentru signals
  public isLoggedIn = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkStoredUser();
  }

  login(loginData: LoginRequest, rememberMe: boolean = false): Observable<any> {
    const headers = new HttpHeaders({ 'x-api-key': this.apiKey });

    return this.http.post(`${this.apiUrl}/login`, {
      email: loginData.email,
      password: loginData.password
    }, { headers }).pipe(
      map((response: any) => {
        const user: User = {
          id: 1,
          email: loginData.email,
          first_name: 'User',
          last_name: 'Demo',
          token: response.token
        };
        
        this.setCurrentUser(user, rememberMe);
        return { success: true, user };
      }),
      catchError(error => {
        return of({ success: false, error: error.error });
      })
    );
  }

  register(registerData: RegisterRequest): Observable<any> {
    const headers = new HttpHeaders({ 'x-api-key': this.apiKey });

    return this.http.post(`${this.apiUrl}/register`, {
      email: registerData.email,
      password: registerData.password,
      first_name: registerData.first_name,
      last_name: registerData.last_name
    }, { headers }).pipe(
      map((response: any) => {
        return { success: true, data: response };
      }),
      catchError(error => {
        return of({ success: false, error: error.error });
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  }

  private setCurrentUser(user: User, rememberMe: boolean): void {
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('currentUser', JSON.stringify(user));
  }

  private checkStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser') || 
                      sessionStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
    }
  }
}
