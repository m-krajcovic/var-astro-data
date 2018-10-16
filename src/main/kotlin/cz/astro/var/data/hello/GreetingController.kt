package cz.astro.`var`.data.hello

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.atomic.AtomicLong

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
@RestController()
@RequestMapping("/hello-kt")
class GreetingController {

    val counter = AtomicLong()

    @GetMapping("")
    fun greeting(@RequestParam(value = "name", defaultValue = "World") name: String) =
            Greeting(counter.incrementAndGet(), "Hello, $name")
}
