import { NgModule } from '@angular/core';
import { CommonModule,DatePipe } from '@angular/common';
import { MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {MatCardModule} from '@angular/material/card';
import { AsistenciaRoutingModule } from './asistencia-routing.module';
import { AsistenciaComponent } from './asistencia.component';
import { EmpleadoService } from '../../service/empleado.service';
import { ListAsistenciaComponent } from './list-asistencia/list-asistencia.component';
//import { AddComponent } from './add/add.component';
import { MAT_DATE_LOCALE} from '@angular/material/core';
import { AuthInterceptor } from 'src/app/interceptor/auth-interceptor';
import { Ubigeo } from 'src/app/modelo/ubigeo';
import { UbigeoService } from 'src/app/service/ubigeo.service';
import { MatFormFieldModule, MatFormFieldControl } from '@angular/material/form-field';
import { CatalogoService } from 'src/app/service/catalogo.service';
import { UnidadOrganicaService } from 'src/app/service/unidad-organica.service';
import { MatDividerModule } from '@angular/material/divider';
import { TokenInterceptor } from 'src/app/interceptor/token-interceptor';
import { AsistenciaPersonalComponent } from './asistencia-personal/asistencia-personal.component';
import { MiAsistenciaComponent } from './mi-asistencia/mi-asistencia.component';
import { AddSolicitudComponent } from './solicitudes/add-solicitud/add-solicitud.component';
import { AsistenciaService } from 'src/app/service/asistencia.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { DialogAddSolicitudComponent } from './solicitudes/dialog-add-solicitud/dialog-add-solicitud.component';
import { MatListModule } from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CustomDateAdapter } from 'src/app/modelo/custom-date-adapter';


@NgModule({
    declarations: [
    AsistenciaComponent,
    ListAsistenciaComponent,
    AsistenciaPersonalComponent,
    MiAsistenciaComponent,
    AddSolicitudComponent,
    DialogAddSolicitudComponent
   
   //AddComponent
    ],
    imports: [
      CommonModule,
      AsistenciaRoutingModule,
      MatTableModule,
      MatPaginatorModule,
      MatInputModule,
      HttpClientModule,
      MatDatepickerModule,
      MatGridListModule,
      MatNativeDateModule,
      MatCardModule,
      MatButtonModule,
      MatExpansionModule,
      FormsModule,
      ReactiveFormsModule,
      MatIconModule,
      MatSelectModule,
      FlexLayoutModule,
      MatTooltipModule,
      MatFormFieldModule,
      MatDividerModule,
      MatListModule,
      MatCheckboxModule,
      MatAutocompleteModule,
      NgxPaginationModule,
      MatProgressSpinnerModule,
      Ng2SearchPipeModule
    ],
     providers: [
      AsistenciaService,
      UbigeoService, 
      MatDatepickerModule,
      DatePipe,
      CatalogoService,
      UnidadOrganicaService,
      { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
      {provide:HTTP_INTERCEPTORS,useClass:AuthInterceptor,multi:true},
      { provide: MAT_DATE_LOCALE, useValue: 'es-PE'},
      { provide: DateAdapter, useClass: CustomDateAdapter}
    ]
  })
  export class AsistenciaModule {}