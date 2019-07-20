package cz.astro.`var`.data.newoc.service

import com.fasterxml.jackson.annotation.JsonFormat
import cz.astro.`var`.data.czev.service.ConstellationModel
import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import cz.astro.`var`.data.czev.service.toIdNameModel
import cz.astro.`var`.data.czev.service.toModel
import cz.astro.`var`.data.newoc.repository.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.time.LocalTime
import javax.validation.constraints.Size


/*
* MODELS
* */
class StarNewModel(
        val name: String,
        val constellationId: Long,
        val coordinates: CosmicCoordinatesModel,
        val comp: String?,
        val type: String,
        @field:Size(min = 1)
        val brightness: List<StarBrightnessNewModel>,
        @field:Size(min = 1)
        val elements: List<StarElementNewModel>
)

class StarUpdateModel(
        val name: String,
        val constellationId: Long,
        val coordinates: CosmicCoordinatesModel,
        val comp: String?,
        val type: String
)

class StarListModel(
        val id: Long,
        val name: String,
        val constellation: ConstellationModel,
        val coordinates: CosmicCoordinatesModel,
        val comp: String?,
        val type: String
)

class StarDetailsModel(
        val id: Long,
        val name: String,
        val constellation: ConstellationModel,
        val coordinates: CosmicCoordinatesModel,
        val comp: String?,
        val type: String,
        val brightness: List<StarBrightnessModel>,
        val elements: List<StarElementModel>
)


class MinimaPublicationModel(
        val id: Long,
        var name: String,
        var link: String?,
        var volumes: List<MinimaPublicationVolumeModel>
)

class MinimaPublicationSimpleModel(
        val id: Long,
        var name: String,
        var link: String?
)

class MinimaPublicationNewModel(
        var name: String,
        var link: String?,
        var volumes: List<MinimaPublicationVolumeNewModel>
)

class MinimaPublicationUpdateModel(
        var name: String,
        var link: String?
)

class MinimaPublicationVolumeModel(
        var id: Long,
        var name: String,
        var year: Int?,
        var link: String?
)

class MinimaPublicationVolumeNewModel(
        var name: String,
        var year: Int?,
        var link: String?
)

class MinimaPublicationVolumeUpdateModel(
        var name: String,
        var year: Int?,
        var link: String?
)

class MinimaPublicationEntryModel(
        var publication: MinimaPublicationSimpleModel,
        var volume: MinimaPublicationVolumeModel,
        var page: String = ""
)

class MinimaPublicationEntryNewModel(
        var volumeId: Long,
        var page: String = ""
)

class MinimaPublicationEntryUpdateModel(
        var page: String?
)

class StarMinimaModel(
        val id: Long,
        val batchId: Long,
        val julianDate: BigDecimal,
        val method: IdNameModel,
        val publicationEntries: List<MinimaPublicationEntryModel>,
        val observer: String,
        val instrument: String
)

class StarMinimaNewModel(
        val starElementId: Long,
        val julianDates: List<BigDecimal>,
        val methodId: Long,
        val publicationEntries: List<MinimaPublicationEntryNewModel>,
        val observer: String,
        val instrument: String = ""
)

class StarMinimaUpdateModel(
        val julianDate: BigDecimal,
        val methodId: Long,
        val publicationEntries: List<MinimaPublicationEntryNewModel>,
        val observer: String,
        val instrument: String = ""
)

class StarMinimaBulkUpdateModel(
        val julianDate: BigDecimal?,
        val methodId: Long?,
        val publicationEntries: List<MinimaPublicationEntryNewModel>?,
        val observer: String?,
        val starElementId: Long?,
        val instrument: String = ""
)

class StarBrightnessModel(
        val id: Long,
        val minS: Double,
        val minP: Double,
        val maxP: Double,
        val filter: IdNameModel,
        val minimaDuration: Int?
)

class StarBrightnessNewModel(
        val minS: Double,
        val minP: Double,
        val maxP: Double,
        val filterId: Long,
        val minimaDuration: Int?
)

class StarElementModel(
        val id: Long,
        val period: BigDecimal,
        val minimum: BigDecimal,
        val kind: IdNameModel,
        val minimas: List<StarMinimaModel>
)

class StarElementNewModel(
        val period: BigDecimal,
        val minimum: BigDecimal,
        val kindId: Long
)

class IdNameModel(
        val id: Long,
        val name: String
)

data class PredictionsStarBrightnessModel(
        val filter: String,
        val max: Double,
        val min: Double,
        val minimaDuration: String
)

data class PredictionsResultModel(
        val predictions: Set<PredictionsStarModel>,
        val nights: List<NightInterval>
)

data class NightInterval(
        @JsonFormat(pattern = "HH:mm", timezone = "UTC/Greenwich")
        val sunset: LocalTime,
        @JsonFormat(pattern = "HH:mm", timezone = "UTC/Greenwich")
        val sunrise: LocalTime
)

class StarElementMinimalModel(
        val id: Long,
        val period: BigDecimal,
        val minimum: BigDecimal,
        val kind: IdNameModel
)


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
        val brightness: List<PredictionsStarBrightnessModel>,
        val elements: String
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


/*
* MAPPERS
* */
fun IdNameEntity.toModel(): IdNameModel {
    return IdNameModel(id, name)
}

fun Star.toListModel(): StarListModel {
    return StarListModel(id, name, constellation.toModel(), coordinates.toModel(), comp, type)
}

fun Star.toDetailsModel(): StarDetailsModel {
    return StarDetailsModel(id, name, constellation.toModel(), coordinates.toModel(), comp, type,
            brightness.asSequence().map { it.toModel() }.toList(),
            elements.asSequence().map { it.toModel() }.toList())
}

fun StarMinima.toModel(): StarMinimaModel {
    return StarMinimaModel(id, batch.id, julianDate, method.toModel(), publicationEntries.map { it.toModel() }, observer, instrument)
}

fun StarBrightness.toModel(): StarBrightnessModel {
    return StarBrightnessModel(id, minS, minP, maxP, filter.toIdNameModel(), minimaDuration)
}

fun StarElement.toModel(): StarElementModel {
    return StarElementModel(id, period, minimum, kind.toModel(), minimas.map { it.toModel() })
}

fun MinimaPublication.toModel(): MinimaPublicationModel {
    return MinimaPublicationModel(id, name, link, volumes.map { it.toModel() })
}

fun MinimaPublication.toSimpleModel(): MinimaPublicationSimpleModel {
    return MinimaPublicationSimpleModel(id, name, link)
}

fun MinimaPublicationVolume.toModel(): MinimaPublicationVolumeModel {
    return MinimaPublicationVolumeModel(id, name, year, link)
}

fun MinimaPublicationEntry.toModel(): MinimaPublicationEntryModel {
    return MinimaPublicationEntryModel(volume.publication!!.toSimpleModel(), volume.toModel(), page)
}

fun StarElement.toMinimalModel(): StarElementMinimalModel {
    return StarElementMinimalModel(id, period, minimum, kind.toModel())
}
