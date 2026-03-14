import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './admindashboard.html',
  styleUrls: ['./admindashboard.css']
})
export class AdminDashboardComponent {

  sidebarCollapsed = false;
  activeTab = 'overview';
  searchQuery = '';
  bookingFilter = 'all';

  get pageTitle(): string {
    const titles: Record<string, string> = {
      overview: 'Dashboard Overview',
      bookings: 'Bookings',
      clients:  'Clients',
      artists:  'Artists',
      services: 'Services',
      reports:  'Reports',
      settings: 'Settings',
    };
    return titles[this.activeTab] || 'Dashboard';
  }

  get pageSubtitle(): string {
    const subs: Record<string, string> = {
      overview: "Welcome back, Admin! Here's what's happening today.",
      bookings: 'Manage and track all bookings.',
      clients:  'View and manage your client base.',
      artists:  'Manage your makeup artists.',
      services: 'Configure your service offerings.',
      reports:  'Analytics and revenue overview.',
      settings: 'Configure your system preferences.',
    };
    return subs[this.activeTab] || '';
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // ── Stat Cards ──
  stats = [
    { icon: '📋', label: 'Total Bookings',  value: '1,284',    change: '12% this month',   positive: true  },
    { icon: '👤', label: 'Total Clients',   value: '546',      change: '8% this month',    positive: true  },
    { icon: '🎨', label: 'Active Artists',  value: '24',       change: '2 new this week',  positive: true  },
    { icon: '💰', label: 'Monthly Revenue', value: '₱128,400', change: '5% vs last month', positive: false },
  ];

  recentBookings = [
    { client: 'Maria Santos',   service: 'Bridal Makeup',   artist: 'Ana Reyes',  date: 'Mar 14, 2026', status: 'confirmed' },
    { client: 'Joy Dela Cruz',  service: 'Evening Glam',    artist: 'Luz Torres', date: 'Mar 14, 2026', status: 'pending'   },
    { client: 'Karen Bautista', service: 'Natural Look',    artist: 'Mia Gomez',  date: 'Mar 15, 2026', status: 'confirmed' },
    { client: 'Rose Fernandez', service: 'Party Makeup',    artist: 'Ana Reyes',  date: 'Mar 15, 2026', status: 'pending'   },
    { client: 'Lisa Aquino',    service: 'Airbrush Makeup', artist: 'Jen Castro', date: 'Mar 16, 2026', status: 'cancelled' },
  ];

  allBookings = [
    { client: 'Maria Santos',    service: 'Bridal Makeup',   artist: 'Ana Reyes',  date: 'Mar 14 10:00AM', amount: '3,500', status: 'confirmed' },
    { client: 'Joy Dela Cruz',   service: 'Evening Glam',    artist: 'Luz Torres', date: 'Mar 14 01:00PM', amount: '1,800', status: 'pending'   },
    { client: 'Karen Bautista',  service: 'Natural Look',    artist: 'Mia Gomez',  date: 'Mar 15 09:00AM', amount: '1,200', status: 'confirmed' },
    { client: 'Rose Fernandez',  service: 'Party Makeup',    artist: 'Ana Reyes',  date: 'Mar 15 02:00PM', amount: '1,500', status: 'pending'   },
    { client: 'Lisa Aquino',     service: 'Airbrush Makeup', artist: 'Jen Castro', date: 'Mar 16 11:00AM', amount: '2,200', status: 'cancelled' },
    { client: 'Nina Villanueva', service: 'Bridal Makeup',   artist: 'Luz Torres', date: 'Mar 17 08:00AM', amount: '3,500', status: 'confirmed' },
    { client: 'Carla Mendoza',   service: 'SFX Makeup',      artist: 'Mia Gomez',  date: 'Mar 18 03:00PM', amount: '2,800', status: 'confirmed' },
  ];

  clients = [
    { name: 'Maria Santos',    email: 'maria@email.com',  phone: '09171234567', bookings: 8,  joined: 'Jan 2025' },
    { name: 'Joy Dela Cruz',   email: 'joy@email.com',    phone: '09281234567', bookings: 5,  joined: 'Feb 2025' },
    { name: 'Karen Bautista',  email: 'karen@email.com',  phone: '09391234567', bookings: 12, joined: 'Mar 2025' },
    { name: 'Rose Fernandez',  email: 'rose@email.com',   phone: '09451234567', bookings: 3,  joined: 'Apr 2025' },
    { name: 'Lisa Aquino',     email: 'lisa@email.com',   phone: '09561234567', bookings: 7,  joined: 'May 2025' },
    { name: 'Nina Villanueva', email: 'nina@email.com',   phone: '09671234567', bookings: 15, joined: 'Jun 2025' },
  ];

  topArtists = [
    { initials: 'AR', name: 'Ana Reyes',  specialty: 'Bridal & Glam', bookings: 142, rating: 4.9 },
    { initials: 'LT', name: 'Luz Torres', specialty: 'Editorial',      bookings: 118, rating: 4.8 },
    { initials: 'MG', name: 'Mia Gomez',  specialty: 'Natural & SFX',  bookings: 97,  rating: 4.7 },
    { initials: 'JC', name: 'Jen Castro', specialty: 'Airbrush',       bookings: 85,  rating: 4.6 },
  ];

  artistsList = [
    { name: 'Ana Reyes',  specialty: 'Bridal & Glam', email: 'ana@glowbook.com',  bookings: 142, rating: 4.9 },
    { name: 'Luz Torres', specialty: 'Editorial',      email: 'luz@glowbook.com',  bookings: 118, rating: 4.8 },
    { name: 'Mia Gomez',  specialty: 'Natural & SFX',  email: 'mia@glowbook.com',  bookings: 97,  rating: 4.7 },
    { name: 'Jen Castro', specialty: 'Airbrush',       email: 'jen@glowbook.com',  bookings: 85,  rating: 4.6 },
    { name: 'Rosa Lim',   specialty: 'Korean Makeup',  email: 'rosa@glowbook.com', bookings: 74,  rating: 4.5 },
    { name: 'Dana Cruz',  specialty: 'Avant-Garde',    email: 'dana@glowbook.com', bookings: 61,  rating: 4.4 },
  ];

  services = [
    { icon: '👰', name: 'Bridal Makeup', desc: 'Full glam for weddings & ceremonies', price: '3,500' },
    { icon: '✨', name: 'Evening Glam',  desc: 'Bold & glamorous for night events',   price: '1,800' },
    { icon: '🌿', name: 'Natural Look',  desc: 'Soft, everyday natural finish',       price: '1,200' },
    { icon: '🎭', name: 'SFX Makeup',    desc: 'Special effects & theatrical looks',  price: '2,800' },
    { icon: '💨', name: 'Airbrush',      desc: 'Flawless airbrush application',       price: '2,200' },
    { icon: '🎉', name: 'Party Makeup',  desc: 'Fun & festive looks for any party',   price: '1,500' },
  ];

  monthlyData = [
    { month: 'Jan', revenue: 18500 }, { month: 'Feb', revenue: 22000 },
    { month: 'Mar', revenue: 19800 }, { month: 'Apr', revenue: 25600 },
    { month: 'May', revenue: 21000 }, { month: 'Jun', revenue: 28400 },
    { month: 'Jul', revenue: 24000 }, { month: 'Aug', revenue: 27500 },
    { month: 'Sep', revenue: 23000 }, { month: 'Oct', revenue: 26800 },
    { month: 'Nov', revenue: 29500 }, { month: 'Dec', revenue: 30000 },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}