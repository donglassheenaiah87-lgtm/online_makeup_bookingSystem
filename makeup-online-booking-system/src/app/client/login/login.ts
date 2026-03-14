import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class ClientLoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  showPassword = false;
  rememberMe = false;

  constructor(private router: Router) {}

  goTo(role: string) {
    const map: Record<string, string> = {
      client: '/client/login',
      artist: '/artist/login',
      admin: '/admin/login',
    };
    this.router.navigate([map[role]]);
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (this.email === 'client@glowbook.com' && this.password === 'client123') {
      this.router.navigate(['/client/dashboard']);
    } else {
      this.errorMessage = 'Invalid email or password.';
    }
  }
}