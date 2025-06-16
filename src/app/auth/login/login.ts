import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzCardModule
  ],
  template: `
    <div class="login-container">
      <nz-card nzTitle="Login" class="login-card">
        <form nz-form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
            <nz-form-control [nzSpan]="24">
              <label nz-checkbox formControlName="rememberMe">
                Remember me
              </label>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzSpan]="24">
              <button 
                nz-button 
                nzType="primary" 
                nzBlock 
                [nzLoading]="loading"
                [disabled]="!loginForm.valid"
              >
                Login
              </button>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzSpan]="24" class="text-center">
              <p>
                Nu ai cont? 
                <a routerLink="/register">Înregistrează-te aici</a>
              </p>
            </nz-form-control>
          </nz-form-item>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
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
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator]],
      rememberMe: [false]
    });
  }

  // Validator custom pentru puterea parolei
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

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password, rememberMe } = this.loginForm.value;

      this.authService.login({ email, password }, rememberMe).subscribe({
        next: (result: any) => {
          this.loading = false;
          if (result.success) {
            this.message.success('Login realizat cu succes!');
            this.router.navigate(['/dashboard']);
          } else {
            this.message.error(result.error?.error || 'Eroare la login!');
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