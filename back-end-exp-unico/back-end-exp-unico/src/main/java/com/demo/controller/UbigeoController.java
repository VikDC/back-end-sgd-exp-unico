package com.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.demo.mapper.UbigeoMapper;
import com.demo.mapper.UsuarioMapper;
import com.demo.service.UbigeoService;

@RestController
@RequestMapping("/ubigeo")
@CrossOrigin(origins = "*")
public class UbigeoController {
	
	@Autowired
	private UbigeoService ubigeoService;
	
	
	@PostMapping("/getDepartamentos")
	public ResponseEntity<?> getDepartamentos(){
		try {
			return new ResponseEntity<>(ubigeoService.getDepartamento(), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
		}
	}
	

}

