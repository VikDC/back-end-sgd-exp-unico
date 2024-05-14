package pe.gob.onpe.adan2backend.model.repository.proceso;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.gob.onpe.adan2backend.model.entities.proceso.Configuracion;

public interface ConfiguracionRepository extends JpaRepository<Configuracion, Integer>{

	@Query("select distinct c from Configuracion c join fetch c.detalleConfiguracion order by c.tipo")
	List<Configuracion> obtener();
}
