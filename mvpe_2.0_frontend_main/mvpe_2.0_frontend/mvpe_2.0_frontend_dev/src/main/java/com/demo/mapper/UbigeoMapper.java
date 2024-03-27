package com.demo.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.demo.modelo.UbigeoModel;

@Repository
public interface UbigeoMapper {
	
	public List<UbigeoModel> getDepartamento();

}
