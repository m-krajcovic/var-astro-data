package cz.astro.`var`.data

import java.math.BigDecimal
import java.math.RoundingMode

data class CosmicCoordinates(
        var raHours: Int = 0,
        var raMinutes: Int = 0,
        var raSeconds: Double = 0.0,
        var decDegrees: Int = 0,
        var decMinutes: Int = 0,
        var decSeconds: Double = 0.0,
        var decSign: String = "+"
) {
    fun ra(): String {
        return "$raHours $raMinutes $raSeconds"
    }

    fun dec(): String {
        return "$decSign$decDegrees $decMinutes $decSeconds"
    }

    fun raValue(): BigDecimal {
        return raHours.toBigDecimal().multiply(BigDecimal(15)) + raMinutes.toBigDecimal().divide(BigDecimal(4), 7, RoundingMode.HALF_UP) + raSeconds.toBigDecimal().divide(BigDecimal(240), 7, RoundingMode.HALF_UP)
    }

    fun decValue(): BigDecimal {
        val op: (BigDecimal, BigDecimal) -> BigDecimal = if (decSign != "-") { a, b -> a + b } else { a, b -> a - b }
        return op(decDegrees.toBigDecimal(), (decMinutes.toBigDecimal().divide(BigDecimal(60), 7, RoundingMode.HALF_UP) + decSeconds.toBigDecimal().divide(BigDecimal(3600), 7, RoundingMode.HALF_UP)))
    }
}
