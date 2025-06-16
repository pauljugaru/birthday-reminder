import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// NgZorro imports
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { AuthService } from '../services/auth';
import { FriendsService, Friend } from '../services/friends';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
    NzPopconfirmModule,
    NzIconModule,
    NzAlertModule,
    NzSpaceModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <nz-card class="header-card">
        <div class="header-content">
          <div class="header-left">
            <h1>🎂 Birthday Reminder</h1>
            <p>Gestionează lista de prieteni și nu uita nicio zi de naștere!</p>
          </div>
          <div class="header-right">
            <span>Bun venit, {{ currentUser?.first_name }}!</span>
            <button nz-button nzType="default" (click)="logout()">
              <span nz-icon nzType="logout"></span>
              Deconectare
            </button>
          </div>
        </div>
      </nz-card>

      <!-- Birthday Alert -->
      <nz-alert
        *ngIf="nextBirthday()"
        nzType="info"
        nzShowIcon
        [nzMessage]="birthdayMessage()"
        class="birthday-alert"
      ></nz-alert>

      <!-- Controls -->
      <nz-card class="controls-card">
        <div class="controls-content">
          <div class="search-section">
            <nz-input-group nzPrefixIcon="search">
              <input
                type="text"
                nz-input
                placeholder="Caută prieteni..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearch()"
              />
            </nz-input-group>
          </div>
          <div class="action-section">
            <button
              nz-button
              nzType="primary"
              (click)="openAddModal()"
            >
              <span nz-icon nzType="plus"></span>
              Adaugă Prieten
            </button>
          </div>
        </div>
      </nz-card>

      <!-- Table -->
      <nz-card class="table-card">
        <nz-table
          #basicTable
          [nzData]="filteredFriends()"
          [nzLoading]="loading"
          nzSize="middle"
          nzShowSizeChanger
          [nzPageSize]="10"
        >
          <thead>
            <tr>
              <th nzColumnKey="firstName" [nzSortFn]="sortByFirstName">
                <span nz-icon nzType="user"></span>
                Prenume
              </th>
              <th nzColumnKey="lastName" [nzSortFn]="sortByLastName">
                <span nz-icon nzType="team"></span>
                Nume
              </th>
              <th nzColumnKey="phone">
                <span nz-icon nzType="phone"></span>
                Telefon
              </th>
              <th nzColumnKey="city" [nzSortFn]="sortByCity">
                <span nz-icon nzType="environment"></span>
                Oraș
              </th>
              <th nzColumnKey="birthDate" [nzSortFn]="sortByBirthDate">
                <span nz-icon nzType="calendar"></span>
                Data Nașterii
              </th>
              <th nzWidth="120px">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let friend of basicTable.data">
              <td>{{ friend.firstName }}</td>
              <td>{{ friend.lastName }}</td>
              <td>{{ friend.phone }}</td>
              <td>{{ friend.city }}</td>
              <td>{{ formatDate(friend.birthDate) }}</td>
              <td>
                <nz-space>
                  <button
                    *nzSpaceItem
                    nz-button
                    nzType="primary"
                    nzSize="small"
                    (click)="openEditModal(friend)"
                    nz-tooltip="Editează"
                  >
                    <span nz-icon nzType="edit"></span>
                  </button>
                  <button
                    *nzSpaceItem
                    nz-button
                    nzType="primary"
                    nzDanger
                    nzSize="small"
                    nz-popconfirm
                    nzPopconfirmTitle="Ești sigur că vrei să ștergi acest prieten?"
                    (nzOnConfirm)="deleteFriend(friend.id)"
                    nz-tooltip="Șterge"
                  >
                    <span nz-icon nzType="delete"></span>
                  </button>
                </nz-space>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      background-color: #f0f2f5;
      min-height: 100vh;
    }

    .header-card {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left h1 {
      margin: 0;
      color: #1890ff;
      font-size: 28px;
    }

    .header-left p {
      margin: 4px 0 0 0;
      color: #666;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .birthday-alert {
      margin-bottom: 24px;
    }

    .controls-card {
      margin-bottom: 24px;
    }

    .controls-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .search-section {
      flex: 1;
      max-width: 400px;
    }

    .table-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .controls-content {
        flex-direction: column;
        align-items: stretch;
      }

      .search-section {
        max-width: none;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  // Signals
  private friendsSignal = signal<Friend[]>([]);
  private searchTermSignal = signal<string>('');
  
  // Computed signals
  filteredFriends = computed(() => {
    const friends = this.friendsSignal();
    const term = this.searchTermSignal().toLowerCase().trim();
    
    if (!term) return friends;
    
    return friends.filter(friend =>
      friend.firstName.toLowerCase().includes(term) ||
      friend.lastName.toLowerCase().includes(term) ||
      friend.city.toLowerCase().includes(term) ||
      friend.phone.includes(term)
    );
  });

  nextBirthday = computed(() => {
    return this.friendsService.getNextBirthday();
  });

  birthdayMessage = computed(() => {
    const next = this.nextBirthday();
    if (!next) return '';
    
    const { friend, daysUntil } = next;
    if (daysUntil === 0) {
      return `🎉 Astăzi este ziua de naștere a lui ${friend.firstName} ${friend.lastName}!`;
    } else if (daysUntil === 1) {
      return `🎂 Mâine este ziua de naștere a lui ${friend.firstName} ${friend.lastName}!`;
    } else {
      return `📅 În ${daysUntil} zile este ziua de naștere a lui ${friend.firstName} ${friend.lastName}`;
    }
  });

  // Component properties
  loading = false;
  searchTerm = '';
  currentUser: any = null;

  // Sort functions
  sortByFirstName = (a: Friend, b: Friend) => a.firstName.localeCompare(b.firstName);
  sortByLastName = (a: Friend, b: Friend) => a.lastName.localeCompare(b.lastName);
  sortByCity = (a: Friend, b: Friend) => a.city.localeCompare(b.city);
  sortByBirthDate = (a: Friend, b: Friend) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();

  constructor(
    private authService: AuthService,
    private friendsService: FriendsService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.loadFriends();
  }

  loadFriends(): void {
    this.loading = true;
    this.friendsService.getFriends().subscribe({
      next: (friends) => {
        this.friendsSignal.set(friends);
        this.loading = false;
      },
      error: () => {
        this.message.error('Eroare la încărcarea prietenilor!');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.searchTermSignal.set(this.searchTerm);
  }

  openAddModal(): void {
    this.message.info('Funcția de adăugare va fi implementată în pasul următor!');
  }

  openEditModal(friend: Friend): void {
    this.message.info('Funcția de editare va fi implementată în pasul următor!');
  }

  deleteFriend(id: number): void {
    this.friendsService.deleteFriend(id).subscribe({
      next: (success) => {
        if (success) {
          this.message.success('Prietenul a fost șters cu succes!');
          this.loadFriends();
        } else {
          this.message.error('Prietenul nu a fost găsit!');
        }
      },
      error: () => {
        this.message.error('Eroare la ștergerea prietenului!');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}