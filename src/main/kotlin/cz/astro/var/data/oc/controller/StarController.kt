package cz.astro.`var`.data.oc.controller

import cz.astro.`var`.data.oc.repository.ConstellationStarSummary
import cz.astro.`var`.data.oc.repository.StarRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
@RestController
@RequestMapping("api/oc")
class StarController(private val starRepository: StarRepository) {

    private val logger: Logger = LoggerFactory.getLogger(StarController::class.java)

    @GetMapping("stars")
    fun getAll(): List<StarListItemModel> =
            starRepository.findAllStarMinimaSummary().asSequence().map { it.toListItemModel() }.toList()

    @GetMapping("stars/{starId}")
    fun getById(@PathVariable starId: Int): StarModel = starRepository.findById(starId).map { it.toModel() }.orElse(null)

    @GetMapping("constellations")
    fun getConstellations(): Set<ConstellationStarSummary> = starRepository.findAllConstellationStarSummary()

    @GetMapping("constellations/{cons}/stars")
    fun getByConstellation(@PathVariable cons: String): List<StarListItemModel> =
            starRepository.findStarMinimaSummaryByConstellation(cons).asSequence().map { it.toListItemModel() }.toList()

}
