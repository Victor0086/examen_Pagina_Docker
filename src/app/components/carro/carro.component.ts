import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JsonService } from '../../services/json.service';
import { HttpClientModule } from '@angular/common/http';

declare global {
  interface Window {
    bootstrap: any;
  }

  interface CartTotal {
    sinIVA: string;
    iva: string;
    conIVA: string;
  }
}

@Component({
  selector: 'app-carro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './carro.component.html',
  styleUrls: ['./carro.component.css'],
  providers: [JsonService]
})
export class CarroComponent implements OnInit, OnDestroy {
  @ViewChild('paymentModal') paymentModal: ElementRef | undefined;
  email: string = '';
  password: string = '';
  cart: any[] = [];
  cartCount: number = 0;
  cartItems: any[] = [];
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
  cartTotal: CartTotal = { sinIVA: '0.00', iva: '0.00', conIVA: '0.00' };
  paymentProcessing: boolean = false;

  constructor(private router: Router,private fb: FormBuilder,private jsonService: JsonService
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

  private checkAdminSession(): void {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (isAdminLoggedIn && loggedInUser) {
      this.adminUser = loggedInUser;
      this.username = null;
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
    const totalSinIVA = this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const iva = totalSinIVA * 0.19; // Calcula el IVA (19%)
    const totalConIVA = totalSinIVA + iva;

    this.cartTotal = {
      sinIVA: totalSinIVA.toFixed(2),
      iva: iva.toFixed(2),
      conIVA: totalConIVA.toFixed(2),
    };

    this.cartEmptyMessage = this.cart.length === 0;
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
    const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!currentUser || !currentUser.email) {
      alert('Debes iniciar sesión para finalizar la compra.');
      return;
    }
  
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
    const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!currentUser || !currentUser.email) {
      alert('Debes iniciar sesión para finalizar la compra.');
      return;
    }
  
    if (this.cart.length === 0) {
      alert('El carrito está vacío. No se puede procesar el pago.');
      return;
    }
  
    this.paymentProcessing = true; // Activar estado de procesamiento
    console.log('Procesando el pago para el carrito:', this.cart);
  
    // Obtener compras existentes de S3
    this.jsonService.getPurchases().subscribe({
      next: (existingPurchases: any[]) => {
        console.log('Compras existentes obtenidas de S3:', existingPurchases);
  
        // Crear las nuevas compras
        const newPurchases = this.cart.map((item: any) => ({
          producto: item.name,
          precio: item.price,
          cantidad: item.quantity,
          total: item.price * item.quantity,
          fecha: new Date().toISOString(),
          status: 'Pendiente',
          trackingNumber: this.generateTrackingNumber(),
          userEmail: currentUser.email,
        }));
  
        console.log('Nuevas compras a agregar:', newPurchases);
  
        // Actualizar el listado de compras
        const updatedPurchases = [...(existingPurchases || []), ...newPurchases];
  
        // Guardar las compras actualizadas en S3
        this.jsonService.savePurchases(updatedPurchases).subscribe({
          next: () => {
            console.log('Compras guardadas exitosamente en S3:', updatedPurchases);
  
            // Sincronizar con LocalStorage
            localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
            console.log('Compras sincronizadas con LocalStorage.');
  
            // Limpiar el carrito
            this.cart = [];
            localStorage.removeItem('cart');
            this.updateCartDetails();
  
            this.paymentProcessing = false; // Desactivar estado de procesamiento
            alert('Compra realizada con éxito. Verifica tus compras.');
          },
          error: (err: any) => {
            console.error('Error al guardar las compras en S3:', err);
            this.paymentProcessing = false;
            alert('Hubo un error al guardar las compras en S3. Por favor, inténtalo más tarde.');
          },
        });
      },
      error: (err: any) => {
        console.error('Error al obtener las compras desde S3:', err);
        this.paymentProcessing = false;
        alert('Hubo un error al obtener las compras existentes. Por favor, inténtalo más tarde.');
      },
    });
  }
  
  
  
  
  
  private generateTrackingNumber(): string {
    return 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
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
