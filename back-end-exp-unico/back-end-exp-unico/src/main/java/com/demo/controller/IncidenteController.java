package pe.gob.onpe.sarha.controller;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.jsonwebtoken.Claims;
import pe.gob.onpe.sarha.service.IncidenteService;

@RestController
@RequestMapping("/apiIncidente")
@CrossOrigin(origins = "*")
public class IncidenteController {
	
	@Autowired
	private IncidenteService incidenteService;
	
	
	@PostMapping("/listIncidentePorEmpleadoFechaCorte")
	public ResponseEntity<?> listIncidentePorEmpleadoFechaCorte(@RequestParam("idEmpleado") Integer idEmpleado,
			@RequestAttribute("claims") final Claims claims){
		try {
			return new ResponseEntity<>(incidenteService.obtenerIncidentePorFechaCorteEmpleado(idEmpleado), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/listIncidentePorEmpleadoAnioMes")
	public ResponseEntity<?> listIncidentePorEmpleadoAnioMes(@RequestParam("idEmpleado") Integer idEmpleado,
			@RequestParam("fecha") String mesAnio,
			@RequestAttribute("claims") final Claims claims){
		try {
			return new ResponseEntity<>(incidenteService.obtenerIncidentePorMesAnioEmpleado(idEmpleado, mesAnio), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	
	
	
	
	
	
	
	
	@PostMapping("/listIncidentePorEmpleadoSolicitudFechaCorte")
	public ResponseEntity<?> listIncidentePorEmpleadoSolicitud(@RequestParam("idEmpleado") Integer idEmpleado, 
			@RequestParam("idSolicitud") Integer idSolicitud,@RequestAttribute("claims") final Claims claims){
		try {
			return new ResponseEntity<>(incidenteService.obtenerIncidentePorFechaCorteEmpleadoSolicitud(idEmpleado, idSolicitud), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/listIncidenteMantGenPorEmpleadoFechaAsistencia")
	public ResponseEntity<?> listarIncidenciaPorEmpleadoFechaAsistencia(@RequestParam("idEmpleado") Integer idEmpleado, 
			@RequestParam("fechaAsistenciaInicio") String fechaAsistenciaInicio, @RequestParam("fechaAsistenciaFinal") String fechaAsistenciaFinal,@RequestAttribute("claims") final Claims claims){
		try {
			return new ResponseEntity<>(incidenteService.obtenerIncidenteMantGenPorEmpleadoFechaAsistencia(idEmpleado, fechaAsistenciaInicio, fechaAsistenciaFinal), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/crearIncidenteGenerado")
	public ResponseEntity<?> crearIncidenteGenerado(@RequestParam("idAsistencia") Integer idAsistencia, 
			@RequestParam("usuario") String usuario,@RequestAttribute("claims") final Claims claims){
		try {
			incidenteService.crearIncidenteGenerado(idAsistencia, usuario);
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			HashMap<String,String> response = new HashMap<String,String>() ;
			response.put("mensaje", e.getMessage());
			return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/eliminarIncidente")
	public ResponseEntity<?> eliminarIncidente(@RequestParam("idIncidente") Integer idIncidente,
			@RequestAttribute("claims") final Claims claims){
		try {
			incidenteService.eliminar(idIncidente);
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			HashMap<String,String> response = new HashMap<String,String>() ;
			response.put("mensaje", e.getMessage());
			return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
		}
	}
}
