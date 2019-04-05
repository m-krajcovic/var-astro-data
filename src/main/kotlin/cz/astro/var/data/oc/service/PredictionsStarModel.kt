package cz.astro.`var`.data.oc.service

import com.fasterxml.jackson.annotation.JsonFormat
import java.math.BigDecimal
import java.time.LocalDateTime

class PredictionsStarModel(
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

        other as PredictionsStarModel

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
