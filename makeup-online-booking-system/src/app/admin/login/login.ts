import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class AdminLoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  showPassword = false;
  rememberMe = false;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goTo(role: string) {
    const map: Record<string, string> = {
      client: '/client/login',
      artist: '/artist/login',
      admin:  '/admin/login',
    };
    this.router.navigate([map[role]]);
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/admin/dashboard']);
    } catch (error: any) {
      this.isLoading = false;
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'No account found with this email.'; break;
        case 'auth/wrong-password':
          this.errorMessage = 'Incorrect password.'; break;
        case 'auth/invalid-email':
          this.errorMessage = 'Invalid email address.'; break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Too many attempts. Try again later.'; break;
        default:
          this.errorMessage = 'Login failed. Please try again.';
      }
    }
  }
}