package pe.gob.onpe.sarha.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import pe.gob.onpe.sarha.domain.Dias;
import pe.gob.onpe.sarha.domain.Horario;
import pe.gob.onpe.sarha.domain.HorarioList;

@Mapper
public interface HorarioMapper {
	
	public String getTiempoRacionamiento();
	
	public List<Horario> select()  ;
	
	@MapKey("id")
	public Map<Integer,Horario> selectAll();
	
	public List<HorarioList> selectListHorarios();
	
	public Horario selectHorario(@Param("id") Integer id);
	
	public Dias selectDays(@Param("id") Integer id);
	
	public int maxId();
	
	public int existeNombre(int id, String nombreHorario);
	
	public void insert(Horario horario);
	
	public void update(Horario horario);

	public int habilitado(@Param("id") Integer id);
	
	public void delete(@Param("id") Integer id);
	
}
