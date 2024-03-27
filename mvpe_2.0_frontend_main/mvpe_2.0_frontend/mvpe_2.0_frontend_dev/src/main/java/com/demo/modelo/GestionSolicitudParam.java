package pe.gob.onpe.sarha.dto;

import java.util.List;

import pe.gob.onpe.sarha.domain.SolicitudDto;

public class GestionSolicitudParam {
	
	private int idEmpleado;
	private int sede;
	private int tipoRegimen;
	private int codGerencia;
	private int codSubGerencia;
	private int opcion;
	private String busqueda;
	private Integer pagina;
	private Integer itemPorPagina;
	
	private Integer total;
	private Integer totalPagina;
	
        private String fechaInicial;
        private String fechaFinal;

	private List<SolicitudDto> solicitudes;

	public int getIdEmpleado() {
		return idEmpleado;
	}

	public void setIdEmpleado(int idEmpleado) {
		this.idEmpleado = idEmpleado;
	}

	public int getSede() {
		return sede;
	}

	public void setSede(int sede) {
		this.sede = sede;
	}

	public int getTipoRegimen() {
		return tipoRegimen;
	}

	public void setTipoRegimen(int tipoRegimen) {
		this.tipoRegimen = tipoRegimen;
	}

	public int getCodGerencia() {
		return codGerencia;
	}

	public void setCodGerencia(int codGerencia) {
		this.codGerencia = codGerencia;
	}

	public int getCodSubGerencia() {
		return codSubGerencia;
	}

	public void setCodSubGerencia(int codSubGerencia) {
		this.codSubGerencia = codSubGerencia;
	}

	public int getOpcion() {
		return opcion;
	}

	public void setOpcion(int opcion) {
		this.opcion = opcion;
	}

	public String getBusqueda() {
		return busqueda;
	}

	public void setBusqueda(String busqueda) {
		this.busqueda = busqueda;
	}

	public Integer getPagina() {
		return pagina;
	}

	public void setPagina(Integer pagina) {
		this.pagina = pagina;
	}

	public Integer getItemPorPagina() {
		return itemPorPagina;
	}

	public void setItemPorPagina(Integer itemPorPagina) {
		this.itemPorPagina = itemPorPagina;
	}

	public List<SolicitudDto> getSolicitudes() {
		return solicitudes;
	}

	public void setSolicitudes(List<SolicitudDto> solicitudes) {
		this.solicitudes = solicitudes;
	}

	public Integer getTotal() {
		return total;
	}

	public void setTotal(Integer total) {
		this.total = total;
	}

	public Integer getTotalPagina() {
		return totalPagina;
	}

	public void setTotalPagina(Integer totalPagina) {
		this.totalPagina = totalPagina;
	}
	
	
	public Integer calcularTotalPagina() {
		return (int) Math.ceil((double) this.total / this.itemPorPagina);
	}

        public String getFechaInicial() {
            return fechaInicial;
        }

        public void setFechaInicial(String fechaInicial) {
            this.fechaInicial = fechaInicial;
        }

        public String getFechaFinal() {
            return fechaFinal;
        }

        public void setFechaFinal(String fechaFinal) {
            this.fechaFinal = fechaFinal;
        }
}