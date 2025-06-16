import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

// NgZorro imports
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Friend } from '../../services/friends';

@Component({
  selector: 'app-friend-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzDatePickerModule
  ],
  template: `
    <nz-modal
      [nzVisible]="visible"
      [nzTitle]="isEdit ? 'Editează Prieten' : 'Adaugă Prieten Nou'"
      [nzOkText]="isEdit ? 'Actualizează' : 'Adaugă'"
      nzCancelText="Anulează"
      [nzOkLoading]="loading"
      [nzOkDisabled]="!friendForm.valid"
      (nzOnCancel)="onCancel()"
      (nzOnOk)="onSave()"
      nzWidth="600px"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="friendForm" nzLayout="vertical">
          <div class="form-row">
            <nz-form-item class="form-item-half">
              <nz-form-label nzRequired>Prenume</nz-form-label>
              <nz-form-control nzErrorTip="Vă rugăm să introduceți prenumele (minim 2 caractere)!">
                <input 
                  nz-input 
                  formControlName="firstName" 
                  placeholder="Prenumele prietenului"
                />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item class="form-item-half">
              <nz-form-label nzRequired>Nume</nz-form-label>
              <nz-form-control nzErrorTip="Vă rugăm să introduceți numele (minim 2 caractere)!">
                <input 
                  nz-input 
                  formControlName="lastName" 
                  placeholder="Numele de familie"
                />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div class="form-row">
            <nz-form-item class="form-item-half">
              <nz-form-label nzRequired>Telefon</nz-form-label>
              <nz-form-control [nzErrorTip]="phoneErrorTip">
                <input 
                  nz-input 
                  formControlName="phone" 
                  placeholder="ex: 0721234567"
                />
                <ng-template #phoneErrorTip let-control>
                  <ng-container *ngIf="control.hasError('required')">
                    Vă rugăm să introduceți numărul de telefon!
                  </ng-container>
                  <ng-container *ngIf="control.hasError('phoneFormat')">
                    Formatul telefonului nu este valid! (ex: 0721234567)
                  </ng-container>
                </ng-template>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item class="form-item-half">
              <nz-form-label nzRequired>Oraș</nz-form-label>
              <nz-form-control nzErrorTip="Vă rugăm să introduceți orașul!">
                <input 
                  nz-input 
                  formControlName="city" 
                  placeholder="Orașul de reședință"
                />
              </nz-form-control>
            </nz-form-item>
          </div>

          <nz-form-item>
            <nz-form-label>Email (opțional)</nz-form-label>
            <nz-form-control nzErrorTip="Vă rugăm să introduceți un email valid!">
              <input 
                nz-input 
                formControlName="email" 
                placeholder="exemplu@email.com"
              />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Data Nașterii</nz-form-label>
            <nz-form-control nzErrorTip="Vă rugăm să selectați data nașterii!">
              <nz-date-picker
                formControlName="birthDate"
                nzPlaceHolder="Selectează data nașterii"
                nzFormat="dd/MM/yyyy"
                [nzDisabledDate]="disabledDate"
                style="width: 100%"
              ></nz-date-picker>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-item-half {
      flex: 1;
    }

    nz-form-item {
      margin-bottom: 16px;
    }

    nz-form-label {
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class FriendModalComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() friend: Friend | null = null;
  @Input() isEdit = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<Friend, 'id'>>();

  friendForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['friend'] && this.friend) {
      this.populateForm();
    } else if (changes['visible'] && this.visible && !this.friend) {
      this.resetForm();
    }
  }

  private initForm(): void {
    this.friendForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, this.phoneValidator]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      birthDate: [null, [Validators.required]]
    });
  }

  // Validator custom pentru numărul de telefon
  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Format românesc: 07xxxxxxxx sau +407xxxxxxxx
    const phoneRegex = /^(\+?40|0)[7][0-9]{8}$/;
    
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return { phoneFormat: true };
    }

    return null;
  }

  // Funcție pentru a dezactiva datele viitoare
  disabledDate = (current: Date): boolean => {
    return current && current.getTime() > Date.now();
  };

  private populateForm(): void {
    if (this.friend) {
      this.friendForm.patchValue({
        firstName: this.friend.firstName,
        lastName: this.friend.lastName,
        phone: this.friend.phone,
        city: this.friend.city,
        email: this.friend.email || '',
        birthDate: new Date(this.friend.birthDate)
      });
    }
  }

  private resetForm(): void {
    this.friendForm.reset();
    Object.keys(this.friendForm.controls).forEach(key => {
      this.friendForm.get(key)?.setErrors(null);
    });
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  onSave(): void {
    if (this.friendForm.valid) {
      this.loading = true;
      
      const formValue = this.friendForm.value;
      const friendData: Omit<Friend, 'id'> = {
        firstName: formValue.firstName.trim(),
        lastName: formValue.lastName.trim(),
        phone: formValue.phone.trim(),
        city: formValue.city.trim(),
        email: formValue.email?.trim() || '',
        birthDate: this.formatDateForSave(formValue.birthDate)
      };

      // Simulăm un mic delay pentru UX
      setTimeout(() => {
        this.loading = false;
        this.save.emit(friendData);
        this.resetForm();
      }, 500);
    } else {
      // Marchează toate câmpurile ca touched pentru a afișa erorile
      Object.keys(this.friendForm.controls).forEach(key => {
        this.friendForm.get(key)?.markAsTouched();
      });
      this.message.warning('Vă rugăm să completați toate câmpurile obligatorii!');
    }
  }

  private formatDateForSave(date: Date): string {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}