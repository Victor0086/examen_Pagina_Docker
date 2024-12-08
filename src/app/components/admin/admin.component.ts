import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  myForm!: FormGroup; 
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  trackingForm!: FormGroup;
  adminUser: string | null = null;
  updateMessage: string = '';
  purchases: any[] = [];
  username: string | null = null; 
  isLoggedIn: boolean = false;

  constructor(private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.checkAdminSession();
    this.initForms();
    this.loadPurchases();
      // Inicializar el FormGroup con el control "trackingNumber"
      this.myForm = this.fb.group({
        trackingNumber: ['', Validators.required],
      });
    
  }

  
  private initForms(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    

    this.registerForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      nombreUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, this.validarEdad(13, 100)]],
      direccion: [''],
      rol: ['', Validators.required],
    });

    this.trackingForm = this.fb.group({
      trackingNumber: ['', Validators.required],
      orderStatus: ['', Validators.required],
    });
  }

  private checkAdminSession(): void {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const loggedInUser = localStorage.getItem('loggedInUser');
  
    if (isAdminLoggedIn && loggedInUser) {
      this.adminUser = loggedInUser || 'Admin'; 
    } else {
      this.adminUser = null; 
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

  // Validar inicio de sesión del administrador
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      alert('Por favor, ingresa las credenciales correctamente.');
      return;
    }

    const { username, password } = this.loginForm.value;

    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('loggedInUser', 'Admin');
      window.dispatchEvent(new Event('storage'));
      this.adminUser = 'Admin';
      alert('Inicio de sesión exitoso.');
      this.router.navigate(['/admin']);
    } else {
      alert('Nombre de usuario o contraseña incorrectos.');
    }
  }

  // Registrar un nuevo usuario
  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();


          // Mostrar el modal de validación
    const modalElement = document.getElementById('validationModal');
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
    return;
    }

    const formValues = this.registerForm.value;

    if (formValues.password !== formValues.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const usuario = {
      nombreCompleto: formValues.nombreCompleto,
      nombreUsuario: formValues.nombreUsuario,
      email: formValues.email,
      password: formValues.password,
      fechaNacimiento: formValues.fechaNacimiento,
      rol: formValues.rol,
    };

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert(`Usuario registrado exitosamente con el rol: ${formValues.rol}`);
    this.registerForm.reset();
  }

  // Actualizar el estado de un pedido
  updateOrderStatus(): void {
    if (this.trackingForm.invalid) {
      this.trackingForm.markAllAsTouched();
      alert('Por favor, completa todos los campos del seguimiento.');
      return;
    }

    const trackingValues = this.trackingForm.value;
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    const order = purchases.find(
      (order: any) => order.trackingNumber === trackingValues.trackingNumber
    );

    if (order) {
      order.status = trackingValues.orderStatus;
      localStorage.setItem('purchases', JSON.stringify(purchases));
      this.updateMessage = 'Estado actualizado correctamente.';
    } else {
      this.updateMessage = 'Número de seguimiento no encontrado.';
    }
  }

  redirectToHome(): void {
    this.router.navigate(['/']);
  }

  // Restablece un formulario específico
  resetForm(form: FormGroup): void {
    form.reset();
    console.log('Formulario limpiado');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Formulario enviado:', this.loginForm.value);
    } else {
      console.log('Formulario inválido');
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      // Actualiza la sesión en el almacenamiento local
      localStorage.setItem('sesionActiva', 'false');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('storage'));
      this.adminUser = null; 
      this.router.navigate(['/']); 
  
      // Reinicia variables locales
      this.username = null;
      this.isLoggedIn = false;
  
      // Disparar el evento 'storage' para sincronización entre pestañas
      window.dispatchEvent(new Event('storage'));
  
      // Disparar el modal de éxito
      const modalElement = document.getElementById('logoutSuccessModal');
      if (modalElement) {
        const modalInstance = new window.bootstrap.Modal(modalElement);
        modalInstance.show();
      }
  
      // Redirige a la página principal después de un tiempo (opcional)
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000); // Cambia el tiempo según sea necesario
    }
  }
  
  // Sincronizar cierre de sesión entre pestañas
  private syncLogout(event: StorageEvent): void {
    if (event.key === 'sesionActiva') {
      const isActive = event.newValue === 'true';
      if (!isActive) {
        console.log('Sincronizando cierre de sesión');
        this.username = null;
        this.isLoggedIn = false;
  
        const modalElement = document.getElementById('logoutSuccessModal');
        if (modalElement) {
          const modalInstance = new window.bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      }
    }
  }
  
  // Verifica si el entorno es el navegador
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  

  private loadPurchases(): void {
    const storedPurchases = localStorage.getItem('purchases');
    this.purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
  }


    // Redirigir al perfil del usuario
    goToProfile(): void {
      if (this.isLoggedIn) {
        this.router.navigate(['/user']);
      } else {
        alert('Por favor, inicie sesión primero.');
      }
    }
}
