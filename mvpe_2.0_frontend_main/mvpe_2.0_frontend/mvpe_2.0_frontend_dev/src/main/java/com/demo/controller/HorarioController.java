package pe.gob.onpe.sarha.controller;

import java.util.Date;
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

import pe.gob.onpe.sarha.domain.Cargo;
import pe.gob.onpe.sarha.domain.Catalogo;
import pe.gob.onpe.sarha.domain.Horario;
import pe.gob.onpe.sarha.service.CatalogoService;
import pe.gob.onpe.sarha.service.HorarioService;
import pe.gob.onpe.sarha.util.Constant;
import pe.gob.onpe.sarha.util.DateUtil;

/**
 * 
 * @author ecisneros
 * */
@RestController
@RequestMapping("/apiHorario")
@CrossOrigin(origins = "*")
public class HorarioController {
	
	@Autowired
	private HorarioService horarioService;
	
	@PostMapping("/list")
	public ResponseEntity<?> list() {
		try {
			return new ResponseEntity<>(horarioService.listarHorario(), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/getTiempoRacionamiento")
	public ResponseEntity<?> getTiempoRacionamiento() {
		try {
			return new ResponseEntity<>(horarioService.getTiempoRacionamiento(), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/getListHorarios")
	public ResponseEntity<?> getListHorarios() {
		try {
			return new ResponseEntity<>(horarioService.getListHorarios(), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/getHorario")
	public ResponseEntity<?> getHorario(@RequestParam("id") Integer id){
		try {
			return new ResponseEntity<>(horarioService.getHorario(id), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/getDays")
	public ResponseEntity<?> getDays(@RequestParam("id") Integer id){
		try {
			return new ResponseEntity<>(horarioService.getDays(id), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/insert")
	public ResponseEntity<?> insert(@RequestBody Horario horario){
		try {
			int isUse = horarioService.existeNombre(0, horario.getNombreHorario());
			Map<String, Object> res= new HashMap();
			if(isUse > 0) {
				res.put("mensaje", Constant.MSJ_EXISTE_NOMBRE);
				res.put("estado", 0);
			}
			else {
				horario.setId(horarioService.maxId() + 1);
				horario.setNombreHorario(horario.getNombreHorario().toUpperCase());
				horarioService.insert(horario);
				res.put("mensaje", Constant.MSJ_EXITO);
				res.put("estado", 1);
			}
			return new ResponseEntity<>(res, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
	@PostMapping("/update")
	public ResponseEntity<?> update(@RequestBody Horario horario){
		try {
			int isUse = horarioService.existeNombre(horario.getId(), horario.getNombreHorario());
			Map<String, Object> res= new HashMap();
			if(isUse > 0) {
				res.put("mensaje", Constant.MSJ_EXISTE_NOMBRE);
				res.put("estado", 0);
			}
			else {
				horario.setNombreHorario(horario.getNombreHorario().toUpperCase());
				horarioService.update(horario);
				res.put("mensaje", Constant.MSJ_EXITO);
				res.put("estado", 1);
			}
			return new ResponseEntity<>(res, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}

	@PostMapping("/delete")
	public ResponseEntity<?> delete(@RequestParam("id") Integer id) {
		try {
			int isUse = horarioService.habilitado(id);
			Map<String, Object> res= new HashMap();
			if(isUse > 0) {
				res.put("mensaje", Constant.MSJ_HORARIO_EN_USO);
				res.put("estado", 0);
			}
			else {
				horarioService.delete(id);
				res.put("mensaje", Constant.MSJ_EXITO);
				res.put("estado", 1);
			}
			return new ResponseEntity<>(res, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	
}
