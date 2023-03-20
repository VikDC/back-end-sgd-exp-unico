package com.demo.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Component;

import com.demo.modelo.UsuarioModelo;

@Component
@Mapper
public interface UsuarioMapper {

	@Select("select * from usuario")
	List<UsuarioModelo> findAll();
	
}
