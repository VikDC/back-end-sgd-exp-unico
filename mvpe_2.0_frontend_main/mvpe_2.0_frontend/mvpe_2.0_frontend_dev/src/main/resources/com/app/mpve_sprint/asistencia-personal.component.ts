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
import { EmpleadoContrato } from 'src/app/modelo/empleado.contrato';
import { IfStmt } from '@angular/compiler';
import { AsistenciaIndividualReportService } from 'src/app/service/asistencia-individual-report.service';
import { ToastrService } from 'ngx-toastr';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { exit } from 'process';

@Component({
  selector: 'app-asistencia-personal',
  templateUrl: './asistencia-personal.component.html',
  styleUrls: ['./asistencia-personal.component.scss']
})
export class AsistenciaPersonalComponent implements OnInit {

  screenHeight:any;
  screenWidth:any;

  cabeceras : string[]=['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO']
  asistencias : AsistenciaDto[];
  empleado:EmpleadoDto = new EmpleadoDto();
  faltasJustificadas : number = 0;
  faltasNoJustificadas: number = 0;
  tardanzasJustificadas : number = 0;
  tardanzasNoJustificadas : number = 0;
  faltasPorTardanza:number=0;
  faltasPorSalidaAnticipada:number = 0;

  enviados: number = 0;
  aprobados:number = 0;
  validados:number = 0;
  rechazados:number =0;
  totalMinutosTardanza: number = 0;
  sobretiempo : number=0;
  totalDiasPermiso:number=0;
  totalSolicitudes:number = 0;
  fechaCalendario :string;
  panelOpenState = false;
  usuario = new Usuario;
  fechaCorte = new FechaCorteDto;
  public imageSrc: string = 'assets/img/icon/icon_user.svg';
  listaPermiso:Solicitud[]= new Array;
  listaSolicitudes:Solicitud[]= new Array;
  mesActual : string;
  anioFiltro : ValorSecuencia = new ValorSecuencia();
  mesFiltro : ValorSecuencia = new ValorSecuencia();
  fecha :Date = new Date();
  maxCantidadAnio:number = 3;
  maxAnio:number;
  maxStrAnio: string;
  public hoy = new Date();
  public fechaHoy: string;
  anio:string;
  mes:number;
  idEmpleado :number;
  codigoMarcacion:string;
  cadenaFechas:string[];
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
  public dias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  minutoingreso:any=0;
  minutosalida:any=0;

  horaingresoEmpleado:any=0;
  horasalidaEmpleado:any=0;

  minutoingresoEmpleado:any=0;
  minutosalidaEmpleado:any=0;

  minutosExtra:number=0;
  minutosExtraFinal:any=0;
  vacacionesArrary= new Array;
  //onomasticoArrary= new Array;
  onomasticoArrary: any[] = [];
  onomasticoArraryAux= new Array;

  horaFinalMensual:any=0;
  minutoFinalMensual:any=0;
  minutosExtraFinalMensual:any;
  salidasAnticipadas:number=0;
  objetoSolicitud= new Array;
  objetoVacaciones = new Array;
  horaSalida:number=17;

  constructor(
    public datePipe: DatePipe,
    public authService:AuthService,
    private asistenciaService: AsistenciaService,
    private empleadoService:EmpleadoService,
    private parametroService:ParametroService,
    private solicitudService:SolicitudService,
    private dateUtilService:DateUtilService,
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public router: Router,
    private toastr : ToastrService,
    public asistenciaIndividualReport:AsistenciaIndividualReportService) {

    this.idEmpleado = parseInt(this.route.snapshot.paramMap.get('id'), 0);
    this.codigoMarcacion = this.route.snapshot.paramMap.get('codigoMarcacion');

   // this.fechaCalendario = this.route.snapshot.paramMap.get('fechaCalendario');
    this.fechaCalendario = sessionStorage.getItem("fechaCalendario");
    this.obtenerEmpleado(this.idEmpleado);
    if(this.fechaCalendario == undefined || this.fechaCalendario == ''|| this.fechaCalendario == null){
      this.fechaCalendario = this.fecha.getMonth()+1 +"/"+this.fecha.getFullYear();
    }
    this.cadenaFechas = this.fechaCalendario.split('/');
    this.mesActual = this.getMeses()[parseInt(this.cadenaFechas[0], 0)-1] + " " + this.cadenaFechas[1];
    this.anioFiltro.valorActual = this.cadenaFechas[1];
    this.mesFiltro.valorActual = this.getMeses()[parseInt(this.cadenaFechas[0], 0)-1];
    this.getScreenSize();
    this.parametroService.obtenerFechaCorteDto();
    this.fechaCorte = this.parametroService.fechaCorteDto;
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

  seleccionarAnio(anios: number) {
    let anioActual = parseInt(this.anioFiltro.valorActual);
    if((anioActual + anios) < 2010){
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

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
   this.screenHeight = window.innerHeight;
   this.screenWidth = window.innerWidth;
}


acortarNomSolicitud(nomSolicitud: string){

  let nombreEtiqueta:String = '';
  nombreEtiqueta = nomSolicitud;

  if(this.screenWidth==1280 && this.screenHeight==720)
  {
    if(nombreEtiqueta.length > 20){
      nombreEtiqueta = nombreEtiqueta.slice(0,16) + "...";
    }
  }
/*
  if(this.screenWidth>1280 && this.screenHeight>720)
  {
    if(nombreEtiqueta.length>20){
      nombreEtiqueta = nombreEtiqueta.slice(0,29) + "...";
    }
  }
*/

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
  //console.log(nombreEtiqueta);
  return nombreEtiqueta;
}

  cargarAnios(){
    this.asistenciaService.getAniosFiltros().subscribe(data=>{
      this.anios = data;
    })
  }

//AQUI
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
            //console.log('El data es...:',data);
            this.imageSrc = 'assets/img/icon/icon_user.svg';
            this.empleado = data.empleado;
            //console.log('El codigoMarcacion es...:',data.empleado.codigoMarcacion);
            if(this.empleado.foto !== null){
              this.imageSrc = this.empleado.foto;
            }
            this.codigoMarcacion = data.empleado.codigoMarcacion;
            
           /* this.empleadoService.getFotoEmpleado(this.empleado.numeroDocumento).subscribe(data =>{

              if(data != null && data.url != null){
                this.imageSrc = data.url;
              } else {
                this.imageSrc = "assets/img/icon/icon_user.svg"
              }

           });*/
            this.list();
            this.horaingresoEmpleado=this.empleado.horarioIngreso;
            this.horasalidaEmpleado=this.empleado.horarioSalida;
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

  list(){
    this.minutosExtraFinalMensual = '';
    this.horaFinalMensual = 0;
    this.minutoFinalMensual = 0;
    this.totalMinutosTardanza = 0;
    var contador=0;
    var idAux=0;
    this.objetoSolicitud = new Array;
    var mesSelect = Number(this.getMeses().indexOf(this.mesFiltro.valorActual))+1;
    var valor=0;
    this.inicializarContadores();
    console.log(this.fechaCalendario);
    this.asistenciaService.list(this.fechaCalendario,this.idEmpleado).subscribe(
      data => {

        this.asistencias = data.asistencias;
        this.listaSolicitudes = data.solicitudes;        
        this.horaFinalMensual = 0;
        this.minutoFinalMensual = 0;
        this.totalMinutosTardanza = 0;
        this.minutosExtraFinalMensual = '';

        this.listaSolicitudes.forEach(solicitud=>{ //10-06-2022
          if(solicitud.idTipoSolicitud == 21){ //VACACIONES            
            var diaInicial = new Date(solicitud.fechaInicio);
            var diaFinal = new Date(solicitud.fechaFin);
            for(var i=diaInicial.getDate(); i<=diaFinal.getDate(); i++){
              var item = {
                id: solicitud.idTipoSolicitud,
                descripcion: solicitud.nombreSolicitud,
                fechaVacacion: ((""+i).padStart(2, "0")+'/'+(""+(diaInicial.getMonth()+1)).padStart(2, "0")+'/'+diaInicial.getFullYear())
              };
              //str.padStart(4, "0")              
              this.objetoVacaciones.push(item);
            }
          }
        })

        this.asistencias.forEach(asistencia =>{
            let faltaTardanza = false;
            asistencia.listaIncidente.forEach((incidente,index) =>{
            
              if(incidente.tipoIncidente.nombre === 'TARDANZA'){
                  //vdcp
                  if(incidente.estado == 0){
                    asistencia.estadoTardanza=1;
                  }//

                  if(incidente.estado != 3){
                    this.tardanzasNoJustificadas = this.tardanzasNoJustificadas +1;
                  } else if(incidente.estado == 3){
                    this.tardanzasJustificadas = this.tardanzasJustificadas +1;
                  }
              }
              if(incidente.tipoIncidente.nombre === 'FALTA'){
                  if(incidente.estado != 3){
                    this.faltasNoJustificadas = this.faltasNoJustificadas +1;
                  } else if(incidente.estado == 3){
                    this.faltasJustificadas = this.faltasJustificadas +1;
                  }
              }
              if( incidente.tipoIncidente.nombre === 'FALTA POR TARDANZA'){
                  this.faltasPorTardanza = this.faltasPorTardanza +1;
                  asistencia.faltaTardanza = false;
                  if(this.empleado.idTipoRegimen ===1){
                      faltaTardanza = true;
                      asistencia.faltaTardanza = true;
                  }
              }
              if(incidente.tipoIncidente.nombre === 'SALIDA ANTICIPADA'){
                //Estado sin justificar
                this.salidasAnticipadas = this.salidasAnticipadas + 1;
              }
              if(incidente.tipoIncidente.nombre === 'FALTA POR SALIDA ANTICIPADA'){
                //Estado sin justificar
                this.salidasAnticipadas = this.salidasAnticipadas + 1;
              }
            });
           
          //Sumando 7-DESCANSO MÉDICO, 21	VACACIONES
          if(asistencia.id != null){                      
            //asistencia.listaSolicitud = asistencia.listaSolicitud.sort((first, second) => 0 - (first.id > second.id ? -1 : 1));//asistencia.listaSolicitud.sort((a, b) => (a.id < b.id) ? -1 : 1 );

            asistencia.listaSolicitud.forEach(listaSolicitudes =>{
              if(listaSolicitudes.idTipoSolicitud == 7 || listaSolicitudes.idTipoSolicitud == 21){
                var fechaSeleccion = new Date(listaSolicitudes.fechaInicio);
                
                if(this.objetoSolicitud.filter(element => element.solicitudesxDia == listaSolicitudes.id).length < 1){

                  var diaInicialSolicitud = this.determinaInicioMes( new Date(listaSolicitudes.fechaInicio),new Date(this.anioFiltro.valorActual+'/'+mesSelect+'/'+1));
                  var diaFinalSolicitud = this.determinaFinMes(new Date(listaSolicitudes.fechaFin), this.diasEnUnMes(mesSelect, this.anioFiltro.valorActual));
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

            if(asistencia.minutosExtra != undefined){
              //2020-03-09 23:37:22 - 09/04/2022
              const fechaComoCadena = asistencia.fecha.substring(6,10)+"-"+asistencia.fecha.substring(3,5)+"-"+asistencia.fecha.substring(0,2); // día lunes
              const numeroDia = new Date(fechaComoCadena).getDay();

                //INICIO SOBRETIEMPO
                if(asistencia.fecha != null && asistencia.horaSalidaActualizado != '' && asistencia.horaSalidaActualizado != undefined){

                  if(asistencia.listaSolicitud.length>0 && asistencia.listaSolicitud[0].nombreCortoSolicitud == "P.D."){
                    this.minutosalida = Number(asistencia.listaSolicitud[0].horaFin.substring(2,0));
                    this.minutosalida = Number(this.minutosalida*60)+Number(asistencia.listaSolicitud[0].horaFin.substring(3,5));

                  }else if(asistencia.listaSolicitud.length > 0 && (asistencia.listaSolicitud[0].idTipoSolicitud == 5 || 
                      asistencia.listaSolicitud[0].idTipoSolicitud == 21 || asistencia.listaSolicitud[0].idTipoSolicitud == 3)){
                    asistencia.listaSolicitud[0].horaInicio = "";
                    asistencia.listaSolicitud[0].horaFin = "";
                  }else {
                    this.minutosalida = Number(asistencia.horaSalidaActualizado.substring(2,0));
                    this.minutosalida = Number(this.minutosalida*60)+Number(asistencia.horaSalidaActualizado.substring(3,5));
                  }

                  if(this.minutosalidaEmpleado==null){
                    this.minutosalidaEmpleado = 0;
                  }else{
                  
                    if(numeroDia == 5 || numeroDia == 6 || asistencia.feriado){
                      this.minutosalidaEmpleado = Number(asistencia.horaIngres.substring(2,0));
                      this.minutosalidaEmpleado = Number(this.minutosalidaEmpleado*60)+Number(asistencia.horaIngres.substring(3,5));
                    }else{
                      this.minutosalidaEmpleado = Number(this.horasalidaEmpleado.substring(2,0));
                      this.minutosalidaEmpleado = Number(this.minutosalidaEmpleado*60)+Number(this.horasalidaEmpleado.substring(3,5));
                    }
                  }
                  
                  this.minutosExtra = asistencia.minutosExtra;
                  this.minutosExtraFinal = 0;

                  //var hora='0'+(Math.floor(element.tiempoIncidencia/60));

                  if(this.minutosExtra>0 && !asistencia.noLaboral){
                    var hora='0'+(Math.floor(this.minutosExtra/60));
                    var minuto='0'+(this.minutosExtra%60);
                    this.horaFinalMensual = (this.minutosExtra+this.horaFinalMensual);
                    this.minutoFinalMensual = (this.minutosExtra + this.minutoFinalMensual);
                    this.minutosExtraFinal = hora.substring(hora.length-2) +':'+ minuto.substring(minuto.length-2);
                    //this.minutosExtraFinal = (Number(hora.substring(hora.length-2))>0 ? hora.substring(hora.length-2) +':'+ minuto.substring(minuto.length-2) : 0);

                    asistencia.minutosExtraString = this.minutosExtraFinal;
                  }
                }else if(asistencia.listaSolicitud.length > 0 && (asistencia.listaSolicitud[0].idTipoSolicitud == 5)){
                  asistencia.listaSolicitud[0].horaInicio = "";
                  asistencia.listaSolicitud[0].horaFin = "";
                }
                //FIN SOBRETIEMPO

                //INICIO OBTIENE SOLICITUDES
                //3	ASUNTO PARTICULAR, 4-CAPACITACIÓN, 7-DESCANSO MÉDICO, 12-PARTES DIARIOS, 18	DOCENCIA, 21-VACACIONES
                if(asistencia.listaSolicitud.length > 0){
                  var solicitud = asistencia.listaSolicitud[0].idTipoSolicitud;
                  var entidad = {
                    fecha: asistencia.fecha,
                    horainicio: (solicitud == 7 || solicitud == 21 || solicitud == 4 || solicitud == 18 || solicitud == 3 ? '' : asistencia.listaSolicitud[0].horaInicio),
                    horafinal: (solicitud == 7 || solicitud == 21 || solicitud == 4 || solicitud == 18 || solicitud == 3 ? '' : asistencia.listaSolicitud[0].horaFin),
                    nombreSolicitud: asistencia.listaSolicitud[0].nombreSolicitud,
                    idTipoSolicitud: asistencia.listaSolicitud[0].idTipoSolicitud,
                    minutosExtraFinal: (solicitud == 7 || solicitud == 21 || solicitud == 4 || solicitud == 18 || solicitud == 3 ? '' : this.minutosExtraFinal),
                    vacaciones: this.descripcionVacacion(asistencia.fecha,1) //(solicitud == 21 ? asistencia.listaSolicitud[0].nombreSolicitud : '')
                  };
                  //console.log(this.descripcionVacacion(asistencia.fecha,1));
                  this.vacacionesArrary.push(entidad);
                }else {
                  var entidad = {
                    fecha: asistencia.fecha,
                    horainicio: asistencia.horaIngresoActualizado,
                    horafinal: asistencia.horaSalidaActualizado,
                    nombreSolicitud: "", //"COMUN"
                    idTipoSolicitud: 0,
                    minutosExtraFinal: this.minutosExtraFinal,
                    vacaciones: ""
                  };
                  this.vacacionesArrary.push(entidad);
                }
                //FIN OBTIENE SOLICITUDES
            }

            if(asistencia.minutosTarde != undefined && faltaTardanza == false){
              this.totalMinutosTardanza = this.totalMinutosTardanza + asistencia.minutosTarde;
            }
         })

        this.onomasticoArrary = [];
        let fecha="";
        //var registroOnomastico: any;
        //SOLICITUD ONOMASTICO
        this.asistencias.forEach(asistencia =>{
          if(asistencia.fecha != null){

            asistencia.listaSolicitud.forEach((solicitud, index) =>{
              if(solicitud.idTipoSolicitud == 21 || solicitud.idTipoSolicitud == 5){// || solicitud.idTipoSolicitud == 23){                
                var entidadVacaciones = {
                  fecha: asistencia.fecha,
                  horainicio: asistencia.horaIngresoActualizado,
                  horafinal: asistencia.horaSalidaActualizado,
                  nombreSolicitud: "", //"COMUN"
                  idTipoSolicitud: 0,
                  minutosExtraFinal: this.minutosExtraFinal,
                  vacaciones: ""//(solicitud.idTipoSolicitud == 21 ? "VACACIONES" : "ONOMÁSTICO")
                };
                this.vacacionesArrary.push(entidadVacaciones);
             
                var entidad = {
                  fecha: asistencia.fecha,
                  nombreSolicitud: solicitud.nombreSolicitud,
                  idTipoSolicitud: solicitud.idTipoSolicitud,
                  vacaciones: (solicitud.idTipoSolicitud == 21 ? solicitud.nombreSolicitud: "" )
                };
                this.onomasticoArrary.push(entidad);
              }
            });
          }
        });
        this.ordenarActualizarArreglo(fecha, this.onomasticoArrary);
         //INICIO SOLICITUD
         this.listaSolicitudes.forEach(solicitud=>{     
 
          if(solicitud.idTipoSolicitud == 5){ //ONOMÁSTICO
            var diaInicial = new Date(solicitud.fechaInicio);
          }

          if(solicitud.tipo == 1){
            let diasPermiso;
            if(solicitud.diaHabil != null && solicitud.diaHabil){
              diasPermiso = solicitud.numeroDias;
            } else {
              diasPermiso = this.contarDiasRangoFechas(solicitud.fechaInicio, solicitud.fechaFin);
            }
          }

          switch(solicitud.estado){
            case 1: this.enviados = this.enviados +1;break;
            case 2: this.aprobados = this.aprobados +1;break;
            case 3: this.validados = this.validados +1; break;
            case 4:this.rechazados = this.rechazados +1; break;
          }

         })
         //FIN SOLICITUD
         var hmensual= ''+Math.floor(this.horaFinalMensual/60);
         var mmensual= ''+this.minutoFinalMensual%60;
         this.minutosExtraFinalMensual = (hmensual.length == 1 ? '0'+hmensual:hmensual) +':'+ (mmensual.length == 1? '0'+mmensual : mmensual);

         
      }
    );
    //console.log(this.vacacionesArrary);
  }

  ordenarActualizarArreglo(fecha: string, registroOnomastico: any) {
    this.onomasticoArrary.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    this.onomasticoArrary.forEach((row, index) => {
      if (fecha != row.fecha) {
        fecha = row.fecha;
      } else {
        registroOnomastico = {
          fecha: row.fecha,
          nombreSolicitud: "ONOMÁSTICO / VACACIONES",
          idTipoSolicitud: 5,
          vacaciones: "VACACIONES"
        };
        this.onomasticoArrary = this.onomasticoArrary.filter((registro) => registro.fecha !== row.fecha);
        this.onomasticoArrary.push(registroOnomastico);
      }
    });
  }

  contarDiasRangoFechas(fecha1, fecha2):number{
    let fechaInicio = moment(fecha1);
    let fechaFin = moment(fecha2);
    return fechaFin.diff(fechaInicio,'days')+1;
  }

  btnRegistrarNuevaSolicitud(){
    let persona = new Persona();
    persona.genero = this.empleado.genero;
    persona.edicionPersonal = "NO";
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

  headers :string[] = ["U. ORGÁNICA",	"FECHA", "DÍA",	"EMPLEADO",	"TIPO",	"MARCADO INGRESO",	"MARCADO SALIDA",	"HORA INGRESO",	"HORA SALIDA",	"INCIDENCIA",	"JUSTIFICACIÓN",	"MINUTOS TARDE","TIEMPO EXTRA TRABAJADO",	"VACACIONES" ];
  nombreArchivo:string = 'Reporte Asistencia Individual';
  async exportExcel(){
    let mes = this.getMeses().indexOf(this.mesFiltro.valorActual)+1;

    const data = this.asistenciaService.getAsistenciaindividual(this.idEmpleado, this.anioFiltro.valorActual, mes).subscribe(data=>{
      if(data != null){
        //console.log(data);
        data.forEach(element => {
          const numeroDia = new Date(element.fecha.slice(3,5)+"/"+element.fecha.slice(0,2)+"/"+element.fecha.slice(6,10)).getDay();
          const nombreDia = this.dias[numeroDia];
          element.dia = nombreDia;

          /*if(element.minutosTrabajo >0){
            /*
            var hora='0'+(Math.floor(element.minutosTrabajo/60));
            var minuto='0'+(element.minutosTrabajo%60);
            element.tiempoTrabajoString = hora.substring(hora.length-2) +'h '+ minuto.substring(minuto.length-2) + 'm';
            * /
            var hora=element.horaFin.substring(2,0);
            var minuto=element.horaFin.substring(3,5);
            hora = (hora-this.horaSalida);
            //console.log("hora: "+hora +" minuto: " + minuto);

            if(parseInt(hora)>=1 || parseInt(minuto)>=1){
              element.tiempoExtraString = hora + 'h '+ minuto + 'm';// horaExtra.substring(horaExtra.length-2) +'h '+ minuto.substring(minuto.length-2) + 'm';
            }else{
              element.tiempoExtraString = '';
            }
          }*/
        });
        //console.log(this.onomasticoArrary);
        this.asistenciaIndividualReport.getAsistenciaIndividualExcel(this.nombreArchivo,this.headers,data,this.usuario.usuario,this.vacacionesArrary,this.onomasticoArrary);
      }
    });
  }

  async verJustificacion(asis:AsistenciaDto){
    if(this.usuario.isAdmin == 1){
      if(this.empleado.estado == 1   ){
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
      } else {
        this.toastr.clear();
          this.toastr.warning("No se puede registrar solicitud de justificación para un personal inhabilitado.", 'Aviso', {
            timeOut: 5000, progressBar: false, closeButton: true
          });
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
    this.totalMinutosTardanza = 0;
    this.salidasAnticipadas = 0;
    this.sobretiempo =0;
    this.totalSolicitudes= 0;
    this.horaFinalMensual=0;
    this.minutoFinalMensual=0;    
    this.minutosExtraFinalMensual='';
  }

  salir(){
    sessionStorage.removeItem("fechaCalendario");
    this.router.navigate(['/asistencias/']);
  }

  descripcionVacacion(fecha, id){
    var cadena="";
    this.objetoVacaciones.forEach(item=>{
      if(fecha == item.fechaVacacion){
        //console.log(item);
        cadena = item.descripcion;
        exit;
      }
    });
    return cadena;
  }
}

export class ValorSecuencia{
  valorAnterior:string;
  valorActual:string;
  valorSiguiente:string;
}