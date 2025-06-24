import { Injectable, signal } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface Friend {
  id?: string; 
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  birthDate: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private readonly COLLECTION_NAME = 'friends';
  
  private friendsSignal = signal<Friend[]>([]);
  
  public friends = this.friendsSignal.asReadonly();

  constructor() {
    this.loadFriendsFromFirebase();
  }

  private async loadFriendsFromFirebase(): Promise<void> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('firstName'));
      const querySnapshot = await getDocs(q);
      const friends: Friend[] = [];
      
      querySnapshot.forEach((doc) => {
        friends.push({
          id: doc.id,
          ...doc.data()
        } as Friend);
      });
      
      this.friendsSignal.set(friends);
    } catch (error) {
      console.error('Eroare la încărcarea prietenilor:', error);
      this.friendsSignal.set([]);
    }
  }

  getFriends(): Observable<Friend[]> {
    return of(this.friendsSignal()).pipe(
      catchError(() => of([]))
    );
  }

  addFriend(friend: Omit<Friend, 'id'>): Observable<Friend> {
    return from(this.addFriendToFirebase(friend));
  }

  private async addFriendToFirebase(friend: Omit<Friend, 'id'>): Promise<Friend> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), friend);
      const newFriend: Friend = {
        id: docRef.id,
        ...friend
      };
      
      const updatedFriends = [...this.friendsSignal(), newFriend];
      this.friendsSignal.set(updatedFriends);
      
      return newFriend;
    } catch (error) {
      console.error('Eroare la adăugarea prietenului:', error);
      throw error;
    }
  }

  updateFriend(id: string, updatedFriend: Omit<Friend, 'id'>): Observable<Friend> {
    return from(this.updateFriendInFirebase(id, updatedFriend));
  }

  private async updateFriendInFirebase(id: string, updatedFriend: Omit<Friend, 'id'>): Promise<Friend> {
    try {
      const friendRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(friendRef, updatedFriend);
      
      const friend: Friend = { id, ...updatedFriend };
      
      const friends = this.friendsSignal();
      const index = friends.findIndex(f => f.id === id);
      if (index !== -1) {
        const updatedFriends = [...friends];
        updatedFriends[index] = friend;
        this.friendsSignal.set(updatedFriends);
      }
      
      return friend;
    } catch (error) {
      console.error('Eroare la actualizarea prietenului:', error);
      throw error;
    }
  }

  deleteFriend(id: string): Observable<boolean> {
    return from(this.deleteFriendFromFirebase(id));
  }

  private async deleteFriendFromFirebase(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
      
      const friends = this.friendsSignal();
      const filteredFriends = friends.filter(f => f.id !== id);
      this.friendsSignal.set(filteredFriends);
      
      return true;
    } catch (error) {
      console.error('Eroare la ștergerea prietenului:', error);
      return false;
    }
  }

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