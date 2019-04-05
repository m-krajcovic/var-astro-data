package cz.astro.`var`.data.oc.controller

import cz.astro.`var`.data.czev.controller.toOkOrNotFound
import cz.astro.`var`.data.oc.repository.ConstellationStarSummary
import cz.astro.`var`.data.oc.repository.StarRepository
import cz.astro.`var`.data.oc.service.PredictionService
import cz.astro.`var`.data.oc.service.PredictionsResultModel
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
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
    fun getAllPredictions(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,
                          @RequestParam(defaultValue = "50.0") latitude: Double,
                          @RequestParam(defaultValue = "15.0") longitude: Double): PredictionsResultModel {
        return predictionService.getAllPredictionsForNight(date, latitude, longitude)
    }

    @GetMapping("stars/{starId}/minima")
    fun getMinimaValuesOnly(@PathVariable starId: Int, @RequestParam("kind") kind: String): ResponseEntity<MinimaResultModel> {
        val star = starRepository.findById(starId)
        return star.map<MinimaResultModel> {
            val element = it.elements.firstOrNull { e -> e.kind == kind }
            if (element != null) {
                MinimaResultModel(
                        prepend24(element.minimum0).toDouble(),
                        element.period.toDouble(),
                        it.minima.filter { m -> m.kind == kind }.map { m -> "${m.julianDatePrefix}${m.julianDate}".toDouble() }
                )
            } else {
                null
            }
        }.toOkOrNotFound()
    }
}

data class MinimaResultModel(
        val m0: Double,
        val period: Double,
        val minima: List<Double>
)
