package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Polygon
import org.springframework.data.domain.Sort
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import javax.transaction.Transactional


/**
 * @author Michal
 * @version 1.0
 * @since 11/19/2018
 */

/**
 * Interface for managing constellation entities
 */
interface ConstellationService {
    fun getAll(): List<ConstellationModel>
    fun getConstellation(point: CosmicCoordinatesModel): ConstellationModel?
}

/**
 * Interface for managing filter bands entities
 */
interface FilterBandService {
    fun getAll(): List<FilterBandModel>
}

/**
 * Interface for managing star observers entities
 */
interface StarObserverService {
    fun getAll(): List<StarObserverModel>
}

/**
 * Interface for managing type entities
 */
interface StarTypeService {
    fun getAll(): List<String>
    fun validateType(type: String): Boolean
}

interface StarAdditionalFileService {
    fun getFile(id: String): StarAdditionalFileModel
}

@Service
class ConstellationServiceImpl(
        private val constellationRepository: ConstellationRepository
) : ConstellationService {

    private var constPolygons: List<Pair<Polygon, Constellation>>? = null

    @Transactional
    override fun getConstellation(point: CosmicCoordinatesModel): ConstellationModel? {
        val geometryFactory = GeometryFactory()
        val geoPoint = geometryFactory.createPoint(Coordinate(point.ra.toDouble(), point.dec.toDouble()))
        return getConstellationPolygons().firstOrNull { geoPoint.within(it.first) }?.second?.toModel()
    }

    override fun getAll(): List<ConstellationModel> {
        return constellationRepository.findAll(Sort.by(Constellation::name.name)).map { it.toModel() }
    }

    private fun getConstellationPolygons(): List<Pair<Polygon, Constellation>> {
        if (constPolygons == null) {
            val allConsts = constellationRepository.findAllWithBounds()
            val geometryFactory = GeometryFactory()
            constPolygons = allConsts.asSequence().filter { it.bounds.size > 0 }.map {
                val coordinates = it.bounds.sortedBy { b -> b.orderNumber }.toMutableList().map { b -> Coordinate(b.coordinates.rightAscension.toDouble(), b.coordinates.declination.toDouble()) }.toMutableList()
                coordinates.add(Coordinate(coordinates[0]))
                Pair(geometryFactory.createPolygon((coordinates.toTypedArray())), it)
            }.toList()
        }
        return constPolygons!!
    }
}

@Service
class FilterBandServiceImpl(
        private val filterBandRepository: FilterBandRepository
) : FilterBandService {
    override fun getAll(): List<FilterBandModel> {
        return filterBandRepository.findAll(Sort.by(FilterBand::name.name)).asSequence().map { it.toModel() }.filter { f -> f != null }.map { it!! }.toList()
    }
}

@Service
class StarObserverServiceImpl(
        private val observerRepository: StarObserverRepository
) : StarObserverService {
    override fun getAll(): List<StarObserverModel> {
        return observerRepository.findAll(Sort.by(StarObserver::abbreviation.name)).toModels()
    }
}

@Service
class StarTypeServiceImpl(
        private val typeRepository: StarTypeRepository
) : StarTypeService {
    @PreAuthorize("hasRole('USER')")
    override fun validateType(type: String): Boolean {
        return StarTypeValidatorImpl(typeRepository.findAll().map { it.name }.toSet()).validate(type)
    }

    override fun getAll(): List<String> {
        return typeRepository.findAll().map { it.name }
    }
}

@Service
class StarAdditionalFileServiceImpl(
        private val fileRepository: StarAdditionalFileRepository
) : StarAdditionalFileService {
    // TODO: permissions
//    @PreAuthorize("hasRole('USER')")
    override fun getFile(id: String): StarAdditionalFileModel {
        return fileRepository.findById(id).map { it.toModel() }.orElseThrow { ServiceException("File not found") }
    }
}
