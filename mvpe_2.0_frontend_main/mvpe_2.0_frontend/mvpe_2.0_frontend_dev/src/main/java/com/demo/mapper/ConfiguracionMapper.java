package pe.gob.onpe.sarha.mapper;


import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import pe.gob.onpe.sarha.domain.Configuracion;



@Mapper
public interface ConfiguracionMapper {
	
	public List<Configuracion> list(Configuracion reporte);

}
