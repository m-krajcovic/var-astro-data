package cz.astro.`var`.data.oc.service

import com.fasterxml.jackson.annotation.JsonFormat
import cz.astro.`var`.data.czev.*
import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import cz.astro.`var`.data.oc.repository.StarRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

/**
 * @author Michal
 * @version 1.0
 * @since 11/26/2018
 */
interface PredictionService {
    fun getAllPredictionsForDay(day: LocalDate): List<PredictionResultModel>
}

@Component
class PredictionServiceImpl(
        private val starRepository: StarRepository
) : PredictionService {

    companion object {
        val logger = LoggerFactory.getLogger(PredictionServiceImpl::class.java)
    }

    override fun getAllPredictionsForDay(day: LocalDate): List<PredictionResultModel> {
        val startTime = System.nanoTime()
        val jdNight = day.toJulianDay()
        val result = ArrayList<PredictionResultModel>()
        starRepository.findAllElements()
                .forEach {
                    val m0 = ("24" + it.minimum9).toDouble()
                    val period = it.period
                    var calculatedMinimum = calculateMinimum(m0, period, jdNight)
                    while (calculatedMinimum < jdNight + 1) {
                        // TODO here i need to add correct coordinates
                        val prediction = isVisible(CosmicCoordinatesModel(raStringToDegrees("1 22 26"), decStringToDegrees("+59 12 36")), 50.0, 15.0, calculatedMinimum)
                        prediction.map { pr ->
                            result.add(PredictionResultModel("${it.starName} ${it.cons}",
                                    it.kind, calculatedMinimum, fromJulianDate(calculatedMinimum), pr.objCoords.azimuth))
                        }
                        calculatedMinimum += period
                    }
                }
        val endTime = System.nanoTime()
        val totalTime = endTime - startTime
        logger.debug("Calculating predictions took {} ms", TimeUnit.NANOSECONDS.toMillis(totalTime))
        return result
    }
}

data class PredictionResultModel(
        val starName: String,
        val kind: String,
        val minimum: Double,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        val minimumDateTime: LocalDateTime,
        val starAzimuth: Double
)

data class StarPredictionResultModel(
        val starName: String,
        val predictions: List<PredictionResultModel>
)

fun LocalDate.toJulianDay(): Double {
    val julianDay = (1461 * (this.year + 4800 + (this.monthValue - 14) / 12)) / 4 + (367 * (this.monthValue - 2 - 12 * ((this.monthValue - 14) / 12))) / 12 - (3 * ((this.year + 4900 + (this.monthValue - 14) / 12) / 100)) / 4 + this.dayOfMonth - 32075
    return julianDay - 0.5
}

fun main(args: Array<String>) {
    val now = LocalDate.now()
    val jd = now.toJulianDay()
    println(now)
    println(jd)
    println(fromJulianDate(jd))
}
