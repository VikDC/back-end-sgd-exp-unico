package pe.gob.onpe.adan2backend.model.entities.proceso;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Data
@Table(name = "cab_configuracion")
public class Configuracion {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name= "n_configuracion_pk")
	private int id;
	
	@Column(name= "n_tipo")
	private int tipo; 
	
	@Column(name= "c_descripcion")
	private String descripcion;
	
	@Column(name= "n_activo")
	private int activo;
	
	@Column(name= "c_aud_usuario_creacion")
	private String usu_creacion;
	
	@Column(name= "d_aud_fecha_creacion")
	private LocalDateTime fec_creacion;
	
	@Column(name= "c_aud_usuario_modificacion")
	private String usu_mod;
	
	@Column(name= "d_aud_fecha_modificacion")
	private LocalDateTime fec_mod;
	
	@OneToMany(mappedBy = "id_conf", cascade=CascadeType.PERSIST)
	private List<DetalleConfiguracion> detalleConfiguracion=new ArrayList<DetalleConfiguracion>();

}
