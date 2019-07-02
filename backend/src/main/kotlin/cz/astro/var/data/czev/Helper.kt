package cz.astro.`var`.data.czev

import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.temporal.JulianFields
import kotlin.math.*


const val JD2000: Double = 2451545.0
const val JD_HOUR = 1.0 / 24.0
const val JD_MINUTE = JD_HOUR / 60.0
const val JD_SECOND = JD_MINUTE / 60.0

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
    return CosmicCoordinatesModel(normalizeDegrees(RA).toBigDecimal(), d.toBigDecimal())
}

private fun normalizeDegrees(deg: Double) = ((deg % 360 + 360) % 360)

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
    return HorizontalCoordinatesModel(90 - altitude, azimuth + 180)
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
//        var sunCoords: HorizontalCoordinatesModel,
        var objCoords: HorizontalCoordinatesModel
)

fun calculateMinimum(m0: Double, period: Double, jd: Double): Double {
    val e = Math.ceil((jd - m0) / period)
    return m0 + period * e
}

val cardinalDirections = arrayOf("N", "NE", "E", "SE", "S", "SW", "W", "NW", "N")

fun getCardinalDirection(azimuth: Double): String {
    val normalizedAzimuth = normalizeDegrees(azimuth)
    val directionIndex: Int = (Math.round(normalizedAzimuth / 45) % 8).toInt()
    return cardinalDirections[directionIndex]
}

fun isNight(jd: Double, nights: List<Array<Double>>): Boolean {
    return nights.any { jd >= it[0] && jd <= it[1] }
}

fun findNights(jdStart: Double, jdEnd: Double, latitude: Double, longitude: Double): List<Array<Double>> {
    val result = arrayListOf<Array<Double>>()
    var twilight: Array<Double>? = null
    var jd = jdStart
    while (jd <= jdEnd) {
        val sunCoords = getSunCoordinates(jd)
        val horiSunCoords = transformEquatorialToHorizontalCoordinates(sunCoords, latitude, longitude, jd)
        if (horiSunCoords.altitude <= -12) {
            if (twilight == null) {
                // change from day to twilight -> need to find sunset
                twilight = Array(2) { 0.0 }
                if (jd == jdStart) {
                    twilight[0] = jd
                } else {
                    twilight[0] = findSunset(jd - JD_HOUR, jd, latitude, longitude)
                }
            }
        } else {
            if (twilight != null) {
                // change from twilight to day -> need to find sunrise
                twilight[1] = findSunrise(jd - JD_HOUR, jd, latitude, longitude)
                result.add(twilight)
                twilight = null
            }
        }
        jd += JD_HOUR
    }
    if (twilight != null) {
        twilight[1] = jdEnd
        result.add(twilight)
    }
    return result
}

fun findSunset(jdStart: Double, jdEnd: Double, latitude: Double, longitude: Double): Double {
    val half = (jdStart + jdEnd) / 2
    if (jdEnd - jdStart < JD_SECOND) {
        return half
    }
    val sunCoords = getSunCoordinates(half)
    val horiSunCoords = transformEquatorialToHorizontalCoordinates(sunCoords, latitude, longitude, half)
    return if (horiSunCoords.altitude > -12) {
        findSunset(half, jdEnd, latitude, longitude)
    } else {
        findSunset(jdStart, half, latitude, longitude)
    }
}

fun findSunrise(jdStart: Double, jdEnd: Double, latitude: Double, longitude: Double): Double {
    val half = (jdStart + jdEnd) / 2
    if (jdEnd - jdStart < JD_SECOND) {
        return half
    }
    val sunCoords = getSunCoordinates(half)
    val horiSunCoords = transformEquatorialToHorizontalCoordinates(sunCoords, latitude, longitude, half)
    return if (horiSunCoords.altitude < -12) {
        findSunrise(half, jdEnd, latitude, longitude)
    } else {
        findSunrise(jdStart, half, latitude, longitude)
    }
}


fun LocalDate.toJulianDay(): Double {
    val julianDay = (1461 * (this.year + 4800 + (this.monthValue - 14) / 12)) / 4 + (367 * (this.monthValue - 2 - 12 * ((this.monthValue - 14) / 12))) / 12 - (3 * ((this.year + 4900 + (this.monthValue - 14) / 12) / 100)) / 4 + this.dayOfMonth - 32075
    return julianDay - 0.5
}
