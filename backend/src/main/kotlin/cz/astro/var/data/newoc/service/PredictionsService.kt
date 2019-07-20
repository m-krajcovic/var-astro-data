package cz.astro.`var`.data.newoc.service

import cz.astro.`var`.data.czev.*
import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import cz.astro.`var`.data.czev.service.toModel
import cz.astro.`var`.data.newoc.repository.ElementMinimaCount
import cz.astro.`var`.data.newoc.repository.StarElementRepository
import cz.astro.`var`.data.newoc.repository.StarsRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.concurrent.TimeUnit
import javax.transaction.Transactional
import kotlin.math.roundToInt

interface PredictionsService {
    fun getAllPredictionsForNight(night: LocalDate, latitude: Double, longitude: Double): PredictionsResultModel
}

@Service
@Transactional
class PredictionsServiceImpl(
        private val starsRepository: StarsRepository,
        private val starElementRepository: StarElementRepository
) : PredictionsService {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(PredictionsServiceImpl::class.java)
    }

    @Cacheable("predictions")
    override fun getAllPredictionsForNight(night: LocalDate, latitude: Double, longitude: Double): PredictionsResultModel {
        val startTime = System.nanoTime()
        val jdNight = night.toJulianDay() + 0.5
        val result = HashSet<PredictionsStarModel>()
        val minimaCounts = starElementRepository.findAllElementMinimaCountsSince(night.minusYears(10).toJulianDay().toBigDecimal()).associateBy { it.elementId }
        val nights = findNights(jdNight, jdNight + 1, latitude, longitude)
        val noMinimaDurationTypes = setOf("EB", "EW")

        starsRepository.findAllFetchedForPredictions().forEach { star ->
            star.elements.asSequence().filter { it.kind.name == "P" || it.kind.name == "S" }.forEach { element ->
                val periodDouble = element.period.toDouble()
                var calculatedMinimum = calculateMinimum(element.minimum.toDouble(), periodDouble, jdNight)
                val points: Int = getPoints(minimaCounts, element.id)
                val starName = "${star.name} ${star.constellation.abbreviation}"

                while (calculatedMinimum < jdNight + 1) {
                    if (isNight(calculatedMinimum, nights)) {
                        val objHorizontalCoords = transformEquatorialToHorizontalCoordinates(CosmicCoordinatesModel(star.coordinates.rightAscension, star.coordinates.declination), latitude, longitude, calculatedMinimum)
                        if (objHorizontalCoords.altitude >= 20) {
                            result.add(PredictionsStarModel(
                                    star.id,
                                    star.constellation.id,
                                    element.toMinimalModel(),
                                    starName,
                                    star.coordinates.toModel(),
                                    calculatedMinimum.toBigDecimal(),
                                    fromJulianDate(calculatedMinimum),
                                    points,
                                    objHorizontalCoords.altitude,
                                    getCardinalDirection(objHorizontalCoords.azimuth),
                                    star.brightness.map { b ->
                                        var md = ""
                                        if (noMinimaDurationTypes.contains(star.type)) {
                                            md = star.type
                                        } else {
                                            b.minimaDuration?.let { duration ->
                                                if (duration > 0) {
                                                    md = "%.1f".format((duration / 1000.0) * periodDouble * 24)
                                                }
                                            }
                                        }
                                        PredictionsStarBrightnessModel(b.filter.name, b.maxP, b.minP, md)
                                    },
                                    "${element.minimum}+${element.period}*E"))
                        }
                    }
                    calculatedMinimum += periodDouble
                }
            }
        }

        val endTime = System.nanoTime()
        val totalTime = endTime - startTime
        logger.debug("Calculating predictions took {} ms", TimeUnit.NANOSECONDS.toMillis(totalTime))
        return PredictionsResultModel(result, nights.map { NightInterval(fromJulianDate(it[0]).toLocalTime(), fromJulianDate(it[1]).toLocalTime()) })
    }


    private fun getPoints(minimaCounts: Map<Long, ElementMinimaCount>, elementId: Long): Int {
        val counts = minimaCounts.get(elementId)
        if (counts != null) {
            val points = 10 - counts.ccdCount - (counts.minimaCount * 0.1).roundToInt()
            return Math.min(Math.max(points, 0), 10).toInt()
        }
        return 10
    }

}
