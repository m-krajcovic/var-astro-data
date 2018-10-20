package cz.astro.`var`.data.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping


/**
 * @author Michal
 * @version 1.0
 * @since 10/20/2018
 */
@Controller
class HomeController {
    @RequestMapping("/")
    fun index(): String {
        return "index.html"
    }
}
