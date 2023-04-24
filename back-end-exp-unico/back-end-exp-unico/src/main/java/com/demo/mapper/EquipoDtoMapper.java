package pe.gob.onpe.sarha.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import pe.gob.onpe.sarha.domain.EquipoDto;

@Mapper
public interface EquipoDtoMapper {
	public List<EquipoDto> list(EquipoDto equipoDto);
}
