import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AsistenciaService } from 'src/app/service/asistencia.service';
import { DatePipe } from '@angular/common';
import { EmpleadoService } from 'src/app/service/empleado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AsistenciaDto } from 'src/app/modelo/asistencia-dto';
import { TipoSolicitud } from 'src/app/modelo/tipo-solicitud';
import { TipoSolicitudService } from 'src/app/service/tipo-solicitud.service';
import { Solicitud } from 'src/app/modelo/solicitud';
import { DateUtilService } from 'src/app/service/date-util.service';
import { DetalleTipoSolicitud } from 'src/app/modelo/detalle-tipo-solicitud';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SolicitudService } from 'src/app/service/solicitud.service';
import { SustentoSolicitud } from 'src/app/modelo/sustento-solicitud';
import { Incidente } from 'src/app/modelo/incidente';
import { AuthService } from 'src/app/service/auth.service';
import { Usuario } from 'src/app/modelo/usuario';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UnidadOrganica } from 'src/app/modelo/unidad-organica';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { EquipoService } from 'src/app/service/equipo.service';
import { DiaNoLaborableService } from 'src/app/service/dia-no-laborable.service';
import { ContratoService } from 'src/app/service/contrato.service';
import { EmpleadoDto } from 'src/app/modelo/empleado-dto';
import { ParametroService } from 'src/app/service/parametro.service';
import { FechaCorteDto } from 'src/app/modelo/fecha-corte-dto';
import { SolicitudEstadoDto } from 'src/app/modelo/solicitud-estado-dto';
import { GestionSolicitudService } from 'src/app/service/gestionSolicitud.service';
import { EmpleadoCardComponent } from 'src/app/modulo/generico/empleado-card/empleado-card.component';
import { DialogoConfirmacionComponent } from 'src/app/modulo/generico/dialogo-confirmacion/dialogo-confirmacion.component';
import { ValorSecuencia } from '../../asistencia-personal/asistencia-personal.component';

@Component({
  providers:[EmpleadoCardComponent ],
  selector: 'app-add-solicitud',
  templateUrl: './add-solicitud.component.html',
  styleUrls: ['./add-solicitud.component.scss']
})
export class AddSolicitudComponent implements OnInit {

  asistencia: AsistenciaDto = new AsistenciaDto();
  tiposSolicitud: TipoSolicitud[];
  sustentos: SustentoSolicitud[] = new Array();
  solicitud: Solicitud = new Solicitud();
  fechaInicio: Date;
  fechaFin: Date;
  horaInicio: Date;
  horaFin: Date;
  files: SustentoSolicitud[];
  public hoy = new Date();
  public fechaHoy: string;
  fechaMaximo: Date;
  fechaMinimo: Date;
  private esDiaPermitido:boolean = false;
  public sustento1 = new SustentoSolicitud();
  public sustento2 = new SustentoSolicitud();
  public sustento3 = new SustentoSolicitud();
  anioFiltro : ValorSecuencia = new ValorSecuencia();
  mesFiltro : ValorSecuencia = new ValorSecuencia();
  public sePuedeReenviar = true;

  public mensajeSolicitud:string = "";
  public marcaciones:string[];
  public empleadoUsuario:EmpleadoDto = new EmpleadoDto();
  
  numeroArchivo: number = 0;
  idIncidenteSeleccionado:number;
  idSolicitudSeleccionado:number;
 
  faltasJustificadas : number = 0;
  faltasNoJustificadas: number = 0;
  tardanzasJustificadas : number = 0;
  tardanzasNoJustificadas : number = 0;

  faltasPorTardanza:number=0;
  faltasPorSalidaAnticipada:number = 0;
  salidasAnticipadas:number=0;
  totalDiasPermiso:number=0;
  listaPermiso:Solicitud[]= new Array;
  enviados: number = 0;
  aprobados:number = 0;
  validados:number = 0;
  rechazados:number =0;
  totalMinutosTardanza: number = 0;
  niveles: number = 3;
  sobretiempo: any;
  horaFinalMensual:any=0;
  minutoFinalMensual:any=0;
  minutosExtra:number=0;
  minutosExtraFinal:any=0;
  minutoingresoEmpleado:any=0;
  minutosalidaEmpleado:any=0;
  minutoingreso:any=0;
  minutosalida:any=0;
  horaingresoEmpleado:any=0;
  horasalidaEmpleado:any=0;
  
  totalSolicitudes:number = 0;
  fecha :Date = new Date();
  fechaCalendario :string;
  fileUrl;
  empleado:EmpleadoDto = new EmpleadoDto();
  imageSrc:string;
  public usuario: Usuario = new Usuario();
  fechaCorte:FechaCorteDto = new FechaCorteDto;
  loading:boolean=false;
  solicitudesRegistradas:Solicitud[];
  mensaje:string="Sin Sustento.";
  @ViewChild('inputFile') myInputVariable: ElementRef;
  @ViewChild('motivo') motivo: ElementRef;
  @ViewChild('horaInicio') iHoraInicio: ElementRef;
  @ViewChild('horaFin') iHoraFin: ElementRef;
  fechaCalendarioDia:string;
  idEmpleado:number;
  codigoMarcacion:string;
  idAsistencia :number;
  dia:string;
  objetoSolicitud= new Array;
  seHabilitaParaRegistro:boolean = false;
  habilitaRegistro:boolean = true;

  constructor(

    private asistenciaService: AsistenciaService,
    private solicitudService: SolicitudService,
    private parametroService:ParametroService,
    private tipoSolicitudService: TipoSolicitudService,
    public authService:AuthService,
    public route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    private datepipe: DatePipe,
    public dialogo: MatDialog,
    private sanitizer:DomSanitizer,
    private equipoService:EquipoService,
    private empleadoService:EmpleadoService,
    private gestionSolicitudService:GestionSolicitudService,
    private dateUtilService:DateUtilService,
    private diaNoLaborableService:DiaNoLaborableService,
    private contratoService:ContratoService) {

    this.idEmpleado = parseInt(this.route.snapshot.paramMap.get('idEmpleado'), 0);
    this.codigoMarcacion = this.route.snapshot.paramMap.get('codigoMarcacion');
   
    this.fechaCalendarioDia = this.route.snapshot.paramMap.get('fecha');  
    this.dia =""+ this.dateUtilService.convertirStringToDate(this.fechaCalendarioDia).getDate();
    this.idAsistencia = parseInt(this.route.snapshot.paramMap.get('idAsistencia'), 0);
    this.obtenerAsistencia();
    this.parametroService.obtenerFechaCorteDto();
    this.fechaCorte = this.parametroService.fechaCorteDto;
    this.fechaCalendario = this.fecha.getMonth()+1 +"/"+this.fecha.getFullYear();
    this.fechaHoy = this.datepipe.transform(this.hoy, 'dd/MM/yyyy');
    this.fechaMaximo= this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaActual);
    //this.fechaMaximo.setDate(this.fechaMaximo.getDate() + 360);
    this.fechaMaximo.setMonth(this.fechaMaximo.getMonth() + 6);
    this.fechaMinimo = (this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaInicioCorte));
    if(this.empleado != null && (this.empleado.fechaIngreso != undefined || this.empleado.fechaIngreso != "")){
      if(this.fechaMinimo < this.dateUtilService.convertirStringToDate(this.empleado.fechaIngreso) ){
        this.fechaMinimo = this.dateUtilService.convertirStringToDate(this.empleado.fechaIngreso) ;
      }
    }

  }

  ngOnInit(): void {
   if(this.authService.isAuthenticated()){
      this.usuario = this.authService.usuario;
      this.permiteModificar();
    }
    this.parametroService.obtenerFechaCorteDto();
    this.fechaCorte = this.parametroService.fechaCorteDto;
    this.mostrarMensajeSolicitud();
  }

  permiteModificar(): void {
    if(this.usuario.perfiles.length > 1){
      this.habilitaRegistro = false;
    }
    this.usuario.perfiles.forEach(element => {
      if(element.nombre == "ADMINISTRADOR" && element.id == 3){
        
      }
    });
  }

  trimFechaRegistro(op:number){
    //devuelve la fecha de registro de solicitud
    if(op==1) {
      let fecha =  this.solicitud.fechaRegistro;
      //console.log("FECHA REGISTRO : " + this.solicitud.fechaRegistro);
      //return ;
    }
  }

  mostrarMensajeSolicitud(){
    this.empleadoService.getEmpleadoContrato(this.usuario.idEmpleado).subscribe(
      data => { 
        this.empleadoUsuario = data.empleado;
        if(this.usuario.isAdmin)
            this.mensajeSolicitud = "LA SOLICITUD FUE ENVIADA Y VALIDADA EL " ;
        else 
          if(this.usuario.isEmpleado && this.empleadoUsuario.cargo.nombre!= 'GERENTE')
              this.mensajeSolicitud = "SU SOLICITUD FUE ENVIADA PARA LA APROBACIÓN DE SU GERENCIA Y VALIDACIÓN EN EL ÁREA DE RRHH, EL " ;
          else
            if(this.usuario.isEmpleado && this.empleadoUsuario.cargo.nombre== 'GERENTE')
              this.mensajeSolicitud = "SU SOLICITUD FUE ENVIADA PARA SU VALIDACIÓN EN EL ÁREA DE RRHH, EL " ;
     }
    ); 
    this.trimFechaRegistro(1);  
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

  async validarArchivo(file){
    const data = await this.contratoService.validarArchivo(file, 0, 0);
    return data;
  }
  
  async handleInputChange(e) {
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
    if (pattern.indexOf(file.type)=== -1) {
      this.toastr.clear();
	    this.toastr.error("Está intentando subir un archivo malicioso, si continúa se le bloqueará su cuenta.", 'Error', {timeOut: 5000, progressBar: true, closeButton: true});
        /*this.toastr.warning("Tipo de Archivo no Permitido. Solo puede adjuntar .jpg, .png, .pdf", 'Advertencia', {
          timeOut: 5000, progressBar: true, closeButton: true
        });*/
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
        //console.log("sustento3.nombreArchivoOriginal: "+ this.sustento3.nombreArchivoOriginal);
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
      //console.log("sustento3.nombreArchivoOriginal: "+ this.sustento3.nombreArchivoOriginal);
    }

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
    
  }

 async validarCruceFechas(solicitud:Solicitud){
    let id = 0;
   if(solicitud.idSolicitudAsociada != undefined && solicitud.idSolicitudAsociada>0){
     id = solicitud.idSolicitudAsociada;
    } else {
    id = 0;
   }
  const data =  await this.solicitudService.listSolicitudPorRangoFechaHora(solicitud.fechaInicio,solicitud.fechaFin,solicitud.horaInicio,solicitud.horaFin, this.idEmpleado,id);
   return data;
} 
async contarDiasHabiles(fechaInicio:Date, fechaFin:Date){

  const data =  await this.diaNoLaborableService.contarDiasHabilesEnRangoFechas(this.dateUtilService.convertirDateToString(fechaInicio),this.dateUtilService.convertirDateToString(fechaFin));
  return data;
}

async obtenerSolicitudesSegunDia(fecha:string,idEmpleado:number){
  const listaSolicitudes = await this.solicitudService.listSolicitudPorDiaEmpleado(fecha,idEmpleado);
  return listaSolicitudes;
}

async getAsistencia(id:number){
  const asistencia = await this.asistenciaService.getAsistencia(id);
  this.marcaciones = asistencia.marcaciones.split(",");
  return asistencia;
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
      } else {

    }
  });
}

 async insert(solicitud:Solicitud){
    //console.log('El solicitud...:',solicitud);
    if(this.usuario.isAdmin == 1){
        this.solicitud.admin = true;
      }
      if(this.tipoIncidenteSeleccionado == 15){
        this.solicitud.horaFin = this.solicitud.horaInicio;
      }
      this.solicitud.idEmpleado = this.idEmpleado;
      this.solicitud.detalle = this.solicitud.detalle.trim();
      this.solicitudService.insert(this.solicitud).subscribe(
        data => {
          this.toastr.clear();
          this.toastr.success(data.mensaje, 'Éxito', {
            timeOut: 5000, progressBar: false, closeButton: true

          });       
          //console.log('El 2...:');
          this.numeroArchivo = 0;
          this.idIncidenteSeleccionado = null;
          this.seHabilitaParaRegistro=false;
          this.solicitud= new Solicitud;
          //console.log('El 3...:');
          this.limpiarCampos();
          this.obtenerAsistencia();
          //console.log('El 4...:');
          this.loading=false;
        }, error => {
          //console.log(error);
        }
      );
  }
  
 tipoSolicitudSeleccionado:TipoSolicitud = new TipoSolicitud()

  obtenerNombre(id:number):string{
    let nombre :string ="seleccionar";
    if(this.tiposSolicitud != undefined){
       this.tiposSolicitud.forEach(tipo=>{
       if(id == tipo.id){
          nombre = tipo.nombre;
            this.tipoSolicitudSeleccionado = tipo;
            if(this.tipoSolicitudSeleccionado.listaDetalle != undefined && this.tipoSolicitudSeleccionado.listaDetalle != null && this.tipoSolicitudSeleccionado.listaDetalle.length == 1){
              this.detalleTipoSeleccionado =this.tipoSolicitudSeleccionado.listaDetalle[0];
            }else if(this.tipoSolicitudSeleccionado.listaDetalle != undefined && this.tipoSolicitudSeleccionado.listaDetalle != null 
              && this.tipoSolicitudSeleccionado.listaDetalle.length >1 && this.solicitud != undefined && this.solicitud.idDetalleTipoSolicitud != undefined)
              {
                  this.tipoSolicitudSeleccionado.listaDetalle.forEach(detalle=>{
                  if(detalle.id == this.solicitud.idDetalleTipoSolicitud){
                    this.detalleTipoSeleccionado = detalle;
                  }
                })
              }
        }
      });
    }
    return nombre;
  }

  async selectMotivo(id){
    this.seHabilitaParaRegistro=true;
     this.detalleTipoSeleccionado = new DetalleTipoSolicitud();
     this.tipoSolicitudSeleccionado = null;
      if(this.tiposSolicitud != undefined){
       this.tiposSolicitud.forEach(tipo=>{
       if(id == tipo.id){
          this.tipoSolicitudSeleccionado = tipo; 
         }
        });

          if( this.tipoSolicitudSeleccionado!= null && this.tipoSolicitudSeleccionado.listaDetalle != undefined && this.tipoSolicitudSeleccionado.listaDetalle != null 
            && this.tipoSolicitudSeleccionado.listaDetalle.length>0 && !this.isPermiso ){
              
              if(this.tipoSolicitudSeleccionado.id != 10){
              this.numeroArchivo = 0;
              this.idIncidenteSeleccionado = null;
            
              this.seHabilitaParaRegistro=false;
              this.solicitud= new Solicitud;
              this.solicitud.horaInicio = undefined;
              this.solicitud.horaFin = undefined;
              this.solicitud.idTipoSolicitud = null;
              this.fechaInicio = null;
              this.fechaFin = null;
              this.limpiarCampos();
              this.cargarTipoSolicitud(0);
              this.toastr.clear();
              this.toastr.warning("Debe registrar este motivo de justificación por la opción Nueva Solicitud, para que pueda seleccionar las fechas.", 'Aviso', {
              timeOut: 3000, progressBar: false, closeButton: true
             });
              
            }else {
              this.toastr.clear();
              this.toastr.warning("De preferencia registre este motivo de justificación por la opción Nueva Solicitud, para que pueda seleccionar las fechas.", 'Aviso', {
              timeOut: 3000, progressBar: false, closeButton: true
             });
            }
            
           
            if(this.tipoSolicitudSeleccionado.listaDetalle.length == 1){
              this.detalleTipoSeleccionado =this.tipoSolicitudSeleccionado.listaDetalle[0];
            }else if(this.tipoSolicitudSeleccionado.listaDetalle != undefined && this.tipoSolicitudSeleccionado.listaDetalle != null 
              && this.tipoSolicitudSeleccionado.listaDetalle.length >1 && this.solicitud != undefined && this.solicitud.idDetalleTipoSolicitud != undefined)
              {this.tipoSolicitudSeleccionado.listaDetalle.forEach(detalle=>{
                  if(detalle.id == this.solicitud.idDetalleTipoSolicitud){
                    this.detalleTipoSeleccionado = detalle;
                  }
                })
            
              }
            
            
          }

          if(this.isPermiso){
            if(this.tipoSolicitudSeleccionado.nombre == 'DUELO' || this.tipoSolicitudSeleccionado.id==13){
              const contrato = await this.obtenerContratoVigente();
               // @ts-ignore
              if(contrato != null && contrato.sindicato){
               this.perteneceSindicato=true;
            }else {
                this.perteneceSindicato=false;
              }
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
 
    
   }

  async seleccionarFechaInicio(){
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

  detalleTipoSeleccionado:DetalleTipoSolicitud;
  perteneceSindicato:boolean=false;
  async selectDetalleTipoSolicitud(id:number){

    this.tipoSolicitudSeleccionado.listaDetalle.forEach(detalle=>{
      if(detalle.id == id){
        this.detalleTipoSeleccionado = detalle;
      }
    })

    if(this.perteneceSindicato){
      this.detalleTipoSeleccionado.numeroDias = this.detalleTipoSeleccionado.numeroDias + 2;
    }

    this.seleccionarFechaInicio();
    
 }

 async obtenerContratoVigente(){
  const contrato = await this.contratoService.getContratoVigentePorEmpleado(this.empleado.idEmpleado);
  return contrato;
}

  updateEstadoSolicutd(solEstado: SolicitudEstadoDto) {
    this.gestionSolicitudService.updateEstado(solEstado).subscribe(
      data => {
        this.toastr.clear();
        this.toastr.success(data.mensaje, 'Éxito', {
          timeOut: 5000, progressBar: false, closeButton: true
        });
      
      }
    );
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



  cargarTipoSolicitud(idTipoIncidente: number) {
    if(idTipoIncidente > 0){
      let nivelEnvio=0;
    if(this.usuario.isAdmin == 1){
        nivelEnvio=1;
    } else if(this.usuario.isEmpleado == 1){
      nivelEnvio =2;
    }
    console.log('valor de tipoRegimen', this.empleado.idTipoRegimen)
    this.tipoSolicitudService.listPorTipoIncidenteNivelEnvioDetalle(idTipoIncidente,nivelEnvio,this.empleado.genero,this.empleado.idTipoRegimen).subscribe(
      data => {
        this.tiposSolicitud = data;
        if(this.tiposSolicitud.length == 0){
           this.toastr.clear();
          this.toastr.warning("Ud. no tiene permitido registrar este tipo de justificación, comuníquese con RRHH.", 'Aviso', {
          timeOut: 5000, progressBar: true, closeButton: true
  
          });
        } else {
          this.seHabilitaParaRegistro=true;
        }
      }
    );
    }else {
      this.tiposSolicitud = [];
      this.seHabilitaParaRegistro=false;
    }
  }

  async add() {
    this.loading=true;
     
    let mensaje =  await this.validarCamposObligatorios();
    // @ts-ignore
    if(mensaje.length > 0){
      this.toastr.clear();
      // @ts-ignore
      this.toastr.warning(mensaje, 'Campos Obligatorios', {
        timeOut: 5000, progressBar: false, closeButton: true,enableHtml:true

      });
      this.loading=false;
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

      this.insert(this.solicitud);
    }

  }

  tipoIncidenteSeleccionado:number;
  mostrarMarcaciones:boolean;

  seleccionarIncidente (incidente:Incidente){
   this.mostrarMarcaciones = false;
  this.cargarFechasAutomatico();
  this.sustento1 = new SustentoSolicitud();
  this.sustento2 = new SustentoSolicitud();
  this.sustento3 = new SustentoSolicitud();
  this.isPermiso = false;
  this.seHabilitaParaRegistro=false;
  this.tipoIncidenteSeleccionado=incidente.tipoIncidente.id;
  this.idSolicitudSeleccionado = null;
       if(incidente.estado == 0 && this.esDiaPermitido){
          this.solicitud = new Solicitud;
          this.solicitud.tipo=0;
          this.solicitud.incidentes.push(incidente);
          this.idIncidenteSeleccionado = incidente.id;
          this.cargarTipoSolicitud(incidente.tipoIncidente.id);
          
       } else {
          this.listaSolicitudes.forEach(solicitud =>{
           if(solicitud.id == incidente.idSolicitud) {
              this.solicitud = solicitud;
           }
          
        })

        this.seHabilitaParaRegistro=false;
        this.idIncidenteSeleccionado = incidente.id;
        
       }

       if(incidente.tipoIncidente.id == 17){
        this.mostrarMarcaciones = true;
       }else{
        this.mostrarMarcaciones = false;
       }

  }


  puedeReenviarSolicitud(solicitud:Solicitud):boolean{

    let puedeEnviar : boolean = true;
    if(this.usuario.isEmpleado == 1 && this.usuario.isAdmin == undefined){
      if(solicitud.nivelEnvio < 2){
        puedeEnviar = false;
      }
    }

   return puedeEnviar;
  }

  async sumarDiasHabiles(fechaInicio:Date, dias:number){
    const fechaFinCalculado  =  await this.diaNoLaborableService.sumarDiasHabiles(this.dateUtilService.convertirDateToString(fechaInicio),dias);
    return fechaFinCalculado.fechaFin;
  }

 

  private cargarFechasAutomatico(){
    let fechaAsistenciaDate = this.dateUtilService.convertirStringToDate(this.fechaCalendarioDia);
    if(fechaAsistenciaDate<=this.fechaMaximo && fechaAsistenciaDate>=this.fechaMinimo){
      this.fechaInicio = this.dateUtilService.convertirStringToDate(this.fechaCalendarioDia);
      this.fechaFin = this.dateUtilService.convertirStringToDate(this.fechaCalendarioDia);
      this.seHabilitaParaRegistro=true;
      this.esDiaPermitido = true;
    }else {
      this.seHabilitaParaRegistro=false;
      this.esDiaPermitido = false;
      this.toastr.clear();
      this.toastr.warning("Recuerde que solo puede ingresar justificaciones/permisos para sus asistencias desde el "+this.fechaCorte.fechaInicioCorte + " hasta " + this.fechaCorte.fechaFinCorte,'Advertencia', {
        timeOut: 5000, progressBar: true, closeButton: true

      });
    }
  }


  reenviarSolicitud(solicitud:Solicitud){
    let nuevaSolicitud = new Solicitud();
    const idSolicitudAsociada = solicitud.id;
    nuevaSolicitud.idSolicitudAsociada = idSolicitudAsociada;
    nuevaSolicitud.numeroEnvio = solicitud.numeroEnvio +1;
    nuevaSolicitud.detalle = solicitud.detalle;
    nuevaSolicitud.sustentos=solicitud.sustentos;
    nuevaSolicitud.fechaInicio = solicitud.fechaInicio;
    nuevaSolicitud.fechaFin = solicitud.fechaFin;
    nuevaSolicitud.horaInicio = solicitud.horaInicio;
    nuevaSolicitud.horaFin = solicitud.horaFin;
    nuevaSolicitud.idTipoSolicitud=solicitud.idTipoSolicitud;
    nuevaSolicitud.tipo = solicitud.tipo;
    nuevaSolicitud.idDetalleTipoSolicitud = solicitud.idDetalleTipoSolicitud;
    if(solicitud.tipo == 0){
      this.cargarTipoSolicitud(this.tipoIncidenteSeleccionado);
    } else {
      this.cargarTipoSolicitud(24);
     
    }
    this.solicitud = nuevaSolicitud;
    this.fechaInicio = this.dateUtilService.convertirStringToDate(this.solicitud.fechaInicio);
    this.fechaFin = this.dateUtilService.convertirStringToDate(this.solicitud.fechaFin);
    this.seHabilitaParaRegistro=true;
   
    let i = solicitud.sustentos.length;
    let j = 0;
   
    if(i==3){
      this.sustento1 = solicitud.sustentos[0];
      this.sustento2 = solicitud.sustentos[1];
      this.sustento3 = solicitud.sustentos[2];
      this.numeroArchivo = 3;
    }

    if(i==2){
      this.sustento1 = solicitud.sustentos[0];
      this.sustento2 = solicitud.sustentos[1];
      this.numeroArchivo = 2;
    }

    if(i==1){
      this.sustento1 = solicitud.sustentos[0];
      this.numeroArchivo = 1;
    } 
  }

  diasEnUnMes(mes, anio) {
    //retorna dia new Date(año, mes, 0).getDate(); 
    var diFinMes = new Date(anio, mes, 0).getDate();
    return new Date(anio+'/'+mes+'/'+diFinMes);
  }

  determinaFinMes(fechaUno, fechaDos){
    if(fechaUno > fechaDos){
      return fechaDos;
    }else{
      return fechaUno;
    }
  }

  determinaInicioMes(fechaUno, fechaDos){
    if(fechaUno < fechaDos){
      return fechaDos;
    }else{
      return fechaUno;
    }
  }
  
  seleccionarSolicitud(solicitud:Solicitud){
    if(solicitud.tipo == 1){
      this.isPermiso = true;  
    }else {
      this.isPermiso = false;
    }
    
    this.idSolicitudSeleccionado=null;
    this.listaSolicitudes.forEach(solicitudPermiso =>{
      if(solicitud.id == solicitudPermiso.id) {
        this.solicitud = solicitudPermiso;
        this.idSolicitudSeleccionado = this.solicitud.id;
      }
    })
    this.seHabilitaParaRegistro=false;
    this.idIncidenteSeleccionado = null;
  }

  fechaMesAnioFiltro:string;
  list(){
    var mesSelect = Number(this.getMeses().indexOf(this.mesFiltro.valorActual))+1;
    //console.log("MESSELECT-> "+mesSelect);
    this.inicializarContadores();
    this.objetoSolicitud = new Array;
    let fechaArray = this.fechaCalendarioDia.split('/');
    this.fechaMesAnioFiltro = fechaArray[1]+'/'+fechaArray[2];
    this.asistenciaService.list(this.fechaMesAnioFiltro,this.idEmpleado).subscribe(
      data => {
          data.asistencias.forEach(asistencia =>{
            let faltaTardanza = false;
            asistencia.listaIncidente.forEach(incidente =>{
              //console.log("lista de incidnetes tipo incidente nombre: "+incidente.tipoIncidente.nombre);
              if(incidente.tipoIncidente.nombre === 'TARDANZA'){
                //  Estado sin justificar
                if(incidente.estado != 3){
                      this.tardanzasNoJustificadas = this.tardanzasNoJustificadas +1;
                  } else if(incidente.estado == 3){
                    this.tardanzasJustificadas = this.tardanzasJustificadas +1;
                  }
              }
              if(incidente.tipoIncidente.nombre === 'FALTA' ){
              //  Estado sin justificar
                if(incidente.estado != 3){
                    this.faltasNoJustificadas = this.faltasNoJustificadas +1;
                } else if(incidente.estado == 3){
                  this.faltasJustificadas = this.faltasJustificadas +1;
                }
              }
              if( incidente.tipoIncidente.nombre === 'FALTA POR TARDANZA'){
              //  Estado sin justificar
                this.faltasPorTardanza = this.faltasPorTardanza +1;
                if(this.empleado.idTipoRegimen === 1){
                  faltaTardanza = true;
                }
              }
              if(incidente.tipoIncidente.nombre === 'SALIDA ANTICIPADA'){
                  //  Estado sin justificar
                this.salidasAnticipadas = this.salidasAnticipadas + 1;
              }

              //INICIO PERMISO
              //Sumando 7-DESCANSO MÉDICO, 21	VACACIONES
              this.totalSolicitudes =0;
              
              if(asistencia.id != null)
              //console.log("id-> "+asistencia.id);
              asistencia.listaSolicitud.forEach(listaSolicitudes =>{
                  if(listaSolicitudes.idTipoSolicitud == 7 || listaSolicitudes.idTipoSolicitud == 21){
                    //console.log("arrayxxx->"+listaSolicitudes.id);
                    if(this.objetoSolicitud.filter(element => element.solicitudesxDia == listaSolicitudes.id).length < 1){//246937
                     
                      var diaInicialSolicitud = this.determinaInicioMes( new Date(listaSolicitudes.fechaInicio),new Date(this.anioFiltro.valorActual+'/'+mesSelect+'/'+1));
                      var diaFinalSolicitud = this.determinaFinMes(new Date(listaSolicitudes.fechaFin), this.diasEnUnMes(mesSelect, this.anioFiltro.valorActual));
                      var contaDias=0;
 
                      const diffTime = Math.abs(diaInicialSolicitud.getTime() - diaFinalSolicitud.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))+1;
                     
                      for(var i=1; i<= diffDays; i++){//undefined
                        contaDias++;
                        listaSolicitudes.nroDias = contaDias;
                      }
                      
                      this.totalDiasPermiso = this.totalDiasPermiso + listaSolicitudes.nroDias;
                      this.listaPermiso.push(listaSolicitudes);
                      this.totalSolicitudes = this.totalSolicitudes +1;

                      var item = {
                        solicitudesxDia: listaSolicitudes.id
                      };
                     this.objetoSolicitud.push(item);;
                    }
                  }
                });
              //FIN PERSMISO
            })
            
           if(asistencia.minutosTarde != undefined && faltaTardanza == false){
            this.totalMinutosTardanza = this.totalMinutosTardanza + asistencia.minutosTarde;
           }

          if(asistencia.minutosExtra != undefined){
            
            this.minutosExtra = asistencia.minutosExtra;

            if (this.minutosExtra > 0 && !asistencia.noLaboral) {
              this.horaFinalMensual = (this.minutosExtra + this.horaFinalMensual);
              this.minutoFinalMensual = (this.minutosExtra + this.minutoFinalMensual);


              var hmensual = '' + Math.floor(this.horaFinalMensual / 60);
              var mmensual = '' + this.minutoFinalMensual % 60;
              this.sobretiempo  = (hmensual.length == 1 ? '0'+hmensual:hmensual) +':'+ (mmensual.length == 1? '0'+mmensual : mmensual);
          }
            // FIN
         }
        })

         data.solicitudes.forEach(solicitud=>{
          if(solicitud.estado !== 0){
            //this.totalSolicitudes = this.totalSolicitudes +1; //28-09-2022
          }
        
          if(solicitud.tipo == 1){
            let diasPermiso;
            if(solicitud.diaHabil != null && solicitud.diaHabil){
              diasPermiso = solicitud.numeroDias;
            } else {
              diasPermiso = this.contarDiasRangoFechas(solicitud.fechaInicio, solicitud.fechaFin);
            }
           
            solicitud.nroDias = diasPermiso;
         
          }


          switch(solicitud.estado){
            case 1: this.enviados = this.enviados +1;break;
            case 2: this.aprobados = this.aprobados +1;break;
            case 3: this.validados = this.validados +1; break;
            case 4:this.rechazados = this.rechazados +1; break;
          }

         }) 

         
      }
    );
  }



  

  obtenerEmpleado(id: number) {
    if (isNaN(id)) {
     return;
    } else {
       this.empleadoService.getEmpleadoContrato(id).subscribe(
        data => {
          if (data == null) {
            this.router.navigate(['/']);
            return;
          }
          if(data.empleado != undefined){
            this.empleado = data.empleado;
            if(this.empleado.foto == null){
              this.imageSrc = 'assets/img/icon/icon_user.svg';
            } else {
              this.imageSrc = this.empleado.foto;
            }
            
            this.horaingresoEmpleado=this.empleado.horarioIngreso;
            this.horasalidaEmpleado=this.empleado.horarioSalida;
          } else {
            this.router.navigate(['/']);
            return;
          }

         }, error => {
          //console.log(error);
          this.router.navigate(['/']);
          return;
        }
      );
    }
  }

  contarDiasRangoFechas(fecha1, fecha2):number{
    let fechaInicio = moment(fecha1);
    let fechaFin = moment(fecha2);
    return fechaFin.diff(fechaInicio,'days') +1;
  }

  getMeses():string[]{
    const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SETIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    return months;
  }

  inicializarContadores(){
    this.faltasJustificadas = 0;
    this.faltasNoJustificadas= 0;
    this.tardanzasJustificadas = 0;
    this.tardanzasNoJustificadas = 0;
    this.enviados= 0;
    this.aprobados= 0;
    this.validados = 0;
    this.rechazados =0;
    this.listaPermiso = new Array();
    this.totalDiasPermiso = 0;
    this.totalMinutosTardanza = 0;
    this.sobretiempo =0;
    this.totalSolicitudes= 0;
    this.minutosExtra = 0;
    this.horaFinalMensual = 0;
    this.minutoFinalMensual = 0;
  }

  limpiarCampos(){
    this.sustento1 = new SustentoSolicitud;
    this.sustento2 = new SustentoSolicitud;
    this.sustento3 = new SustentoSolicitud;
    this.listaPermisosConSustento= new Array;
  }

  async validarCamposObligatorios() {
    let mensaje  = "";
    //console.log("idtiposolicitud-> "+this.solicitud.idTipoSolicitud);
    if(this.solicitud.idTipoSolicitud == undefined){ //VEMOS VALOR DEL MOTIVO
      mensaje = mensaje + "Seleccione MOTIVO.<br/>";
    } else {
            
      if(this.tipoIncidenteSeleccionado == 15){
        if( (this.solicitud.horaInicio == undefined || this.solicitud.horaInicio =="") ){
          mensaje = mensaje + "Ingrese HORA.<br/>";
        }
      }else if(this.solicitud.idTipoSolicitud == 3 || this.solicitud.idTipoSolicitud ==7 || this.solicitud.idTipoSolicitud == 23){
        mensaje=mensaje;
      }else{
        if(this.solicitud.horaInicio == undefined  || this.solicitud.horaInicio ==""){
          mensaje = mensaje + "Ingrese HORA INICIO.<br/>";
        }
    
        if(this.solicitud.horaFin == undefined || this.solicitud.horaFin == ""){
          mensaje = mensaje + "Ingrese HORA FIN.<br/>";
        }
      }

    }

    if(this.solicitud.detalle == undefined || this.solicitud.detalle.trim() == ""){
      mensaje = mensaje + "Ingrese DETALLE.<br/>";
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

    if(this.fechaFin != undefined && this.fechaInicio != undefined){
      if(this.fechaFin < this.fechaInicio){
        mensaje = mensaje + "Fecha Fin debe ser mayor que Fecha Inicio.<br/>";
      }
    }else {

    }

   if(this.solicitud.horaInicio != undefined && this.solicitud.horaFin != undefined){
      if(this.solicitud.horaInicio == "00:00"){
        mensaje = mensaje + "Hora Inicio debe ser diferente de 00:00.<br/>";
      }
      if(this.solicitud.horaFin == "00:00"){
        mensaje = mensaje + "Hora Fin debe ser diferente de 00:00.<br/>";
      }
      if(this.solicitud.horaInicio >= this.solicitud.horaFin){
        mensaje = mensaje + "Hora Fin debe ser mayor que Hora Inicio.<br/>";
      } else {

        if(this.tipoSolicitudSeleccionado.id == 14){
          let cadenaInicioHora = this.solicitud.horaInicio.split(':')[0];
          let cadenaInicioMinutos = this.solicitud.horaInicio.split(':')[1];
  
          let cadenaFinHora = this.solicitud.horaFin.split(':')[0];
          let cadenaFinMinutos = this.solicitud.horaFin.split(':')[1];
  
          var a = moment([cadenaFinHora,cadenaFinMinutos], "HH:mm")
          var b = moment([cadenaInicioHora,cadenaInicioMinutos], "HH:mm")
         
          let restaHora = a.diff(b, 'hours') ;
          let restaMinuto = a.diff(b, 'minutes') ;
  
        
          if(restaMinuto > 60 ){
            mensaje = mensaje + "El permiso por lactancia es máximo una hora.<br/>";
       
          }

        }
       

        
      }

      /*else {
        if(!this.isPermiso){
          if(this.tipoIncidenteSeleccionado == 16 || this.tipoIncidenteSeleccionado == 20 ){
            if(this.solicitud.horaFin < this.empleado.horarioSalida){
              mensaje = mensaje + "Hora Fin debe ser mayor o igual que la Hora de Salida:"+this.empleado.horarioSalida+".<br/>";
            }
          }
        }
      }*/
    }
    if (this.fechaFin != undefined && this.fechaInicio != undefined && this.solicitud.horaInicio != undefined && this.solicitud.horaFin != undefined ){
          const solicitudes = await  this.validarCruceFechas(this.solicitud);
         // @ts-ignore
          if(solicitudes != undefined && solicitudes.length > 0){
             // @ts-ignore
          mensaje = mensaje +"Tiene "+solicitudes.length + " solicitud(es) registrada(s) en la fecha y/o hora seleccionada.<br/>";
         
        }
    }

   
 

    if(this.solicitud.idTipoSolicitud != undefined){
     
      let tipoSolicitud = this.obtenerTipoSolicitud(this.solicitud.idTipoSolicitud);
      if(this.isPermiso){
        if(tipoSolicitud.listaDetalle != undefined && tipoSolicitud.listaDetalle.length > 0){
       
          if(this.detalleTipoSeleccionado != undefined && this.detalleTipoSeleccionado != null && this.detalleTipoSeleccionado.id> 0){
  
            if(!this.detalleTipoSeleccionado.esDiaHabil && this.fechaInicio != null && this.fechaFin != null){
                  let dias = this.contarDiasRangoFechas(this.fechaInicio, this.fechaFin);
                  if(dias > this.detalleTipoSeleccionado.numeroDias && !this.detalleTipoSeleccionado.muestraFechaAutomatico){
                    if(tipoSolicitud.listaDetalle.length == 1){
                      mensaje = mensaje + "Para el MOTIVO: " +tipoSolicitud.nombre +", como máximo puede tomar "+this.detalleTipoSeleccionado.numeroDias+" días calendarios. Ha seleccionado "+dias+" días.<br/>";
                  
                    }else {
                      mensaje = mensaje + "Para el TIPO de " +tipoSolicitud.nombre +" seleccionado, como máximo puede tomar "+this.detalleTipoSeleccionado.numeroDias+" días calendarios. Ha seleccionado "+dias+" días.<br/>";
                    }
                   
                  } else {
                    if(dias !=  this.detalleTipoSeleccionado.numeroDias &&  this.detalleTipoSeleccionado.muestraFechaAutomatico){
                      if(tipoSolicitud.listaDetalle.length == 1){
                        mensaje = mensaje + "Para el MOTIVO: " +tipoSolicitud.nombre +", de tomar "+this.detalleTipoSeleccionado.numeroDias+" días calendarios. Ha seleccionado "+dias+" días.<br/>";
                    
                      }else {
                        mensaje = mensaje + "Para el TIPO de " +tipoSolicitud.nombre +" seleccionado, debe tomar "+this.detalleTipoSeleccionado.numeroDias+" días calendarios. Ha seleccionado "+dias+" días.<br/>";
                      }
                     
                    }
                  }
            } else if(this.detalleTipoSeleccionado.esDiaHabil && this.fechaInicio != null && this.fechaFin != null) {
              const numeroDiasHabiles = await this.contarDiasHabiles(this.fechaInicio, this.fechaFin);
              if(numeroDiasHabiles > this.detalleTipoSeleccionado.numeroDias){
                if(tipoSolicitud.listaDetalle.length == 1){
                  mensaje = mensaje + "Para el MOTIVO:" +tipoSolicitud.nombre +", como máximo puede tomar "+this.detalleTipoSeleccionado.numeroDias+" días hábiles. Ha seleccionado "+numeroDiasHabiles+" días hábiles.<br/>";
               
                }else {
                  mensaje = mensaje + "Para el TIPO de " +tipoSolicitud.nombre +" seleccionado, como máximo puede tomar "+this.detalleTipoSeleccionado.numeroDias+" días hábiles. Ha seleccionado "+numeroDiasHabiles+" días hábiles.<br/>";
                }
              }
            }
          }else {
            mensaje = mensaje + "Seleccione TIPO.<br/>";
          }
        }
      }
      if(tipoSolicitud != undefined && tipoSolicitud.requiereSustento){
        if( this.sustento2.imgSrc == undefined &&
            this.sustento1.imgSrc == undefined &&
            this.sustento3.imgSrc == undefined){
          mensaje = mensaje +"Adjuntar SUSTENTO.<br/>";
        }
      }
    }
    

    return mensaje;

  }

  async getNivelAprobacion (id:number){
    const empleadoFiltro = new FormData();
    empleadoFiltro.set('idEmpleado', this.idEmpleado.toString());
    let nivel = this.equipoService.getNivelAprobacion(empleadoFiltro);
    return nivel;
  }

  listaPermisosConSustento:Solicitud[]=new Array;
  listaSolicitudes:Solicitud[]=new Array;
  async  obtenerAsistencia() {
        this.obtenerEmpleado(this.idEmpleado);
        if(this.idAsistencia > 0){
            const data = await  this.asistenciaService.getAsistencia(this.idAsistencia);
            let exisFaltaTardanza = false;
            if(data != null){
              this.asistencia = data;
              this.marcaciones = this.asistencia.marcaciones.split(",");
            }
          }
          
         
          this.listaSolicitudes = await this.obtenerSolicitudesSegunDia(this.fechaCalendarioDia, this.idEmpleado);
          const nivel = await this.getNivelAprobacion(this.idEmpleado);
          if(nivel == null){
            this.niveles = 0;
          } else {
            this.niveles = nivel;
          }

          if(this.asistencia != null && this.asistencia.listaIncidente != null && this.asistencia.listaIncidente.length == 0 ){
             this.isPermiso = true;
          } 
          
           this.listaSolicitudes.forEach(solicitud=>{
            solicitud.seAgrega = true;
            if(this.asistencia != undefined && this.asistencia.listaIncidente != undefined){
              this.asistencia.listaIncidente.forEach(incidente =>{
                if(incidente.idSolicitud != null && incidente.idSolicitud == solicitud.id){
                  solicitud.seAgrega = false;
                }
              });
            }
             
              
              if(solicitud.seAgrega){
                solicitud.descripcion = 'PERMISO';
                this.listaPermisosConSustento.push(solicitud);
              }
            });
            
            if(this.asistencia != undefined && this.asistencia.listaIncidente != undefined 
              && this.asistencia.listaIncidente.length > 0 && this.asistencia.listaIncidente[0].estado > 0 ){
                this.seleccionarIncidente(this.asistencia.listaIncidente[0]);
            }else if(this.listaPermisosConSustento.length>0 && this.asistencia != undefined && this.asistencia.listaIncidente != undefined 
              && this.asistencia.listaIncidente.length == 0){
                this.seleccionarSolicitud(this.listaPermisosConSustento[0]);
            }else if(this.listaPermisosConSustento.length>0 && this.asistencia.listaIncidente == undefined ){
              this.seleccionarSolicitud(this.listaPermisosConSustento[0]);
            }


            this.list();
            //codiglist()o se guardo en notepad
         
        }
  
  isPermiso :boolean= false;
  
  nuevoPermiso(){
    this.fechaInicio = this.dateUtilService.convertirStringToDate(this.asistencia.fecha);
    this.fechaFin = this.dateUtilService.convertirStringToDate(this.asistencia.fecha);
    this.isPermiso = true;
    this.idIncidenteSeleccionado = null;
    this.idSolicitudSeleccionado = null;
    this.solicitud = new Solicitud();
    this.solicitud.tipo=1;
    this.seHabilitaParaRegistro = true;
    this.sustento1 = new SustentoSolicitud();
    this.sustento2 = new SustentoSolicitud();
    this.sustento3 = new SustentoSolicitud();
    this.cargarTipoSolicitud(24);
  }


  obtenerTipoSolicitud(idTipoSolicitud : number):TipoSolicitud{
   let tipoSolicitudE;
    this.tiposSolicitud.forEach(tipo =>{
      if(idTipoSolicitud == tipo.id){
        tipoSolicitudE = tipo;
      }
    });
    return tipoSolicitudE;
  }

  descargarArchivo(sustento:SustentoSolicitud){
    const archivoBlob = this.base64toBlob(sustento.archivo,sustento.tipoArchivo);
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(archivoBlob));
    sustento.url=this.fileUrl;
  }

  base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  salir(){
    if(this.usuario.isEmpleado == 1 && this.usuario.isAdmin == undefined && this.usuario.isLider == undefined ){
        this.router.navigate(['/asistencias/miAsistencia']);
      } else if(this.usuario.isLider == 1 && this.usuario.idEmpleado == this.idEmpleado){
        this.router.navigate(['/asistencias/miAsistencia']);
      }else if(this.usuario.isAdmin== 1 && this.usuario.idEmpleado == this.idEmpleado){
        this.router.navigate(['/asistencias/miAsistencia']);
      } else if(this.usuario.isAdmin == 1 && this.usuario.isEmpleado == 1) {
          this.router.navigate(['/asistencias/asistencia', this.idEmpleado]);
      }else if(this.usuario.isLider == 1 && this.usuario.isEmpleado == 1){
          this.router.navigate(['/asistencias/asistencia', this.idEmpleado]);
      } else if(this.usuario.isLider == 1 && this.usuario.isAdmin == 1){
          this.router.navigate(['/asistencias/asistencia', this.idEmpleado]);
      }else if(this.usuario.isLider == 1 && this.usuario.isAdmin == undefined && this.usuario.isEmpleado == undefined ){
          this.router.navigate(['/asistencias/asistencia', this.idEmpleado]);
      }else if(this.usuario.isAdmin == 1 && this.usuario.isLider == undefined && this.usuario.isEmpleado == undefined ){
        this.router.navigate(['/asistencias/asistencia', this.idEmpleado]);
      }
  }

}