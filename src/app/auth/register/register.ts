import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule
  ],
  template: `
    <div class="register-container">
      <nz-card nzTitle="Înregistrare" class="register-card">
        <form nz-form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Email</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Vă rugăm să introduceți un email valid!">
              <input 
                nz-input 
                formControlName="email" 
                placeholder="exemplu@email.com"
              />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Nume</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Vă rugăm să introduceți numele!">
              <input 
                nz-input 
                formControlName="lastName" 
                placeholder="Numele de familie"
              />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Prenume</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Vă rugăm să introduceți prenumele!">
              <input 
                nz-input 
                formControlName="firstName" 
                placeholder="Prenumele"
              />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Parolă</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="passwordErrorTip">
              <input 
                nz-input 
                formControlName="password" 
                type="password" 
                placeholder="Parola"
              />
              <ng-template #passwordErrorTip let-control>
                <ng-container *ngIf="control.hasError('required')">
                  Vă rugăm să introduceți parola!
                </ng-container>
                <ng-container *ngIf="control.hasError('passwordStrength')">
                  {{ control.getError('passwordStrength').message }}
                </ng-container>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Confirmă Parola</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="confirmPasswordErrorTip">
              <input 
                nz-input 
                formControlName="confirmPassword" 
                type="password" 
                placeholder="Confirmă parola"
              />
              <ng-template #confirmPasswordErrorTip let-control>
                <ng-container *ngIf="control.hasError('required')">
                  Vă rugăm să confirmați parola!
                </ng-container>
                <ng-container *ngIf="control.hasError('passwordMismatch')">
                  Parolele nu se potrivesc!
                </ng-container>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzSpan]="24">
              <button 
                nz-button 
                nzType="primary" 
                nzBlock 
                [nzLoading]="loading"
                [disabled]="!registerForm.valid"
              >
                Înregistrare
              </button>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzSpan]="24" class="text-center">
              <p>
                Ai deja cont? 
                <a routerLink="/login">Autentifică-te aici</a>
              </p>
            </nz-form-control>
          </nz-form-item>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
    box-sizing: border-box;
  }

  .register-card {
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .text-center {
    text-align: center;
  }

  .text-center a {
    color: #1890ff;
    text-decoration: none;
  }

  .text-center a:hover {
    text-decoration: underline;
  }
`]

})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    });

    this.registerForm.get('confirmPassword')?.setValidators([
      Validators.required,
      this.passwordMatchValidator.bind(this)
    ]);
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const minLength = value.length >= 6;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && minLength;

    if (!passwordValid) {
      let message = 'Parola trebuie să conțină cel puțin: ';
      const missing = [];
      
      if (!minLength) missing.push('6 caractere');
      if (!hasUpperCase) missing.push('o literă mare');
      if (!hasLowerCase) missing.push('o literă mică');
      if (!hasNumeric) missing.push('o cifră');
      if (!hasSpecialChar) missing.push('un caracter special');
      
      message += missing.join(', ');
      
      return { passwordStrength: { message } };
    }

    return null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = this.registerForm?.get('password')?.value;
    const confirmPassword = control.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const { email, password, firstName, lastName } = this.registerForm.value;

      this.authService.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName
      }).subscribe({
        next: (result: any) => {
          this.loading = false;
          if (result.success) {
            this.message.success('Cont creat cu succes! Vă rugăm să vă autentificați.');
            this.router.navigate(['/login']);
          } else {
            this.message.error(result.error?.error || 'Eroare la crearea contului!');
          }
        },
        error: () => {
          this.loading = false;
          this.message.error('Eroare la conectarea la server!');
        }
      });
    }
  }
}