import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, OnDestroy {
  @ViewChild('logoutModal') logoutModal: ElementRef | undefined;

  email: string = 'elpandacomida@gmail.com';
  userRegistrationForm!: FormGroup;
  loginForm!: FormGroup;
  username: string | null = null;
  isLoggedIn: boolean = false;
  purchases: any[] = [];
  cartCount: number = 0;
  alertMessage: string | null = null;
  alertType: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('Inicializando componente User...');
  
    // Inicializar formularios
    this.initForms();
  
    // Verificar si hay un usuario en sesión activa
    const userData = localStorage.getItem('userData');
    const sesionActiva = localStorage.getItem('sesionActiva') === 'true';
  
    if (userData && sesionActiva) {
      const user = JSON.parse(userData);
      this.username = user.nombreCompleto;
      this.isLoggedIn = true;
      console.log('Usuario logueado:', this.username);
    } else {
      this.username = null;
      this.isLoggedIn = false;
      console.log('No hay usuario logueado.');
    }
  
    // Cargar compras y conteo del carrito
    this.loadPurchases();
    this.loadCartCount();
  
    // Sincronizar sesión entre pestañas si es navegador
    if (this.isBrowser()) {
      window.addEventListener('storage', this.syncSession.bind(this));
    }
  }
  

  ngOnDestroy(): void {
    if (this.isBrowser()) {
      window.removeEventListener('storage', this.syncSession.bind(this)); // Eliminar listeners al destruir componente
    }
  }

    // Métodos para alternar la visibilidad de las contraseñas
    toggleShowPassword(): void {
      this.showPassword = !this.showPassword;
    }
  
    toggleShowConfirmPassword(): void {
      this.showConfirmPassword = !this.showConfirmPassword;
    }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private initForms(): void {
    this.userRegistrationForm = this.fb.group(
      {
        nombreCompleto: ['', Validators.required],
        nombreUsuario: ['', Validators.required],
        email: ['', [Validators.required, Validators.email, this.validarDominioCorreo]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        fechaNacimiento: ['', [Validators.required, this.validarEdad(13, 100)]],
        direccion: [''],
      },
      {
        validators: this.passwordsMatchValidator, 
      }
    );
  
    this.loginForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  
  private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
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

      console.log('Estado de sesión en user.component:', { username: this.username, isLoggedIn: this.isLoggedIn });
    }
  }

  private syncSession(event: StorageEvent): void {
    if (event.key === 'sesionActiva' || event.key === 'userData') {
      this.checkUserSession();
    }
  }
  



  logout(): void {
    if (this.isBrowser()) {
      localStorage.setItem('sesionActiva', 'false');
      this.username = null;
      this.isLoggedIn = false;
      window.dispatchEvent(new Event('storage')); 
      this.showNotification('logoutModal'); 
    }
  }

  private loadPurchases(): void {
    if (this.isBrowser()) {
      const storedPurchases = localStorage.getItem('purchases');
      this.purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
    }
  }

  private loadCartCount(): void {
    if (this.isBrowser()) {
      const cart = localStorage.getItem('cart');
      try {
        const parsedCart = cart ? JSON.parse(cart) : [];
        this.cartCount = parsedCart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        this.cartCount = 0;
      }
    }
  }

  validarDominioCorreo(control: any) {
    const email = control.value;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) ? null : { dominioInvalido: true };
  }

  validarEdad(minEdad: number, maxEdad: number) {
    return (control: any) => {
      const fechaNacimiento = new Date(control.value);
      if (isNaN(fechaNacimiento.getTime())) {
        return { fechaInvalida: true };
      }
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear() - 
        (hoy < new Date(hoy.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate()) ? 1 : 0);
      if (edad < minEdad) {
        return { edadMinima: true };
      }
      if (edad > maxEdad) {
        return { edadMaxima: true };
      }
      return null;
    };
  }
  


  onFieldTouched(fieldName: string): void {
    const control = this.userRegistrationForm.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }

  submitForm(): void {
    if (this.userRegistrationForm.invalid) {
      this.userRegistrationForm.markAllAsTouched();
      return;
    }

    const formValues = this.userRegistrationForm.value;

    // Validar si las contraseñas coinciden
    if (formValues.password !== formValues.confirmPassword) {
      this.showAlert('Las contraseñas no coinciden', 'danger');
      return;
    }

    

    // Obtener usuarios existentes
    const existingUsers = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Verificar si el correo ya existe
    const emailExists = existingUsers.some(
      (user: any) => user.email === formValues.email
    );
    if (emailExists) {
      this.showAlert('Este correo ya está registrado', 'warning');
      return;
    }

    // Agregar el nuevo usuario al array
    existingUsers.push(formValues);

    // Guardar el array actualizado en `localStorage`
    localStorage.setItem('usuarios', JSON.stringify(existingUsers));

    this.showNotification('successModal');
    this.userRegistrationForm.reset();
    this.router.navigate(['/']);
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
  
    const loginValues = this.loginForm.value;
    const storedUsers = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
    // Buscar el usuario en la lista
    const user = storedUsers.find(
      (u: any) =>
        u.email === loginValues.nombreUsuario &&
        u.password === loginValues.password
    );
  
    if (user) {
      // Guardar datos de sesión en localStorage
      localStorage.setItem('sesionActiva', 'true');
      localStorage.setItem('userData', JSON.stringify(user));
      this.username = user.nombreCompleto;
      this.isLoggedIn = true;
      window.dispatchEvent(new Event('storage'));
  
      // Cerrar el modal correctamente
      const modalElement = document.getElementById('loginModal');
      if (modalElement) {
        const modalInstance = new window.bootstrap.Modal(modalElement);
        modalInstance.hide(); 
      }
  
 
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      this.cleanModalArtifacts();
      this.router.navigate(['/']);
    } else {
     
      this.showNotification('logoutModal');
    }
  }

  


  private showNotification(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new window.bootstrap.Modal(modalElement);
      modalInstance.show();
    } else {
      console.error(`No se encontró el modal con ID: ${modalId}`);
    }


  }
  
  

  isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  private showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000); 
  }

  private cleanModalArtifacts(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove('modal-open');
  }
  
}
