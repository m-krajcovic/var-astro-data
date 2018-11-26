package cz.astro.`var`.data.czev

import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime
import java.time.temporal.JulianFields
import java.util.*
import kotlin.math.*


const val JD2000: Double = 2451545.0
const val JD_MINUTE = 0.000694

const val RA_NUMBER_PATTERN = "(\\d*(\\.\\d+)?)"
const val DEC_NUMBER_PATTERN = "([+\\-]?\\d*(\\.\\d+)?)"
const val RA_STRING_PATTERN = "(\\d{1,2})[\\s:](\\d{1,2})[\\s:](\\d{0,2}(\\.\\d+)?)"
const val DEC_STRING_PATTERN = "([+\\-]?\\d{1,2})[\\s:](\\d{1,2})[\\s:](\\d{0,2}(\\.\\d+)?)"

val RA_STRING_REGEX = Regex(RA_STRING_PATTERN)
val DEC_STRING_REGEX = Regex(DEC_STRING_PATTERN)
val RA_NUMBER_OR_STRING_REGEX = Regex("^$RA_NUMBER_PATTERN|$RA_STRING_PATTERN$")
val DEC_NUMBER_OR_STRING_REGEX: Regex = Regex("^$DEC_NUMBER_PATTERN|$DEC_STRING_PATTERN$")

fun raStringToDegrees(raString: String): BigDecimal {
    val match = RA_STRING_REGEX.matchEntire(raString)
            ?: throw IllegalArgumentException("Given string doesn't have correct format")
    val hours = match.groupValues[1].toBigDecimal()
    val minutes = match.groupValues[2].toBigDecimal()
    val seconds = match.groupValues[3].toBigDecimal()

    return hours.multiply(BigDecimal(15)) + minutes.divide(BigDecimal(4), 7, RoundingMode.HALF_UP) + seconds.divide(BigDecimal(240), 7, RoundingMode.HALF_UP)
}

fun decStringToDegrees(decString: String): BigDecimal {
    val match = DEC_STRING_REGEX.matchEntire(decString)
            ?: throw IllegalArgumentException("Given string doesn't have correct format")

    val degrees = match.groupValues[1].toBigDecimal()
    val arcmin = match.groupValues[2].toBigDecimal()
    val arcsec = match.groupValues[3].toBigDecimal()

    val op: (BigDecimal, BigDecimal) -> BigDecimal = if (degrees > BigDecimal.ZERO) { a, b -> a + b } else { a, b -> a - b }

    return op(degrees, (arcmin.divide(BigDecimal(60), 7, RoundingMode.HALF_UP) + arcsec.divide(BigDecimal(3600), 7, RoundingMode.HALF_UP)))
}

fun cosmicDistance(ra1: Double, dec1: Double, ra2: Double, dec2: Double): Double {
    val ra1Rads = Math.toRadians(ra1)
    val ra2Rads = Math.toRadians(ra2)
    val dec1Rads = Math.toRadians(dec1)
    val dec2Rads = Math.toRadians(dec2)
    return Math.toDegrees(Math.acos(Math.sin(dec1Rads) * Math.sin(dec2Rads) + Math.cos(dec1Rads) * Math.cos(dec2Rads) * Math.cos(ra1Rads - ra2Rads)))
}

fun getSunCoordinates(jd: Double): CosmicCoordinatesModel {
    val d0 = jd - JD2000
    val g = 357.529 + 0.98560028 * d0
    val q = 280.459 + 0.98564736 * d0
    val L = q + 1.915 * sin(Math.toRadians(g)) + 0.02 * sin(Math.toRadians(2 * g))
    val e = 23.439 - 0.00000036 * d0
    val eRad = Math.toRadians(e)
    val LRad = Math.toRadians(L)
    val RA = Math.toDegrees(atan2(cos(eRad) * sin(LRad), cos(LRad)))
    val d = Math.toDegrees(asin(sin(eRad) * sin(LRad)))
    return CosmicCoordinatesModel(((RA % 360 + 360) % 360).toBigDecimal(), d.toBigDecimal())
}

data class HorizontalCoordinatesModel(
        val altitude: Double,
        val azimuth: Double
)

fun transformEquatorialToHorizontalCoordinates(coordinates: CosmicCoordinatesModel,
                                               latitude: Double, longitude: Double, jd: Double): HorizontalCoordinatesModel {
//    val lonRad = Math.toRadians(longitude)
    val latRad = Math.toRadians(latitude)
//    val raRad = Math.toRadians(coordinates.ra.toDouble())
    val decRad = Math.toRadians(coordinates.dec.toDouble())
    val s = countS(longitude, jd)
    val t = 15 * s - coordinates.ra.toDouble()
    val tRad = Math.toRadians(t)
    val altitude = Math.toDegrees(acos(sin(decRad) * sin(latRad) + cos(decRad) * cos(latRad) * cos(tRad)))
    val v1 = sin(tRad)
    val v2 = sin(latRad) * cos(tRad) - tan(decRad) * cos(latRad)
    val azimuth = Math.toDegrees(atan2(v1, v2))
    return HorizontalCoordinatesModel(90 - altitude, azimuth)
}

// this is probably correct now
fun countS(longitude: Double, jd: Double): Double {
    val jd0 = Math.floor(jd) + 0.5
    val T = (jd0 - JD2000) / 36525
    val s0 = (24110.54841 + 8640184.812866 * T + 0.093104 * Math.pow(T, 2.0) - 6.2e-6 * Math.pow(T, 3.0)) / 3600
    val ld = fromJulianDate(jd)
    return s0 + 1.0027379093 * (ld.hour + ld.minute.toDouble() / 60) + longitude / 15
}

fun fromJulianDate(jd: Double): LocalDateTime {
    val jd = jd + 0.5
    return LocalDateTime.MIN.with(JulianFields.JULIAN_DAY, Math.floor(jd).toLong()).plusSeconds((86400 * (jd % 1)).roundToLong())
}

data class PredictionModel(
        var sunCoords: HorizontalCoordinatesModel,
        var objCoords: HorizontalCoordinatesModel
)

fun isVisible(objCoords: CosmicCoordinatesModel, latitude: Double, longitude: Double, jd: Double): Optional<PredictionModel> {
    val sunCoords = getSunCoordinates(jd)
    val sunHorizontalCoords = transformEquatorialToHorizontalCoordinates(sunCoords, latitude, longitude, jd)
    if (sunHorizontalCoords.altitude <= -12) {
        val objHorizontalCoords = transformEquatorialToHorizontalCoordinates(objCoords, latitude, longitude, jd)
        if (objHorizontalCoords.altitude >= 20)
        return Optional.of(PredictionModel(sunHorizontalCoords, objHorizontalCoords))
    }
    return Optional.empty()
}

fun calculateMinimum(m0: Double, period: Double, jd: Double): Double {
    val e = Math.ceil((jd - m0) / period)
    return m0 + period * e
}

fun main(args: Array<String>) {
    val jdNight = 2458448.5
    var i = 0.0
    while (i < 1) {
        val sunCoords = getSunCoordinates(jdNight + i)
        val horiCoords = transformEquatorialToHorizontalCoordinates(sunCoords, 50.0, 15.0, jdNight + i)
        println(((horiCoords.altitude - 90) * -1).toString() + " "+ horiCoords.azimuth)
        i+= JD_MINUTE
    }
}

