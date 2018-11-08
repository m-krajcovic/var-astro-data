package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import java.math.BigDecimal
import java.math.RoundingMode

data class CzevStarNewModel(
        val vsxName: String,
        val vsxId: Long?,
        val constellation: ConstellationModel,
        val type: String,
        val discoverers: List<StarObserverModel>,
        val amplitude: Double?,
        val filterBand: FilterBandModel?,
        val crossIds: List<String>,
        val coordinates: CosmicCoordinatesModel,
        val privateNode: String,
        val publicNote: String
)

data class CzevStarDetailsModel(
        val id: Long,
        val czevId: Long?,
        val coordinates: CosmicCoordinatesModel,
        val constellation: ConstellationModel,
        val type: String,
        val magnitude: Double,
        val discoverers: List<StarObserverModel>,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val filterBand: FilterBandModel?,
        val year: Int,
        val publicNote: String,
        val vsxName: String,
        val vsxId: Long?
)

data class CzevStarExportModel(
        val czevId: Long,
        val crossIdentifications: List<String>,
        val vsxName: String,
        val coordinates: CosmicCoordinatesModel,
        val constellation: ConstellationModel,
        val type: String,
        val vMagnitude: Double?,
        val jMagnitude: Double?,
        val jk: Double?,
        val amplitude: Double?,
        val filterBand: FilterBandModel?,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val discoverers: List<StarObserverModel>,
        val year: Int
)

data class CzevStarListModel(
        val id: Long,
        val czevId: Long?,
        val coordinates: CosmicCoordinatesModel,
        val constellation: ConstellationModel,
        val type: String,
        val magnitude: Double,
        val discoverers: List<StarObserverModel>,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val year: Int
)

data class CosmicCoordinatesModel(
        val ra: BigDecimal,
        val dec: BigDecimal
) {

    fun toEntity(): CosmicCoordinates {
        return CosmicCoordinates(ra, dec)
    }

    fun toStringRa(): String {
        val hours = ra.divide(BigDecimal(15), RoundingMode.HALF_UP).setScale(0, RoundingMode.DOWN)
        val minutes = (ra - hours * BigDecimal(15)).multiply(BigDecimal(4))
        val minutesRounded = minutes.setScale(0, RoundingMode.DOWN)
        val minutesRemainder = minutes.remainder(BigDecimal.ONE)
        val seconds = (minutesRemainder * BigDecimal(60)).setScale(3, RoundingMode.HALF_UP)

        return "$hours $minutesRounded $seconds"
    }

    fun toStringDec(): String {
        val degrees = dec.setScale(0, RoundingMode.DOWN)
        val degreesRemainder = dec.abs().remainder(BigDecimal.ONE)
        val arcminutes = degreesRemainder * BigDecimal(60)
        val arcminutesRounded = arcminutes.setScale(0, RoundingMode.DOWN)
        val arcminutesRemainder = arcminutes.abs().remainder(BigDecimal.ONE)
        val arcseconds = arcminutesRemainder * BigDecimal(60)
        val sign = if (degrees > BigDecimal.ZERO) "+" else "-"
        return "$sign$degrees $arcminutesRounded $arcseconds"
    }
}

data class ConstellationModel(
        val id: Long,
        val name: String
)

data class FilterBandModel(
        val id: Long,
        val name: String
)

data class StarObserverModel(
        val id: Long,
        val firstName: String,
        val lastName: String,
        val abbreviation: String
)

fun CzevStar.toDetailsModel(): CzevStarDetailsModel {
    return CzevStarDetailsModel(
            id, czevId, coordinates.toModel(), constellation.toModel(), type, .0, discoverers.toModels(), m0, period, filterBand.toModel(), year, publicNote, vsxName, vsxId
    )
}

fun CzevStar.toListModel(): CzevStarListModel {
    return CzevStarListModel(id, czevId, coordinates.toModel(), constellation.toModel(), type, .0, discoverers.toModels(), m0, period, year)
}

fun FilterBand?.toModel(): FilterBandModel? {
    if (this == null) {
        return null
    }
    return FilterBandModel(id, name)
}

fun CosmicCoordinates.toModel(): CosmicCoordinatesModel {
    return CosmicCoordinatesModel(rightAscension, declination)
}

fun Constellation.toModel(): ConstellationModel {
    return ConstellationModel(id, name)
}

fun List<StarObserver>.toModels(): List<StarObserverModel> {
    return this.asSequence().map { StarObserverModel(it.id, it.firstName, it.lastName, it.abbreviation) }.toList()
}