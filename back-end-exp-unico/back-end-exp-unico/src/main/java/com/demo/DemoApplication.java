package com.demo;

/*import org.apache.ibatis.type.MappedTypes;
import org.mybatis.spring.annotation.MapperScan;*/
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.client.RestTemplate;

//import com.demo.modelo.UsuarioModelo;

/*@MappedTypes(UsuarioModelo.class)
@MapperScan("com.demo.mapper")*/
@SpringBootApplication
@EnableTransactionManagement
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
	
	


}
