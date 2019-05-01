package cz.astro.`var`.data.newoc.service

import cz.astro.`var`.data.czev.repository.ConstellationRepository
import cz.astro.`var`.data.czev.repository.UserRepository
import cz.astro.`var`.data.czev.service.*
import cz.astro.`var`.data.newoc.repository.*
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

    // TODO: need get/update/delete based on filter
}

interface PublicationsService {
    fun getAll(): List<PublicationModel>
    fun getById(id: Long): Optional<PublicationModel>
    fun delete(id: Long)
    fun insert(publication: PublicationNewModel)
    fun update(id: Long, model: PublicationUpdateModel)
}

/*
* MODELS
* */
class StarNewModel(
        val name: String,
        val constellationId: Long,
        val coordinates: CosmicCoordinatesModel,
        val comp: String,
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
        val comp: String,
        val type: String
)

class StarListModel(
        val id: Long,
        val name: String,
        val constellation: ConstellationModel,
        val coordinates: CosmicCoordinatesModel,
        val comp: String,
        val type: String
)

class StarDetailsModel(
        val id: Long,
        val name: String,
        val constellation: ConstellationModel,
        val coordinates: CosmicCoordinatesModel,
        val comp: String,
        val type: String,
        val brightness: List<StarBrightnessModel>,
        val elements: List<StarElementModel>
)


// TODO check publications how they should be modelled
class PublicationModel(
        val id: Long,
        val name: String,
        val link: String
)

class PublicationNewModel(
        val name: String,
        val link: String
)

class PublicationUpdateModel(
        val name: String,
        val link: String
)

class StarMinimaModel(
        val id: Long,
        val batchId: Long,
        val julianDate: BigDecimal,
        val method: IdNameModel,
        val publications: List<PublicationModel>
)

class StarMinimaNewModel(
        val starElementId: Long,
        val julianDate: BigDecimal,
        val methodId: Long,
        val publicationIds: List<Long>
)

class StarMinimaUpdateModel(
        val julianDate: BigDecimal,
        val methodId: Long,
        val publicationIds: List<Long>
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
    return StarDetailsModel(id, name, constellation.toModel(), coordinates.toModel(), comp, type,
            brightness.map(StarBrightness::toModel),
            elements.map(StarElement::toModel))
}

fun StarMinima.toModel(): StarMinimaModel {
    return StarMinimaModel(id, batch.id, julianDate, method.toModel(), publications.map(StarPublication::toModel))
}

fun StarBrightness.toModel(): StarBrightnessModel {
    return StarBrightnessModel(id, minS, minP, maxP, filter.toModel())
}

fun StarElement.toModel(): StarElementModel {
    return StarElementModel(id, period, minimum, kind.toModel(), minimas.map(StarMinima::toModel))
}

fun StarPublication.toModel(): PublicationModel {
    return PublicationModel(id, name, link)
}

/*
* SERVICE IMPLEMENTATIONS
* */
@Service
@Transactional
class StarsServiceImpl(
        private val starsRepository: StarsRepository,
        private val constellationRepository: ConstellationRepository,
        private val observationFilterRepository: ObservationFilterRepository,
        private val observationKindRepository: ObservationKindRepository,
        private val observationMethodRepository: ObservationMethodRepository,
        private val starElementRepository: StarElementRepository,
        private val userRepository: UserRepository,
        private val publicationsRepository: PublicationsRepository,
        private val minimaRepository: MinimaRepository,
        private val minimaBatchRepository: MinimaBatchRepository,
        private val starBrightnessRepository: StarBrightnessRepository
) : StarsService {
    override fun updateStarBrightness(brightnessId: Long, model: StarBrightnessNewModel) {
        val entity = starBrightnessRepository.findById(brightnessId).orElseThrow { ServiceException("Star brightness doesn't exist") }
        entity.apply {
            minS = model.minS
            maxP = model.maxP
            minP = model.minP
            if (filter.id != model.filterId) {
                filter = observationFilterRepository.findById(model.filterId).orElseThrow { ServiceException("Observations filter doesn't exist") }
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
            publications = publicationsRepository.findAllById(minima.publicationIds).toMutableSet()
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
        }
    }

    override fun insertStarBrightness(starId: Long, brightness: StarBrightnessNewModel) {
        val star = starsRepository.findById(starId).orElseThrow { ServiceException("Star doesn't exist") }
        val filter = observationFilterRepository.findById(brightness.filterId).orElseThrow { ServiceException("Observations filter doesn't exist") }
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
        // TODO user
        val user = userRepository.findAll().first()
        var importBatch = MinimaImportBatch(LocalDateTime.now(), user)
        importBatch = minimaBatchRepository.save(importBatch)
        minimas.forEach { minima ->
            val starElement = starElementRepository.findById(minima.starElementId).orElseThrow { ServiceException("Star element doesn't exist") }
            val obsMethod = observationMethodRepository.findById(minima.methodId).orElseThrow { ServiceException("Observation method doesn't exist") }
            val publications = publicationsRepository.findAllById(minima.publicationIds).toMutableSet()
            val newMinima = StarMinima(
                    importBatch,
                    minima.julianDate,
                    obsMethod,
                    publications
            )
            newMinima.element = starElement
            starElement.minimas.add(newMinima)
        }
    }

    override fun insertMinima(minima: StarMinimaNewModel) {
        insertMinimas(listOf(minima))
    }

    override fun insert(star: StarNewModel): StarListModel {
        val constellation = constellationRepository.findById(star.constellationId).orElseThrow { ServiceException("Constellation doesn't exist") }
        val brightness = star.brightness.map {
            val filter = observationFilterRepository.findById(it.filterId).orElseThrow { ServiceException("Observation filter doesn't exist") }
            StarBrightness(it.minS, it.maxP, it.minP, filter)
        }.toMutableSet()
        val elements = star.elements.map {
            val kind = observationKindRepository.findById(it.kindId).orElseThrow { ServiceException("Observation kind doesn't exist") }
            StarElement(it.period, it.minimum, kind, mutableSetOf())
        }.toMutableSet()
        val entity = Star(star.name, constellation, star.coordinates.toEntity(), star.comp, star.type, brightness, elements)
        brightness.forEach { it.star = entity }
        elements.forEach { it.star = entity }
        return starsRepository.save(entity).toListModel()
    }

    override fun getAll(): List<StarListModel> {
        return starsRepository.findAll().map(Star::toListModel)
    }

    override fun getById(id: Long): Optional<StarDetailsModel> {
        return starsRepository.findById(id).map { it.toDetailsModel() }
    }
}

@Service
@Transactional
class PublicationsServiceImpl(private val publicationsRepository: PublicationsRepository) : PublicationsService {
    override fun insert(publication: PublicationNewModel) {
        publicationsRepository.save(StarPublication(publication.name, publication.link))
    }

    override fun delete(id: Long) {
        publicationsRepository.delete(publicationsRepository.findById(id).orElseThrow { ServiceException("Publication not found") })
    }

    override fun getAll(): List<PublicationModel> {
        return publicationsRepository.findAll().map(StarPublication::toModel)
    }

    override fun getById(id: Long): Optional<PublicationModel> {
        return publicationsRepository.findById(id).map(StarPublication::toModel)
    }

    override fun update(id: Long, model: PublicationUpdateModel) {
        val publication = publicationsRepository.findById(id).orElseThrow { ServiceException("Publication not found") }
        publication.apply {
            name = model.name
            link = model.link
        }
    }
}
