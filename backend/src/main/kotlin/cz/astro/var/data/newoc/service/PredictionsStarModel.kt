package cz.astro.`var`.data.newoc.service

import com.fasterxml.jackson.annotation.JsonFormat
import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import cz.astro.`var`.data.newoc.repository.StarElement
import java.math.BigDecimal
import java.time.LocalDateTime

class StarElementMinimalModel(
        val id: Long,
        val period: BigDecimal,
        val minimum: BigDecimal,
        val kind: IdNameModel
)

fun StarElement.toMinimalModel(): StarElementMinimalModel {
    return StarElementMinimalModel(id, period, minimum, kind.toModel())
}

class PredictionsStarModel(
        val starId: Long,
        val constellationId: Long,
        val element: StarElementMinimalModel,
        val name: String,
        val coordinates: CosmicCoordinatesModel,
        val minimum: BigDecimal,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        val minimumDateTime: LocalDateTime,
        val points: Int?,
        val altitude: Double,
        val azimuth: String,
        val magnitudes: List<PredictionMagnitudeModel>,
        val elements: String,
        val minimaDuration: String
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is PredictionsStarModel) return false

        if (starId != other.starId) return false
        if (element != other.element) return false
        if (minimum != other.minimum) return false

        return true
    }

    override fun hashCode(): Int {
        var result = starId.hashCode()
        result = 31 * result + element.hashCode()
        result = 31 * result + minimum.hashCode()
        return result
    }
}
