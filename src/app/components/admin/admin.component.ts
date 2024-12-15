import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { JsonService } from '../../services/json.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,HttpClientModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [JsonService]
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
  

  constructor(private router: Router, private fb: FormBuilder,private jsonService: JsonService) {}

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
  
    // Obtiene los usuarios desde localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
    console.log('Credenciales ingresadas:', { email: username, password }); // Debug
    console.log('Usuarios almacenados:', usuarios); 
  
    const usuario = usuarios.find(
      (user: any) => user.email === username && user.password === password
    );
  
    if (usuario) {
      // Guarda los datos del usuario logueado en localStorage
      localStorage.setItem('userData', JSON.stringify(usuario));
      alert(`Inicio de sesión exitoso como ${usuario.nombreCompleto}`);
      
      this.router.navigate([usuario.rol === 'Administrador' ? '/admin' : '/user']);
    } else {
      alert('Correo o contraseña incorrectos.');
    }
  }
  
  
  

  // Registrar un nuevo usuario
  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
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
      direccion: formValues.direccion,
      rol: formValues.rol,
    };
  
    // Determinar el archivo JSON correspondiente según el rol
    let jsonResource: string;
    switch (formValues.rol.toLowerCase()) {
      case 'administrador':
        jsonResource = 'admin';
        break;
      case 'vendedor':
        jsonResource = 'vendedor';
        break;
      case 'soporte al cliente':
        jsonResource = 'soportecliente';
        break;
      default:
        jsonResource = 'users'; // Por defecto, guardar en `users.json`
        break;
    }
  
    // Obtener datos actuales del archivo JSON correspondiente
    this.jsonService.getJsonData(jsonResource as keyof typeof this.jsonService['urls']).subscribe({
      next: (existingUsers: any[]) => {
        console.log(`Usuarios existentes en ${jsonResource}.json:`, existingUsers);
  
        // Agregar el nuevo usuario a la lista
        existingUsers.push(usuario);
  
        // Guardar la lista actualizada en el archivo JSON correspondiente
        this.jsonService.saveJsonData(jsonResource as keyof typeof this.jsonService['urls'], existingUsers).subscribe({
          next: () => {
            alert(`Usuario registrado exitosamente en ${jsonResource}.json.`);
            this.registerForm.reset();
          },
          error: (err) => {
            console.error(`Error al guardar en ${jsonResource}.json:`, err);
            alert('Hubo un problema al registrar el usuario. Intenta nuevamente.');
          },
        });
      },
      error: (err) => {
        console.error(`Error al obtener datos de ${jsonResource}.json:`, err);
        alert('No se pudo cargar los datos existentes. Intenta nuevamente.');
      },
    });
  }
  

  // Actualizar el estado de un pedido
  updateOrderStatus(): void {
    if (this.trackingForm.invalid) {
      this.trackingForm.markAllAsTouched();
      alert('Por favor, completa todos los campos del seguimiento.');
      return;
    }
  
    const trackingValues = this.trackingForm.value;
  
    // Obtener las compras desde S3
    this.jsonService.getJsonData('purchases').subscribe({
      next: (purchases) => {
        // Buscar el pedido por el número de seguimiento
        const order = purchases.find(
          (order: any) => order.trackingNumber === trackingValues.trackingNumber
        );
  
        if (order) {
          // Actualizar el estado
          order.status = trackingValues.orderStatus;
  
          // Guardar los cambios en S3
          this.jsonService.saveJsonData('purchases', purchases).subscribe({
            next: () => {
              alert('Estado actualizado correctamente.');
              this.updateMessage = 'Estado actualizado correctamente.';
  
              // Sincronizar también en LocalStorage
              localStorage.setItem('purchases', JSON.stringify(purchases));
              console.log('Cambios sincronizados con S3 y LocalStorage:', purchases);
  
              // Recargar las compras
              this.loadPurchases();
            },
            error: (err) => {
              console.error('Error al guardar los cambios en S3:', err);
              alert('No se pudo guardar los cambios en el servidor.');
            },
          });
        } else {
          alert('Número de seguimiento no encontrado.');
          this.updateMessage = 'Número de seguimiento no encontrado.';
        }
      },
      error: (err) => {
        console.error('Error al obtener las compras desde S3:', err);
        alert('No se pudo cargar los datos desde el servidor.');
      },
    });
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
