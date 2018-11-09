package cz.astro.`var`.data.czev.controller

import cz.astro.`var`.data.czev.service.CzevStarDetailsModel
import cz.astro.`var`.data.czev.service.CzevStarListModel
import cz.astro.`var`.data.czev.service.CzevStarService
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin(origins = ["http://localhost:3000"])
@RequestMapping("api/czev")
@Secured("ROLE_ANONYMOUS")
class CzevController(
        private val starService: CzevStarService) {

    @GetMapping("stars")
    fun getApprovedStars(): List<CzevStarListModel> {
        return starService.getAllForList()
    }

    @GetMapping("stars/{id}")
    fun getApprovedStarDetails(@PathVariable id: Long): CzevStarDetailsModel {
        return starService.getStarDetails(id)
    }
}