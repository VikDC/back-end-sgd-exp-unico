package pe.gob.onpe.adan2backend.model.dto.response;

import java.util.List;

import lombok.Data;

@Data
public class ConfiguracionResponseDto {
	private Integer id;
	private Integer tipo;
	private String descripcion;
	private List<DetalleConfiguracionResponseDto> detalleConfiguracion;
}
