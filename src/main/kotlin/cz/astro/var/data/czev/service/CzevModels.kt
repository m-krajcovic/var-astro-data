package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.security.UserPrincipal
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.DecimalFormat

data class CzevStarDraftModel(
        val id: Long?,
        val constellation: ConstellationModel,
        val type: String,
        val discoverers: List<StarObserverModel>,
        val amplitude: Double?,
        val filterBand: FilterBandModel?,
        val crossIdentifications: List<String>,
        val coordinates: CosmicCoordinatesModel,
        val privateNote: String,
        val publicNote: String,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val year: Int,
        val createdBy: UserPrincipal
)

data class CzevStarApprovalModel(
        val id: Long?,
        val constellation: ConstellationModel,
        val type: String,
        val discoverers: List<StarObserverModel>,
        val amplitude: Double?,
        val filterBand: FilterBandModel?,
        val crossIdentifications: List<String>,
        val coordinates: CosmicCoordinatesModel,
        val privateNote: String,
        val publicNote: String,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val year: Int
)

data class CzevStarDetailsModel(
        val czevId: Long,
        val coordinates: CosmicCoordinatesModel,
        val constellation: ConstellationModel,
        val type: String,
        val jMagnitude: Double?,
        val vMagnitude: Double?,
        val jkMagnitude: Double?,
        val amplitude: Double?,
        val discoverers: List<StarObserverModel>,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val filterBand: FilterBandModel?,
        val crossIdentifications: List<String>,
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
        val jkMagnitude: Double?,
        val amplitude: Double?,
        val filterBand: FilterBandModel?,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val discoverers: List<StarObserverModel>,
        val year: Int
)

data class CzevStarListModel(
        val czevId: Long,
        val coordinates: CosmicCoordinatesModel,
        val constellation: ConstellationModel,
        val type: String,
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

        val dc = DecimalFormat("00.000")
        val ic = DecimalFormat("00")

        return "${ic.format(hours)} ${ic.format(minutesRounded)} ${dc.format(seconds)}"
    }

    fun toStringDec(): String {
        val degrees = dec.setScale(0, RoundingMode.DOWN)
        val degreesRemainder = dec.abs().remainder(BigDecimal.ONE)
        val arcminutes = degreesRemainder * BigDecimal(60)
        val arcminutesRounded = arcminutes.setScale(0, RoundingMode.DOWN)
        val arcminutesRemainder = arcminutes.abs().remainder(BigDecimal.ONE)
        val arcseconds = arcminutesRemainder * BigDecimal(60)

        val dc = DecimalFormat("00.00")
        val ic = DecimalFormat("00")

        val sign = if (degrees > BigDecimal.ZERO) "+" else "-"
        return "$sign${ic.format(degrees.abs())} ${ic.format(arcminutesRounded)} ${dc.format(arcseconds)}"
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
            czevId, coordinates.toModel(), constellation.toModel(), type, jMagnitude, vMagnitude, jkMagnitude, amplitude,
            discoverers.toModels(), m0, period, filterBand.toModel(), crossIdentifications.map { it.name },
            year, publicNote, vsxName, vsxId
    )
}

fun CzevStar.toListModel(): CzevStarListModel {
    return CzevStarListModel(czevId, coordinates.toModel(), constellation.toModel(),
            type, discoverers.toModels(), m0, period, year)
}

fun CzevStar.toExportModel(): CzevStarExportModel {
    return CzevStarExportModel(
            czevId,
            crossIdentifications.asSequence().map { it.name }.toList(),
            vsxName,
            coordinates.toModel(),
            constellation.toModel(),
            type,
            vMagnitude,
            jMagnitude,
            jkMagnitude,
            amplitude,
            filterBand.toModel(),
            m0,
            period,
            discoverers.toModels(),
            year
    )
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

fun Set<StarObserver>.toModels(): List<StarObserverModel> {
    return this.asSequence().map { StarObserverModel(it.id, it.firstName, it.lastName, it.abbreviation) }.toList()
}

fun CzevStarDraft.toModel(): CzevStarDraftModel {
    val principal = UserPrincipal()
    principal.id = createdBy.id
    return CzevStarDraftModel(
            id, constellation.toModel(), type, discoverers.toModels(), amplitude, filterBand.toModel(),
            crossIdentifications.map { it.name }, coordinates.toModel(), privateNote, publicNote, m0, period, year,
            principal
    )
}