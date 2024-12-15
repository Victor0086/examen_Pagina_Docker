import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JsonService } from '../../services/json.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [JsonService],
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
  useLocalStorage: boolean = true;

  editUserForm!: FormGroup;
  isEditing: boolean = false;

  constructor(private router: Router, private fb: FormBuilder, private jsonService: JsonService) {
    this.useLocalStorage = this.jsonService.getCurrentStorageMethod();
  }

  ngOnInit(): void {
    console.log('Inicializando componente User...');

    
    this.initForms();
    this.checkUserSession();
    this.loadCartCount();
    this.loadPurchases();

    // Verificar si hay un usuario en sesión activa
    const userData = localStorage.getItem('userData');
    const sesionActiva = localStorage.getItem('sesionActiva') === 'true';

    if (userData && sesionActiva) {
      const user = JSON.parse(userData);
      this.username = user.nombreCompleto;
      this.isLoggedIn = true;
      this.populateEditForm(user); 
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
      window.removeEventListener('storage', this.syncSession.bind(this)); 
      console.log('Destruyendo componente User...');
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private initForms(): void {
    this.userRegistrationForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      nombreUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, this.validarEdad(13, 100)]],
      direccion: [''],
    });

    this.editUserForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      nombreUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required, this.validarEdad(13, 100)]],
      direccion: [''],
    });

    this.loginForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  // Llenar el formulario de edición con los datos del usuario
  private populateEditForm(user: any): void {
    this.editUserForm.patchValue({
      nombreCompleto: user.nombreCompleto,
      nombreUsuario: user.nombreUsuario,
      email: user.email,
      fechaNacimiento: user.fechaNacimiento,
      direccion: user.direccion,
    });
  }

  enableEdit(): void {
    this.isEditing = true;
  }

  saveUserChanges(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }
  
    const updatedUser = this.editUserForm.value;
  
    // Obtener todos los usuarios desde users.json
    this.jsonService.getUsers().subscribe({
      next: (users: any[]) => {
        console.log('Usuarios obtenidos desde users.json:', users);
  
        // Encontrar el usuario actual
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
  
        if (userIndex === -1) {
          console.error('El usuario no se encontró en users.json.');
          alert('El usuario no se encontró. Por favor, inicia sesión de nuevo.');
          return;
        }
  
        // Actualizar los datos del usuario
        users[userIndex] = {
          ...users[userIndex],
          ...updatedUser,
        };
  
        // Guardar los cambios en users.json
        this.jsonService.saveJsonData('users', users).subscribe({
          next: () => {
            console.log('Datos del usuario actualizados en users.json:', users);
  
            // Actualizar el usuario en LocalStorage
            localStorage.setItem('userData', JSON.stringify(users[userIndex]));
            this.username = updatedUser.nombreCompleto; // Actualizar nombre en la interfaz
  
            alert('¡Cambios guardados exitosamente!');
            this.isEditing = false; // Cerrar el modo de edición
          },
          error: (err) => {
            console.error('Error al guardar cambios en users.json:', err);
            alert('Error al guardar los cambios. Por favor, inténtalo más tarde.');
          },
        });
      },
      error: (err) => {
        console.error('Error al obtener usuarios desde users.json:', err);
        alert('Error al cargar los datos de usuario. Por favor, inténtalo más tarde.');
      },
    });
  }
  


  cancelEdit(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.populateEditForm(JSON.parse(userData));
    }
    this.isEditing = false;
  }

  private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  private checkUserSession(): void {
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

  private syncSession(event: StorageEvent): void {
    if (event.key === 'sesionActiva' || event.key === 'userData') {
      this.checkUserSession();
    }
  }

  logout(): void {
    console.log('Cerrando sesión...');
    localStorage.setItem('sesionActiva', 'false');
    this.username = null;
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }


  private loadPurchases(): void {
    this.jsonService.getJsonData('purchases').subscribe({
      next: (data) => {
        this.purchases = data || [];
        console.log('Compras cargadas:', this.purchases);
      },
      error: (err) => {
        console.error('Error al cargar compras:', err);
      },
    });
  }

  private loadCartCount(): void {
    this.jsonService.getJsonData('cart').subscribe({
      next: (data) => {
        this.cartCount = Array.isArray(data)
          ? data.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
          : 0;
        console.log('Carrito cargado:', data);
      },
      error: (err) => {
        console.error('Error al cargar el carrito:', err);
      },
    });
  }

  validarDominioCorreo(control: any) {
    const email = control.value;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) ? null : { dominioInvalido: true };
  }


  private validarEdad(minEdad: number, maxEdad: number) {
    return (control: any) => {
      const fechaNacimiento = new Date(control.value);
      if (isNaN(fechaNacimiento.getTime())) {
        return { fechaInvalida: true };
      }
      const hoy = new Date();
      const edad =
        hoy.getFullYear() -
        fechaNacimiento.getFullYear() -
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
      console.warn('El formulario contiene errores, corrige antes de enviar.');
      this.userRegistrationForm.markAllAsTouched();
      return;
    }
  
    const newUser = this.userRegistrationForm.value;
  
    // Validar si las contraseñas coinciden
    if (newUser.password !== newUser.confirmPassword) {
      this.showAlert('Las contraseñas no coinciden', 'danger');
      console.warn('Las contraseñas no coinciden. Revisa los datos ingresados.');
      return;
    }
  
    console.log('Iniciando registro de usuario...', newUser);
  
    // Obtener usuarios existentes desde S3
    this.jsonService.getUsers().subscribe({
      next: (users: any[]) => {
        console.log('Usuarios existentes obtenidos desde S3:', users);
  
        // Validar si el correo ya está registrado
        if (users.some((u) => u.email === newUser.email)) {
          this.showAlert('Este correo ya está registrado', 'warning');
          console.warn('Intento de registro con un correo ya existente:', newUser.email);
          return;
        }
  
        // Agregar el nuevo usuario
        users.push({
          nombreCompleto: newUser.nombreCompleto,
          nombreUsuario: newUser.nombreUsuario,
          email: newUser.email,
          password: newUser.password,
          fechaNacimiento: newUser.fechaNacimiento,
          direccion: newUser.direccion,
        });
  
        console.log('Actualizando usuarios con el nuevo registro:', users);
  
        // Guardar en S3
        this.jsonService.saveJsonData('users', users).subscribe({
          next: (response) => {
            console.log('Usuario registrado exitosamente en S3:', response);
  
            // Guardar en LocalStorage tras éxito en S3
            localStorage.setItem('usuarios', JSON.stringify(users));
            console.log('Usuario sincronizado en LocalStorage:', users);
  
            // Mostrar notificación de éxito
            this.showNotification('successModal');
            this.userRegistrationForm.reset();
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Error al guardar usuario en S3:', err);
            this.showAlert('Error al guardar usuario en S3.', 'danger');
          },
        });
      },
      error: (err) => {
        console.error('Error al obtener usuarios desde S3:', err);
        this.showAlert('Error al obtener usuarios desde S3.', 'danger');
      },
    });
  }
  
  
  
  
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
  
    const loginValues = this.loginForm.value;
  
    if (this.useLocalStorage) {
      const storedUsers = JSON.parse(localStorage.getItem('usuarios') || '[]');
      const user = storedUsers.find(
        (u: any) =>
          u.email === loginValues.nombreUsuario &&
          u.password === loginValues.password
      );
  
      if (user) {
        localStorage.setItem('sesionActiva', 'true');
        localStorage.setItem('userData', JSON.stringify(user));
        this.username = user.nombreCompleto;
        this.isLoggedIn = true;
        alert('Inicio de sesión exitoso');
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    } else {
      this.jsonService.getUsers().subscribe({
        next: (users: any[]) => {
          console.log('Usuarios obtenidos desde S3:', users);
          const user = users.find(
            (u: any) =>
              u.email === loginValues.nombreUsuario &&
              u.password === loginValues.password
          );
  
          if (user) {
            localStorage.setItem('sesionActiva', 'true');
            localStorage.setItem('userData', JSON.stringify(user));
            this.username = user.nombreCompleto;
            this.isLoggedIn = true;
            alert('Inicio de sesión exitoso');
          } else {
            alert('Usuario o contraseña incorrectos');
          }
        },
        error: (err) => {
          console.error('Error al cargar usuarios desde S3:', err);
          alert('No se pudo autenticar el usuario.');
        },
      });
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
    return this.isLoggedIn && !!this.username;
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

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  openEditModal(): void {
    const modalElement = document.getElementById('editUserModal');
    if (modalElement) {
      const modalInstance = new window.bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }


  addPurchase(cart: any[]): void {
    const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
    console.log('Usuario actual:', currentUser);
  
    if (!currentUser || !currentUser.email) {
      alert('Usuario no autenticado. No se puede registrar la compra.');
      return;
    }
  
    const storedPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    console.log('Compras existentes en localStorage:', storedPurchases);
  
    cart.forEach((item: any) => {
      const newPurchase = {
        producto: item.producto,
        precio: item.precio,
        cantidad: item.cantidad,
        total: item.precio * item.cantidad,
        fecha: new Date().toISOString(),
        status: 'Pendiente',
        trackingNumber: this.generateTrackingNumber(),
        userEmail: currentUser.email, // Asociar la compra al usuario actual
      };
  
      console.log('Nueva compra a agregar:', newPurchase);
      storedPurchases.push(newPurchase);
    });
  
    localStorage.setItem('purchases', JSON.stringify(storedPurchases));
    console.log('Compras guardadas después de finalizar:', storedPurchases);
  
    // Limpia el carrito después de la compra
    localStorage.removeItem('cart');
    this.loadCartCount(); // Actualiza el contador del carrito
    alert('Compra registrada con éxito.');
  }
  
  

  private generateTrackingNumber(): string {
    return 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  
  finalizarCompra(): void {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('Contenido del carrito antes de finalizar la compra:', cart);
  
    if (cart.length === 0) {
      alert('El carrito está vacío. No se puede finalizar la compra.');
      return;
    }
  
    this.addPurchase(cart); // Llama a addPurchase con el carrito
    alert('Compra finalizada.');
    this.loadPurchases(); // Recarga las compras del usuario
  }
  
  


  mostrarEstado(): void {
    console.log('Username:', this.username);
    console.log('isLoggedIn:', this.isLoggedIn);
    console.log('useLocalStorage:', this.useLocalStorage);
  }

}
