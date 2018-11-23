package cz.astro.`var`.data.czev.service

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.czev.validation.Declination
import cz.astro.`var`.data.czev.validation.RightAscension
import cz.astro.`var`.data.security.UserPrincipal
import java.io.InputStream
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.DecimalFormat
import java.time.LocalDateTime

data class CzevStarDraftModel(
        val id: Long,
        val constellation: ConstellationModel,
        val type: String,
        val typeValid: Boolean,
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
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        val lastChange: LocalDateTime,
        val createdBy: UserModel,
        val rejected: Boolean,
        val rejectedReason: String,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        val rejectedOn: LocalDateTime?
)

data class CzevStarDraftUpdateModel(
        val id: Long,
        val constellation: Long,
        val type: String,
        val discoverers: List<Long>,
        val amplitude: Double?,
        val filterBand: Long?,
        val crossIdentifications: List<String>,
        val coordinates: CosmicCoordinatesModel,
        val privateNote: String,
        val publicNote: String,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val year: Int
)

data class CzevStarDraftNewModel(
        val constellation: Long,
        val type: String,
        val discoverers: List<Long>,
        val amplitude: Double?,
        val filterBand: Long?,
        val crossIdentifications: List<String>,
        val coordinates: CosmicCoordinatesModel,
        val privateNote: String,
        val publicNote: String,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val year: Int
)

data class CzevStarDraftImportModel(
        val coordinates: CosmicCoordinatesModel,
        val constellation: String,
        val type: String,
        val amplitude: Double?,
        val filterBand: String,
        val crossIds: List<String>,
        val year: Int,
        val discoverers: Set<String>,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val privateNote: String,
        val publicNote: String
)

data class CzevStarDraftRejectionModel(
        val rejectionNote: String
) {
    var id: Long = -1
}

data class CsvImportModel(
//        val settings: CsvImportSettings,
        val fileInputStream: InputStream
)

data class CsvImportResultModel(
        val importedCount: Int,
        val parsingErrors: List<ImportRecordError>
)

//data class CsvImportSettings(
//        val discoverersStrategy: DiscoverersImportStrategy = DiscoverersImportStrategy.ABBREVIATIONS_FAIL,
//        val validationFailStrategy: ImportValidationFailStrategy = ImportValidationFailStrategy.SKIP
//)
//
//enum class ImportValidationFailStrategy {
//    SKIP, FAIL_ALL
//}
//
//enum class DiscoverersImportStrategy {
//    ABBREVIATIONS_FAIL, NAME_CREATE_NEW, NAME_FAIL
//}

data class CzevStarApprovalModel(
        val id: Long,
        val constellation: Long,
        val type: String,
        val discoverers: List<Long>,
        val amplitude: Double?,
        val filterBand: Long?,
        val crossIdentifications: List<String>,
        val coordinates: CosmicCoordinatesModel,
        val privateNote: String,
        val publicNote: String,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val year: Int,
        val jMagnitude: Double?,
        val vMagnitude: Double?,
        val jkMagnitude: Double?
)

data class CzevStarDetailsModel(
        val czevId: Long,
        val coordinates: CosmicCoordinatesModel,
        val constellation: ConstellationModel,
        val type: String,
        val typeValid: Boolean,
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

data class CzevStarUpdateModel(
        val czevId: Long,
        val coordinates: CosmicCoordinatesModel,
        val constellation: Long,
        val type: String,
        val typeValid: Boolean,
        val jMagnitude: Double?,
        val vMagnitude: Double?,
        val jkMagnitude: Double?,
        val amplitude: Double?,
        val discoverers: List<Long>,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val filterBand: Long?,
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
        val typeValid: Boolean,
        val discoverers: List<StarObserverModel>,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val year: Int
)

data class CosmicCoordinatesModel(
        @RightAscension val ra: BigDecimal,
        @Declination val dec: BigDecimal
) {

    // TODO move to helper?
    @JsonProperty("raString")
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

    @JsonProperty("decString")
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
        val name: String,
        val abbreviation: String
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

data class UserModel(
        val id: Long,
        val name: String
)

fun CzevStar.toDetailsModel(): CzevStarDetailsModel {
    return CzevStarDetailsModel(
            czevId, coordinates.toModel(), constellation.toModel(), type, typeValid, jMagnitude, vMagnitude, jkMagnitude, amplitude,
            discoverers.toModels(), m0, period, filterBand.toModel(), crossIdentifications.sortedBy { it.orderNumber }.map { it.name }.toList(),
            year, publicNote, vsxName, vsxId
    )
}

fun CzevStar.toListModel(): CzevStarListModel {
    return CzevStarListModel(czevId, coordinates.toModel(), constellation.toModel(),
            type, typeValid, discoverers.toModels(), m0, period, year)
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
    return ConstellationModel(id, name, abbreviation)
}

fun Iterable<StarObserver>.toModels(): List<StarObserverModel> {
    return this.asSequence().map { StarObserverModel(it.id, it.firstName, it.lastName, it.abbreviation) }.toList()
}

fun CzevStarDraft.toModel(): CzevStarDraftModel {
    val principal = UserModel(createdBy.id, createdBy.email)
    return CzevStarDraftModel(
            id, constellation.toModel(), type, typeValid, discoverers.toModels(), amplitude, filterBand.toModel(),
            crossIdentifications.sortedBy { it.orderNumber }.map { it.name }.toList(), coordinates.toModel(), privateNote, publicNote, m0, period, year,
            lastChange, principal, rejected, rejectedNote, rejectedOn
    )
}

fun ConstellationModel.toEntity(): Constellation {
    val constellation = Constellation(name, abbreviation)
    constellation.id = id
    return constellation
}

fun FilterBandModel?.toEntity(): FilterBand? {
    if (this == null) return null
    val filterBand = FilterBand(name)
    filterBand.id = id
    return filterBand
}

fun List<StarObserverModel>.toEntities(): MutableSet<StarObserver> {
    return this.map {
        val starObserver = StarObserver(it.firstName, it.lastName, it.abbreviation, "")
        starObserver.id = it.id
        starObserver
    }.toMutableSet()
}

fun CosmicCoordinatesModel.toEntity(): CosmicCoordinates {
    return CosmicCoordinates(ra, dec)
}

fun UserPrincipal.toModel(): UserModel {
    return UserModel(id,  email)
}
