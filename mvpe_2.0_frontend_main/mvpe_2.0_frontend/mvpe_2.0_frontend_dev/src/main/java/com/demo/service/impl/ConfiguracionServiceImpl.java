package pe.gob.onpe.adan2backend.model.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.gob.onpe.adan2backend.model.dto.response.ConfiguracionResponseDto;
import pe.gob.onpe.adan2backend.model.mapper.IConfiguracionMapper;
import pe.gob.onpe.adan2backend.model.repository.proceso.ConfiguracionRepository;
import pe.gob.onpe.adan2backend.model.service.IConfiguracionService;

@Service
public class ConfiguracionServiceImpl implements IConfiguracionService{

	@Autowired
	private IConfiguracionMapper configuracionMapper;
	
	@Autowired
	private ConfiguracionRepository configuracionRepository;
	
	@Override
	public List<ConfiguracionResponseDto> listarTodo() {

		List<ConfiguracionResponseDto> configuracionDto = configuracionRepository.obtener().stream().map(config->configuracionMapper.configuracionToDto(config)).collect(Collectors.toList());
		return configuracionDto;
	}

}
