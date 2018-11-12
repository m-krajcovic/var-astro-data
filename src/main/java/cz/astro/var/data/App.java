/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
package cz.astro.var.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.kotlin.KotlinModule;
import cz.astro.var.data.czev.repository.CzevInit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class App implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @Autowired
    private CzevInit czevInit;

    @Value("${czev.hibernate.hbm2ddl.auto}")
    private String czevhbm2ddl;

    @Override
    public void run(String... args) throws Exception {
        new ObjectMapper().registerModule(new KotlinModule());
        if (czevhbm2ddl.startsWith("create")) {
            czevInit.initialize();
        }
//        czevInit.test();
    }
}
