import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Empleado } from '../../../modelo/empleado';
import { EmpleadoService } from 'src/app/service/empleado.service';
import { CatalogoService } from 'src/app/service/catalogo.service';
import { UnidadOrganicaService } from 'src/app/service/unidad-organica.service';
import { Catalogo } from 'src/app/modelo/catalogo';
import { UnidadOrganica } from 'src/app/modelo/unidad-organica';
import { environment } from 'src/environments/environment';
import { EmpleadoDto } from 'src/app/modelo/empleado-dto';
import { GestionSolicitudService } from 'src/app/service/gestionSolicitud.service';
import { Equipo } from 'src/app/modelo/equipo';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AuthService } from 'src/app/service/auth.service';
import { Usuario } from 'src/app/modelo/usuario';

@Component({
  selector: 'app-list-asistencia',
  templateUrl: './list-asistencia.component.html',
  styleUrls: ['./list-asistencia.component.scss']
})
export class ListAsistenciaComponent implements OnInit {
  public page:number = 1;
  public queryFilter: string;
  public total:number;

  public empleado: EmpleadoDto = new EmpleadoDto();
  public filtro: string;
  public mensaje : string;
  public verGerencia: boolean = false;
  public verSubGerencia: boolean = false;
  public aplicaFiltro: boolean = true;
  public muestraFiltro: boolean = true;
  public tieneResultado : boolean = true;
  public empleados: EmpleadoDto[];
  public empleadosBD: EmpleadoDto[];
  public empleadosFiltro: EmpleadoDto[];
  public regimen : Catalogo = new Catalogo();
  public tiposRegimen: Catalogo[];
  public sedes: Catalogo[];
  public sede: Catalogo = new Catalogo();
  public gerencias: UnidadOrganica[];
  public gerencia: UnidadOrganica = new UnidadOrganica();
  public subGerencia: UnidadOrganica = new UnidadOrganica();
  public subGerencias: UnidadOrganica[];
  public ruta: string = environment.BASE_URL + "/apiEmpleado/getFoto/";

  public equipo: Equipo = new Equipo();
  public nivelAprobacion:number = 0;
  public isAdmin:boolean = false;
  private nivelFiltro:number = 0;
  public vista:number = 0;
  public usuario = new Usuario;
  public _timeout: any;
  public loading: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('filter1') myFilterVariable: ElementRef;

  constructor(
    public authService:AuthService,
    private empleadoService: EmpleadoService,
    public router: Router,
    private toastr: ToastrService,
    private catalogoService: CatalogoService,
    private unidadOrganicaService: UnidadOrganicaService,
    private gestionSolicitudService:GestionSolicitudService) {
      this.getEquipo();
      this.listarSede();
      this.listarTiposRegimen();
      this.listarGerencia();
      this.empleado.filtroEstado = true;
      this.empleado.estado = 1;//por defecto se debe mostrar los empleados con estado activo
      this.list();
      this.mensaje = "No se encontraron coincidencias";

  }
  contadorRegimen:number = 0;
  verTipoRegimen:boolean=true;
  ngOnInit(): void {
    this.authService.isAuthenticated();
    this.usuario = this.authService.usuario;
    //console.log(this.usuario);
    if(this.usuario.regimenes != null && this.usuario.regimenes != undefined) {
        this.usuario.regimenes.forEach(regimen =>{
          this.contadorRegimen = this.contadorRegimen + 1 ;
        });
      }
    if(this.contadorRegimen = 1){
      this.verTipoRegimen = false;
     }
  }

  over(empleado){
    this._timeout = window.setTimeout(() => {
      this.empleadoService.getFotoEmpleado(empleado.numeroDocumento).subscribe(data =>{
        if(data != null && data.url != null){
          empleado.foto = data.url;
        } else {
          empleado.foto = "assets/img/icon/icon_user.svg"
        }
      });
    }, 2000);
  }

  out(empleado){
    window.clearTimeout(this._timeout);
    empleado.foto = "assets/img/icon/icon_user.svg"
  }


  getEquipo(){
    this.gestionSolicitudService.getEquipo().subscribe(
      data => {
        this.equipo = data;
        if(this.equipo != null){
          this.nivelAprobacion = this.equipo.nivelAprobacion;
          this.getSubgerencias(this.equipo.idUnidadOrganica);
          if(this.nivelAprobacion == 0 || this.nivelAprobacion == 2){
            this.verSubGerencia = false;
          }
        }else{
          this.isAdmin = true;
        }
    });
  }

  listarTiposRegimen(){
    let cargo = new Catalogo();
    cargo.tabla ="TAB_EMP_CONTRATO";
    cargo.columna = "N_TIPO_CONTRATO"
    this.catalogoService.list(cargo).subscribe(
      data =>{
        this.tiposRegimen = data;
       // console.log(this.tiposRegimen);
      });
  }

  listarSede() {
    let sede = new Catalogo();
    sede.tabla = "TAB_EMPLEADO";
    sede.columna = "N_SEDE"
    this.catalogoService.list(sede).subscribe(

      data => {
        this.sedes = data;
      });

  }

  listarGerencia() {

    this.gerencia.nivel = 1;
    this.unidadOrganicaService.list(this.gerencia).subscribe(data => {
      this.gerencias = data;
    })
  }

  changeEstado(){
    this.muestraFiltro = false;
  }
  changeRegimen(){
    this.muestraFiltro = false;
  }

  changeSede() {
    this.verGerencia = true;
    this.muestraFiltro = false;
    this.nivelFiltro = 1;
    if(this.nivelAprobacion==1) this.verSubGerencia=true;

  }
  changeSubGerencia() {

    this.nivelFiltro = 3;
    this.muestraFiltro = false;

  }

  async getSubgerencias(idUO:number) {
    //this.nivelFiltro = 2;
    //this.verSubGerencia = true;

    let subgerencia = new UnidadOrganica;
    subgerencia.nivel = 2;
    subgerencia.idPadre = idUO;
    this.subGerencias = await new Promise((resolve, reject) => {
      this.unidadOrganicaService.list(subgerencia).subscribe(data => {
        resolve(data);
      });
    });

  }

  async changeGerencia() {
    if(this.gerencia.id != undefined){
      this.nivelFiltro = 2;
    this.verSubGerencia = true;

    let subgerencia = new UnidadOrganica;
    subgerencia.nivel = 2;
    subgerencia.idPadre = this.gerencia.id;
    this.subGerencias = await new Promise((resolve, reject) => {
      this.unidadOrganicaService.list(subgerencia).subscribe(data => {
        resolve(data);
      });
    });
    }
    else {
      this.verSubGerencia = false;
      this.subGerencia = new UnidadOrganica();
     }
  }

  list() {
    this.loading = true;
    this.empleadoService.listaEmpleados(this.empleado).subscribe(
      data => {
        this.empleados = data;
        this.empleadosBD = data;
        this.tieneResultado = true;
        if(this.empleados.length == 0){
           this.tieneResultado = false;
        }
        this.loading = false;
      }
    );
  }

  applyFilterSedeGerenciaSubGerencia() {
    this.myFilterVariable.nativeElement.value = '';
    this.page = 1;
    this.queryFilter = '';
    this.total = 0;
    this.aplicaFiltro = false;
    let empleadosFiltro;

    if(this.sede!=undefined){
      if(this.sede.valueOf()== 0)
        this.empleado.sede = null;
      else
        this.empleado.sede = this.sede;
    }

    if(this.gerencia !=undefined){
      if(this.gerencia.valueOf()== 0)
        this.empleado.gerencia  = null;
      else
        this.empleado.gerencia = this.gerencia;
    }

    if(this.subGerencia!=undefined){
      if(this.subGerencia.valueOf()== 0)
        this.empleado.subgerencia = null;
      else
        this.empleado.subgerencia = this.subGerencia;
    }

    if(this.regimen != undefined){
      this.empleado.tipoContrato = this.regimen.nombre;
    } else {
      this.empleado.tipoContrato ="";
    }

    this.list();
  }

  applyFilterSedeGerenciaSubGerencia1() {
    this.aplicaFiltro = false;
    let empleadosFiltro;

    if(this.nivelFiltro == 1){
      empleadosFiltro = this.empleadosBD.filter(
        empleado =>
              empleado.sede.codigo == this.sede.codigo
     );
     this.filtro = this.sede.nombre;
    } else if(this.nivelFiltro == 2){
      empleadosFiltro = this.empleadosBD.filter(
        empleado =>
          empleado.sede.codigo == this.sede.codigo && empleado.gerencia.id == this.gerencia.id
     )
     this.filtro = this.sede.nombre +"-"+this.gerencia.siglas;
    }else if(this.nivelFiltro == 3 && this.isAdmin){
      empleadosFiltro = this.empleadosBD.filter(
        empleado =>
        empleado.sede.codigo == this.sede.codigo && empleado.gerencia.id == this.gerencia.id && empleado.subgerencia.id == this.subGerencia.id)
        //this.filtro = this.sede.nombre +"-"+this.gerencia.siglas +"-"+this.subGerencia.siglas;
    }else if(this.nivelFiltro == 3 && this.nivelAprobacion==1){
      empleadosFiltro = this.empleadosBD.filter(
        empleado =>
        empleado.sede.codigo == this.sede.codigo && empleado.subgerencia.id == this.subGerencia.id)
        //this.filtro = this.sede.nombre +"-"+this.subGerencia.siglas;
    }
    if(this.regimen.codigo!=undefined && this.nivelFiltro !=0){
      empleadosFiltro =  empleadosFiltro.filter(
      empleado =>
      empleado.tipoContrato == this.regimen.nombre)
    }
    if(this.regimen.codigo!=undefined && this.nivelFiltro ==0){
      empleadosFiltro =  this.empleadosBD.filter(
        empleado =>
        empleado.tipoContrato == this.regimen.nombre)
    }

    this.empleados = empleadosFiltro;
    this.tieneResultado = true;
    if(this.empleados.length == 0){
      this.tieneResultado = false;
    }
  }

  deleteFilterSede() {
    this.myFilterVariable.nativeElement.value = '';
    this.page = 1;
    this.queryFilter = '';
    this.total = 0;
    this.filtro = "";
    this.nivelFiltro = 0;
    this.aplicaFiltro = true;
    this.muestraFiltro = true;
    this.empleados = this.empleadosBD;
    this.tieneResultado = true;
    this.gerencia = new UnidadOrganica();
    this.sede = new Catalogo();
    this.regimen = new Catalogo();
    this.subGerencia = new UnidadOrganica();
    this.verGerencia  = false;
    this.verSubGerencia  = false;
    this.empleado=new EmpleadoDto();
    this.empleado.filtroEstado = true;
    this.empleado.estado = 1;
    this.list();
  }

  public cambiarVista(valor:number){
    this.vista = valor;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    let empleadosFiltro = this.empleadosBD.filter( function(empleado){
      let  nombreCompleto = empleado.apellidoPaterno + " " + empleado.apellidoMaterno +" " + empleado.nombres;
      return  ( nombreCompleto.toLowerCase().includes(filterValue.toLowerCase()) ||
           empleado.numeroDocumento.toLowerCase().includes(filterValue.toLowerCase()) )
     }
   )
   /* let empleadosFiltro = this.empleadosBD.filter(
      empleado =>
        empleado.apellidoMaterno.toLowerCase().includes(filterValue.toLowerCase()) ||
        empleado.apellidoPaterno.toLowerCase().includes(filterValue.toLowerCase()) ||
        empleado.nombres.toLowerCase().includes(filterValue.toLowerCase())
        || empleado.numeroDocumento.toLowerCase().includes(filterValue.toLowerCase())
    )*/

    this.empleados = empleadosFiltro;
    if (filterValue == "") {
      this.empleados = this.empleadosBD;
    }
    this.tieneResultado = true;
    if(this.empleados.length == 0){
      this.tieneResultado = false;
    }
    this.total = this.empleados.length;
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

export interface EmpleadoInterface {
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  numeroDocumento: string;
  id: number;
  tipoContrato: string;
  gerencia: string;
  subgerencia: string;
  sede: string;
}