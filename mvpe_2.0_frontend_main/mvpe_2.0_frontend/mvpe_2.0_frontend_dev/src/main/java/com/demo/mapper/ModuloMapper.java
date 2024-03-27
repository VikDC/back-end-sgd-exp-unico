package pe.gob.onpe.sarha.mapper;

import org.apache.ibatis.annotations.Mapper;
import pe.gob.onpe.sarha.domain.Modulo;

import java.util.List;

/**
 * @author aquispec
 */
@Mapper
public interface ModuloMapper {

    List<Modulo> getModuloByPerfil(int idPerfil);

    List<Modulo> getModuloByIdUsuario(int idUsuario);

    List<Modulo> list();

}
