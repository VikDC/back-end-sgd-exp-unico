package com.demo.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.demo.mapper.UbigeoMapper;
import com.demo.modelo.UbigeoModel;
import com.demo.service.UbigeoService;

@Service
public class UbigeoServiceImpl implements UbigeoService {

	@Autowired
	private UbigeoMapper ubigeoMap;

	@Override
	public List<UbigeoModel> getDepartamento() throws Exception {
		try {
			 List<UbigeoModel> listaDptos = ubigeoMap.getDepartamento();
			return listaDptos;
		} catch (Exception e) {
			e.printStackTrace();
			throw new Exception("ERROR DEMO");
		}
		
		
	}

}
