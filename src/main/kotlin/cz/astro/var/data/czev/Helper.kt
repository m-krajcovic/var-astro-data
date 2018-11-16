package cz.astro.`var`.data.czev

import java.math.BigDecimal
import java.math.RoundingMode

const val RA_NUMBER_PATTERN = "(\\d*(\\.\\d+)?)"
const val DEC_NUMBER_PATTERN = "([+\\-]?\\d*(\\.\\d+)?)"
const val RA_STRING_PATTERN = "(\\d{1,2})[\\s:](\\d{1,2})[\\s:](\\d{0,2}(\\.\\d+)?)"
const val DEC_STRING_PATTERN = "([+\\-]?\\d{1,2})[\\s:](\\d{1,2})[\\s:](\\d{0,2}(\\.\\d+)?)"

val RA_STRING_REGEX = Regex(RA_STRING_PATTERN)
val DEC_STRING_REGEX = Regex(DEC_STRING_PATTERN)
val RA_NUMBER_OR_STRING_REGEX = Regex("^$RA_NUMBER_PATTERN|$RA_STRING_PATTERN$")
val DEC_NUMBER_OR_STRING_REGEX: Regex = Regex("^$DEC_NUMBER_PATTERN|$DEC_STRING_PATTERN$")

fun raStringToDegrees(raString: String): BigDecimal {
    val match = RA_STRING_REGEX.matchEntire(raString) ?: throw IllegalArgumentException("Given string doesn't have correct format")
    val hours = match.groupValues[1].toBigDecimal()
    val minutes = match.groupValues[2].toBigDecimal()
    val seconds = match.groupValues[3].toBigDecimal()

    return hours.multiply(BigDecimal(15)) + minutes.divide(BigDecimal(4), 7, RoundingMode.HALF_UP) + seconds.divide(BigDecimal(240), 7, RoundingMode.HALF_UP)
}

fun decStringToDegrees(decString: String): BigDecimal {
    val match = DEC_STRING_REGEX.matchEntire(decString) ?: throw IllegalArgumentException("Given string doesn't have correct format")

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
