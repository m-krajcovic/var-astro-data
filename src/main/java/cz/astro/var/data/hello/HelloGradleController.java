package cz.astro.var.data.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("hello-java")
public class HelloGradleController {

    @GetMapping("")
    public String helloGradle() {
        return "Hello Gradle!";
    }

}
