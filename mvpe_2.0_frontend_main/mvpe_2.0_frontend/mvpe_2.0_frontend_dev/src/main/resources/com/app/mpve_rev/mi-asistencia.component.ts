import { Component, OnInit } from '@angular/core';
import { EmpleadoDto } from 'src/app/modelo/empleado-dto';
import { Persona } from 'src/app/modelo/persona';
import { AsistenciaService } from 'src/app/service/asistencia.service';
import { AsistenciaDto } from 'src/app/modelo/asistencia-dto';
import { environment } from 'src/environments/environment';
import { EmpleadoService } from 'src/app/service/empleado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { Usuario } from 'src/app/modelo/usuario';
import { HostListener } from "@angular/core";
import { DatePipe } from '@angular/common';
import { Solicitud } from 'src/app/modelo/solicitud';
import * as moment from 'moment';
import { ParametroService } from 'src/app/service/parametro.service';
import { FechaCorteDto } from 'src/app/modelo/fecha-corte-dto';
import { SolicitudService } from 'src/app/service/solicitud.service';
import { DateUtilService } from 'src/app/service/date-util.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddSolicitudComponent } from '../solicitudes/dialog-add-solicitud/dialog-add-solicitud.component';
import { ValorSecuencia } from '../asistencia-personal/asistencia-personal.component';
import { assert } from 'console';

@Component({
  selector: 'app-mi-asistencia',
  templateUrl: './mi-asistencia.component.html',
  styleUrls: ['./mi-asistencia.component.scss']
})
export class MiAsistenciaComponent implements OnInit {

  screenHeight:any;
  screenWidth:any;

  cabeceras : string[]=['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO']
  asistencias : AsistenciaDto[];
  empleado:EmpleadoDto = new EmpleadoDto();
  faltasJustificadas : number = 0;
  faltasNoJustificadas: number = 0;
  tardanzasJustificadas : number = 0;
  tardanzasNoJustificadas : number = 0;
  enviados: number = 0;
  aprobados:number = 0;
  validados:number = 0;
  rechazados:number =0;
  totalMinutosTardanza: number = 0;
  sobretiempo : string ='00:00';
  totalDiasPermiso:number=0;
  totalSolicitudes:number = 0;
  fechaCalendario :string;
  panelOpenState = false;
  usuario = new Usuario;
  fechaCorte = new FechaCorteDto;
  public imageSrc:string = '';
  public hoy = new Date();
  public fechaHoy: string;
  anioFiltro : ValorSecuencia = new ValorSecuencia();
  mesFiltro : ValorSecuencia = new ValorSecuencia();
  listaPermiso:Solicitud[]= new Array;
  mesActual : string;
  fecha :Date = new Date();
  maxCantidadAnio:number = 3;
  maxAnio:number;
  maxStrAnio: string;
  faltasPorTardanza:number=0;
  faltasPorSalidaAnticipada:number = 0;
  salidasAnticipadas:number=0;
  anio:string;
  mes:number;
  cadenaFechas:string[];
  niveles: number = 3;
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
  anios:string[];
  months = [{id:1,descripcion:"ENERO"},
            {id:2,descripcion:"FEBRERO"},
            {id:3,descripcion:"MARZO"},
            {id:4,descripcion:"ABRIL"},
            {id:5,descripcion:"MAYO"},
            {id:6,descripcion:"JUNIO"},
            {id:7,descripcion: "JULIO"},
            {id:8,descripcion: "AGOSTO"},
            {id:9,descripcion: "SETIEMBRE"},
            {id:10,descripcion: "OCTUBRE"},
            {id:11,descripcion: "NOVIEMBRE"},
            {id:12,descripcion: "DICIEMBRE"}];


  constructor(
    private asistenciaService: AsistenciaService,
    private empleadoService:EmpleadoService,
    private parametroService:ParametroService,
    private solicitudService:SolicitudService,
    public route: ActivatedRoute,
    public authService:AuthService,
    private dateUtilService:DateUtilService,
    private datepipe: DatePipe,
    public dialog: MatDialog,
    public router: Router) {

    this.usuario = this.authService.usuario;

    this.parametroService.obtenerFechaCorteDto();
    this.fechaCorte = this.parametroService.fechaCorteDto;
    this.empleado.idEmpleado = this.usuario.idEmpleado;
    //this.obtenerEmpleado(parseInt(this.route.snapshot.paramMap.get('id'), 0));
    this.fechaCalendario = sessionStorage.getItem("fechaCalendario");
    this.obtenerEmpleado(this.usuario.idEmpleado);
    if(this.fechaCalendario == undefined || this.fechaCalendario == ''|| this.fechaCalendario == null){
      this.fechaCalendario = this.fecha.getMonth()+1 +"/"+this.fecha.getFullYear();
    }
    this.cadenaFechas = this.fechaCalendario.split('/');
    this.mesActual = this.getMeses()[parseInt(this.cadenaFechas[0], 0)-1] + " " + this.cadenaFechas[1];
    this.anioFiltro.valorActual = this.cadenaFechas[1];
    this.mesFiltro.valorActual = this.getMeses()[parseInt(this.cadenaFechas[0], 0)-1];
    this.fechaHoy = this.datepipe.transform(this.hoy, 'd/MM/yyyy');
    this.getScreenSize();
    this.cargarAnios();
    this.maxAnio =  new Date().getFullYear() + this.maxCantidadAnio;
    this.maxStrAnio = this.maxAnio.toString();
  }

  ngOnInit(): void {
    this.authService.isAuthenticated();
    this.usuario = this.authService.usuario;
    this.parametroService.obtenerFechaCorteDto();
    this.fechaCorte = this.parametroService.fechaCorteDto;
  }

  cargarAnios(){
    this.asistenciaService.getAniosFiltros().subscribe(data=>{
      this.anios = data;
    })
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
   this.screenHeight = window.innerHeight;
   this.screenWidth = window.innerWidth;
}

seleccionarAnio(anios: number) {
  let anioActual = parseInt(this.anioFiltro.valorActual);
  if((anioActual + anios) < 2010){
    //console.log((anioActual + anios));
    return;
  }
  this.anioFiltro.valorActual = "" + (anioActual + anios);
  this.anioFiltro.valorAnterior = "" + ((anioActual + anios) - 1);
  this.anioFiltro.valorSiguiente = "" + ((anioActual + anios) + 1);

  //Cada evento clic va mover el calendario
  this.filterMesClic(this.getMeses().indexOf(this.mesFiltro.valorActual)+1);
}

seleccionarMes(meses: number) {
  let mesActual = this.getMeses().indexOf(this.mesFiltro.valorActual);
  let mesActualNuevo = mesActual + meses;
  // para el caso del mes actual diciembre
  if (mesActualNuevo == 12) {
    mesActualNuevo = 0;
  }

  if (mesActualNuevo == -1) {
    mesActualNuevo = 11;
  }
  let mesAnterio = mesActualNuevo - 1;
  let mesSiguiente = mesActualNuevo + 1;
  // para el caso de mes actual diciembre
  if (mesActualNuevo == 11) {
    mesSiguiente = 0;
    //Para el caso de mes actual enero
  } else if (mesActualNuevo == 0) {
    mesAnterio = 11;

  }
  this.mesFiltro.valorActual = "" + this.getMeses()[mesActualNuevo];
  this.mesFiltro.valorAnterior = "" + this.getMeses()[mesAnterio];
  this.mesFiltro.valorSiguiente = "" + this.getMeses()[mesSiguiente];

  //Cada evento clic va mover el calendario
  if(meses != 0){
    this.filterMesClic(this.getMeses().indexOf(this.mesFiltro.valorActual)+1);
  }
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
            this.imageSrc = 'assets/img/persona.jpg'
          }else {
            this.imageSrc = 'data:image/png;base64,'+this.empleado.foto ;
          }
          this.list();
        } else {
          this.router.navigate(['/']);
          return;
        }
       }, error => {
        console.log(error);
        this.router.navigate(['/']);
        return;
      }
    );
  }
}

acortarNomSolicitud(nomSolicitud: string){

  let nombreEtiqueta:String = '';

  nombreEtiqueta = nomSolicitud;

  if(this.screenWidth==1280 && this.screenHeight==720)
  {
    if(nombreEtiqueta.length>20){
      nombreEtiqueta = nombreEtiqueta.slice(0,16) + "...";
    }
  }

  if(this.screenWidth>1280 && this.screenHeight>720)
  {
    if(nombreEtiqueta.length>20){
      nombreEtiqueta = nombreEtiqueta.slice(0,29) + "...";
    }
  }

  return nombreEtiqueta;
}


acortarNomIncidente(nomIncidente: String, juztificacion: String){

  let nombreEtiqueta:String = '';

  if(juztificacion==null || juztificacion==''){
    nombreEtiqueta = nomIncidente;
  } else {
    nombreEtiqueta = '['+nomIncidente+'] '+juztificacion;
  }

  if(this.screenWidth==1280 && this.screenHeight==720)
  {
    if(nombreEtiqueta.length>20){
      nombreEtiqueta = nombreEtiqueta.slice(0,16) + "...";
    }
  }

  if(this.screenWidth>1280 && this.screenHeight>720)
  {
    if(nombreEtiqueta.length>20){
      nombreEtiqueta = nombreEtiqueta.slice(0,29) + "...";
    }
  }

  return nombreEtiqueta;
}

  filterAnioClic(anio:string){
    this.anio = anio;
  }
  seMuestraBotonNuevaSolicitud:boolean=true;
  filterMesClic(mes:number){
    this.mes = mes;
    this.fechaCalendario = this.mes +"/"+ this.anioFiltro.valorActual;
    this.mesActual = this.getMeses()[this.mes-1] + " " + this.anioFiltro.valorActual;
    sessionStorage.setItem("fechaCalendario",this.fechaCalendario);
    let fechaPrueba = "1/"+this.fechaCalendario;
    let fechaBuscar = this.dateUtilService.convertirStringToDate(fechaPrueba);
    this.fechaCorte = this.parametroService.fechaCorteDto;
    let fechaInicioCorte = this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaInicioCorte);
    let fechaFinCorte = this.dateUtilService.convertirStringToDate(this.fechaCorte.fechaFinCorte);

    if(fechaInicioCorte!= null && fechaFinCorte != null ){
      if(fechaBuscar.getTime() >= fechaInicioCorte.getTime() && fechaBuscar.getTime()<=fechaFinCorte.getTime()){
        this.seMuestraBotonNuevaSolicitud = true;
      }else {
       this.seMuestraBotonNuevaSolicitud = false;
      }
    }
    this.list();

  }

  btnRegistrarNuevaSolicitud(){
    let persona = new Persona();
    persona.genero = this.empleado.genero;
    persona.edicionPersonal = "SI";
    const dialogRef = this.dialog.open(DialogAddSolicitudComponent, {
       height: '90vh',
       disableClose:true,
       data: { 
         id:this.empleado.idEmpleado,
         persona:persona,
         fechaIngreso:this.empleado.fechaIngreso,
         idTipoRegimen:this.empleado.idTipoRegimen,
         horarioIngreso:this.empleado.horarioIngreso,
         horarioSalida:this.empleado.horarioSalida,
        fechaCalendario:this.fechaCalendario}
     });

     dialogRef.afterClosed().subscribe(result => {
       this.list();
     });
   }

   objetoSolicitud= new Array;
   listaSolicitudes:Solicitud[]= new Array;
  list(){
    this.inicializarContadores();
    var mesSelect = Number(this.getMeses().indexOf(this.mesFiltro.valorActual))+1;
    this.asistenciaService.list(this.fechaCalendario,this.empleado.idEmpleado).subscribe(
      data => {
       this.asistencias = data.asistencias;
       this.listaSolicitudes = data.solicitudes;
         this.asistencias.forEach(asistencia =>{
          if (asistencia.minutosExtra > 0) {
              var hmensual = '' + Math.floor(asistencia.minutosExtra/ 60);
              var mmensual = '' + asistencia.minutosExtra % 60;
              asistencia.minutosExtraString  = (hmensual.length == 1 ? '0'+hmensual:hmensual) +':'+ (mmensual.length == 1? '0'+mmensual : mmensual);
          }
           asistencia.listaIncidente.forEach(incidente =>{
             if(incidente.tipoIncidente.nombre === 'TARDANZA'){
              //  Estado sin justificar
                if(incidente.estado != 3){
                   this.tardanzasNoJustificadas = this.tardanzasNoJustificadas +1;
                } else if(incidente.estado == 3){
                  this.tardanzasJustificadas = this.tardanzasJustificadas +1;
                }
             }
             if(incidente.tipoIncidente.nombre === 'FALTA' )
            {
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
             }


            if(incidente.tipoIncidente.nombre === 'SALIDA ANTICIPADA'){
                //  Estado sin justificar
                  this.salidasAnticipadas = this.salidasAnticipadas + 1;
                }
           })

           if(asistencia.minutosTarde != undefined){
            this.totalMinutosTardanza = this.totalMinutosTardanza + asistencia.minutosTarde;
           }

           if(asistencia.minutosExtra != undefined){
            
            this.minutosExtra = asistencia.minutosExtra;

            if(this.minutosExtra>0 && !asistencia.noLaboral){
              this.horaFinalMensual = (this.minutosExtra + this.horaFinalMensual);
              this.minutoFinalMensual = (this.minutosExtra + this.minutoFinalMensual);


              var hmensual = '' + Math.floor(this.horaFinalMensual / 60);
              var mmensual = '' + this.minutoFinalMensual % 60;
              this.sobretiempo  = (hmensual.length == 1 ? '0'+hmensual:hmensual) +':'+ (mmensual.length == 1? '0'+mmensual : mmensual);
          }
            // FIN
         }
         if(asistencia.id != null){           
          //asistencia.listaSolicitud = asistencia.listaSolicitud.sort((first, second) => 0 - (first.id > second.id ? -1 : 1));//asistencia.listaSolicitud.sort((a, b) => (a.id < b.id) ? -1 : 1 );

          asistencia.listaSolicitud.forEach(listaSolicitudes =>{
            if(listaSolicitudes.idTipoSolicitud == 7 || listaSolicitudes.idTipoSolicitud == 21){
              var fechaSeleccion = new Date(listaSolicitudes.fechaInicio);
              
              if(this.objetoSolicitud.filter(element => element.solicitudesxDia == listaSolicitudes.id).length < 1){

                var diaInicialSolicitud = this.determinaInicioMes( new Date(listaSolicitudes.fechaInicio),new Date(this.anioFiltro.valorActual+'/'+mesSelect+'/'+1));
                var diaFinalSolicitud = this.determinaFinMes(new Date(listaSolicitudes.fechaFin), this.diasEnUnMes(0, this.anioFiltro.valorActual));
                //esta MAL ESTA LINEA, CORREGIR.
                //var diaFinalSolicitud = this.determinaFinMes(new Date(listaSolicitudes.fechaFin), this.diasEnUnMes( mesSelect, this.anioFiltro.valorActual));
                var contaDias=0;

                const diffTime = Math.abs(diaInicialSolicitud.getTime() - diaFinalSolicitud.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))+1;
                    console.log("diasdiferentesMAIN-> "+diffDays);

                    for(var i=1; i<= diffDays; i++){//undefined
                      contaDias++;
                      listaSolicitudes.nroDias = contaDias;
                    }
                /*ORIGINALfor(var i=diaInicialSolicitud.getDate(); i<= diaFinalSolicitud.getDate(); i++){
                  contaDias++;
                  listaSolicitudes.nroDias = contaDias;
                }*/
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
          //console.log(this.objetoSolicitud);
        }
         })
         this.listaSolicitudes.forEach(listaSolicitudes =>{
          if(listaSolicitudes.idTipoSolicitud == 7 || listaSolicitudes.idTipoSolicitud == 21){
            var fechaSeleccion = new Date(listaSolicitudes.fechaInicio);
            
            if(this.objetoSolicitud.filter(element => element.solicitudesxDia == listaSolicitudes.id).length < 1){                
              var diaInicialSolicitud = this.determinaInicioMes( new Date(listaSolicitudes.fechaInicio),new Date(this.anioFiltro.valorActual+'/'+mesSelect+'/'+1));
              var diaFinalSolicitud = this.determinaFinMes(new Date(listaSolicitudes.fechaFin), this.diasEnUnMes(mesSelect, this.anioFiltro.valorActual));
              var contaDias=0;

              const diffTime = Math.abs(diaInicialSolicitud.getTime() - diaFinalSolicitud.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))+1;
              //console.log("diasdiferentesMAIN-> "+diffDays);

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

         if(this.listaPermiso != undefined){
           this.listaPermiso.sort(function(a:Solicitud,b:Solicitud):number{
             if(a.fechaInicio < b.fechaInicio){
               return 1;
             }

             if(a.fechaInicio > b.fechaInicio){
              return -1;
            }
            return 0;
           }
           );
         }

      }
    );
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

  diasEnUnMes(mes, anio) {
    //retorna dia new Date(año, mes, 0).getDate(); 
    var diFinMes = new Date(anio, mes, 0).getDate();
    return new Date(anio+'/'+mes+'/'+diFinMes);
  }

  contarDiasRangoFechas(fecha1, fecha2):number{
    let fechaInicio = moment(fecha1);
    let fechaFin = moment(fecha2);


    return fechaFin.diff(fechaInicio,'days')+1;
  }

  valor:any;
  async verJustificacion(asis:AsistenciaDto)
  {
    //console.log(this.usuario);
    this.valor=false;
    console.log(asis);

    let editar=false;
    this.usuario.perfiles.forEach(element => {
      if(element.nombre == "ADMINISTRADOR"){
        editar=true;
      }
    });
    console.log(editar);

    if(asis.horaIngres== "" && asis.listaSolicitud.length==0 || editar==false && asis.listaSolicitud.length == 0){
      console.log(asis.horaIngres+'__'+asis.listaSolicitud.length);
      this.valor=true;
    }else{
      console.log(asis.horaIngres+'__'+asis.listaSolicitud.length);
    }

        if(!this.valor){
          if(asis.id != null ){

              asis = await this.asistenciaService.getAsistencia(asis.id);
              if(asis.listaIncidente.length > 0){
                this.router.navigate(['/asistencias/solicitud',asis.id,this.empleado.idEmpleado,asis.fecha]);
              }
              const data = await this.solicitudService.listSolicitudPorDiaEmpleado(asis.fecha,this.empleado.idEmpleado);
              if(data != null && data.length > 0){
                this.router.navigate(['/asistencias/solicitud',asis.id,this.empleado.idEmpleado,asis.fecha]);
              }

          }else if(asis.id == null && asis.estadoDia>0) {
                const data = await this.solicitudService.listSolicitudPorDiaEmpleado(asis.fecha,this.empleado.idEmpleado);
              if(data != null && data.length>0){
                this.router.navigate(['/asistencias/solicitud',0,this.empleado.idEmpleado,asis.fecha]);
              }
          }
        }
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
    this.salidasAnticipadas = 0;
    this.totalMinutosTardanza = 0;
    this.sobretiempo ='00:00';
    this.totalSolicitudes= 0;
    this.minutosExtra = 0;
    this.horaFinalMensual = 0;
    this.minutoFinalMensual = 0;
  }

  salir(){
    sessionStorage.removeItem("fechaCalendario");
    this.router.navigate(['/']);
  }
}