package pe.gob.onpe.adan2backend.model.service;

import java.util.List;

import pe.gob.onpe.adan2backend.model.dto.response.ConfiguracionResponseDto;

public interface IConfiguracionService {
	
	public List<ConfiguracionResponseDto> listarTodo();

}
