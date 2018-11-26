package cz.astro.`var`.data.oc.controller

import cz.astro.`var`.data.oc.repository.ConstellationStarSummary
import cz.astro.`var`.data.oc.repository.StarRepository
import cz.astro.`var`.data.oc.service.PredictionResultModel
import cz.astro.`var`.data.oc.service.PredictionService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
@RestController
@RequestMapping("api/oc")
class StarController(private val starRepository: StarRepository,
                     private val predictionService: PredictionService) {

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

    @GetMapping("predictions")
    fun getAllPredictions(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate): List<PredictionResultModel> {
        return predictionService.getAllPredictionsForDay(date)
    }
}
