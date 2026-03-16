import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface Booking {
  id: number;
  client: string;
  service: string;
  artist: string;
  date: string;
  amount: string;
  status: string;
  phone?: string;
  notes?: string;
  bookingDate?: string;
  bookingTime?: string;
}

interface Addon {
  name: string;
  desc: string;
  price: string;
  selected: boolean;
}

interface Client {
  name: string;
  email: string;
  phone: string;
  bookings: number;
  joined: string;
  status: string;
  totalSpent: string;
  lastVisit?: string;
  favoriteService?: string;
}

interface Artist {
  name: string;
  initials: string;
  specialty: string;
  email: string;
  bookings: number;
  rating: number;
  status: string;
  revenue: string;
  availability: string;
  phone?: string;
  joinedDate?: string;
  completionRate?: number;
}

interface Service {
  icon: string;
  name: string;
  desc: string;
  price: string;
  duration: string;
  bookings: number;
  status: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface CalendarDay {
  day: number;
  bookings: Booking[];
  isToday: boolean;
  isEmpty: boolean;
}

interface Review {
  id: number;
  client: string;
  artist: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  status: 'published' | 'pending' | 'flagged';
  reply?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './admindashboard.html',
  styleUrls: ['./admindashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  sidebarCollapsed = false;
  activeTab = 'overview';
  searchQuery = '';
  bookingFilter = 'all';
  bookingView = 'table'; // 'table' | 'calendar'
  showNotifPanel = false;
  showModal = false;
  modalType = '';
  showConfirmDialog = false;
  confirmAction = '';
  confirmTarget: Record<string, unknown> | null = null;
  toastMessage = '';
  toastType = 'success';
  toastVisible = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  currentTime = '';
  currentDate = '';
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  // Detail view
  selectedBooking: Booking | null = null;
  selectedClient: Client | null = null;
  selectedArtist: Artist | null = null;

  // Calendar
  calendarMonth = 'March 2026';
  calendarDays: CalendarDay[] = [];
  selectedCalDay: CalendarDay | null = null;

  // Export
  exportFormat = 'csv';

  // ── Form Models ──
  newBooking: Partial<Booking> = {};
  newClient: Partial<Client> = {};
  newArtist: Partial<Artist> = {};
  newService: Partial<Service> = {};

  get pageTitle(): string {
    const titles: Record<string, string> = {
      overview: 'Dashboard Overview', bookings: 'Bookings',
      clients: 'Clients', artists: 'Artists', services: 'Services',
      reports: 'Reports', notifications: 'Notifications',
      reviews: 'Client Reviews', settings: 'Settings',
    };
    return titles[this.activeTab] || 'Dashboard';
  }

  get pageSubtitle(): string {
    const subs: Record<string, string> = {
      overview: "Welcome back, Admin! Here's what's happening today.",
      bookings: 'Manage and track all bookings.',
      clients: 'View and manage your client base.',
      artists: 'Manage your makeup artists.',
      services: 'Configure your service offerings.',
      reports: 'Analytics and revenue overview.',
      notifications: 'Stay on top of all alerts and updates.',
      reviews: 'Manage client feedback and artist ratings.',
      settings: 'Configure your system preferences.',
    };
    return subs[this.activeTab] || '';
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.showNotifPanel = false;
  }

  // ── Stats ──
  stats = [
    { icon: '📋', label: 'Total Bookings',  value: '1,284',    change: '12% this month',   positive: true  },
    { icon: '👤', label: 'Total Clients',   value: '546',      change: '8% this month',    positive: true  },
    { icon: '🎨', label: 'Active Artists',  value: '24',       change: '2 new this week',  positive: true  },
    { icon: '💰', label: 'Monthly Revenue', value: '₱128,400', change: '5% vs last month', positive: false },
  ];

  // ── Notifications ──
  notifications: Notification[] = [
    { id: 1, type: 'booking', message: 'New booking from Maria Santos – Bridal Makeup',    time: '2 min ago',  read: false },
    { id: 2, type: 'payment', message: 'Payment received ₱3,500 from Nina Villanueva',      time: '15 min ago', read: false },
    { id: 3, type: 'artist',  message: 'Artist Dana Cruz submitted a new portfolio update', time: '1 hr ago',   read: false },
    { id: 4, type: 'cancel',  message: 'Booking #1042 cancelled by Lisa Aquino',            time: '2 hrs ago',  read: true  },
    { id: 5, type: 'review',  message: 'New 5-star review for Ana Reyes',                   time: '3 hrs ago',  read: true  },
    { id: 6, type: 'system',  message: 'Monthly report for February is ready to download',  time: '1 day ago',  read: true  },
  ];

  get unreadCount(): number { return this.notifications.filter(n => !n.read).length; }
  markAllRead(): void { this.notifications.forEach(n => n.read = true); this.showToast('All notifications marked as read', 'success'); }
  markRead(n: Notification): void { n.read = true; }

  // ── Recent Bookings (overview) ──
  recentBookings = [
    { client: 'Maria Santos',   service: 'Bridal Makeup',   artist: 'Ana Reyes',  date: 'Mar 14, 2026', status: 'confirmed' },
    { client: 'Joy Dela Cruz',  service: 'Evening Glam',    artist: 'Luz Torres', date: 'Mar 14, 2026', status: 'pending'   },
    { client: 'Karen Bautista', service: 'Natural Look',    artist: 'Mia Gomez',  date: 'Mar 15, 2026', status: 'confirmed' },
    { client: 'Rose Fernandez', service: 'Party Makeup',    artist: 'Ana Reyes',  date: 'Mar 15, 2026', status: 'pending'   },
    { client: 'Lisa Aquino',    service: 'Airbrush Makeup', artist: 'Jen Castro', date: 'Mar 16, 2026', status: 'cancelled' },
  ];

  // ── All Bookings ──
  allBookings: Booking[] = [
    { id: 1001, client: 'Maria Santos',    service: 'Bridal Makeup',   artist: 'Ana Reyes',  date: 'Mar 14 10:00AM', amount: '3,500', status: 'confirmed', phone: '09171234567', notes: 'Requested dewy finish' },
    { id: 1002, client: 'Joy Dela Cruz',   service: 'Evening Glam',    artist: 'Luz Torres', date: 'Mar 14 01:00PM', amount: '1,800', status: 'pending',   phone: '09281234567', notes: '' },
    { id: 1003, client: 'Karen Bautista',  service: 'Natural Look',    artist: 'Mia Gomez',  date: 'Mar 15 09:00AM', amount: '1,200', status: 'confirmed', phone: '09391234567', notes: 'Sensitive skin' },
    { id: 1004, client: 'Rose Fernandez',  service: 'Party Makeup',    artist: 'Ana Reyes',  date: 'Mar 15 02:00PM', amount: '1,500', status: 'pending',   phone: '09451234567', notes: '' },
    { id: 1005, client: 'Lisa Aquino',     service: 'Airbrush Makeup', artist: 'Jen Castro', date: 'Mar 16 11:00AM', amount: '2,200', status: 'cancelled', phone: '09561234567', notes: 'Client request cancel' },
    { id: 1006, client: 'Nina Villanueva', service: 'Bridal Makeup',   artist: 'Luz Torres', date: 'Mar 17 08:00AM', amount: '3,500', status: 'confirmed', phone: '09671234567', notes: 'VIP client' },
    { id: 1007, client: 'Carla Mendoza',   service: 'SFX Makeup',      artist: 'Mia Gomez',  date: 'Mar 18 03:00PM', amount: '2,800', status: 'confirmed', phone: '09781234567', notes: 'Cosplay event' },
    { id: 1008, client: 'Bea Gonzales',    service: 'Natural Look',    artist: 'Rosa Lim',   date: 'Mar 20 10:00AM', amount: '1,200', status: 'confirmed', phone: '09891234567', notes: '' },
    { id: 1009, client: 'Trisha Ocampo',   service: 'Evening Glam',    artist: 'Ana Reyes',  date: 'Mar 21 05:00PM', amount: '1,800', status: 'pending',   phone: '09121234567', notes: 'Awards night' },
    { id: 1010, client: 'Gia Santos',      service: 'Airbrush Makeup', artist: 'Dana Cruz',  date: 'Mar 22 09:00AM', amount: '2,200', status: 'confirmed', phone: '09131234567', notes: '' },
  ];

  countByStatus(status: string): number {
    return this.allBookings.filter(b => b.status === status).length;
  }

  get filteredBookings(): Booking[] {
    let list = this.allBookings;
    if (this.bookingFilter !== 'all') list = list.filter(b => b.status === this.bookingFilter);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(b =>
        b.client.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q) ||
        b.artist.toLowerCase().includes(q) ||
        String(b.id).includes(q)
      );
    }
    return list;
  }

  updateBookingStatus(booking: Booking, status: string): void {
    booking.status = status;
    this.showToast(`Booking #${booking.id} marked as ${status}`, 'success');
  }

  deleteBooking(booking: Booking): void {
    this.confirmTarget = booking as unknown as Record<string, unknown>;
    this.confirmAction = 'deleteBooking';
    this.showConfirmDialog = true;
  }

  viewBookingDetail(booking: Booking): void {
    this.selectedBooking = booking;
    this.modalType = 'viewBooking';
    this.showModal = true;
  }

  // ── Clients ──
  clients: Client[] = [
    { name: 'Maria Santos',    email: 'maria@email.com',  phone: '09171234567', bookings: 8,  joined: 'Jan 2025', status: 'active',   totalSpent: '28,000', lastVisit: 'Mar 14, 2026', favoriteService: 'Bridal Makeup'  },
    { name: 'Joy Dela Cruz',   email: 'joy@email.com',    phone: '09281234567', bookings: 5,  joined: 'Feb 2025', status: 'active',   totalSpent: '9,000',  lastVisit: 'Mar 14, 2026', favoriteService: 'Evening Glam'   },
    { name: 'Karen Bautista',  email: 'karen@email.com',  phone: '09391234567', bookings: 12, joined: 'Mar 2025', status: 'active',   totalSpent: '14,400', lastVisit: 'Mar 15, 2026', favoriteService: 'Natural Look'   },
    { name: 'Rose Fernandez',  email: 'rose@email.com',   phone: '09451234567', bookings: 3,  joined: 'Apr 2025', status: 'inactive', totalSpent: '4,500',  lastVisit: 'Jan 10, 2026', favoriteService: 'Party Makeup'   },
    { name: 'Lisa Aquino',     email: 'lisa@email.com',   phone: '09561234567', bookings: 7,  joined: 'May 2025', status: 'active',   totalSpent: '15,400', lastVisit: 'Mar 16, 2026', favoriteService: 'Airbrush Makeup'},
    { name: 'Nina Villanueva', email: 'nina@email.com',   phone: '09671234567', bookings: 15, joined: 'Jun 2025', status: 'vip',      totalSpent: '52,500', lastVisit: 'Mar 17, 2026', favoriteService: 'Bridal Makeup'  },
  ];

  get filteredClients(): Client[] {
    if (!this.searchQuery.trim()) return this.clients;
    const q = this.searchQuery.toLowerCase();
    return this.clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }

  deleteClient(client: Client): void {
    this.confirmTarget = client as unknown as Record<string, unknown>;
    this.confirmAction = 'deleteClient';
    this.showConfirmDialog = true;
  }

  viewClientDetail(client: Client): void {
    this.selectedClient = client;
    this.modalType = 'viewClient';
    this.showModal = true;
  }

  getClientBookings(clientName: string): Booking[] {
    return this.allBookings.filter(b => b.client === clientName);
  }

  // ── Top Artists ──
  topArtists = [
    { initials: 'AR', name: 'Ana Reyes',  specialty: 'Bridal & Glam', bookings: 142, rating: 4.9 },
    { initials: 'LT', name: 'Luz Torres', specialty: 'Editorial',      bookings: 118, rating: 4.8 },
    { initials: 'MG', name: 'Mia Gomez',  specialty: 'Natural & SFX',  bookings: 97,  rating: 4.7 },
    { initials: 'JC', name: 'Jen Castro', specialty: 'Airbrush',       bookings: 85,  rating: 4.6 },
  ];

  // ── Artists List ──
  artistsList: Artist[] = [
    { name: 'Ana Reyes',  initials: 'AR', specialty: 'Bridal & Glam', email: 'ana@glowbook.com',  bookings: 142, rating: 4.9, status: 'active',   revenue: '497,000', availability: 'Available', phone: '09171110001', joinedDate: 'Jan 2024', completionRate: 98 },
    { name: 'Luz Torres', initials: 'LT', specialty: 'Editorial',      email: 'luz@glowbook.com',  bookings: 118, rating: 4.8, status: 'active',   revenue: '212,400', availability: 'Busy',      phone: '09171110002', joinedDate: 'Mar 2024', completionRate: 95 },
    { name: 'Mia Gomez',  initials: 'MG', specialty: 'Natural & SFX',  email: 'mia@glowbook.com',  bookings: 97,  rating: 4.7, status: 'active',   revenue: '271,600', availability: 'Available', phone: '09171110003', joinedDate: 'Jun 2024', completionRate: 97 },
    { name: 'Jen Castro', initials: 'JC', specialty: 'Airbrush',       email: 'jen@glowbook.com',  bookings: 85,  rating: 4.6, status: 'active',   revenue: '187,000', availability: 'On Leave',  phone: '09171110004', joinedDate: 'Aug 2024', completionRate: 92 },
    { name: 'Rosa Lim',   initials: 'RL', specialty: 'Korean Makeup',  email: 'rosa@glowbook.com', bookings: 74,  rating: 4.5, status: 'active',   revenue: '133,200', availability: 'Available', phone: '09171110005', joinedDate: 'Sep 2024', completionRate: 94 },
    { name: 'Dana Cruz',  initials: 'DC', specialty: 'Avant-Garde',    email: 'dana@glowbook.com', bookings: 61,  rating: 4.4, status: 'inactive', revenue: '170,800', availability: 'Unavailable',phone: '09171110006',joinedDate: 'Oct 2024', completionRate: 88 },
  ];

  get filteredArtists(): Artist[] {
    if (!this.searchQuery.trim()) return this.artistsList;
    const q = this.searchQuery.toLowerCase();
    return this.artistsList.filter(a => a.name.toLowerCase().includes(q) || a.specialty.toLowerCase().includes(q));
  }

  deleteArtist(artist: Artist): void {
    this.confirmTarget = artist as unknown as Record<string, unknown>;
    this.confirmAction = 'deleteArtist';
    this.showConfirmDialog = true;
  }

  toggleArtistStatus(artist: Artist): void {
    artist.status = artist.status === 'active' ? 'inactive' : 'active';
    this.showToast(`${artist.name} status updated`, 'success');
  }

  viewArtistDetail(artist: Artist): void {
    this.selectedArtist = artist;
    this.modalType = 'viewArtist';
    this.showModal = true;
  }

  getArtistBookings(artistName: string): Booking[] {
    return this.allBookings.filter(b => b.artist === artistName);
  }

  getRatingStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? '★' : '☆');
  }

  // ── Services ──
  services: Service[] = [
    { icon: '👰', name: 'Bridal Makeup', desc: 'Full glam for weddings & ceremonies', price: '3,500', duration: '3 hrs',   bookings: 312, status: 'active'   },
    { icon: '✨', name: 'Evening Glam',  desc: 'Bold & glamorous for night events',   price: '1,800', duration: '1.5 hrs', bookings: 245, status: 'active'   },
    { icon: '🌿', name: 'Natural Look',  desc: 'Soft, everyday natural finish',       price: '1,200', duration: '1 hr',    bookings: 198, status: 'active'   },
    { icon: '🎭', name: 'SFX Makeup',    desc: 'Special effects & theatrical looks',  price: '2,800', duration: '2.5 hrs', bookings: 87,  status: 'active'   },
    { icon: '💨', name: 'Airbrush',      desc: 'Flawless airbrush application',       price: '2,200', duration: '2 hrs',   bookings: 134, status: 'active'   },
    { icon: '🎉', name: 'Party Makeup',  desc: 'Fun & festive looks for any party',   price: '1,500', duration: '1.5 hrs', bookings: 308, status: 'inactive' },
  ];

  deleteService(service: Service): void {
    this.confirmTarget = service as unknown as Record<string, unknown>;
    this.confirmAction = 'deleteService';
    this.showConfirmDialog = true;
  }

  toggleServiceStatus(service: Service): void {
    service.status = service.status === 'active' ? 'inactive' : 'active';
    this.showToast(`${service.name} status updated`, 'success');
  }

  // ── Reports ──
  reportPeriod = 'monthly';

  monthlyData = [
    { month: 'Jan', revenue: 18500, bookings: 92  },
    { month: 'Feb', revenue: 22000, bookings: 110 },
    { month: 'Mar', revenue: 19800, bookings: 99  },
    { month: 'Apr', revenue: 25600, bookings: 128 },
    { month: 'May', revenue: 21000, bookings: 105 },
    { month: 'Jun', revenue: 28400, bookings: 142 },
    { month: 'Jul', revenue: 24000, bookings: 120 },
    { month: 'Aug', revenue: 27500, bookings: 138 },
    { month: 'Sep', revenue: 23000, bookings: 115 },
    { month: 'Oct', revenue: 26800, bookings: 134 },
    { month: 'Nov', revenue: 29500, bookings: 148 },
    { month: 'Dec', revenue: 30000, bookings: 150 },
  ];

  serviceBreakdown = [
    { name: 'Bridal Makeup', percent: 35, color: '#c9a84c' },
    { name: 'Party Makeup',  percent: 24, color: '#60c080' },
    { name: 'Evening Glam',  percent: 19, color: '#6090d0' },
    { name: 'Airbrush',      percent: 13, color: '#c060a0' },
    { name: 'Others',        percent: 9,  color: '#5a7a9a' },
  ];

  reportKpis = [
    { label: 'Best Month',      value: 'December',  sub: '₱30,000 revenue',     icon: '🏆' },
    { label: 'Top Artist',      value: 'Ana Reyes',  sub: '142 bookings • 4.9⭐', icon: '🎨' },
    { label: 'Avg per Booking', value: '₱2,100',    sub: 'Across all services',  icon: '💵' },
    { label: 'Repeat Clients',  value: '68%',        sub: 'Book more than once',  icon: '🔁' },
  ];

  get maxRevenue(): number { return Math.max(...this.monthlyData.map(m => m.revenue)); }
  get totalRevenueYTD(): number { return this.monthlyData.reduce((s, m) => s + m.revenue, 0); }
  get totalBookingsYTD(): number { return this.monthlyData.reduce((s, m) => s + m.bookings, 0); }

  // ── Calendar ──
  buildCalendar(): void {
    // March 2026 starts on Sunday (0)
    const daysInMonth = 31;
    const startDay = 0; // Sunday
    this.calendarDays = [];

    // empty leading cells
    for (let i = 0; i < startDay; i++) {
      this.calendarDays.push({ day: 0, bookings: [], isToday: false, isEmpty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayBookings = this.allBookings.filter(b => {
        const parts = b.date.split(' ');
        return parts[1] && parseInt(parts[1]) === d;
      });
      this.calendarDays.push({ day: d, bookings: dayBookings, isToday: d === 16, isEmpty: false });
    }
  }

  selectCalDay(day: CalendarDay): void {
    if (day.isEmpty) return;
    this.selectedCalDay = this.selectedCalDay?.day === day.day ? null : day;
  }

  // ── Export ──
  exportBookings(): void {
    const headers = ['ID', 'Client', 'Service', 'Artist', 'Date', 'Amount', 'Status', 'Phone'];
    const rows = this.filteredBookings.map(b =>
      [b.id, b.client, b.service, b.artist, b.date, '₱' + b.amount, b.status, b.phone || ''].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'glowbook-bookings.csv'; a.click();
    URL.revokeObjectURL(url);
    this.showToast('Bookings exported as CSV!', 'success');
  }

  exportClients(): void {
    const headers = ['Name', 'Email', 'Phone', 'Bookings', 'Total Spent', 'Status', 'Joined'];
    const rows = this.clients.map(c =>
      [c.name, c.email, c.phone, c.bookings, '₱' + c.totalSpent, c.status, c.joined].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'glowbook-clients.csv'; a.click();
    URL.revokeObjectURL(url);
    this.showToast('Clients exported as CSV!', 'success');
  }

  // ── Settings ──
  settings = {
    adminName: 'Super Admin',
    email: 'admin@glowbook.com',
    password: '',
    businessName: 'GlowBook',
    leadTime: 24,
    currency: 'PHP',
    emailNotifs: true,
    smsNotifs: false,
    autoConfirm: false,
    darkMode: true,
    maintenanceMode: false,
  };

  saveSettings(): void { this.showToast('Settings saved successfully!', 'success'); }

  // ── Service → Specialty mapping ──
  serviceSpecialtyMap: Record<string, string> = {
    'Bridal Makeup':  'Bridal & Glam',
    'Evening Glam':   'Editorial',
    'Natural Look':   'Natural & SFX',
    'SFX Makeup':     'Natural & SFX',
    'Airbrush':       'Airbrush',
    'Party Makeup':   'Bridal & Glam',
  };

  // Auto-suggest artists when service is selected
  suggestedArtists: Artist[] = [];
  otherArtists: Artist[] = [];
  autoAssignedArtist = false;

  // ── Add-ons ──
  bookingAddons: Addon[] = [
    { name: 'Lash Extensions',   desc: 'Full set of natural lashes',       price: '350',  selected: false },
    { name: 'Brow Shaping',      desc: 'Defined arch & clean-up',          price: '200',  selected: false },
    { name: 'Skin Prep & Primer',desc: 'Deep cleanse + primer base',        price: '250',  selected: false },
    { name: 'Setting Spray',     desc: 'Long-lasting finish spray',         price: '150',  selected: false },
    { name: 'HD Touch-Up Kit',   desc: 'Take-home touch-up essentials',     price: '400',  selected: false },
    { name: 'Glitter/Gems',      desc: 'Decorative glitter or face gems',   price: '180',  selected: false },
  ];

  get selectedAddons(): Addon[] {
    return this.bookingAddons.filter(a => a.selected);
  }

  toggleAddon(addon: Addon): void {
    addon.selected = !addon.selected;
  }

  getBasePrice(): string {
    if (!this.newBooking.service) return '0';
    const svc = this.services.find(s => s.name === this.newBooking.service);
    return svc ? svc.price : '0';
  }

  getTotalPrice(): string {
    const base = parseInt(this.getBasePrice().replace(',', '')) || 0;
    const addonsTotal = this.selectedAddons.reduce((sum, a) => sum + (parseInt(a.price) || 0), 0);
    const total = base + addonsTotal;
    return total.toLocaleString();
  }

  onServiceChange(): void {
    const service = this.newBooking.service;
    if (!service) {
      this.suggestedArtists = [];
      this.otherArtists = this.artistsList.filter(a => a.status === 'active');
      this.newBooking.artist = '';
      this.autoAssignedArtist = false;
      return;
    }

    const targetSpecialty = this.serviceSpecialtyMap[service] || '';
    const activeArtists = this.artistsList.filter(a => a.status === 'active');
    this.suggestedArtists = activeArtists.filter(a => a.specialty === targetSpecialty);
    this.otherArtists = activeArtists.filter(a => a.specialty !== targetSpecialty);

    // Auto-assign the top-rated suggested artist
    if (this.suggestedArtists.length > 0) {
      const best = this.suggestedArtists.reduce((prev, cur) => cur.rating > prev.rating ? cur : prev);
      this.newBooking.artist = best.name;
      this.autoAssignedArtist = true;

      // Also auto-fill amount from service price
      const svc = this.services.find(s => s.name === service);
      if (svc) this.newBooking.amount = svc.price;
    } else {
      this.newBooking.artist = '';
      this.autoAssignedArtist = false;
    }
  }

  getArtistForBooking(name: string): Artist | undefined {
    return this.artistsList.find(a => a.name === name);
  }

  // ── Reviews ──
  reviews: Review[] = [
    { id: 1, client: 'Maria Santos',    artist: 'Ana Reyes',  service: 'Bridal Makeup',   rating: 5, comment: 'Absolutely stunning! Ana made me look like a princess on my wedding day. Highly recommend her for any bridal makeup.', date: 'Mar 14, 2026', status: 'published' },
    { id: 2, client: 'Joy Dela Cruz',   artist: 'Luz Torres', service: 'Evening Glam',    rating: 4, comment: 'Great job! The look lasted all night. Minor issue with timing but overall very satisfied.', date: 'Mar 14, 2026', status: 'published', reply: 'Thank you Joy! We hope to see you again soon.' },
    { id: 3, client: 'Karen Bautista',  artist: 'Mia Gomez',  service: 'Natural Look',    rating: 5, comment: 'Mia is so talented and professional. She understood exactly what I wanted. The makeup was flawless!', date: 'Mar 15, 2026', status: 'published' },
    { id: 4, client: 'Nina Villanueva', artist: 'Luz Torres', service: 'Bridal Makeup',   rating: 5, comment: 'Worth every peso! Luz made my skin glow. I received so many compliments at my wedding.', date: 'Mar 17, 2026', status: 'published' },
    { id: 5, client: 'Carla Mendoza',   artist: 'Mia Gomez',  service: 'SFX Makeup',      rating: 5, comment: 'Mind-blowing SFX work! Mia is incredibly skilled. The transformation was unreal for our cosplay event.', date: 'Mar 18, 2026', status: 'published' },
    { id: 6, client: 'Bea Gonzales',    artist: 'Rosa Lim',   service: 'Natural Look',    rating: 4, comment: 'Rosa did a wonderful job. Clean, natural finish exactly as requested. Will book again!', date: 'Mar 20, 2026', status: 'published' },
    { id: 7, client: 'Trisha Ocampo',   artist: 'Ana Reyes',  service: 'Evening Glam',    rating: 3, comment: 'The look was nice but the session ran 30 minutes over schedule which caused me to be late for my event.', date: 'Mar 21, 2026', status: 'pending' },
    { id: 8, client: 'Lisa Aquino',     artist: 'Jen Castro', service: 'Airbrush Makeup', rating: 2, comment: 'Disappointed with the result. The airbrush looked cakey after 2 hours. Expected better quality for the price.', date: 'Mar 16, 2026', status: 'flagged' },
  ];

  reviewFilter = 'all'; // all | published | pending | flagged
  reviewReplyText = '';
  selectedReview: Review | null = null;

  get filteredReviews(): Review[] {
    let list = this.reviews;
    if (this.reviewFilter !== 'all') list = list.filter(r => r.status === this.reviewFilter);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r => r.client.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q) || r.service.toLowerCase().includes(q));
    }
    return list;
  }

  get avgRating(): string {
    const sum = this.reviews.reduce((s, r) => s + r.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  getReviewCountByRating(star: number): number {
    return this.reviews.filter(r => r.rating === star).length;
  }

  getRatingPercent(star: number): number {
    return Math.round((this.getReviewCountByRating(star) / this.reviews.length) * 100);
  }

  openReviewReply(review: Review): void {
    this.selectedReview = review;
    this.reviewReplyText = review.reply || '';
    this.modalType = 'replyReview';
    this.showModal = true;
  }

  saveReviewReply(): void {
    if (this.selectedReview) {
      this.selectedReview.reply = this.reviewReplyText;
      this.showToast('Reply saved!', 'success');
    }
    this.closeModal();
  }

  updateReviewStatus(review: Review, status: 'published' | 'pending' | 'flagged'): void {
    review.status = status;
    this.showToast(`Review ${status}`, 'success');
  }

  deleteReview(review: Review): void {
    this.confirmTarget = review as unknown as Record<string, unknown>;
    this.confirmAction = 'deleteReview';
    this.showConfirmDialog = true;
  }

  getRatingStarsArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  getReviewCountByStatus(status: string): number {
    return this.reviews.filter(r => r.status === status).length;
  }

  // ── Modal ──
  openModal(type: string): void {
    this.modalType = type;
    if (type === 'addBooking') {
      this.newBooking = {};
      this.suggestedArtists = [];
      this.otherArtists = this.artistsList.filter(a => a.status === 'active');
      this.autoAssignedArtist = false;
      this.bookingAddons.forEach(a => a.selected = false);
    }
    if (type === 'addClient') this.newClient = {};
    if (type === 'addArtist') this.newArtist = {};
    if (type === 'addService') this.newService = {};
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBooking = null;
    this.selectedClient = null;
    this.selectedArtist = null;
  }

  saveModal(): void {
    if (this.modalType === 'addBooking') {
      const b = this.newBooking;
      if (!b.client || !b.service || !b.artist) { this.showToast('Please fill all required fields', 'error'); return; }
      const dateStr = b.bookingDate && b.bookingTime
        ? `${b.bookingDate} ${b.bookingTime}`
        : b.bookingDate || b.bookingTime || 'TBD';
      const addonsNote = this.selectedAddons.length
        ? ` | Add-ons: ${this.selectedAddons.map(a => a.name).join(', ')}`
        : '';
      this.allBookings.push({
        id: 1000 + this.allBookings.length + 1,
        client: b.client!, service: b.service!, artist: b.artist!,
        date: dateStr, amount: this.getTotalPrice(),
        status: 'pending', phone: b.phone || '',
        notes: (b.notes || '') + addonsNote
      });
      this.showToast('Booking added successfully!', 'success');
    }
    if (this.modalType === 'addClient') {
      const c = this.newClient;
      if (!c.name || !c.email) { this.showToast('Please fill all required fields', 'error'); return; }
      this.clients.push({ name: c.name!, email: c.email!, phone: c.phone || '', bookings: 0, joined: 'Mar 2026', status: 'active', totalSpent: '0', lastVisit: '—', favoriteService: '—' });
      this.showToast('Client added successfully!', 'success');
    }
    if (this.modalType === 'addArtist') {
      const a = this.newArtist;
      if (!a.name || !a.email) { this.showToast('Please fill all required fields', 'error'); return; }
      const initials = a.name!.split(' ').map((w: string) => w[0]).join('').toUpperCase();
      this.artistsList.push({ name: a.name!, initials, specialty: a.specialty || 'General', email: a.email!, bookings: 0, rating: 5.0, status: 'active', revenue: '0', availability: 'Available', phone: a.phone || '', joinedDate: 'Mar 2026', completionRate: 100 });
      this.showToast('Artist added successfully!', 'success');
    }
    if (this.modalType === 'addService') {
      const s = this.newService;
      if (!s.name || !s.price) { this.showToast('Please fill all required fields', 'error'); return; }
      this.services.push({ icon: s.icon || '💄', name: s.name!, desc: s.desc || '', price: s.price!, duration: s.duration || '1 hr', bookings: 0, status: 'active' });
      this.showToast('Service added successfully!', 'success');
    }
    this.closeModal();
  }

  // ── Confirm Dialog ──
  confirmDialogAction(): void {
    if (this.confirmAction === 'deleteBooking' && this.confirmTarget) {
      const idx = this.allBookings.findIndex(b => b.id === (this.confirmTarget as unknown as Booking).id);
      if (idx > -1) this.allBookings.splice(idx, 1);
      this.showToast('Booking deleted', 'success');
    }
    if (this.confirmAction === 'deleteClient' && this.confirmTarget) {
      const idx = this.clients.findIndex(c => c.name === (this.confirmTarget as unknown as Client).name);
      if (idx > -1) this.clients.splice(idx, 1);
      this.showToast('Client removed', 'success');
    }
    if (this.confirmAction === 'deleteArtist' && this.confirmTarget) {
      const idx = this.artistsList.findIndex(a => a.name === (this.confirmTarget as unknown as Artist).name);
      if (idx > -1) this.artistsList.splice(idx, 1);
      this.showToast('Artist removed', 'success');
    }
    if (this.confirmAction === 'deleteService' && this.confirmTarget) {
      const idx = this.services.findIndex(s => s.name === (this.confirmTarget as unknown as Service).name);
      if (idx > -1) this.services.splice(idx, 1);
      this.showToast('Service deleted', 'success');
    }
    if (this.confirmAction === 'deleteReview' && this.confirmTarget) {
      const idx = this.reviews.findIndex(r => r.id === (this.confirmTarget as unknown as Review).id);
      if (idx > -1) this.reviews.splice(idx, 1);
      this.showToast('Review deleted', 'success');
    }
    this.cancelConfirm();
  }

  cancelConfirm(): void { this.showConfirmDialog = false; this.confirmTarget = null; this.confirmAction = ''; }

  // ── Toast ──
  showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMessage = message; this.toastType = type; this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3000);
  }

  // ── Lifecycle ──
  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.buildCalendar();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
    this.currentDate = now.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  constructor(private router: Router, private authService: AuthService) {}

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}