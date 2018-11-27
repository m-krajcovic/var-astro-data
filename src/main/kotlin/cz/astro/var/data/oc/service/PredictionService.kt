package cz.astro.`var`.data.oc.service

import com.fasterxml.jackson.annotation.JsonFormat
import cz.astro.`var`.data.czev.calculateMinimum
import cz.astro.`var`.data.czev.fromJulianDate
import cz.astro.`var`.data.czev.getCardinalDirection
import cz.astro.`var`.data.czev.isVisible
import cz.astro.`var`.data.czev.repository.PredpovediRepository
import cz.astro.`var`.data.czev.repository.toMap
import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import cz.astro.`var`.data.oc.repository.StarRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

/**
 * @author Michal
 * @version 1.0
 * @since 11/26/2018
 */
interface PredictionService {
    fun getAllPredictionsForDay(night: LocalDate, latitude: Double = 50.0, longitude: Double = 15.0): Set<PredictionResultModel>
}

@Component
class PredictionServiceImpl(
        private val starRepository: StarRepository,
        private val predpovediRepository: PredpovediRepository
) : PredictionService {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(PredictionServiceImpl::class.java)
    }

    override fun getAllPredictionsForDay(night: LocalDate, latitude: Double, longitude: Double): Set<PredictionResultModel> {
        val startTime = System.nanoTime()
        val jdNight = night.toJulianDay() + 0.5
        val result = HashSet<PredictionResultModel>()
        val body = predpovediRepository.findAll().toMap { "${it.starName} ${it.cons}" }
        starRepository.findStarsWithElements()
                .forEach { star ->
                    star.elements.asSequence().filter { it.kind == "p" || it.kind == "s" }.forEach {
                        val m0 = BigDecimal("2400000") + it.minimum9
                        val period = it.period
                        val periodDouble = period.toDouble()
                        var calculatedMinimum = calculateMinimum(m0.toDouble(), periodDouble, jdNight)
                        var points: Int? = null
                        val starName = "${star.starName} ${star.constellation}"
                        val predpoved = body[starName]
                        if (predpoved != null) {
                            points = predpoved.body
                        }
                        while (calculatedMinimum < jdNight + 1) {
                            val prediction = isVisible(CosmicCoordinatesModel(star.coordinates.raValue(), star.coordinates.decValue()), latitude, longitude, calculatedMinimum.toDouble())
                            prediction.map { pr ->
                                result.add(PredictionResultModel(star.id, starName,
                                        it.kind, calculatedMinimum.toBigDecimal(), fromJulianDate(calculatedMinimum), points, pr.objCoords.altitude, getCardinalDirection(pr.objCoords.azimuth),
                                        star.brightness.map { b -> PredictionMagnitudeModel(b.col, b.maxP, b.minP) },
                                        "24${it.minimum9}+$period*E"))
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

class PredictionResultModel(
        val id: Int,
        val name: String,
        val kind: String,
        val minimum: BigDecimal,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        val minimumDateTime: LocalDateTime,
        val points: Int?,
        val altitude: Double,
        val azimuth: String,
        val magnitudes: List<PredictionMagnitudeModel>,
        val elements: String
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as PredictionResultModel

        if (id != other.id) return false
        if (kind != other.kind) return false
        if (minimum != other.minimum) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id
        result = 31 * result + kind.hashCode()
        result = 31 * result + minimum.hashCode()
        return result
    }
}

data class PredictionMagnitudeModel(
        val filter: String,
        val max: Double,
        val min: Double
)

fun LocalDate.toJulianDay(): Double{
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
