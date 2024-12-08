import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonService } from '../../services/json.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({
  selector: 'app-seg-pedido',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './seg-pedido.component.html',
  styleUrls: ['./seg-pedido.component.css'],
  providers: [JsonService],
})
export class SegPedidoComponent implements OnInit {
  email: string = 'elpandacomida@gmail.com';
  orders: any[] = []; 
  searchResult: any[] = []; 
  orderNumber: string = ''; 
  errorMessage: string = ''; 
  isLoggedIn: boolean = false;
  adminUser: string | null = null;
  username: string | null = null;
  cartCount: number = 0;

  constructor(
    private jsonService: JsonService, 
    private router: Router,
    private activatedRoute: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    console.log('Cargando componente...');
    this.checkAdminSession();
    this.checkUserSession();
    this.loadCartCount();

    // Manejar parámetros de ruta (para pruebas unitarias)
    this.activatedRoute.params.subscribe(params => {
      console.log('Parámetros de ruta:', params);
      if (params['id']) {
        this.orderNumber = params['id'];
        this.trackOrder(); // Buscar pedido automáticamente si se pasa un ID en la ruta
      }
    });
  }

  trackOrder(): void {
    console.log('Buscando pedido con número:', this.orderNumber);

    if (!this.orderNumber) {
      this.errorMessage = 'Por favor, ingresa un número de seguimiento válido.';
      this.searchResult = [];
      return;
    }

    // Cargar pedidos desde S3 y buscar el pedido específico
    this.jsonService.getCarritoData().subscribe({
      next: (data) => {
        console.log('Datos cargados desde S3:', data);
        this.orders = data;

        const order = this.orders.find(
          (o: any) => o.trackingNumber === this.orderNumber
        );

        if (order) {
          console.log('Pedido encontrado:', order);
          this.searchResult = [order];
          this.errorMessage = '';
        } else {
          console.warn('Pedido no encontrado.');
          this.searchResult = [];
          this.errorMessage = 'No se encontró un pedido con ese número.';
        }
      },
      error: (err) => {
        console.error('Error al cargar datos desde S3:', err);
        this.errorMessage = 'No se pudo cargar los datos desde el servidor.';
      },
    });
  }

  // Validar si un administrador está conectado
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

  checkUserSession(): void {
    const storedUser = localStorage.getItem('userData');
    const sesionActiva = localStorage.getItem('sesionActiva') === 'true';

    if (storedUser && sesionActiva) {
      const user = JSON.parse(storedUser);
      this.username = user.nombreCompleto || null;
      this.isLoggedIn = true;
      console.log('Sesión activa:', this.username);
    } else {
      this.username = null;
      this.isLoggedIn = false;
      console.log('No hay sesión activa.');
    }
  }

  loadCartCount(): void {
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        this.cartCount = Array.isArray(parsedCart)
          ? parsedCart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
          : 0;
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        this.cartCount = 0;
      }
    }
  }

  logout(): void {
    console.log('Cerrando sesión...');
    localStorage.setItem('sesionActiva', 'false');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('loggedInUser');
    this.username = null;
    this.adminUser = null;
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  goToProfile(): void {
    console.log('Redirigiendo al perfil...');
    if (this.isLoggedIn) {
      this.router.navigate(['/user']);
    } else {
      alert('Por favor, inicie sesión primero.');
    }
  }
}
