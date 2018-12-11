package cz.astro.`var`.data.oc.service

import cz.astro.`var`.data.czev.*
import cz.astro.`var`.data.czev.repository.toMap
import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import cz.astro.`var`.data.oc.repository.Star
import cz.astro.`var`.data.oc.repository.StarMinimaCounts
import cz.astro.`var`.data.oc.repository.StarRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate
import java.util.concurrent.TimeUnit
import kotlin.math.roundToInt

@Component
class PredictionServiceImpl(
        private val starRepository: StarRepository
) : PredictionService {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(PredictionServiceImpl::class.java)
    }

    private fun getPoints(minimaCounts: Map<String, StarMinimaCounts>, star: Star, kind: String): Int {
        val counts = minimaCounts.get("${star.constellationId}$kind${star.starId}")
        if (counts != null) {
            return Math.max(10 - (counts.ccdCount ?: 0) - ((counts.allCount ?: 0 - (counts.ccdCount ?: 0)) * 0.1).roundToInt(), 0)
        }
        return 10
    }

    @Cacheable("predictions")
    override fun getAllPredictionsForNight(night: LocalDate, latitude: Double, longitude: Double): Set<PredictionResultModel> {
        val startTime = System.nanoTime()
        val jdNight = night.toJulianDay() + 0.5
        val result = HashSet<PredictionResultModel>()
        val minimaCounts = starRepository.findMinimaCountsSince(night.minusYears(10).toJulianDay() - 2400000).toMap { "${it.constellationId}${it.kind}${it.starId}" }
        val nights = findNights(jdNight, jdNight + 1, latitude, longitude)
        starRepository.findStarsWithElements()
                .forEach { star ->
                    star.elements.asSequence().filter { it.kind == "p" || it.kind == "s" }.forEach {
                        val m0 = BigDecimal("2400000") + it.minimum9
                        val period = it.period
                        val periodDouble = period.toDouble()
                        var calculatedMinimum = calculateMinimum(m0.toDouble(), periodDouble, jdNight)
                        val points: Int = getPoints(minimaCounts, star, it.kind)
                        val starName = "${star.starName} ${star.constellation}"
                        while (calculatedMinimum < jdNight + 1) {
                            if (isNight(calculatedMinimum, nights)) {
                                val objHorizontalCoords = transformEquatorialToHorizontalCoordinates(CosmicCoordinatesModel(star.coordinates.raValue(), star.coordinates.decValue()), latitude, longitude, calculatedMinimum)
                                if (objHorizontalCoords.altitude >= 20) {
                                    result.add(PredictionResultModel(star.id, starName,
                                            it.kind, calculatedMinimum.toBigDecimal(), fromJulianDate(calculatedMinimum), points, objHorizontalCoords.altitude, getCardinalDirection(objHorizontalCoords.azimuth),
                                            star.brightness.map { b -> PredictionMagnitudeModel(b.col, b.maxP, b.minP) },
                                            "24${it.minimum9}+$period*E"))
                                }
                            }
                            calculatedMinimum += periodDouble
                        }
                    }
                }
        val endTime = System.nanoTime()
        val totalTime = endTime - startTime
        logger.debug("Calculating predictions took {} ms", TimeUnit.NANOSECONDS.toMillis(totalTime))
        return result
    }
}
