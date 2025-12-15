package noYapDj.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"noYapDj.demo"})
public class NoYapDjApplication {

	public static void main(String[] args) {
		SpringApplication.run(NoYapDjApplication.class, args);
	}

}