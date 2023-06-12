package pe.gob.onpe.adan2backend.model.entities.proceso;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Entity
@Data
@Table(name = "det_configuracion")
public class DetalleConfiguracion {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "n_det_configuracion_pk")
	private int id;
	
	@ManyToOne
	@JoinColumn(name="n_configuracion")
	@JsonIgnore
	private Configuracion id_conf;

	@Column(name = "c_clave")
	private String tipo;
	
	@Column(name = "c_valor")
	private String contenido;
	
	@Column(name = "n_activo")
	private int estado;
	
	@Column(name= "c_aud_usuario_creacion")
	private String usu_creacion;
	
	@Column(name= "d_aud_fecha_creacion")
	private LocalDateTime fec_creacion;
	
	@Column(name= "c_aud_usuario_modificacion")
	private String usu_mod;
	
	@Column(name= "d_aud_fecha_modificacion")
	private LocalDateTime fec_mod;

}
