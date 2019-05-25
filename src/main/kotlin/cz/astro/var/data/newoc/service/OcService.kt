package cz.astro.`var`.data.newoc.service

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.czev.service.*
import cz.astro.`var`.data.newoc.repository.*
import cz.astro.`var`.data.security.SecurityService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*
import javax.transaction.Transactional
import javax.validation.constraints.Size

/**
 * @author Michal
 * @version 1.0
 * @since 12/3/2018
 */
/*
* SERVICE INTERFACES
* */
interface StarsService {
    fun getAll(): List<StarListModel>
    fun getById(id: Long): Optional<StarDetailsModel>
    fun insert(star: StarNewModel): StarListModel
    fun insertMinima(minima: StarMinimaNewModel)
    fun insertMinimas(minimas: List<StarMinimaNewModel>)
    fun deleteStar(starId: Long)
    fun deleteMinima(minimaId: Long)
    fun deleteMinimaBatch(batchId: Long)
    fun updateMinima(minimaId: Long, minima: StarMinimaUpdateModel)
    fun updateStar(starId: Long, star: StarUpdateModel)
    fun updateStarBrightness(brightnessId: Long, model: StarBrightnessNewModel)
    fun updateStarElement(elementId: Long, model: StarElementNewModel)
    fun insertStarBrightness(starId: Long, brightness: StarBrightnessNewModel)
    fun insertStarElement(starId: Long, element: StarElementNewModel)
    fun deleteStarBrightness(brightnessId: Long)
    fun deleteStarElement(elementId: Long)

    // TODO: need get/updatePublication/deletePublication based on filter
}

interface PublicationsService {
    fun getAll(): List<MinimaPublicationModel>
    fun getById(id: Long): Optional<MinimaPublicationModel>
    fun deletePublication(id: Long)
    fun insertPublication(publication: MinimaPublicationNewModel)
    fun updatePublication(id: Long, model: MinimaPublicationUpdateModel)
    fun deleteVolume(id: Long)
    fun insertVolume(publicationId: Long, model: MinimaPublicationVolumeNewModel)
    fun updateVolume(id: Long, model: MinimaPublicationVolumeUpdateModel)
}

interface ObservationsService {
    fun getAllMethods(): List<IdNameModel>
    fun getAllKinds(): List<IdNameModel>
    fun getAllFilters(): List<IdNameModel>
}

/*
* MODELS
* */
class StarNewModel(
        val name: String,
        val constellationId: Long,
        val coordinates: CosmicCoordinatesModel,
        val comp: String?,
        val type: String,
        val minimaDuration: Int?,
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
        val type: String,
        val minimaDuration: Int?
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
        val minimaDuration: Int?,
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
        var year: Int?,
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
        var year: Int,
        var link: String?
)

class MinimaPublicationVolumeNewModel(
        var name: String,
        var year: Int,
        var link: String?
)

class MinimaPublicationVolumeUpdateModel(
        var name: String,
        var year: Int,
        var link: String?
)

class MinimaPublicationEntryModel(
        var id: Long,
        var publication: MinimaPublicationSimpleModel,
        var volume: MinimaPublicationVolumeModel,
        var page: String?
)

class MinimaPublicationEntryNewModel(
        var volumeId: Long,
        var page: String?
)

class MinimaPublicationEntryUpdateModel(
        var page: String?
)

class StarMinimaModel(
        val id: Long,
        val batchId: Long,
        val julianDate: BigDecimal,
        val method: IdNameModel,
        val publicationEntries: List<MinimaPublicationEntryModel>
)

class StarMinimaNewModel(
        val starElementId: Long,
        val julianDates: List<BigDecimal>,
        val methodId: Long,
        val publicationEntries: List<MinimaPublicationEntryNewModel>
)

class StarMinimaUpdateModel(
        val julianDate: BigDecimal,
        val methodId: Long,
        val publicationEntries: List<MinimaPublicationEntryNewModel>
//        val deletedPublicationEntryIds: List<Long>
)

class StarBrightnessModel(
        val id: Long,
        val minS: Double,
        val minP: Double,
        val maxP: Double,
        val filter: IdNameModel
)

class StarBrightnessNewModel(
        val minS: Double,
        val minP: Double,
        val maxP: Double,
        val filterId: Long
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
    return StarDetailsModel(id, name, constellation.toModel(), coordinates.toModel(), comp, type, minimaDuration,
            brightness.map(StarBrightness::toModel),
            elements.map(StarElement::toModel))
}

fun StarMinima.toModel(): StarMinimaModel {
    return StarMinimaModel(id, batch.id, julianDate, method.toModel(), publicationEntries.map(MinimaPublicationEntry::toModel))
}

fun StarBrightness.toModel(): StarBrightnessModel {
    return StarBrightnessModel(id, minS, minP, maxP, filter.toIdNameModel())
}

fun StarElement.toModel(): StarElementModel {
    return StarElementModel(id, period, minimum, kind.toModel(), minimas.map(StarMinima::toModel))
}

fun MinimaPublication.toModel(): MinimaPublicationModel {
    return MinimaPublicationModel(id, name, link, volumes.map(MinimaPublicationVolume::toModel))
}

fun MinimaPublication.toSimpleModel(): MinimaPublicationSimpleModel {
    return MinimaPublicationSimpleModel(id, name, link)
}

fun MinimaPublicationVolume.toModel(): MinimaPublicationVolumeModel {
    return MinimaPublicationVolumeModel(id, name, year, link)
}

fun MinimaPublicationEntry.toModel(): MinimaPublicationEntryModel {
    return MinimaPublicationEntryModel(id, volume.publication!!.toSimpleModel(), volume.toModel(), page)
}

/*
* SERVICE IMPLEMENTATIONS
* */
@Service
@Transactional
@PreAuthorize("hasRole('ADMIN')")
class StarsServiceImpl(
        private val starsRepository: StarsRepository,
        private val constellationRepository: ConstellationRepository,
        private val observationKindRepository: ObservationKindRepository,
        private val observationMethodRepository: ObservationMethodRepository,
        private val starElementRepository: StarElementRepository,
        private val userRepository: UserRepository,
        private val filterBandRepository: FilterBandRepository,
        private val publicationsRepository: PublicationsRepository,
        private val minimaRepository: MinimaRepository,
        private val minimaBatchRepository: MinimaBatchRepository,
        private val starBrightnessRepository: StarBrightnessRepository,
        private val securityService: SecurityService,
        private val volumeRepository: MinimaPublicationVolumeRepository
) : StarsService {
    override fun updateStarBrightness(brightnessId: Long, model: StarBrightnessNewModel) {
        val entity = starBrightnessRepository.findById(brightnessId).orElseThrow { ServiceException("Star brightness doesn't exist") }
        entity.apply {
            minS = model.minS
            maxP = model.maxP
            minP = model.minP
            if (filter.id != model.filterId) {
                filter = filterBandRepository.findById(model.filterId).orElseThrow { ServiceException("Observations filter doesn't exist") }
            }
        }
    }

    override fun updateStarElement(elementId: Long, model: StarElementNewModel) {
        val entity = starElementRepository.findById(elementId).orElseThrow { ServiceException("Star element doesn't exist") }
        entity.apply {
            minimum = model.minimum
            period = model.period
            if (kind.id != model.kindId) {
                kind = observationKindRepository.findById(model.kindId).orElseThrow { ServiceException("Observations kind doesn't exist") }
            }
        }
    }

    override fun deleteStarBrightness(brightnessId: Long) {
        starBrightnessRepository.delete(starBrightnessRepository.findById(brightnessId).orElseThrow { ServiceException("Star brightness doesn't exist") })
    }

    override fun deleteStarElement(elementId: Long) {
        starElementRepository.delete(starElementRepository.findById(elementId).orElseThrow { ServiceException("Star brightness doesn't exist") })
    }

    override fun updateMinima(minimaId: Long, minima: StarMinimaUpdateModel) {
        val entity = minimaRepository.findById(minimaId).orElseThrow { ServiceException("Minima doesn't exist") }
        entity.apply {
            julianDate = minima.julianDate
            if (method.id != minima.methodId) {
                method = observationMethodRepository.findById(minima.methodId).orElseThrow { ServiceException("Observation method doesn't exist") }
            }
            publicationEntries.clear()
            publicationEntries.addAll(minima.publicationEntries.map {
                MinimaPublicationEntry(volumeRepository.findById(it.volumeId).orElseThrow { ServiceException("Volume doesn't exist") }, it.page)
            })
            publicationEntries.forEach {
                it.minima = this
            }
        }
    }

    override fun updateStar(starId: Long, star: StarUpdateModel) {
        val entity = starsRepository.findById(starId).orElseThrow { ServiceException("Star doesn't exist") }
        entity.apply {
            if (constellation.id != star.constellationId) {
                constellation = constellationRepository.findById(star.constellationId).orElseThrow { ServiceException("Constellation doesn't exist") }
            }
            comp = star.comp
            coordinates = star.coordinates.toEntity()
            name = star.name
            type = star.type
            minimaDuration = star.minimaDuration
        }
    }

    override fun insertStarBrightness(starId: Long, brightness: StarBrightnessNewModel) {
        val star = starsRepository.findById(starId).orElseThrow { ServiceException("Star doesn't exist") }
        val filter = filterBandRepository.findById(brightness.filterId).orElseThrow { ServiceException("Observations filter doesn't exist") }
        val bright = StarBrightness(brightness.minS, brightness.maxP, brightness.minP, filter)
        bright.star = star
        starBrightnessRepository.save(bright)
    }

    override fun insertStarElement(starId: Long, element: StarElementNewModel) {
        val star = starsRepository.findById(starId).orElseThrow { ServiceException("Star doesn't exist") }
        val kind = observationKindRepository.findById(element.kindId).orElseThrow { ServiceException("Observations kind doesn't exist") }
        val ele = StarElement(element.period, element.minimum, kind, mutableSetOf())
        ele.star = star
        starElementRepository.save(ele)
    }

    override fun deleteMinimaBatch(batchId: Long) {
        minimaBatchRepository.delete(minimaBatchRepository.findById(batchId).orElseThrow { ServiceException("Minima batch doesn't exist") })
    }

    override fun deleteStar(starId: Long) {
        starsRepository.delete(starsRepository.findById(starId).orElseThrow { ServiceException("Star doesn't exist") })
    }

    override fun deleteMinima(minimaId: Long) {
        minimaRepository.delete(minimaRepository.findById(minimaId).orElseThrow { ServiceException("Star minima doesn't exist") })
    }

    override fun insertMinimas(minimas: List<StarMinimaNewModel>) {
        var importBatch = MinimaImportBatch(LocalDateTime.now(), User(securityService.currentUser.id))
        importBatch = minimaBatchRepository.save(importBatch)
        minimas.forEach { minima ->
            val starElement = starElementRepository.findById(minima.starElementId).orElseThrow { ServiceException("Star element doesn't exist") }
            val obsMethod = observationMethodRepository.findById(minima.methodId).orElseThrow { ServiceException("Observation method doesn't exist") }
            minima.julianDates.forEach { julianDate ->
                val newMinima = StarMinima(
                        importBatch,
                        julianDate,
                        obsMethod,
                        minima.publicationEntries.map { MinimaPublicationEntry(volumeRepository.findById(it.volumeId).orElseThrow { ServiceException("Volume doesn't exist") }, it.page) }.toMutableSet()
                )
                newMinima.publicationEntries.forEach {
                    it.minima = newMinima
                }
                newMinima.element = starElement
                starElement.minimas.add(newMinima)
            }
        }
    }

    override fun insertMinima(minima: StarMinimaNewModel) {
        insertMinimas(listOf(minima))
    }

    override fun insert(star: StarNewModel): StarListModel {
        val constellation = constellationRepository.findById(star.constellationId).orElseThrow { ServiceException("Constellation doesn't exist") }
        val brightness = star.brightness.map {
            val filter = filterBandRepository.findById(it.filterId).orElseThrow { ServiceException("Observation filter doesn't exist") }
            StarBrightness(it.minS, it.maxP, it.minP, filter)
        }.toMutableSet()
        val elements = star.elements.map {
            val kind = observationKindRepository.findById(it.kindId).orElseThrow { ServiceException("Observation kind doesn't exist") }
            StarElement(it.period, it.minimum, kind, mutableSetOf())
        }.toMutableSet()
        val entity = Star(star.name, constellation, star.coordinates.toEntity(), star.comp, star.type, star.minimaDuration, brightness, elements)
        brightness.forEach { it.star = entity }
        elements.forEach { it.star = entity }
        return starsRepository.save(entity).toListModel()
    }

    override fun getAll(): List<StarListModel> {
        return starsRepository.findAllPartlyFetched().map(Star::toListModel)
    }

    override fun getById(id: Long): Optional<StarDetailsModel> {
        return starsRepository.findById(id).map { it.toDetailsModel() }
    }
}

@Service
@Transactional
class PublicationsServiceImpl(
        private val publicationsRepository: PublicationsRepository,
        private val volumeRepository: MinimaPublicationVolumeRepository
) : PublicationsService {
    override fun deleteVolume(id: Long) {
        volumeRepository.delete(volumeRepository.findById(id).orElseThrow { ServiceException("Volume not found") })
    }

    override fun insertVolume(publicationId: Long, model: MinimaPublicationVolumeNewModel) {
        val publication = publicationsRepository.findById(publicationId).orElseThrow { ServiceException("Publication not found") }
        val volume = MinimaPublicationVolume(model.name, model.year, model.link, mutableSetOf())
        volume.publication = publication
        publication.volumes.add(volume)
    }

    override fun updateVolume(id: Long, model: MinimaPublicationVolumeUpdateModel) {
        val volume = volumeRepository.findById(id).orElseThrow { ServiceException("Volume not found") }
        volume.apply {
            name = model.name
            link = model.link
            year = model.year
        }
    }

    override fun insertPublication(publication: MinimaPublicationNewModel) {
        publication.apply {
            val minimaPublication = MinimaPublication(name, link, volumes.map { MinimaPublicationVolume(it.name, it.year, it.link, mutableSetOf()) }.toMutableSet())
            minimaPublication.volumes.forEach { it.publication = minimaPublication }
            publicationsRepository.save(minimaPublication)
        }
    }

    override fun deletePublication(id: Long) {
        publicationsRepository.delete(publicationsRepository.findById(id).orElseThrow { ServiceException("Publication not found") })
    }

    override fun getAll(): List<MinimaPublicationModel> {
        return publicationsRepository.findAll().map(MinimaPublication::toModel)
    }

    override fun getById(id: Long): Optional<MinimaPublicationModel> {
        return publicationsRepository.findById(id).map(MinimaPublication::toModel)
    }

    override fun updatePublication(id: Long, model: MinimaPublicationUpdateModel) {
        val publication = publicationsRepository.findById(id).orElseThrow { ServiceException("Publication not found") }
        publication.apply {
            name = model.name
            link = model.link
        }
    }
}

@Service
@Transactional
class ObservationsServiceImpl(
        private val observationMethodRepository: ObservationMethodRepository,
        private val observationKindRepository: ObservationKindRepository,
        private val filterBandRepository: FilterBandRepository
) : ObservationsService {

    override fun getAllMethods(): List<IdNameModel> {
        return observationMethodRepository.findAll().map(IdNameEntity::toModel)
    }

    override fun getAllKinds(): List<IdNameModel> {
        return observationKindRepository.findAll().map(IdNameEntity::toModel)
    }

    override fun getAllFilters(): List<IdNameModel> {
        return filterBandRepository.findAll().map(FilterBand::toIdNameModel)
    }
}
