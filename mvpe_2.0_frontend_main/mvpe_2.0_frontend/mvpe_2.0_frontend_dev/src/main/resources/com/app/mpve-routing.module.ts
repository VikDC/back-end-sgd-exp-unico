import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AsistenciaComponent } from './asistencia.component';
import { ListAsistenciaComponent } from './list-asistencia/list-asistencia.component';
import { AddSolicitudComponent } from './solicitudes/add-solicitud/add-solicitud.component';
import { MiAsistenciaComponent } from './mi-asistencia/mi-asistencia.component';
import { AsistenciaPersonalComponent } from './asistencia-personal/asistencia-personal.component';


const routes: Routes = [
    {path:'',component:AsistenciaComponent, children:[
      {path:'',component:ListAsistenciaComponent},
      {path:'solicitud/:idAsistencia/:idEmpleado/:fecha',component:AddSolicitudComponent},
      {path: 'asistencia/:id', component: AsistenciaPersonalComponent},
      {path: 'miAsistencia', component: MiAsistenciaComponent}
      
    ]}
  ];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AsistenciaRoutingModule { }