package com.demo.modelo;

public class UsuarioModelo {
	private Integer id;
	private String nombre;
	private String paterno;
	private String materno;
	private String usuario;
	private String clave;
	private boolean enabled;
	
	public UsuarioModelo(Integer id, String nombre, String paterno, String materno, String usuario, String clave,
			boolean enabled) {
		super();
		this.id = id;
		this.nombre = nombre;
		this.paterno = paterno;
		/*this.materno = materno;
		this.usuario = usuario;
		this.clave = clave;
		this.enabled = enabled;*/
	}
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getNombre() {
		return nombre;
	}
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}
	public String getPaterno() {
		return paterno;
	}
	public void setPaterno(String paterno) {
		this.paterno = paterno;
	}
	public String getMaterno() {
		return materno;
	}
	public void setMaterno(String materno) {
		this.materno = materno;
	}
	public String getUsuario() {
		return usuario;
	}
	public void setUsuario(String usuario) {
		this.usuario = usuario;
	}
	public String getClave() {
		return clave;
	}
	public void setClave(String clave) {
		this.clave = clave;
	}
	public boolean isEnabled() {
		return enabled;
	}
	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}
	
	
}
