package pe.gob.onpe.sarha.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import pe.gob.onpe.sarha.domain.Cargo;

@Mapper
public interface CargoMapper {
	
	public List<Cargo> list(Cargo cargo);
	
	public void create(Cargo cargo);
	
	public void update(Cargo cargo);
	
	public void updateEstado(Cargo cargo);
	
	public void delete(Cargo cargo);
	
	public Cargo obtenerCargo (Cargo cargo);

}
