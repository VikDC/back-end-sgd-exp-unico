package pe.gob.onpe.adan2backend.rest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.gob.onpe.adan2backend.model.dto.response.GenericResponse;
import pe.gob.onpe.adan2backend.model.service.IConfiguracionService;

@RestController
@Validated
@CrossOrigin
@RequestMapping("/configuracion")
public class ConfiguracionController {
	
	@Autowired
	private IConfiguracionService configuracionService;
	
	@GetMapping
    public ResponseEntity<GenericResponse> getAll() {
	GenericResponse genericResponse = new GenericResponse();
	List<pe.gob.onpe.adan2backend.model.dto.response.ConfiguracionResponseDto> configuracion = this.configuracionService.listarTodo();
		if (configuracion != null) {
	        genericResponse.setSuccess(Boolean.TRUE);
	        genericResponse.setData(configuracion);
	    }
	return new ResponseEntity<GenericResponse>(genericResponse, HttpStatus.OK);
	}
}
