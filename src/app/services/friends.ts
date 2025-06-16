import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  birthDate: string; // format: YYYY-MM-DD
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private readonly API_URL = 'https://reqres.in/api/users'; // Fake API
  
  // Signal pentru lista de prieteni
  private friendsSignal = signal<Friend[]>([]);
  
  // Getter pentru signal (readonly)
  public friends = this.friendsSignal.asReadonly();

  // Date mock pentru început (în absența unui backend real)
  private mockFriends: Friend[] = [
    {
      id: 1,
      firstName: 'Ana',
      lastName: 'Popescu',
      phone: '0721234567',
      city: 'București',
      birthDate: '1995-03-15',
      email: 'ana.popescu@email.com'
    },
    {
      id: 2,
      firstName: 'Mihai',
      lastName: 'Ionescu',
      phone: '0734567890',
      city: 'Cluj-Napoca',
      birthDate: '1988-07-22',
      email: 'mihai.ionescu@email.com'
    },
    {
      id: 3,
      firstName: 'Elena',
      lastName: 'Dumitrescu',
      phone: '0745678901',
      city: 'Timișoara',
      birthDate: '1992-11-08',
      email: 'elena.dumitrescu@email.com'
    }
  ];

  constructor(private http: HttpClient) {
    // Inițializăm cu date mock
    this.loadMockData();
  }

  private loadMockData(): void {
    this.friendsSignal.set([...this.mockFriends]);
  }

  // Obține toți prietenii
  getFriends(): Observable<Friend[]> {
    return of(this.friendsSignal()).pipe(
      catchError(() => of([]))
    );
  }

  // Adaugă un prieten nou
  addFriend(friend: Omit<Friend, 'id'>): Observable<Friend> {
    const newFriend: Friend = {
      ...friend,
      id: Math.max(...this.friendsSignal().map(f => f.id), 0) + 1
    };

    const updatedFriends = [...this.friendsSignal(), newFriend];
    this.friendsSignal.set(updatedFriends);

    return of(newFriend);
  }

  // Actualizează un prieten existent
  updateFriend(id: number, updatedFriend: Omit<Friend, 'id'>): Observable<Friend> {
    const friends = this.friendsSignal();
    const index = friends.findIndex(f => f.id === id);
    
    if (index !== -1) {
      const friend: Friend = { ...updatedFriend, id };
      const updatedFriends = [...friends];
      updatedFriends[index] = friend;
      this.friendsSignal.set(updatedFriends);
      return of(friend);
    }
    
    throw new Error('Prietenul nu a fost găsit');
  }

  // Șterge un prieten
  deleteFriend(id: number): Observable<boolean> {
    const friends = this.friendsSignal();
    const filteredFriends = friends.filter(f => f.id !== id);
    
    if (filteredFriends.length < friends.length) {
      this.friendsSignal.set(filteredFriends);
      return of(true);
    }
    
    return of(false);
  }

  // Caută prieteni după nume, prenume sau oraș
  searchFriends(searchTerm: string): Friend[] {
    if (!searchTerm.trim()) {
      return this.friendsSignal();
    }

    const term = searchTerm.toLowerCase();
    return this.friendsSignal().filter(friend =>
      friend.firstName.toLowerCase().includes(term) ||
      friend.lastName.toLowerCase().includes(term) ||
      friend.city.toLowerCase().includes(term) ||
      friend.phone.includes(term)
    );
  }

  // Calculează cea mai apropiată zi de naștere
  getNextBirthday(): { friend: Friend; daysUntil: number } | null {
    const friends = this.friendsSignal();
    if (friends.length === 0) return null;

    const today = new Date();
    const currentYear = today.getFullYear();
    
    let nextBirthday: { friend: Friend; daysUntil: number } | null = null;
    let minDays = Infinity;

    friends.forEach(friend => {
      const birthDate = new Date(friend.birthDate);
      const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      
      // Dacă ziua de naștere a trecut în acest an, calculăm pentru anul viitor
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(currentYear + 1);
      }

      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < minDays) {
        minDays = daysUntil;
        nextBirthday = { friend, daysUntil };
      }
    });

    return nextBirthday;
  }
}