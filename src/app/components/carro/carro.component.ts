import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

declare global {
  interface Window {
    bootstrap: any;
  }
}

@Component({
  selector: 'app-carro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './carro.component.html',
  styleUrls: ['./carro.component.css'],
})
export class CarroComponent implements OnInit, OnDestroy {
  @ViewChild('paymentModal') paymentModal: ElementRef | undefined;
  email: string = '';
  password: string = '';
  cart: any[] = [];
  cartCount: number = 0;
  cartTotal: number = 0;
  cartEmptyMessage: boolean = false;
  subTotal: number = 0;
  discount: number = 0;
  tax: number = 0;
  paymentMethod: string = 'Tarjeta de Crédito';
  estimatedDeliveryDate: string = '2024-12-01';
  trackingNumber: string | null = null;
  paymentConfirmed: boolean = false;
  adminUser: string | null = null;
  username: string | null = null;
  isLoggedIn: boolean = false;
  loginForm!: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    console.log('Inicializando componente Carro...');
    this.initLoginForm();
    this.checkAdminSession();
    this.checkUserSession();
    this.loadCart();

    if (this.isBrowser()) {
      window.addEventListener('storage', this.syncLogout.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser()) {
      window.removeEventListener('storage', this.syncLogout.bind(this));
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

    // Validar si un administrador está conectado
    private checkAdminSession(): void {
      const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
      const loggedInUser = localStorage.getItem('loggedInUser');
  
      if (isAdminLoggedIn && loggedInUser) {
        this.adminUser = loggedInUser; // Nombre del administrador
        this.username = null; // Limpiar usuario estándar
        this.isLoggedIn = true;
        console.log('Admin logueado:', this.adminUser);
      } else {
        this.adminUser = null;
      }
    }

  private checkUserSession(): void {
    if (this.isBrowser()) {
      const storedUser = localStorage.getItem('userData');
      const sesionActiva = localStorage.getItem('sesionActiva') === 'true';

      if (storedUser && sesionActiva) {
        const user = JSON.parse(storedUser);
        this.username = user.nombreCompleto || null;
        this.isLoggedIn = true;
      } else {
        this.username = null;
        this.isLoggedIn = false;
      }

      console.log('Estado de sesión:', { username: this.username, isLoggedIn: this.isLoggedIn });
    }
  }

  private syncLogout(event: StorageEvent): void {
    if (event.key === 'sesionActiva' && event.newValue === 'false') {
      this.username = null;
      this.isLoggedIn = false;
    }
  }

  private initLoginForm(): void {
    this.loginForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  private updateCartDetails(): void {
    this.cartEmptyMessage = this.cart.length === 0;
    this.subTotal = this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
    this.discount = this.calculateDiscount();
    this.tax = this.calculateTax(this.subTotal - this.discount);
    this.cartTotal = this.subTotal - this.discount + this.tax;
    this.cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  login(email: string, password: string): void {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === email && user.password === password) {
        localStorage.setItem('sesionActiva', 'true');
        this.username = user.nombreCompleto;
        this.isLoggedIn = true;
        window.dispatchEvent(new Event('storage'));
        alert('Inicio de sesión exitoso');
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } else {
      alert('Usuario no encontrado');
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.setItem('sesionActiva', 'false');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('loggedInUser');
      this.adminUser = null;
      this.username = null;
      this.isLoggedIn = false;
      window.dispatchEvent(new Event('storage'));
      alert('Sesión cerrada');
      this.router.navigate(['/']);
    }
  }

  loadCart(): void {
    if (this.isBrowser()) {
      const cartData = localStorage.getItem('cart') || '[]';
      try {
        this.cart = JSON.parse(cartData);
        this.updateCartDetails();
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        this.cart = [];
      }
    }
  }

  finalizePurchase(): void {
    if (this.cart.length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    this.openPaymentModal();
  }

  openPaymentModal(): void {
    if (this.paymentModal) {
      const modalElement = this.paymentModal.nativeElement;
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  processPayment(): void {
    alert('Procesando el pago...');
    this.cart = [];
    localStorage.removeItem('cart');
    this.updateCartDetails();
    this.paymentConfirmed = true;
  }

  calculateDiscount(): number {
    return this.subTotal * 0.1;
  }

  calculateTax(amount: number): number {
    return amount * 0.19;
  }

  removeFromCart(productName: string): void {
    if (this.isBrowser()) {
      this.cart = this.cart.filter((item) => item.name !== productName);
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.updateCartDetails();
    }
  }

  goToHomePage(): void {
    this.router.navigate(['/']);
  }

  goToProfile(): void {
    this.router.navigate(['/user']);
  }
}
