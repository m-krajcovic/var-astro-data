package cz.astro.`var`.data.newoc.service

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.czev.service.*
import cz.astro.`var`.data.newoc.repository.*
import cz.astro.`var`.data.security.SecurityService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*
import javax.transaction.Transactional

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
    fun updateMinimaBulk(minimaIds: List<Long>, model: StarMinimaBulkUpdateModel)
    fun updateStar(starId: Long, star: StarUpdateModel)
    fun updateStarBrightness(brightnessId: Long, model: StarBrightnessNewModel)
    fun updateStarElement(elementId: Long, model: StarElementNewModel)
    fun insertStarBrightness(starId: Long, brightness: StarBrightnessNewModel)
    fun insertStarElement(starId: Long, element: StarElementNewModel)
    fun deleteStarBrightness(brightnessId: Long)
    fun deleteStarElement(elementId: Long)
    fun getStarsByConstellation(constellationId: Long): List<StarListModel>
    fun getStarMinimaJulianDates(starId: Long): List<Double>
    fun getElementMinimaJulianDates(elementId: Long): List<Double>

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
        private val publicationsRepository: MinimaPublicationsRepository,
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
            observer = minima.observer
            publicationEntries.clear()
            publicationEntries.addAll(minima.publicationEntries.map {
                MinimaPublicationEntry(volumeRepository.findById(it.volumeId).orElseThrow { ServiceException("Volume doesn't exist") }, it.page)
            })
            publicationEntries.forEach {
                it.minima = this
            }
        }
    }

    override fun updateMinimaBulk(minimaIds: List<Long>, model: StarMinimaBulkUpdateModel) {
        val entities = minimaRepository.findAllById(minimaIds)
        entities.forEach { entity ->
            entity.apply {
                model.julianDate?.let {
                    julianDate = it
                }

                model.methodId?.let {
                    if (method.id != it) {
                        method = observationMethodRepository.findById(it).orElseThrow { ServiceException("Observation method doesn't exist") }
                    }
                }

                model.observer?.let {
                    observer = it
                }

                model.publicationEntries?.let {
                    publicationEntries.clear()
                    publicationEntries.addAll(it.map { e ->
                        MinimaPublicationEntry(volumeRepository.findById(e.volumeId).orElseThrow { ServiceException("Volume doesn't exist") }, e.page)
                    })
                    publicationEntries.forEach { e ->
                        e.minima = this
                    }
                }

                model.starElementId?.let {
                    element = starElementRepository.findById(it).orElseThrow { ServiceException("Element does not exist") }
                }
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
        var importBatch = MinimaImportBatch(LocalDateTime.now(), User(securityService.getCurrentUser()!!.id))
        importBatch = minimaBatchRepository.save(importBatch)
        minimas.forEach { minima ->
            val starElement = starElementRepository.findById(minima.starElementId).orElseThrow { ServiceException("Star element doesn't exist") }
            val obsMethod = observationMethodRepository.findById(minima.methodId).orElseThrow { ServiceException("Observation method doesn't exist") }
            minima.julianDates.forEach { julianDate ->
                val newMinima = StarMinima(
                        importBatch,
                        julianDate,
                        obsMethod,
                        minima.publicationEntries.map { MinimaPublicationEntry(volumeRepository.findById(it.volumeId).orElseThrow { ServiceException("Volume doesn't exist") }, it.page) }.toMutableSet(),
                        minima.observer,
                        minima.instrument
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

    @PreAuthorize("permitAll()")
    override fun getAll(): List<StarListModel> {
        return starsRepository.findAllPartlyFetched().map { it.toListModel() }
    }

    @PreAuthorize("permitAll()")
    override fun getById(id: Long): Optional<StarDetailsModel> {
        return starsRepository.findByIdFetched(id).map { it.toDetailsModel() }
    }

    @PreAuthorize("permitAll()")
    override fun getStarsByConstellation(constellationId: Long): List<StarListModel> {
        return starsRepository.findAllByConstellationId(constellationId).map { it.toListModel() }
    }

    @PreAuthorize("permitAll()")
    override fun getElementMinimaJulianDates(elementId: Long): List<Double> {
        val entity = starElementRepository.findById(elementId).orElseThrow { ServiceException("Star element doesn't exist") }
        return entity.minimas.map { it.julianDate.toDouble() }
    }

    @PreAuthorize("permitAll()")
    override fun getStarMinimaJulianDates(starId: Long): List<Double> {
        val entity = starsRepository.findByIdFetched(starId).orElseThrow { ServiceException("Star doesn't exist") }
        val result = ArrayList<Double>()
        entity.elements.forEach { e ->
            result.addAll(e.minimas.map { it.julianDate.toDouble() })
        }
        return result
    }
}

@Service
@Transactional
class PublicationsServiceImpl(
        private val publicationsRepository: MinimaPublicationsRepository,
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
        return publicationsRepository.findAll().map { it.toModel() }
    }

    override fun getById(id: Long): Optional<MinimaPublicationModel> {
        return publicationsRepository.findById(id).map { it.toModel() }
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
        return observationMethodRepository.findAll().map { it.toModel() }
    }

    override fun getAllKinds(): List<IdNameModel> {
        return observationKindRepository.findAll().map { it.toModel() }
    }

    override fun getAllFilters(): List<IdNameModel> {
        return filterBandRepository.findAll().map { it.toIdNameModel() }
    }
}
