package pe.gob.onpe.sarha.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pe.gob.onpe.sarha.util.Constant;
import pe.gob.onpe.sarha.domain.Equipo;
import pe.gob.onpe.sarha.service.EquipoService;


@RestController
@RequestMapping("/apiEquipo")
@CrossOrigin(origins = "*")
public class EquipoController {
	
	@Autowired
	EquipoService equipoService;
	
	@PostMapping("/list")
	public ResponseEntity<?> list(@RequestBody Equipo equipo){
		try {
			return new ResponseEntity<>(equipoService.list(equipo), HttpStatus.OK);
		} catch (Exception e) {
			System.out.println("ERROR EN CONTROLLER");
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
			
		}
	}
	
	@PostMapping("/insert")
	public ResponseEntity<?> insert(@RequestBody Equipo equipo){
		try {
			equipoService.create(equipo);
			Map<String, Object> res= new HashMap();
			res.put("mensaje", Constant.MSJ_EXITO);
			res.put("equipo", equipo);
			return new ResponseEntity<>(res, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("update")
	public ResponseEntity<?> update(@RequestBody Equipo equipo){
		try {
			equipoService.update(equipo);
			Map<String, Object> res= new HashMap();
			res.put("mensaje", Constant.MSJ_EXITO);
			return new ResponseEntity<>(res, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/delete")
	public ResponseEntity<?> delete(@RequestBody Equipo equipo){
		try {
			equipoService.delete(equipo);
			Map<String, Object> res= new HashMap();
			res.put("mensaje", Constant.MSJ_EXITO);
			return new ResponseEntity<>(res, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/get")
	public ResponseEntity<?> get(@RequestParam("id") String id){
		try {
			return new ResponseEntity<>(equipoService.get(Integer.parseInt(id)), HttpStatus.OK);
		} catch (Exception e) {
			System.out.println("error en get");
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	
	@PostMapping("/getNivelAprobacion")
	public ResponseEntity<?> getNivelAprobacion(@RequestParam("idEmpleado") String id){
		try {
			return new ResponseEntity<>(equipoService.getNivelAprobacionEmpleado(Integer.parseInt(id)), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
}
