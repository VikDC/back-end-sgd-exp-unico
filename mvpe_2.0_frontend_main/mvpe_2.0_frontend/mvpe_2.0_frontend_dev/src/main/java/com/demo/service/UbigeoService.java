package com.demo.service;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.demo.modelo.UbigeoModel;

@Repository
public interface UbigeoService {
	
	public List<UbigeoModel> getDepartamento() throws Exception;

}
