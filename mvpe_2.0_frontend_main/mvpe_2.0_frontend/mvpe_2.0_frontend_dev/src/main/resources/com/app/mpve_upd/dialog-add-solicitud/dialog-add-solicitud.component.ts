import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { Solicitud } from 'src/app/modelo/solicitud';
import { Persona } from 'src/app/modelo/persona';
import { AuthService } from 'src/app/service/auth.service';
import { Usuario } from 'src/app/modelo/usuario';
import { TipoSolicitudService } from 'src/app/service/tipo-solicitud.service';
import { TipoSolicitud } from 'src/app/modelo/tipo-solicitud';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { FechaCorteDto } from 'src/app/modelo/fecha-corte-dto';
import { ParametroService } from 'src/app/service/parametro.service';
import { DateUtilService } from 'src/app/service/date-util.service';
import { SustentoSolicitud } from 'src/app/modelo/sustento-solicitud';
import { Empleado } from 'src/app/modelo/empleado';
import { SolicitudService } from 'src/app/service/solicitud.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Incidente } from 'src/app/modelo/incidente';
import { IncidenteDto } from 'src/app/modelo/incidente-dto';
import { IncidenteService } from 'src/app/service/incidente.service';
import { DiaNoLaborableService } from 'src/app/service/dia-no-laborable.service';
import { InvokeMethodExpr } from '@angular/compiler';
import { DetalleTipoSolicitud } from 'src/app/modelo/detalle-tipo-solicitud';
import { ContratoService } from 'src/app/service/contrato.service';
import { UnidadOrganica } from 'src/app/modelo/unidad-organica';
import { EmpleadoContratoDto } from 'src/app/modelo/empleado-contrato-dto';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UnidadOrganicaService } from 'src/app/service/unidad-organica.service';
import { startWith, map, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { DialogoConfirmacionComponent } from 'src/app/modulo/generico/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from "@angular/material/dialog";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { runInThisContext } from 'vm';
import { resolve } from 'dns';
import { Reporte } from 'src/app/modelo/reporte';
import { ReporteService } from 'src/app/service/reporte.service';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { ReporteVacacionesEmpleado } from 'src/app/modelo/reporte-vacaciones-empleado';
import { VacacionesService } from 'src/app/service/vacaciones.service';
import { PeriodoDto } from 'src/app/modelo/periodo-dto';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-add-solicitud',
  templateUrl: './dialog-add-solicitud.component.html',
  styleUrls: ['./dialog-add-solicitud.component.scss']
})
export class DialogAddSolicitudComponent implements OnInit {


  @ViewChild('inputFile') myInputVariable: ElementRef;
 // @ViewChild('matCheckBox') matCheckBox: ElementRef;
  loaded = 0;
  periodoSeleccionado: PeriodoDto = new PeriodoDto();
  public solicitud:Solicitud;
  private usuario:Usuario;
  fechaCorte:FechaCorteDto = new FechaCorteDto;
  public sustento1 = new SustentoSolicitud();
  public sustento2 = new SustentoSolicitud();
  public sustento3 = new SustentoSolicitud();
  public loading = false;
  tiposSolicitud: TipoSolicitud[];
  sustentos: SustentoSolicitud[] = new Array();
  esJustificacion:boolean = false;
  incidentes:IncidenteDto[];
  incidentesSeleccionados:IncidenteDto[] = new Array ();
  selectedOption;
  isPermiso:boolean = true;

  fechaInicio: Date;
  fechaFin: Date;
  fechaMaximo: Date;
  fechaMinimo: Date;
  numeroArchivo: number = 0;
  incidenteSinIncidente:IncidenteDto = new IncidenteDto();
  tipoSeleccionado:number = 0;
  horaIngresoSeleccionado:string;
  horaSalidaSeleccionado:string;
  fCalendario :string;

  public selectEmpleado:boolean = false;
  public verSubGerencia:boolean = false;
  public gerencias: UnidadOrganica[];
  public gerencia: UnidadOrganica = new UnidadOrganica();
  public subGerencia: UnidadOrganica = new UnidadOrganica();
  public subGerencias: UnidadOrganica[];
  public uuooTodos: UnidadOrganica = new UnidadOrganica();
  public empleadoContratoDto: EmpleadoContratoDto = new EmpleadoContratoDto();
  options : EmpleadoContratoDto[];
  filteredOptions: Observable<EmpleadoContratoDto[]>;
  emp = new FormControl({value: '', disabled: true}, []);
  public idTipoRegimen:number = 0;
  public empleadoSeleccionado:EmpleadoContratoDto = new EmpleadoContratoDto();
  public solicitudEmpleado:Solicitud;
  public empleadosReportes: ReporteVacacionesEmpleado[] = new Array();

  constructor(
    public dialogRef: MatDialogRef<DialogAddSolicitudComponent>,
    @Inject(MAT_DIALOG_DATA) public empleado: Empleado,
    public authService:AuthService,
    private tipoSolicitudService: TipoSolicitudService,
    private toastr: ToastrService,
    private datepipe: DatePipe,
    private parametroService:ParametroService,
    private dateUtilService:DateUtilService,
    private solicitudService:SolicitudService,
    private incidenteService:IncidenteService,
    private diaNoLaborableService:DiaNoLaborableService,
    private contratoService:ContratoService,
    private unidadOrganicaService: UnidadOrganicaService,
    private reporteService: ReporteService,
    private vacacionesService: VacacionesService,
    public dialogo: MatDialog
  ) {
    this.parametroService.obtenerFechaCorteDto();
    this.fechaCorte = this.parametroService.fechaCorteDto;
    //console.log(this.fechaCorte);
    this.fechaMaximo= this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaActual);
    this.fechaMaximo.setMonth(this.fechaMaximo.getMonth() + 6);
    this.fechaMinimo = (this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaInicioCorte));
    this.solicitud = new Solicitud();
    this.solicitud.tipo=1;
    this.incidenteSinIncidente.id = 0;
    this.incidenteSinIncidente.nombreTipoIncidente='NINGUNO';
    //this.incidentesSeleccionados.push(this.incidenteSinIncidente);
    this.tipoSeleccionado=0;
    if(this.empleado != null && (this.empleado.fechaIngreso != undefined || this.empleado.fechaIngreso != "")){
      if(this.fechaMinimo < this.dateUtilService.convertirStringToDate(this.empleado.fechaIngreso) ){
        this.fechaMinimo = this.dateUtilService.convertirStringToDate(this.empleado.fechaIngreso) ;
      }
    }
    if(this.empleado != null && this.empleado.id > 0){
      this.idTipoRegimen = this.empleado.idTipoRegimen;
    }
   }

  ngOnInit(): void {
    if(this.authService.isAuthenticated()){
      this.usuario = this.authService.usuario;
    }else {
      this.dialogRef.close();
    }

    console.log(this.empleado);

    if(this.empleado.id ==0){
      this.selectEmpleado = true;
      this.listarGerencia();
    }else{
      if(this.empleado.idSolicitud != null){

        this.loadDataEmpleado();
      }else{
        if(this.empleado.fechaCalendario != undefined){
          this.obtenerIncidentePorEmpleadoMesAnio();
        }else {
          this.obtenerIncidentePorEmpleado();
        }

      }

    }
    this.cargarTipoSolicitud(24);
  }

  async loadDataEmpleado(){

    this.empleadoSeleccionado = await this.obtenerContratoVigente();
    this.empleadoSeleccionado.nombresEmpleado = this.empleado.persona.nombres;
    this.gerencia.siglas = this.empleadoSeleccionado.nombreGerencia;
    this.gerencias = [this.gerencia];
    this.idTipoRegimen = this.empleadoSeleccionado.tipoContrato;

    if(this.empleadoSeleccionado.codSubGerencia != null){
      this.verSubGerencia = true;
      this.subGerencia.siglas = this.empleadoSeleccionado.nombreSubGerencia;
      this.subGerencias = [this.subGerencia];
    }
    this.options = [this.empleadoSeleccionado];
    this.getSolicitud();
  }

  async getSolicitud(){
    const data = new FormData();
    data.set('idSolicitud', this.empleado.idSolicitud.toString());
    this.solicitudEmpleado = await new Promise((resolve, reject) => {
      this.solicitudService.getSolicitudById(data).subscribe(
        (data) => {
          resolve(data);
      });
    });

    this.incidentes = await new Promise((resolve,reject)=>{
      this.incidenteService.listIncidentePorEmpleadoSolicitudFC(this.empleado.id, this.empleado.idSolicitud).subscribe(
        (data)=>{
          resolve(data);
      });
    });

    this.solicitud.id = this.solicitudEmpleado.id;
    this.solicitud.idTipoSolicitud = this.solicitudEmpleado.idTipoSolicitud;
    this.solicitud.idDetalleTipoSolicitud = this.solicitudEmpleado.idDetalleTipoSolicitud;
    this.solicitud.horaInicio = this.solicitudEmpleado.horaInicio;
    this.solicitud.horaFin = this.solicitudEmpleado.horaFin;
    this.solicitud.detalle = this.solicitudEmpleado.detalle;

    if(this.solicitudEmpleado.sustentos[0]!= null){
      this.sustento1 = this.solicitudEmpleado.sustentos[0];
    }
    if(this.solicitudEmpleado.sustentos[1]!= null){
      this.sustento2 = this.solicitudEmpleado.sustentos[1];
    }
    if(this.solicitudEmpleado.sustentos[2]!= null){
      this.sustento3 = this.solicitudEmpleado.sustentos[2];
    }

    //Si es justificación
    let tipoIncidente;

    if(this.solicitudEmpleado.tipo == 0){
      for(let i of this.solicitudEmpleado.incidentes){

        for(let inc of this.incidentes){

          if(i.id == inc.id){
            tipoIncidente = inc.idTipoIncidente;
            this.seleccionarIncidencia(inc);
            await new Promise(r => setTimeout(r, 300));
          }
        }
      }

      if(tipoIncidente==undefined){
        tipoIncidente=14;
      }
    }else{
      tipoIncidente = 24;
      this.seleccionarPermiso();
      this.fechaInicio = this.dateUtilService.convertirStringToDate(this.solicitudEmpleado.fechaInicio);
      this.fechaFin = this.dateUtilService.convertirStringToDate(this.solicitudEmpleado.fechaFin);
    }

    this.cargarCombosParaMostrarSolicitud(this.solicitud.idTipoSolicitud,tipoIncidente,this.solicitud.idDetalleTipoSolicitud);
  }

  listarGerencia() {
    this.gerencia.nivel = 1;
    this.unidadOrganicaService.list(this.gerencia).subscribe(
      data => {
      this.gerencias = data;
    });
  }

  async changeGerencia() {
    this.verSubGerencia = true;
    this.empleadoContratoDto.codGerencia = this.gerencia.id;
    this.empleadoContratoDto.codSubGerencia = 0;
    let subgerencia = new UnidadOrganica();
    subgerencia.nivel = 2;
    subgerencia.idPadre = this.gerencia.id;
    this.subGerencias = await new Promise((resolve, reject) => {
      this.unidadOrganicaService.list(subgerencia).subscribe(
        (data) => {
          resolve(data);
      });
    });
    this.empleado.id=0;
    this.listarEmpleados();
  }

  changeSubGerencia() {
      if(this.subGerencia==undefined)
      this.subGerencia.id = 0;

    this.empleadoContratoDto.codSubGerencia = (this.subGerencia.id != undefined)?this.subGerencia.id:0;
    this.empleado.id=0;
    this.listarEmpleados();
  }

  changeEmpleado() {
  this.empleado.id=2;
  }

  listarEmpleados() {
    //this.optionsIntegrantes = [];
    this.contratoService.listEmpleados(this.empleadoContratoDto).subscribe(data=>{
      this.options = data;
      this.emp = new FormControl({value: '', disabled: false}, []);
      this.loadData();
      this.empleadoSeleccionado = new EmpleadoContratoDto();
    })
  }

  loadData(){
    this.filteredOptions = this.emp.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.nombresEmpleado),
        map(nombresEmpleado => nombresEmpleado ? this._filter(nombresEmpleado) : this.options.slice())
      );
  }

  private _filter(nombresEmpleado: string): EmpleadoContratoDto[] {
    const filterValue = nombresEmpleado.toLowerCase();
    if(filterValue.trim().length<=1){
      this.empleado.id=2;
    }
    return this.options.filter(option => option.nombresEmpleado.toLowerCase().indexOf(filterValue) === 0);
  }

  displayFn(user: EmpleadoContratoDto): string {
    return user && user.nombresEmpleado ? user.nombresEmpleado : '';
  }

  onSelectionChange(event){
    this.empleado.id = this.empleadoSeleccionado.idEmpleado;
    let persona = new Persona();
    persona.genero = this.empleadoSeleccionado.genero;
    this.empleado.persona = persona;
    this.empleado.idTipoRegimen = this.empleadoSeleccionado.tipoContrato;
    this.empleado.horarioIngreso = this.empleadoSeleccionado.horarioIngreso;
    this.empleado.horarioSalida = this.empleadoSeleccionado.horarioSalida;
    this.idTipoRegimen = this.empleado.idTipoRegimen;
    if(this.empleadoSeleccionado != null && (this.empleadoSeleccionado.fechaIngreso != undefined || this.empleadoSeleccionado.fechaIngreso != "")){
      if(this.fechaMinimo < this.dateUtilService.convertirStringToDate(this.empleadoSeleccionado.fechaIngreso) ){
        this.fechaMinimo = this.dateUtilService.convertirStringToDate(this.empleadoSeleccionado.fechaIngreso) ;
      }
    }
    this.obtenerIncidentePorEmpleado();
    this.limpiarCampos();
  }

  obtenerIncidentePorEmpleado(){
    this.incidenteService.listIncidentePorEmpleadoFechaCorte(this.empleado.id).subscribe(data=>{
      if(data != null){
        this.incidentes = data;
      }
    });
  }

  obtenerIncidentePorEmpleadoMesAnio(){
    this.incidenteService.listIncidentePorEmpleadoMesAnio(this.empleado.id,this.empleado.fechaCalendario).subscribe(data=>{
      if(data != null){
        this.incidentes = data;
      }
    });
  }

  obtenerIncidentePorEmpleadoYSolicitud(){
    this.incidenteService.listIncidentePorEmpleadoSolicitudFC(this.empleado.id, this.empleado.idSolicitud).subscribe(data=>{
      if(data != null){
        this.incidentes = data;
      }
    });
  }

  async cargarCombosParaMostrarSolicitud(id:number, idIncidente:number, idDetalleTipoSolicitud:number){
    console.log("id: "+idIncidente);
    this.cargarTipoSolicitud(idIncidente);
    await new Promise(r => setTimeout(r, 300));

    this.detalleTipoSeleccionado = new DetalleTipoSolicitud();
      let nombre :string ="seleccionar";
      if(this.tiposSolicitud != undefined){
        this.tiposSolicitud.forEach(tipo=>{
        if(id == tipo.id){
            this.tipoSolicitudSeleccionado = tipo;
            if(this.tipoSolicitudSeleccionado.listaDetalle != undefined && this.tipoSolicitudSeleccionado.listaDetalle != null){
              this.tipoSolicitudSeleccionado.listaDetalle.forEach(tipoDetalle=>{
                if(idDetalleTipoSolicitud != undefined && tipoDetalle.id == idDetalleTipoSolicitud){
                  this.detalleTipoSeleccionado = tipoDetalle;
                }
              })
            }
          nombre = tipo.nombre;
        }
      });

      if(this.tipoSolicitudSeleccionado.nombre == 'DUELO' || this.tipoSolicitudSeleccionado.id==13){
        const contrato = await this.obtenerContratoVigente();
        // @ts-ignore
        if(contrato != null && contrato.sindicato){
          this.perteneceSindicato=false;
        } else {
          this.perteneceSindicato=false;
        }
        this.fechaMaximo= this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaActual);
      } else {
        this.fechaMaximo= this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaActual);
        this.fechaMaximo.setMonth(this.fechaMaximo.getMonth() + 6);
      }
    }
  /* if(this.tipoSolicitudSeleccionado != null && this.tipoSolicitudSeleccionado.muestraHorario){
     this.solicitud.horaInicio = this.empleado.horarioIngreso;
     this.solicitud.horaFin = this.empleado.horarioSalida;
   } else {
     this.solicitud.horaInicio =undefined;
     this.solicitud.horaFin = undefined;
   }*/
  }

 async selectMotivo(id:number){
  if(this.isPermiso){
    this.fechaInicio = null;
    this.fechaFin = null;
  }

  this.detalleTipoSeleccionado = new DetalleTipoSolicitud();
  let nombre :string ="seleccionar";
  if(this.tiposSolicitud != undefined){
      this.tiposSolicitud.forEach(tipo=>{
        if(id == tipo.id){
          this.tipoSolicitudSeleccionado = tipo;
          if(this.tipoSolicitudSeleccionado.listaDetalle != undefined && this.tipoSolicitudSeleccionado.listaDetalle != null && this.tipoSolicitudSeleccionado.listaDetalle.length == 1){
            this.detalleTipoSeleccionado =this.tipoSolicitudSeleccionado.listaDetalle[0];
          }
          nombre = tipo.nombre;
        }
      });

      if(this.tipoSolicitudSeleccionado.id == 11 ||
          this.tipoSolicitudSeleccionado.id == 15  ||
          this.tipoSolicitudSeleccionado.id == 13 ){
          this.seleccionarPermiso();
      }

      if(this.tipoSolicitudSeleccionado.nombre == 'DUELO' || this.tipoSolicitudSeleccionado.id==13){
        const contrato = await this.obtenerContratoVigente();
        // @ts-ignore
        if(contrato != null && contrato.sindicato){
          this.perteneceSindicato=false;
        } else {
          this.perteneceSindicato=false;
        }
        this.fechaMaximo= this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaActual);
      } else {
        this.fechaMaximo= this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaActual);
        this.fechaMaximo.setMonth(this.fechaMaximo.getMonth() + 6);
      }
  }

    if(this.tipoSolicitudSeleccionado != null && this.tipoSolicitudSeleccionado.muestraHorario){
      this.solicitud.horaInicio = this.empleado.horarioIngreso;
      this.solicitud.horaFin = this.empleado.horarioSalida;
    } else {
      this.solicitud.horaInicio =undefined;
      this.solicitud.horaFin = undefined;
    }
  }
  tipoSolicitudSeleccionado:TipoSolicitud = new TipoSolicitud();


  async  seleccionarFechaInicio(){
     if(this.isPermiso){
      if(this.detalleTipoSeleccionado != undefined && this.detalleTipoSeleccionado != null){
        if(this.fechaInicio != null && !this.detalleTipoSeleccionado.esDiaHabil && this.detalleTipoSeleccionado.muestraFechaAutomatico){
          let fechaInicioNuevoString = this.dateUtilService.convertirDateToString(this.fechaInicio);
          let fechaInicioNuevoDate = this.dateUtilService.convertirStringToDate(fechaInicioNuevoString);

          this.fechaFin = fechaInicioNuevoDate;
          this.fechaFin.setDate(this.fechaFin.getDate() + (this.detalleTipoSeleccionado.numeroDias-1));
        }

        if(this.fechaInicio != null && this.detalleTipoSeleccionado.esDiaHabil){
            let fechaFinString = await this.sumarDiasHabiles(this.fechaInicio,this.detalleTipoSeleccionado.numeroDias);
            this.fechaFin = this.dateUtilService.convertirStringToDate(fechaFinString);
        }
      }
     }
  }

    detalleTipoSeleccionado:DetalleTipoSolicitud;
    perteneceSindicato:boolean=false;
    async selectDetalleTipoSolicitud(){
      if(this.perteneceSindicato){
        this.detalleTipoSeleccionado.numeroDias = this.detalleTipoSeleccionado.numeroDias + 2;
      }
      this.seleccionarFechaInicio();
    }

    async obtenerContratoVigente(){
      const contrato = await this.contratoService.getContratoVigentePorEmpleado(this.empleado.id);
      console.log('El contrato es...',contrato);
      return contrato;
    }

    async validarArchivo(file){
      const data = await this.contratoService.validarArchivo(file, 0, 0);
      return data;
    }

    async handleInputChange(e) {
      //console.log("ss");
      var respt = await this.validarArchivo(e.target.files[0]);
      if(respt){
        if(respt.codigo == -1){
          this.toastr.clear();
          this.toastr.error(respt.mensaje, 'Error', {timeOut: 5000, progressBar: true, closeButton: true});
          return;
        }
      }
      var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
      var pattern = ['image/jpeg','image/png', 'application/pdf'];
      console.log("vdcp1-> ",pattern.indexOf(file.type));
      if (pattern.indexOf(file.type)=== -1) {
        this.toastr.clear();
          //vdcpthis.toastr.error("Está intentando subir un archivo malicioso, si continúa se le bloqueará su cuenta.", 'Error', {timeOut: 5000, progressBar: true, closeButton: true});
          this.toastr.warning("Tipo de Archivo no Permitido. Solo puede adjuntar .jpg, .png, .pdf", 'Advertencia', {
            timeOut: 5000, progressBar: true, closeButton: true
          });
        return;
      }

      //4MB
      if ((file.size / 1024) >4096 ) {
        this.myInputVariable.nativeElement.value = '';
        this.toastr.clear();
          this.toastr.warning("Tamaño de archivo no permitido. El límite de tamaño de archivo es de 4 MB.", 'Advertencia', {
            timeOut: 5000, progressBar: true, closeButton: true
          });
        return;
      }

      if (this.numeroArchivo == 3) {
        this.myInputVariable.nativeElement.value = '';
        this.toastr.clear();
          this.toastr.warning("Solo se permiten 3 archivos", 'Advertencia', {
            timeOut: 5000, progressBar: true, closeButton: true
          });
        return;
      }

      if(file.name.trim().length>50){
        this.myInputVariable.nativeElement.value = '';
        this.toastr.clear();
        this.toastr.warning("Nombre de archivo muy extenso. Solo debe tener 50 caracteres (incluido la extensión del archivo .jpg, .png, .pdf).", 'Advertencia', {
          timeOut: 5000, progressBar: true, closeButton: true
        });
      return;
      }

      if(this.sustento1.nombreArchivoOriginal != undefined){
        if(this.sustento1.nombreArchivoOriginal == file.name){
          this.myInputVariable.nativeElement.value = '';
          this.toastr.clear();
          this.toastr.warning("Archivo Duplicado. Ya tiene un archivo adjunto con el mismo nombre.", 'Advertencia', {
            timeOut: 5000, progressBar: true, closeButton: true
          });
        return;
        }
      }

      if(this.sustento2.nombreArchivoOriginal != undefined){
        if(this.sustento2.nombreArchivoOriginal == file.name){
          this.myInputVariable.nativeElement.value = '';
          this.toastr.clear();
          this.toastr.warning("Archivo Duplicado. Ya tiene un archivo adjunto con el mismo nombre.", 'Advertencia', {
            timeOut: 5000, progressBar: true, closeButton: true
          });
        return;
        }
      }

      if(this.sustento3.nombreArchivoOriginal != undefined){
        if(this.sustento3.nombreArchivoOriginal == file.name){
          this.myInputVariable.nativeElement.value = '';
          this.toastr.clear();
          this.toastr.warning("Archivo Duplicado. Ya tiene un archivo adjunto con el mismo nombre", 'Advertencia', {
          timeOut: 5000, progressBar: true, closeButton: true

          });
        return;
        }
      }

      this.numeroArchivo++;

      if (this.sustento1.imgSrc == undefined) {
          this.sustento1.tipoArchivo = file.type;
          this.sustento1.nombreArchivoOriginal = file.name.trim();
      }
      else if (this.sustento2.imgSrc == undefined) {
        this.sustento2.tipoArchivo = file.type;
        this.sustento2.nombreArchivoOriginal = file.name.trim();
      }
      else if (this.sustento3.imgSrc == undefined) {
        this.sustento3.tipoArchivo = file.type;
        this.sustento3.nombreArchivoOriginal = file.name.trim();
      }
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e) {
    let reader = e.target;
    if (this.sustento1.imgSrc == undefined) {
      this.sustento1.imgSrc = reader.result;
      this.myInputVariable.nativeElement.value = '';
    } else if (this.sustento2.imgSrc == undefined) {
      this.sustento2.imgSrc = reader.result;
      this.myInputVariable.nativeElement.value = '';
    } else if (this.sustento3.imgSrc == undefined) {
      this.sustento3.imgSrc = reader.result;
      this.myInputVariable.nativeElement.value = '';
    }
  }

  eliminarImagen(numero: number) {
    if (numero == 1) {
      this.sustento1 = new SustentoSolicitud();
      this.numeroArchivo--;
    }
    if (numero == 2) {
       this.sustento2 = new SustentoSolicitud();
      this.numeroArchivo--;
    }
    if (numero == 3) {
      this.sustento3 = new SustentoSolicitud();
      this.numeroArchivo--;
    }
    this.myInputVariable.nativeElement.value = '';
  }

  mostrarDialogoGuardar(): void {
    this.dialogo
    .open(DialogoConfirmacionComponent, {
      data: `¿Está seguro(a) que desea REGISTRAR la solicitud?`
    })
    .afterClosed()
    .subscribe((confirmado: Boolean) => {
      if (confirmado) {
        this.add();
        //vdcpconsole.log("val1-> ", this.solicitud.idTipoSolicitud)
        } else {

      }
    });
  }

  //boton guardar
  async add() {
    
    this.loading = true;
    
    let mensaje = await this.validarCamposObligatorios();
    // @ts-ignore
    if(mensaje.length > 0){
      this.toastr.clear();
      // @ts-ignore
      this.toastr.warning(mensaje, 'Campos Obligatorios', {
        timeOut: 5000, progressBar: false, closeButton: true,enableHtml:true
      });
      this.loading = false;
      //console.log("01");
    }else {
          
          if (this.sustento1.imgSrc != undefined) {
          this.sustento1.archivo = this.sustento1.imgSrc.split(",")[1];
          this.sustentos[0] = this.sustento1;
        }

        if (this.sustento2.imgSrc != undefined) {
          this.sustento2.archivo = this.sustento2.imgSrc.split(",")[1];
          this.sustentos[1] = this.sustento2;
        }

        if (this.sustento3.imgSrc != undefined) {
          this.sustento3.archivo = this.sustento3.imgSrc.split(",")[1];
          this.sustentos[2] = this.sustento3;
        }
        this.solicitud.sustentos = this.sustentos;
          
        
        this.solicitud.usuarioCreacion=this.usuario.usuario;
        
        if(this.solicitud.idSolicitudAsociada == undefined || this.solicitud.idSolicitudAsociada == null){
          this.solicitud.numeroEnvio = 1;
        }

        if(!this.isPermiso && this.incidentesSeleccionados.length > 0){
          this.solicitud.tipo = 0;
          this.incidentesSeleccionados.forEach(incidenteDto=>{
            let incidencia = new Incidente();
            incidencia.id = incidenteDto.id;
            this.solicitud.incidentes.push(incidencia);
          })
        } else if(this.isPermiso){
          this.solicitud.tipo=1;
        }

        //console.log("hhh-> ", this.solicitud);
        if(this.solicitud.id != undefined){
          //console.log("ACTUALIZA");
          this.update(this.solicitud); //UPDATE
        } else {
          //console.log("REGISTRO");
          this.insert(this.solicitud); //INSERT
        }
        //this.loading = false;
    }
  }

  async getObtenerVacacionesEmpleado(){
    /*
    this.fCalendario = sessionStorage.getItem("fechaCalendario");
    if(this.fCalendario == undefined || this.fCalendario == ''|| this.fechaCalendario == null){
      this.fCalendario = this.fecha.getMonth()+1 +"/"+this.fecha.getFullYear();
    }
    */
    const fechaActual = new Date();
    const yearActual = fechaActual.getFullYear();

    let totalDiasVacaciones = 0;
    console.log(this.empleado.fechaCalendario);
    let year = this.empleado.fechaCalendario != undefined ? (this.empleado.fechaCalendario).split('/')[1] : yearActual;//(this.empleado.fechaCalendario).substring(2,6);
    let idGerencia = 0;
    let idSubgerencia = 0;
    let tipoContrato = 0;
    let fechaInicial = "01/01/" + year;
    let fechaFinal = "31/12/" + year;
    var idEmpleado = this.empleado.id;
    this.empleadosReportes = await new Promise((resolve,reject)=>{
      this.reporteService.obtenerVacacionesEmpleado(idGerencia,idSubgerencia,tipoContrato,fechaInicial,fechaFinal,idEmpleado).subscribe(
        (data)=>{
          resolve(data);
      });
    });

    this.empleadosReportes.forEach(element => {
      //let dd = new Date(element.fechaPermisoInicio);
      //console.log("FechaPermisoInicio "+element.fechaPermisoInicio+" Mes: "+dd.getMonth()+" Dia: "+dd.getDate()+" Año: "+dd.getFullYear());
      let fechaInicio = moment(element.fechaPermisoInicio.slice(3,5)+"/"+element.fechaPermisoInicio.slice(0,2)+"/"+element.fechaPermisoInicio.slice(6,10));
      let fechaFin = moment(element.fechaPermisoFin.slice(3,5)+"/"+element.fechaPermisoFin.slice(0,2)+"/"+element.fechaPermisoFin.slice(6,10));
      //console.log(fechaFin.diff(fechaInicio,'days')+1);
      totalDiasVacaciones += this.contarDiasRangoFechas(fechaInicio, fechaFin);
    });

    return totalDiasVacaciones;
  }

  async validarCruceFechas(solicitud:Solicitud){
    const data = await this.solicitudService.listSolicitudPorRangoFechaHora(solicitud.fechaInicio,solicitud.fechaFin,solicitud.horaInicio,solicitud.horaFin, this.empleado.id,solicitud.id==null?0:solicitud.id);
    return data;
  }

  async getObtenerDiasNoLaborablesAnual(periodoDto: PeriodoDto){
    const data = await this.vacacionesService.getObtenerDiasNoLaborablesAnual(periodoDto);
    return data;
  }

  async contarDiasHabiles(fechaInicio:Date, fechaFin:Date){
    let data;
    if(fechaInicio > fechaFin){
      data = await this.diaNoLaborableService.contarDiasHabilesEnRangoFechas(this.dateUtilService.convertirDateToString(fechaFin),this.dateUtilService.convertirDateToString(fechaInicio));
    }else {
      data = await this.diaNoLaborableService.contarDiasHabilesEnRangoFechas(this.dateUtilService.convertirDateToString(fechaInicio),this.dateUtilService.convertirDateToString(fechaFin));
    }
    return data;
  }

  async esDiaHabil(fechaInicio:Date){
    const respuesta  =  await this.diaNoLaborableService.esDiaHabil(this.dateUtilService.convertirDateToString(fechaInicio));
    return respuesta;
  }

  async sumarDiasHabiles(fechaInicio:Date, dias:number){
    const fechaFinCalculado  =  await this.diaNoLaborableService.sumarDiasHabiles(this.dateUtilService.convertirDateToString(fechaInicio),dias);
    return fechaFinCalculado.fechaFin;
  }

  async validarCamposObligatorios() {

    let validaHora = true; 
    let mensaje  = "";
    
    if( (this.solicitud.idTipoSolicitud == 3  || this.solicitud.idTipoSolicitud ==7)){
        validaHora = false;
    }
    
    if(this.solicitud.idTipoSolicitud == undefined){
      mensaje = mensaje + "Seleccione MOTIVO.<br/>";
    }
    if(this.fechaInicio == undefined || this.fechaInicio == null){
      mensaje = mensaje + "Ingrese FECHA INICIO.<br/>";
    } else {
      if (this.fechaInicio != null) {
        this.solicitud.fechaInicio = this.dateUtilService.convertirDateToString(this.fechaInicio);
        }
    }
    if(this.fechaFin == undefined || this.fechaFin == null){
      mensaje = mensaje + "Ingrese FECHA FIN.<br/>";
    } else {
      if (this.fechaFin != null) {
        this.solicitud.fechaFin = this.dateUtilService.convertirDateToString(this.fechaFin)
       }
    }
     if(this.tipoSeleccionado == 15 && this.incidentesSeleccionados.length>0 ){
        if( (this.solicitud.horaInicio == undefined || this.solicitud.horaInicio =="")){
          mensaje = mensaje + "Ingrese HORA.<br/>";
        }
      } else {
        if((this.solicitud.horaInicio == undefined  || this.solicitud.horaInicio =="") && validaHora)
          mensaje = mensaje + "Ingrese HORA INICIO.<br/>";

        if((this.solicitud.horaFin == undefined  || this.solicitud.horaFin =="") && validaHora)
          mensaje = mensaje + "Ingrese HORA FIN.<br/>";
      }

    if(this.fechaFin != undefined && this.fechaInicio != undefined){
      if(this.fechaFin < this.fechaInicio){
        mensaje = mensaje + "FECHA FIN debe ser mayor que FECHA INICIO.<br/>";
      }else {
        if(this.tipoSolicitudSeleccionado.id == 14 && this.solicitud.horaInicio != undefined && this.solicitud.horaFin != undefined){
          let cadenaInicioHora = this.solicitud.horaInicio.split(':')[0];
          let cadenaInicioMinutos = this.solicitud.horaInicio.split(':')[1];

          let cadenaFinHora = this.solicitud.horaFin.split(':')[0];
          let cadenaFinMinutos = this.solicitud.horaFin.split(':')[1];

          var a = moment([cadenaFinHora,cadenaFinMinutos], "HH:mm")
          var b = moment([cadenaInicioHora,cadenaInicioMinutos], "HH:mm")

          let restaHora = a.diff(b, 'hours') ;
          let restaMinuto = a.diff(b, 'minutes') ;

          if(this.detalleTipoSeleccionado != null && this.detalleTipoSeleccionado != undefined){
            if(this.detalleTipoSeleccionado.descripcion == 'PARTO MÚLTIPLE'){
              if(restaMinuto > 120 ){
                mensaje = mensaje + "El permiso por lactancia para parto múltiple es máximo dos horas.<br/>";
              }
            } else if(this.detalleTipoSeleccionado.descripcion == 'PARTO ÚNICO'){
              if(restaMinuto > 60 ){
                mensaje = mensaje + "El permiso por lactancia para parto único es máximo una hora.<br/>";
              }
            }
          }
        }
      }
    }

   if(this.solicitud.horaInicio != undefined && this.solicitud.horaFin != undefined){
      if(this.solicitud.horaInicio == "00:00"){
        mensaje = mensaje + "Hora Inicio debe ser diferente de 00:00.<br/>";
      }
      if(this.solicitud.horaFin == "00:00"){
        mensaje = mensaje + "Hora Fin debe ser diferente de 00:00.<br/>";
      }
      if((this.solicitud.horaInicio >= this.solicitud.horaFin) && this.tipoSeleccionado != 15 ){
        mensaje = mensaje + "Hora Fin debe ser mayor que HORA INICIO.<br/>";
      }
    }
    if (this.fechaFin != undefined && this.fechaInicio != undefined && this.solicitud.horaInicio != undefined && this.solicitud.horaFin != undefined ){
      const solicitudes = await this.validarCruceFechas(this.solicitud);
      const solicitudesEncontradas = await this.getObtenerDiasNoLaborablesAnual(this.periodoSeleccionado);
      let tipoSolicitud;
      //console.log(dart);
      console.log(solicitudes);
      if(solicitudes != undefined && solicitudes.length > 0){
        //console.log("idTipoSolicitud: "+this.solicitud.idTipoSolicitud);
        //if(this.solicitud.idTipoSolicitud != 21){ //21 Vacaciones
        solicitudes.forEach(element => {
          if(element.idTipoSolicitud ==5){
            tipoSolicitud = element.idTipoSolicitud;
          }
        });
        //console.log("tipoSolicitud: "+tipoSolicitud);
        if(tipoSolicitud != 5 || solicitudes.length >= 2){
          mensaje = mensaje +"Tiene "+solicitudes.length + " solicitud(es) registrada(s) en la fecha y/o hora seleccionada.<br/>";
        }

      }
    }


    if(this.solicitud.idTipoSolicitud != undefined){
      let tipoSolicitud = this.obtenerTipoSolicitud(this.solicitud.idTipoSolicitud);

      if(tipoSolicitud != undefined && tipoSolicitud.listaDetalle != undefined && tipoSolicitud.listaDetalle.length > 0 ){

        if(this.detalleTipoSeleccionado != undefined && this.detalleTipoSeleccionado != null && this.detalleTipoSeleccionado.id> 0){

          if(!this.detalleTipoSeleccionado.esDiaHabil && this.fechaInicio != null && this.fechaFin != null){
                let dias = this.contarDiasRangoFechas(this.fechaInicio, this.fechaFin);
                //Solo se considera para vacacion de tipo cas
                if(this.tipoSolicitudSeleccionado.id == 21 && this.empleado.idTipoRegimen == 2){
                  this.detalleTipoSeleccionado.numeroDias = 30;
                }

                if(dias > this.detalleTipoSeleccionado.numeroDias && !this.detalleTipoSeleccionado.muestraFechaAutomatico){
                  if(tipoSolicitud.listaDetalle.length == 1){
                    mensaje = mensaje + "Para el MOTIVO: " +tipoSolicitud.nombre +", como máximo puede tomar "+this.detalleTipoSeleccionado.numeroDias+" días calendarios. Ha seleccionado "+dias+" días.<br/>";

                  }else {
                    mensaje = mensaje + "Para el TIPO de " +tipoSolicitud.nombre +" seleccionado, como máximo puede tomar "+this.detalleTipoSeleccionado.numeroDias+" días calendarios. Ha seleccionado "+dias+" días.<br/>";
                  }

                } else {
                  if(dias !=  this.detalleTipoSeleccionado.numeroDias && this.detalleTipoSeleccionado.muestraFechaAutomatico){
                    if(tipoSolicitud.listaDetalle.length == 1){
                      mensaje = mensaje + "Para el MOTIVO: " +tipoSolicitud.nombre +", debe tomar "+this.detalleTipoSeleccionado.numeroDias+" días calendarios. Ha seleccionado "+dias+" días.<br/>";
                    }else {
                      mensaje = mensaje + "Para el TIPO de " +tipoSolicitud.nombre +" seleccionado, debe tomar "+this.detalleTipoSeleccionado.numeroDias+" días calendarios. Ha seleccionado "+dias+" días.<br/>";
                    }
                    if(!this.isPermiso){
                      mensaje = mensaje + "Si no tiene mas incidencias por seleccionar, deberá seleccionar la opción NINGUNO.<br/>"
                    }
                  }
                }
          } else if(this.detalleTipoSeleccionado.esDiaHabil && this.fechaInicio != null && this.fechaFin != null) {
            const numeroDiasHabiles = await this.contarDiasHabiles(this.fechaInicio, this.fechaFin);
            if(numeroDiasHabiles != this.detalleTipoSeleccionado.numeroDias){
              if(tipoSolicitud.listaDetalle.length == 1){
                mensaje = mensaje + "Para el MOTIVO:" +tipoSolicitud.nombre +", debe tomar "+this.detalleTipoSeleccionado.numeroDias+" días hábiles. Ha seleccionado "+numeroDiasHabiles+" días hábiles.<br/>";

              }else {
                mensaje = mensaje + "Para el TIPO de " +tipoSolicitud.nombre +" seleccionado,debe tomar "+this.detalleTipoSeleccionado.numeroDias+" días hábiles. Ha seleccionado "+numeroDiasHabiles+" días hábiles.<br/>";
              }
            }
          }
        }else {
          mensaje = mensaje + "Seleccione TIPO.<br/>";
        }
      }
      /*console.log("TIPOSOL-> ",tipoSolicitud);
      console.log("TIPOSOL-REQSUST-> ",tipoSolicitud.requiereSustento)*/


      if(this.solicitud.detalle == undefined || this.solicitud.detalle.trim() == ""){
        mensaje = mensaje + "Ingrese DETALLE.<br/>";
      }

      if(tipoSolicitud != undefined && tipoSolicitud.requiereSustento){
        console.log("pasoCondicion");
        if( this.sustento2.imgSrc == undefined &&
            this.sustento1.imgSrc == undefined &&
            this.sustento3.imgSrc == undefined){
          mensaje = mensaje +"Adjuntar SUSTENTO.<br/>";
        }
      }
      console.log("No ingresa a la condición");

      if(!this.isPermiso && this.incidentesSeleccionados.length > 0){
        let fechaInicioNuevoString = this.dateUtilService.convertirDateToString(this.fechaInicio);
        let fechaInicioNuevoDate = this.dateUtilService.convertirStringToDate(fechaInicioNuevoString);
        let fechaInicioPrueba = fechaInicioNuevoDate;
        let continuar = true;
        while(fechaInicioPrueba <= this.fechaFin && continuar){
          continuar = await this.buscarIncidenciaSeleccionada(fechaInicioPrueba);
          fechaInicioPrueba.setDate(fechaInicioPrueba.getDate()+1);
        }
        if(!continuar){
          mensaje = mensaje + "Debe seleccionar incidencias con fechas consecutivas.<br/>";
        }
      }
    }

    
    
    /*vdcp 28969
    if(this.solicitud.idTipoSolicitud == 1 && this.solicitud.sustentos.length==0){
      mensaje = mensaje + "Ingrese SUSTENTO.<br/>";
    }*/

    if(this.tipoSolicitudSeleccionado.id == 21){
      let totalDiasVacaciones = 0;
      totalDiasVacaciones = await this.getObtenerVacacionesEmpleado();

      let dias = this.contarDiasRangoFechas(this.fechaInicio, this.fechaFin);
      console.log("dias: "+dias+" totalDiasVacaciones: "+totalDiasVacaciones);
      if(this.idTipoRegimen == 2){ //CAS
        if((dias+totalDiasVacaciones) > 30){
          mensaje = mensaje + "No puede sobrepasar de los 30 dias calendarios.<br/>";
        }
      }else if(this.idTipoRegimen == 1){ //CAP
        if((dias+totalDiasVacaciones) > 53){
          mensaje = mensaje + "No puede sobrepasar de los 53 dias calendarios.<br/>";
        }
      }
      console.log(dias+totalDiasVacaciones);
    }

    return mensaje;
  }

  async buscarIncidenciaSeleccionada(fecha):Promise<boolean>{
    let fechaCadena = this.dateUtilService.convertirDateToString(fecha) ;
    let seEncontro = false;


    this.incidentesSeleccionados.forEach(inc =>{
      if(fechaCadena== inc.fechaIncidente){
         return seEncontro = true;
       }
    })

    if(!seEncontro){
      const respuesta = await this.esDiaHabil(fecha);
      if(!respuesta){
        seEncontro = true;
      }
    }
    return seEncontro;
  }

  contarDiasRangoFechas(fecha1, fecha2):number{
    let fechaInicio = moment(fecha1);
    let fechaFin = moment(fecha2);
    return fechaFin.diff(fechaInicio,'days')+1;
  }

  salir(){
    this.dialogRef.close();
  }

  async insert(solicitud:Solicitud){
    if(this.usuario.isAdmin == 1){
        this.solicitud.admin = true;
      }

      if(this.tipoSeleccionado == 15){
        this.solicitud.horaFin = this.solicitud.horaInicio;
      }
      
      this.solicitud.idEmpleado = this.empleado.id;
      if(this.detalleTipoSeleccionado != null && this.detalleTipoSeleccionado != undefined){
        this.solicitud.idDetalleTipoSolicitud= this.detalleTipoSeleccionado.id;
      }
      this.solicitud.detalle = this.solicitud.detalle.trim();
      this.solicitudService.insert(this.solicitud).subscribe(
        data => {
          this.toastr.clear();
          this.toastr.success(data.mensaje, 'Éxito', {
            timeOut: 5000, progressBar: false, closeButton: true

          });

          this.numeroArchivo = 0;
          this.solicitud= new Solicitud;
          this.solicitud.tipo=1;
          this.limpiarCampos();
          this.obtenerIncidentePorEmpleado();
          this.loading = false;
        }, error => {
          this.loading = false;
          console.log(error);
          
        }

      );
    }


  async update(solicitud:Solicitud){
    if(this.usuario.isAdmin == 1){
        this.solicitud.admin = true;
      }
      if(this.tipoSeleccionado == 15){
        this.solicitud.horaFin = this.solicitud.horaInicio;
      }
      this.solicitud.idEmpleado = this.empleado.id;
      if(this.detalleTipoSeleccionado != null && this.detalleTipoSeleccionado != undefined){
        this.solicitud.idDetalleTipoSolicitud= this.detalleTipoSeleccionado.id;
      }
      this.solicitud.detalle = this.solicitud.detalle.trim();
      this.solicitudService.update(this.solicitud).subscribe(
        data => {
          this.toastr.clear();
          this.toastr.success(data.mensaje, 'Éxito', {
            timeOut: 5000, progressBar: false, closeButton: true
          });

          this.numeroArchivo = 0;
          this.solicitud= new Solicitud;
          this.solicitud.tipo=1;
          this.limpiarCampos();
          this.obtenerIncidentePorEmpleado();
          this.loading = false;
        }, error => {
          console.log(error);
        }
      );
  }

  limpiarCampos(){
    this.sustento1 = new SustentoSolicitud;
    this.sustento2 = new SustentoSolicitud;
    this.sustento3 = new SustentoSolicitud;
    this.solicitud = new Solicitud();
    this.numeroArchivo =0;
    this.solicitud.tipo = 1;
    this.seleccionarPermiso();
    this.cargarTipoSolicitud(24);
    this.detalleTipoSeleccionado = new DetalleTipoSolicitud();
    this.tipoSolicitudSeleccionado = new TipoSolicitud();
    this.incidentesSeleccionados.length=0;
    this.fechaInicio = null;
    this.fechaFin = null;
  }

  //CARGAR COMBOS
  async cargarTipoSolicitud(idTipoIncidente: number) {
    console.log("xx"+this.empleado+'__'+this.empleado.persona+'__'+this.idTipoRegimen+'__'+idTipoIncidente);

   if(this.empleado != undefined && this.empleado.persona != undefined && this.idTipoRegimen > 0){
    //if(this.empleado != undefined && this.empleado.persona != undefined){
    let nivelEnvio=0;

    if(this.usuario.isAdmin == 1){
        nivelEnvio=1;
        console.log(1);
    } else if(this.usuario.isEmpleado == 1){
      nivelEnvio =2;
        console.log(2);
    }
    //console.log('El genero es...',this.empleado.persona.genero);
    //console.log('El cargar tipo solicitud codigoMarcacion es...',this.empleado.codigoMarcacion);
    this.tipoSolicitudService.listPorTipoIncidenteNivelEnvioDetalle(idTipoIncidente,nivelEnvio,this.empleado.persona.genero,this.idTipoRegimen).subscribe(
      data => {
          
          this.tiposSolicitud = data;
          //console.log(this.tiposSolicitud);
          //console.log(this.empleado.persona.edicionPersonal);

          this.tiposSolicitud.forEach((value,index)=>{
            
            if(value.id==21 && this.empleado.persona.edicionPersonal == 'SI') this.tiposSolicitud.splice(index,1);
          });

          if(this.solicitud != undefined && this.solicitud.idTipoSolicitud != undefined){
            let existe = false;
            this.tiposSolicitud.forEach(tipoSolicitud =>{
              if(tipoSolicitud.id == this.solicitud.idTipoSolicitud){
                existe = true;
              }
            });
            if(!existe){
              this.solicitud.idTipoSolicitud = undefined;
            }
          }
          if(this.tiposSolicitud.length == 0){
            this.toastr.clear();
            this.toastr.warning("Ud. no tiene permitido registrar este tipo de justificación, comuníquese con RRHH.", 'Aviso', {
            timeOut: 5000, progressBar: true, closeButton: true
            });
            this.seleccionarPermiso();
          }
        //console.log(data);
      }
    );
   }
  }

  obtenerTipoSolicitud(idTipoSolicitud : number):TipoSolicitud {
    let tipoSolicitudE;
     this.tiposSolicitud.forEach(tipo =>{
       if(idTipoSolicitud == tipo.id){
         tipoSolicitudE = tipo;
       }
     }); return tipoSolicitudE;
  }

  async  seleccionarIncidencia(incidencia:IncidenteDto){
      if(!incidencia.seleccionado){
        if(this.tipoSeleccionado == 0){
           this.cargarTipoSolicitud(incidencia.idTipoIncidente);
          this.tipoSeleccionado = incidencia.idTipoIncidente;
          this.horaIngresoSeleccionado = incidencia.horaIngreso;
          this.horaSalidaSeleccionado = incidencia.horaSalida;
          this.isPermiso = false;
          this.incidentesSeleccionados.push(incidencia);
          this.fechaInicio = this.dateUtilService.convertirStringToDate(incidencia.fechaIncidente);
          this.fechaFin = this.dateUtilService.convertirStringToDate(incidencia.fechaIncidente);
          this.solicitud.tipo = 0;
          incidencia.seleccionado=true;
        } else if(this.tipoSeleccionado > 0 && this.tipoSeleccionado == incidencia.idTipoIncidente){
          const contadorFin = this.restarDias(this.fechaFin,this.dateUtilService.convertirStringToDate(incidencia.fechaIncidente));
          const contadorInicio = this.restarDias(this.fechaInicio,this.dateUtilService.convertirStringToDate(incidencia.fechaIncidente));
          const numeroDiasHabilesFin = await this.contarDiasHabiles(this.fechaFin, this.dateUtilService.convertirStringToDate(incidencia.fechaIncidente));
          const numeroDiasHabilesInicio= await this.contarDiasHabiles(this.fechaInicio, this.dateUtilService.convertirStringToDate(incidencia.fechaIncidente));

          if(Math.abs(contadorFin) > 1 && Math.abs(contadorInicio)>1 && numeroDiasHabilesFin!=2 && numeroDiasHabilesInicio !=2){
             incidencia.seleccionado = false;
              this.toastr.clear();
              this.toastr.warning("Debe seleccionar incidencias con fechas consecutivas.", 'Aviso', {
              timeOut: 2500, progressBar: true, closeButton: true
            });
           }else {
            if(this.horaIngresoSeleccionado != incidencia.horaIngreso || this.horaSalidaSeleccionado != incidencia.horaSalida){
              incidencia.seleccionado = false;
              this.toastr.clear();
              this.toastr.warning("Las incidencias deben haber ocurrido en un mismo horario.", 'Aviso', {
              timeOut: 2500, progressBar: true, closeButton: true

            });

            } else {

              this.fechaFin = this.dateUtilService.convertirStringToDate(incidencia.fechaIncidente);
              incidencia.seleccionado=true;
              this.incidentesSeleccionados.push(incidencia);
            }
          }
          //Validar que tengan las misma hora
          //Se agrega a la lista
        } else if (this.tipoSeleccionado > 0 && this.tipoSeleccionado != incidencia.idTipoIncidente){
          this.toastr.clear();
          this.toastr.warning("Debe seleccionar el mismo tipo de incidencia.", 'Aviso', {
          timeOut: 2500, progressBar: true, closeButton: true

        });
        }
      } else{
        //remover la incidencia
        let index = this.incidentesSeleccionados.indexOf(incidencia);
        incidencia.seleccionado=false;
        this.incidentesSeleccionados.splice(index,1);

      }
      if(this.incidentesSeleccionados.length >0){
        this.esJustificacion = true;
      } else {
        this.isPermiso = true;
        this.esJustificacion = false;
        this.seleccionarPermiso();
      }
      this.mostrarFechaSegunSeleccion();
     }



    restarDias(fecha1, fecha2):number{
      let fechaInicio = moment(fecha1);
      let fechaFin = moment(fecha2);
      return fechaFin.diff(fechaInicio,'days');
    }


    mostrarFechaSegunSeleccion(){
      if(this.incidentesSeleccionados.length == 0){
          this.fechaInicio = null;
          this.fechaFin = null;
      } else {
          this.incidentesSeleccionados.sort((a:IncidenteDto,b:IncidenteDto) => {
          if(this.dateUtilService.convertirStringToDate(a.fechaIncidente) > this.dateUtilService.convertirStringToDate(b.fechaIncidente)){
            return 1;
          }
          if(this.dateUtilService.convertirStringToDate(a.fechaIncidente) <this.dateUtilService.convertirStringToDate(b.fechaIncidente)){
            return -1;
          }
          return 0;
        });
          const tamanioArray = this.incidentesSeleccionados.length;
          this.fechaInicio = this.dateUtilService.convertirStringToDate(this.incidentesSeleccionados[0].fechaIncidente);
          this.fechaFin = this.dateUtilService.convertirStringToDate(this.incidentesSeleccionados[tamanioArray-1].fechaIncidente);
       }
     }

     seleccionarPermiso(){
       this.esJustificacion = false;
       this.isPermiso = true;
       this.tipoSeleccionado=0;
       this.incidentesSeleccionados.length=0;
       this.cargarTipoSolicitud(24);
       this.fechaInicio = null;
       this.fechaFin = null;

       if (this.incidentes != undefined){
        this.incidentes.forEach(incidente =>{
          incidente.seleccionado = false;
        });
       }
     }

     public validarAlfanumerico(e){
        //const regexp: RegExp = /^[a-zA-Z0-9 ñÑáéíóúÁÉÍÓÚ]+$/;
        let input;
        if (e.metaKey || e.ctrlKey) {
            return true;
        }
        if (e.which === 32) {
         return true;
        }
        if (e.which === 0) {
         return true;
        }
        if (e.which < 33) {
          return true;
        }
        input = String.fromCharCode(e.which);
        return !!/[a-zA-Z0-9 ñÑáéíóúÁÉÍÓÚ]/.test(input);
    }
}
