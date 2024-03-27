package com.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.demo.mapper.UsuarioMapper;
import com.demo.modelo.UsuarioModelo;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioControler {
	
	@Autowired
	private UsuarioMapper usuarioMapper;
	
	public UsuarioControler(UsuarioMapper usuarioMapper) {
		this.usuarioMapper = usuarioMapper;
	}
	
	@GetMapping("/listar")
	public List<UsuarioModelo> getAll(){
		return usuarioMapper.findAll();
	}
	
	

}
