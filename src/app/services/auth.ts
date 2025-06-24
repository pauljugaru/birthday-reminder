import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.config'; 

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password?: string; 
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
  public currentUser = signal<User | null>(null);
  public isLoggedIn = signal<boolean>(false);

  constructor() {
    this.checkStoredUser();
  }

  login(loginData: LoginRequest, rememberMe: boolean = false): Observable<any> {
    return new Observable(observer => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', loginData.email));

      getDocs(q).then(snapshot => {
        if (snapshot.empty) {
          observer.next({ success: false, error: 'User not found' });
        } else {
          const userDoc = snapshot.docs[0];
          const userData = userDoc.data() as User;

          if (userData.password === loginData.password) {
            this.setCurrentUser(userData, rememberMe);
            observer.next({ success: true, user: userData });
          } else {
            observer.next({ success: false, error: 'Incorrect password' });
          }
        }
        observer.complete();
      }).catch(error => {
        observer.next({ success: false, error });
        observer.complete();
      });
    });
  }

  register(registerData: RegisterRequest): Observable<any> {
    return new Observable(observer => {
      const usersRef = collection(db, 'users');

      const newUser: User = {
        id: Date.now(),
        email: registerData.email,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        password: registerData.password 
      };

      addDoc(usersRef, newUser).then(() => {
        observer.next({ success: true, user: newUser });
        observer.complete();
      }).catch(error => {
        observer.next({ success: false, error });
        observer.complete();
      });
    });
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
