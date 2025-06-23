import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
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
    NzSpaceModule,
    NzModalModule,
    NzFormModule,
    NzDatePickerModule
  ],
  template: `
    <div class="dashboard-container">
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

      <nz-alert
        *ngIf="nextBirthday()"
        nzType="info"
        nzShowIcon
        [nzMessage]="birthdayMessage()"
        class="birthday-alert"
      ></nz-alert>

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
                    (nzOnConfirm)="deleteFriend(friend.id!)"
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

      <!-- Modal pentru adăugare prieten -->
      <nz-modal
        [(nzVisible)]="isAddModalVisible"
        nzTitle="Adaugă Prieten Nou"
        (nzOnCancel)="closeAddModal()"
        (nzOnOk)="saveNewFriend()"
        [nzOkLoading]="isAddSubmitting"
        nzOkText="Adaugă"
        nzCancelText="Anulează"
        nzWidth="500px"
      >
        <ng-container *nzModalContent>
          <form nz-form nzLayout="vertical" class="add-form">
            <nz-form-item>
              <nz-form-label nzRequired>Prenume</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="text"
                  [(ngModel)]="addForm.firstName"
                  name="addFirstName"
                  placeholder="Introduceți prenumele"
                  required
                />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label nzRequired>Nume</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="text"
                  [(ngModel)]="addForm.lastName"
                  name="addLastName"
                  placeholder="Introduceți numele"
                  required
                />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label nzRequired>Telefon</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="tel"
                  [(ngModel)]="addForm.phone"
                  name="addPhone"
                  placeholder="Introduceți numărul de telefon"
                  required
                />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label nzRequired>Oraș</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="text"
                  [(ngModel)]="addForm.city"
                  name="addCity"
                  placeholder="Introduceți orașul"
                  required
                />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label nzRequired>Data Nașterii</nz-form-label>
              <nz-form-control>
                <nz-date-picker
                  [(ngModel)]="addForm.birthDate"
                  name="addBirthDate"
                  nzFormat="dd/MM/yyyy"
                  nzPlaceHolder="Selectați data nașterii"
                  style="width: 100%"
                  required
                ></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Modal pentru editare prieten -->
      <nz-modal
        [(nzVisible)]="isEditModalVisible"
        nzTitle="Editează Prieten"
        (nzOnCancel)="closeEditModal()"
        (nzOnOk)="saveEditedFriend()"
        [nzOkLoading]="isEditSubmitting"
        nzOkText="Salvează"
        nzCancelText="Anulează"
        nzWidth="500px"
      >
        <ng-container *nzModalContent>
          <form nz-form nzLayout="vertical" class="edit-form">
            <nz-form-item>
              <nz-form-label nzRequired>Prenume</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="text"
                  [(ngModel)]="editForm.firstName"
                  name="firstName"
                  placeholder="Introduceți prenumele"
                  required
                />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label nzRequired>Nume</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="text"
                  [(ngModel)]="editForm.lastName"
                  name="lastName"
                  placeholder="Introduceți numele"
                  required
                />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label nzRequired>Telefon</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="tel"
                  [(ngModel)]="editForm.phone"
                  name="phone"
                  placeholder="Introduceți numărul de telefon"
                  required
                />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label nzRequired>Oraș</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="text"
                  [(ngModel)]="editForm.city"
                  name="city"
                  placeholder="Introduceți orașul"
                  required
                />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label nzRequired>Data Nașterii</nz-form-label>
              <nz-form-control>
                <nz-date-picker
                  [(ngModel)]="editForm.birthDate"
                  name="birthDate"
                  nzFormat="dd/MM/yyyy"
                  nzPlaceHolder="Selectați data nașterii"
                  style="width: 100%"
                  required
                ></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
    }
    .dashboard-container {
      padding: 24px;
      background-color: #f0f2f5;
      min-height: 100vh;
      width: 100vw;
      box-sizing: border-box;
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
    .edit-form, .add-form {
      padding: 20px 0;
    }
    .edit-form nz-form-item, .add-form nz-form-item {
      margin-bottom: 16px;
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
  // SCHIMBAT: Eliminăm signalul local și folosim doar cel din service
  private searchTermSignal = signal<string>('');
  
  // SCHIMBAT: Folosim signalul din service în loc de cel local
  filteredFriends = computed(() => {
    const friends = this.friendsService.friends(); // Folosim signalul din service
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

  loading = false;
  searchTerm = '';
  currentUser: any = null;
  
  // Variabile pentru modal adăugare
  isAddModalVisible = false;
  isAddSubmitting = false;
  addForm = {
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    birthDate: null as Date | null
  };
  
  // Variabile pentru modal editare
  isEditModalVisible = false;
  isEditSubmitting = false;
  editingFriendId: string | null = null;
  editForm = {
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    birthDate: null as Date | null
  };

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
    // SCHIMBAT: Nu mai avem nevoie de loadFriends() separat
    // Service-ul deja încarcă datele în constructor
  }

  // SCHIMBAT: Eliminăm loadFriends() pentru că folosim signalul din service
  
  onSearch(): void {
    this.searchTermSignal.set(this.searchTerm);
  }

  // Funcții pentru modal adăugare
  openAddModal(): void {
    this.resetAddForm();
    this.isAddModalVisible = true;
  }

  closeAddModal(): void {
    this.isAddModalVisible = false;
    this.resetAddForm();
  }

  resetAddForm(): void {
    this.addForm = {
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      birthDate: null
    };
  }

  saveNewFriend(): void {
    if (!this.addForm.firstName || !this.addForm.lastName || 
        !this.addForm.phone || !this.addForm.city || !this.addForm.birthDate) {
      this.message.error('Toate câmpurile sunt obligatorii!');
      return;
    }

    this.isAddSubmitting = true;

    const newFriend: Omit<Friend, 'id'> = {
      firstName: this.addForm.firstName.trim(),
      lastName: this.addForm.lastName.trim(),
      phone: this.addForm.phone.trim(),
      city: this.addForm.city.trim(),
      birthDate: this.formatDateForAPI(this.addForm.birthDate!)
    };

    this.friendsService.addFriend(newFriend).subscribe({
      next: (addedFriend) => {
        this.isAddSubmitting = false;
        if (addedFriend) {
          this.message.success('Prietenul a fost adăugat cu succes!');
          this.closeAddModal();
          // SCHIMBAT: Nu mai avem nevoie de loadFriends() - signalul se actualizează automat
        } else {
          this.message.error('Eroare la adăugarea prietenului!');
        }
      },
      error: () => {
        this.isAddSubmitting = false;
        this.message.error('Eroare la adăugarea prietenului!');
      }
    });
  }

  // Funcții pentru modal editare
  openEditModal(friend: Friend): void {
    this.editingFriendId = friend.id!;
    this.editForm = {
      firstName: friend.firstName,
      lastName: friend.lastName,
      phone: friend.phone,
      city: friend.city,
      birthDate: new Date(friend.birthDate + 'T00:00:00')
    };
    this.isEditModalVisible = true;
  }

  closeEditModal(): void {
    this.isEditModalVisible = false;
    this.editingFriendId = null;
    this.resetEditForm();
  }

  resetEditForm(): void {
    this.editForm = {
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      birthDate: null
    };
  }

  saveEditedFriend(): void {
    if (!this.editingFriendId) return;

    if (!this.editForm.firstName || !this.editForm.lastName || 
        !this.editForm.phone || !this.editForm.city || !this.editForm.birthDate) {
      this.message.error('Toate câmpurile sunt obligatorii!');
      return;
    }

    this.isEditSubmitting = true;

    const updatedFriend: Omit<Friend, 'id'> = {
      firstName: this.editForm.firstName.trim(),
      lastName: this.editForm.lastName.trim(),
      phone: this.editForm.phone.trim(),
      city: this.editForm.city.trim(),
      birthDate: this.formatDateForAPI(this.editForm.birthDate!)
    };

    this.friendsService.updateFriend(this.editingFriendId, updatedFriend).subscribe({
      next: (updatedFriendResult) => {
        this.isEditSubmitting = false;
        if (updatedFriendResult) {
          this.message.success('Prietenul a fost actualizat cu succes!');
          this.closeEditModal();
          // SCHIMBAT: Nu mai avem nevoie de loadFriends() - signalul se actualizează automat
        } else {
          this.message.error('Eroare la actualizarea prietenului!');
        }
      },
      error: () => {
        this.isEditSubmitting = false;
        this.message.error('Eroare la actualizarea prietenului!');
      }
    });
  }

  deleteFriend(id: string): void {
    this.friendsService.deleteFriend(id).subscribe({
      next: (success) => {
        if (success) {
          this.message.success('Prietenul a fost șters cu succes!');
          // SCHIMBAT: Nu mai avem nevoie de loadFriends() - signalul se actualizează automat
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
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}