import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-gato-accesorios',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gato-accesorios.component.html',
  styleUrl: './gato-accesorios.component.css'
})
export class GatoAccesoriosComponent implements OnInit, OnDestroy {
  @ViewChild('logoutModal') logoutModal: ElementRef | undefined;


  email: string = 'elpandacomida@gmail.com';
  cartCount: number = 0;
  errorMessage: string = ''; 
  username: string | null = null; // Usuario estándar
  adminUser: string | null = null; // Administrador
  isLoggedIn: boolean = false;
  loginForm!: FormGroup;

  constructor(private router: Router, private el: ElementRef, private renderer: Renderer2, private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('Inicializando componente Index...');
    this.initLoginForm();
    this.checkUserSession();
    this.checkAdminSession();

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
        this.adminUser = null; // Limpiar administrador
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

  // Cargar datos del carrito
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

  // Agregar producto al carrito
  addToCart(product: any): void {
    if (typeof localStorage !== 'undefined') {
      let cart = localStorage.getItem('cart');
      let parsedCart = cart ? JSON.parse(cart) : [];
      const existingProduct = parsedCart.find((item: any) => item.id === product.id);

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        parsedCart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(parsedCart));
      this.cartCount += 1;
    }
  }

  // Redirigir al perfil del usuario
  goToProfile(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/user']);
    } else {
      alert('Por favor, inicie sesión primero.');
    }
  }

  // Iniciar sesión usando correo electrónico
  login(email: string, password: string): void {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      if (user.email === email && user.password === password) {
        this.username = user.nombreCompleto; 
        this.isLoggedIn = true;
        localStorage.setItem('sesionActiva', 'true');

        // Dispara manualmente el evento 'storage'
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
      localStorage.setItem('sesionActiva', 'false');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('loggedInUser');
      this.username = null;
      this.adminUser = null;
      this.isLoggedIn = false;
      window.dispatchEvent(new Event('storage'));
      alert('Sesión cerrada');
      this.router.navigate(['/']);
    }
  }

  // Sincronizar cierre de sesión entre pestañas
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

  // Verificar si el usuario está logueado
  isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // Manejar inicio de sesión
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      alert('Por favor, completa todos los campos.');
      return;
    }

    const { nombreUsuario, password } = this.loginForm.value;

    console.log('Credenciales ingresadas:', nombreUsuario, password);

    // Verificar si las credenciales son del administrador
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      const adminUser = JSON.parse(adminData);
      console.log('Datos del administrador:', adminUser);

      if (adminUser.email === nombreUsuario && adminUser.password === password) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('loggedInUser', 'Admin');
        this.isLoggedIn = true;
        this.adminUser = 'Admin'; // Establecer el nombre del administrador
        this.username = null;
        alert('Inicio de sesión como administrador exitoso');
        this.closeModal(); // Cerrar el modal
        this.router.navigate(['/admin']);
        return;
      }
    }

    // Verificar credenciales de usuarios regulares
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      if (user.email === nombreUsuario && user.password === password) {
        this.isLoggedIn = true;
        this.username = user.nombreCompleto;
        this.adminUser = null; // Limpiar administrador
        localStorage.setItem('sesionActiva', 'true');
        alert('Inicio de sesión exitoso');
        this.closeModal();
        this.router.navigate(['/']);
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } else {
      alert('Usuario no encontrado');
    }
  }

  // Método para cerrar el modal
  closeModal(): void {
    const modalElement = document.getElementById('loginModal'); // Verificar ID correcto
    if (modalElement) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
      modalInstance.hide();
      modalElement.classList.remove('show');
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    } else {
      console.error('No se encontró el modal con el ID "loginModal".');
    }
  }


  toggleDropdown(dropdownId: string): void {
    const dropdownElement = document.getElementById(dropdownId);
    if (dropdownElement) {
      const dropdown = new window.bootstrap.Dropdown(dropdownElement);
      dropdown.toggle();
    }
  }

}
