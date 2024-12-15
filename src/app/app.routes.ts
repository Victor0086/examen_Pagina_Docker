import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { CarroComponent } from './components/carro/carro.component';
import { IndexComponent } from './components/index/index.component';
import { SegPedidoComponent } from './components/seg-pedido/seg-pedido.component';
import { UserComponent } from './components/user/user.component';
import { ListaPersonasComponent } from './components/lista-personas/lista-personas.component';

import { PerroAlimentosComponent } from './components/productos/perro-alimentos/perro-alimentos.component';
import { PerroJuguetesComponent } from './components/productos/perro-juguetes/perro-juguetes.component';
import { PerroAccesoriosComponent } from './components/productos/perro-accesorios/perro-accesorios.component';
import { GatoAlimentosComponent } from './components/productos/gato-alimentos/gato-alimentos.component';
import { GatoJuguetesComponent } from './components/productos/gato-juguetes/gato-juguetes.component';
import { GatoAccesoriosComponent } from './components/productos/gato-accesorios/gato-accesorios.component';

export const routes: Routes = [
  { path: '', component: IndexComponent }, 
  { path: 'admin', component: AdminComponent },
  { path: 'carro', component: CarroComponent },
  { path: 'seg-pedido', component: SegPedidoComponent },
  { path: 'user', component: UserComponent },
  { path: 'lista-personas', component: ListaPersonasComponent },


  // Rutas para los componentes de Perro
  { path: 'perro/alimentos', component: PerroAlimentosComponent },
  { path: 'perro/juguetes', component: PerroJuguetesComponent },
  { path: 'perro/accesorios', component: PerroAccesoriosComponent },

  // Rutas para los componentes de Gato
  { path: 'gato/alimentos', component: GatoAlimentosComponent },
  { path: 'gato/juguetes', component: GatoJuguetesComponent },
  { path: 'gato/accesorios', component: GatoAccesoriosComponent },
];
