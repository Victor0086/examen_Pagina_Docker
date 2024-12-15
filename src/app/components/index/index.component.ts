import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { JsonService } from '../../services/json.service';

// Interfaz para el total del carrito
interface CartTotal {
  sinIVA: string;
  iva: string;
  conIVA: string;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  providers: [JsonService]
})
export class IndexComponent implements OnInit, OnDestroy {
  @ViewChild('logoutModal') logoutModal: ElementRef | undefined;

  email: string = 'elpandacomida@gmail.com';
  cartCount: number = 0;
  errorMessage: string = '';
  username: string | null = null; // Usuario estándar
  adminUser: string | null = null; // Administrador
  isLoggedIn: boolean = false;
  loginForm!: FormGroup;
  cartItems: any[] = [];
  cartTotal: CartTotal = { sinIVA: '0.00', iva: '0.00', conIVA: '0.00' };

  constructor(private router: Router, private el: ElementRef, private renderer: Renderer2, private fb: FormBuilder,private jsonService: JsonService ) {}

  ngOnInit(): void {
    console.log('Inicializando componente Index...');
    this.initLoginForm();
    this.checkUserSession();
    this.checkAdminSession();
    this.loadCart();
    this.loadCartCount();

    // Inicializar el usuario administrador si no existe
    const storedUserData = localStorage.getItem('adminData');
    if (!storedUserData) {
      const adminUser = {
        email: 'admin@gmail.com',
        password: 'admin',
        nombreCompleto: 'Admin',
      };
      localStorage.setItem('adminData', JSON.stringify(adminUser));
      console.log('Usuario administrador inicializado.');
    }

    if (this.isBrowser()) {
      window.addEventListener('storage', this.syncLogout.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser()) {
      window.removeEventListener('storage', this.syncLogout.bind(this));
    }
  }

  private initLoginForm(): void {
    this.loginForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      password: ['', Validators.required],
    });
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
        this.adminUser = null; 
        console.log('Usuario logueado:', this.username);
      } else {
        this.username = null;
        this.isLoggedIn = false;
      }
    }
  }

  // Escucha cambios en localStorage
  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {
    if (
      event.key === 'isAdminLoggedIn' ||
      event.key === 'loggedInUser' ||
      event.key === 'sesionActiva'
    ) {
      this.checkAdminSession();
      this.checkUserSession();
    }
  }

  private loadCart(): void {
    const cart = localStorage.getItem('cart');

    if (cart) {
      this.cartItems = JSON.parse(cart).map((item: any) => ({
        ...item,
        image: item.image || `/imagenes/${item.name.replace(/\s+/g, '')}.jpg`,
      }));

      // Calculamos el total del carrito
      const totalSinIVA = this.cartItems.reduce((total: number, item: any) => {
        return total + item.price * (item.quantity || 1);
      }, 0);

      const iva = totalSinIVA * 0.19; // Calcula el IVA (19%)
      const totalConIVA = totalSinIVA + iva;

      this.cartTotal = {
        sinIVA: totalSinIVA.toFixed(2),
        iva: iva.toFixed(2),
        conIVA: totalConIVA.toFixed(2),
      };
    } else {
      this.cartItems = [];
      this.cartTotal = { sinIVA: '0.00', iva: '0.00', conIVA: '0.00' };
    }

    console.log('Cart Items:', this.cartItems);
    console.log('Cart Total:', this.cartTotal);
  }

  private loadCartCount(): void {
    if (typeof localStorage !== 'undefined') {
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
  }

  addToCart(product: any): void {
    if (typeof localStorage !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
      // Verifica si el producto ya está en el carrito
      const existingProduct = cart.find((item: any) => item.id === product.id);
  
      if (existingProduct) {
        existingProduct.quantity += 1; // Incrementa la cantidad
      } else {
        cart.push({
          ...product,
          quantity: 1, // Agrega con cantidad inicial de 1
          image: `/imagenes/${product.name.replace(/\s+/g, '')}.jpg`,
        });
      }
  
      // Actualiza el carrito en el localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
  
      // Actualiza las variables locales y la vista
      this.cartItems = cart;
      this.cartCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  
      console.log('Producto agregado:', product);
      console.log('Carrito actualizado:', this.cartItems);
    }
  }
  

  goToProfile(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/user']);
    } else {
      alert('Por favor, inicie sesión primero.');
    }
  }

  login(email: string, password: string): void {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      if (user.email === email && user.password === password) {
        this.username = user.nombreCompleto;
        this.isLoggedIn = true;
        localStorage.setItem('sesionActiva', 'true');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          console.log('Evento de almacenamiento disparado manualmente.');
        }

        alert('Inicio de sesión exitoso');
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } else {
      alert('Usuario no encontrado');
    }
  }

  openModal(): void {
    if (this.isBrowser()) {
      const modal = new window.bootstrap.Modal(document.getElementById('orderModal'));
      modal.show();
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      // Actualiza la sesión en el almacenamiento local
      localStorage.setItem('sesionActiva', 'false');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('loggedInUser');
      this.username = null;
      this.adminUser = null;
      this.isLoggedIn = false;
  
      // Mostrar el modal de cierre de sesión
      const modalElement = document.getElementById('logoutSuccessModal');
      if (modalElement) {
        const modalInstance = new window.bootstrap.Modal(modalElement);
        modalInstance.show();
      }
  
      // Espera 2 segundos antes de redirigir
      setTimeout(() => {
        // Limpiar backdrop y clases residuales del modal
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
        document.body.classList.remove('modal-open');
  
        // Redirigir al usuario a la página principal
        this.router.navigate(['/']);
      })
    }
  }
  

  private syncLogout(event: StorageEvent): void {
    if (event.key === 'sesionActiva') {
      const isActive = event.newValue === 'true';
      if (!isActive) {
        console.log('Sincronizando cierre de sesión');
        this.username = null;
        this.adminUser = null;
        this.isLoggedIn = false;
      }
    }
  }

  isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      alert('Por favor, completa todos los campos.');
      return;
    }
  
    const { nombreUsuario, password } = this.loginForm.value;
  
    console.log('Credenciales ingresadas:', { nombreUsuario, password });
  
    // Primero, verifica si es un administrador
    this.jsonService.getJsonData('admin').subscribe({
      next: (admins: any[]) => {
        console.log('Datos del administrador desde S3:', admins);
        const admin = admins.find(
          (admin: any) => admin.email === nombreUsuario && admin.password === password
        );
  
        if (admin) {
          localStorage.setItem('isAdminLoggedIn', 'true');
          localStorage.setItem('loggedInUser', admin.nombreCompleto);
          this.isLoggedIn = true;
          this.adminUser = admin.nombreCompleto;
  
          // Llama a la función para cerrar el modal de inicio de sesión y mostrar el modal de éxito
          this.closeModal('loginModal', () => {
            this.showLoginSuccessModal('admin');
          });
  
          // Redirigir después de mostrar el modal de éxito
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 2000);
        } else {
          this.validateRegularUsers(nombreUsuario, password);
        }
      },
      error: (err) => {
        console.error('Error al obtener datos del administrador:', err);
        alert('No se pudo autenticar al administrador.');
      },
    });
  }
  
  private validateRegularUsers(email: string, password: string): void {
    this.jsonService.getJsonData('users').subscribe({
      next: (users: any[]) => {
        console.log('Usuarios obtenidos desde S3:', users);
  
        // Busca al usuario por correo electrónico y contraseña
        const user = users.find(
          (user: any) => user.email === email && user.password === password
        );
  
        if (user) {
          // Verificar que el rol esté definido
          const userRole = user.rol ? user.rol.toLowerCase() : 'usuario';
          
          // Guarda los datos del usuario en localStorage
          localStorage.setItem('userData', JSON.stringify(user));
          localStorage.setItem('sesionActiva', 'true');
          this.username = user.nombreCompleto;
          this.adminUser = null; // Asegura que no sea un admin
          this.isLoggedIn = true;
  
          // Llama a la función para mostrar el modal de inicio de sesión exitoso
          this.showLoginSuccessModal(userRole);
  
          // Cerrar el modal antes de redirigir
          setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            document.body.classList.remove('modal-open');
            this.router.navigate(['/']);
          }, 2000);
        } else {
          alert('Correo o contraseña incorrectos.');
        }
      },
      error: (err) => {
        console.error('Error al obtener usuarios desde S3:', err);
        alert('No se pudo autenticar al usuario.');
      },
    });
  }
  
  
  private closeModal(modalId: string, callback?: () => void): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
      // Limpia el fondo y clases residuales
      this.cleanModalState();
      if (callback) {
        callback();
      }
    }
  }
  
  private cleanModalState(): void {
 
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
  
  private showLoginSuccessModal(userType: string): void {
    const loginModalElement = document.getElementById('loginModal');
    if (loginModalElement) {
      const loginModalInstance = window.bootstrap.Modal.getInstance(loginModalElement);
      if (loginModalInstance) {
        loginModalInstance.hide();
        // Esperar a que el modal se cierre completamente antes de abrir el nuevo
        loginModalElement.addEventListener('hidden.bs.modal', () => {
          this.displaySuccessModal(userType);
        });
        return;
      }
    }
    this.displaySuccessModal(userType);
  }
  
  private displaySuccessModal(userType: string): void {
    const modalBody = document.querySelector('#loginSuccessModal .modal-body');
    if (modalBody) {
      // Cambia el mensaje según el tipo de usuario
      if (userType === 'admin') {
        modalBody.textContent = '¡Inicio de sesión como administrador exitoso!';
      } else if (userType === 'vendedor') {
        modalBody.textContent = '¡Inicio de sesión como vendedor exitoso!';
      } else if (userType === 'soportecliente') {
        modalBody.textContent = '¡Inicio de sesión como soporte al cliente exitoso!';
      } else {
        modalBody.textContent = '¡Inicio de sesión exitoso!';
      }
    }
  
    // Muestra el modal
    const modalElement = document.getElementById('loginSuccessModal');
    if (modalElement) {
      const modalInstance = new window.bootstrap.Modal(modalElement);
  
      // Escucha el evento de cierre del modal
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.restoreScroll(); 
      });
  
      modalInstance.show(); 
  
     
      setTimeout(() => {
        const modalBackdropExists = document.querySelector('.modal-backdrop');
        if (modalBackdropExists || document.body.classList.contains('modal-open')) {
          this.restoreScroll();
        }
      });
    }
  }

  

  private restoreScroll(): void {
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove(); // Elimina cualquier backdrop restante
    }
    document.body.style.overflow = ''; // Asegúrate de restaurar el scroll
  }
  


  
  
  

  toggleDropdown(dropdownId: string): void {
    const dropdownElement = document.getElementById(dropdownId);
    if (dropdownElement) {
      const dropdown = new window.bootstrap.Dropdown(dropdownElement);
      dropdown.toggle();
    }
  }

  ngAfterViewInit(): void {
    const carousel = document.getElementById('product-carousel');
    let isDragging = false;
    let startX: number;
    let scrollLeft: number;

    if (carousel) {
      const startDrag = (e: MouseEvent | TouchEvent) => {
        isDragging = true;
        carousel.classList.add('dragging');
        startX = e instanceof MouseEvent
          ? e.pageX - carousel.offsetLeft
          : e.touches[0].pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      };

      const endDrag = () => {
        isDragging = false;
        carousel.classList.remove('dragging');
      };

      const dragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e instanceof MouseEvent
          ? e.pageX - carousel.offsetLeft
          : e.touches[0].pageX - carousel.offsetLeft;
        const walk = x - startX;
        carousel.scrollLeft = scrollLeft - walk;
      };

      carousel.addEventListener('mousedown', startDrag);
      carousel.addEventListener('mouseup', endDrag);
      carousel.addEventListener('mouseleave', endDrag);
      carousel.addEventListener('mousemove', dragMove);

      carousel.addEventListener('touchstart', startDrag);
      carousel.addEventListener('touchend', endDrag);
      carousel.addEventListener('touchmove', dragMove);
    }
  }

  scrollCarousel(direction: 'left' | 'right'): void {
    const carousel = document.getElementById('product-carousel');
    if (carousel) {
      const scrollAmount = 300;
      if (direction === 'left') {
        carousel.scrollLeft -= scrollAmount;
      } else if (direction === 'right') {
        carousel.scrollLeft += scrollAmount;
      }
    }
  }

  products = [
    { id: 1, name: 'Fit Formula Adulto 20 kg', description: 'Alimento para perros', oldPrice: 50000, price: 45000, image: '/imagenes/FitAdulto.jpg' },
    { id: 2, name: 'Cat Chow Adulto 10 kg', description: 'Alimento para gatos', oldPrice: 30000, price: 25000, image: '/imagenes/Gati15kg.jpg' },
    { id: 3, name: 'Gaucho 15kg', description: 'Alimento para gatos', oldPrice: 50000, price: 35000, image: '/imagenes/Gaucho15kg.jpg' },
    { id: 4, name: 'Raza Gatos 15kg', description: 'Alimento para gatos', oldPrice: 30000, price: 25000, image: '/imagenes/RazaGato10kg.jpg' },
    { id: 5, name: 'Master Dog Cachorro 15 kg', description: 'Alimento para perros cachorros', oldPrice: 30000, price: 25000, image: '/imagenes/Alimento Perro Cachorro Master Dog Razas Medianas y Grandes 15 kg.webp' },
    { id: 6, name: 'Doko Carne y Pollo 15 kg', description: 'Alimento para perros adultos', oldPrice: 30000, price: 25000, image: '/imagenes/Alimento Perro Adulto Doko Carne y Pollo 15 kg.webp' },
    { id: 7, name: 'Cannes Carne y Cereales 15 kg', description: 'Alimento para perros adultos', oldPrice: 30000, price: 25000, image: '/imagenes/Alimento Perro Adulto Cannes Carne y Cereales 15 kg.webp' },
    { id: 8, name: 'Cachupin Carne 15 kg', description: 'Alimento para perros adultos', oldPrice: 30000, price: 25000, image: '/imagenes/Alimento Perro Adulto Cachupin Carne 15 kg.webp' },
    { id: 9, name: 'Purina One Gato Adulto 10 kg', description: 'Alimento premium para gatos', oldPrice: 55000, price: 50000, image: '/imagenes/PurinaOneGato.jpg' },
    { id: 10, name: 'Royal Canin Perro 15 kg', description: 'Alimento premium para perros', oldPrice: 60000, price: 55000, image: '/imagenes/RoyalCaninPerro.jpg' }
  ];
  
  
}
