package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.controller.CzevCatalogFilter
import cz.astro.`var`.data.czev.repository.*
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.*
import javax.persistence.criteria.*

@Service
@Transactional
class CzevStarServiceImpl(
        private val czevStarRepository: CzevStarRepository,
        private val observerRepository: StarObserverRepository,
        private val constellationRepository: ConstellationRepository,
        private val filterBandRepository: FilterBandRepository,
        private val starIdentificationRepository: StarIdentificationRepository
) : CzevStarService {
    override fun update(model: CzevStarUpdateModel): CzevStarDetailsModel {
        val updatedEntity = czevStarRepository.getOne(model.czevId)
        updatedEntity.apply {

            val observers = observerRepository.findAllById(discoverers.map { it.id }).toMutableSet()
            if (observers.size == 0 || observers.size != discoverers.size) {
                throw ServiceException("Some of discoverers don't exist")
            }
            val newConstellation = constellationRepository.findById(constellation.id).orElseThrow { ServiceException("Constellation does not exist") }
            val newFilterBand = filterBand?.let { filterBandRepository.findById(it.id).orElseThrow { ServiceException("Filter band does not exist") } }


            val newIds = crossIdentifications.intersectIds(model.crossIdentifications)

            if (starIdentificationRepository.existsByNameIn(newIds)) {
                throw ServiceException("Star with same cross-id already exists")
            }

            type = model.type
            publicNote = model.publicNote
            amplitude = model.amplitude
            m0 = model.m0
            period = model.period
            jMagnitude = model.jMagnitude
            jkMagnitude = model.jkMagnitude
            vMagnitude = model.vMagnitude
            constellation = newConstellation
            filterBand = newFilterBand
            year = model.year
            discoverers = observers
            coordinates = CosmicCoordinates(model.coordinates.ra, model.coordinates.dec)
            vsxId = model.vsxId
            vsxName = model.vsxName
        }
        return czevStarRepository.save(updatedEntity).toDetailsModel()
    }

    override fun getByIdentification(identification: String): Optional<CzevStarListModel> {
        return czevStarRepository.findByStarIdentificationPartlyFetched(identification.trim()).map { it.toListModel() }
    }

    override fun getAllForExport(filter: CzevCatalogFilter): List<CzevStarExportModel> {
        return czevStarRepository.findAll(CzevStarFilterSpec(filter)).asSequence().map { it.toExportModel() }.toList()
    }

    override fun getByCoordinatesForList(coordinates: CosmicCoordinatesModel, radius: BigDecimal): List<DistanceModel<CzevStarListModel>> {
        return czevStarRepository.findAllByCoordinatesPartlyFetched(
                coordinates.ra - radius,
                coordinates.ra + radius,
                coordinates.dec - radius,
                coordinates.dec + radius
        ).asSequence().map { DistanceModel(cosmicDistance(coordinates.ra.toDouble(), coordinates.dec.toDouble(), it.coordinates.rightAscension.toDouble(), it.coordinates.declination.toDouble()), it.toListModel()) }.toList()
    }

    @Transactional(readOnly = true)
    override fun getStarDetails(id: Long): Optional<CzevStarDetailsModel> {
        return czevStarRepository.findByIdFetched(id).map {
            it.toDetailsModel()
        }
    }

    @Transactional(readOnly = true)
    override fun getAllForList(): List<CzevStarListModel> {
        return czevStarRepository.findAllPartlyFetched().asSequence().map { it.toListModel() }.toList()
    }
}

fun cosmicDistance(ra1: Double, dec1: Double, ra2: Double, dec2: Double): Double {
    val ra1Rads = Math.toRadians(ra1)
    val ra2Rads = Math.toRadians(ra2)
    val dec1Rads = Math.toRadians(dec1)
    val dec2Rads = Math.toRadians(dec2)
    return Math.toDegrees(Math.acos(Math.sin(dec1Rads) * Math.sin(dec2Rads) + Math.cos(dec1Rads) * Math.cos(dec2Rads) * Math.cos(ra1Rads - ra2Rads)))
}

class CzevStarFilterSpec(val spec: CzevCatalogFilter): Specification<CzevStar> {
    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
        val clazz = query.resultType
        if (clazz == Long::class.java || clazz == Long::class.javaPrimitiveType)
            return null

        val predicates = ArrayList<Predicate>()
        root.fetch<CzevStar, Constellation>(CzevStar::constellation.name, JoinType.LEFT)
        root.fetch<CzevStar, StarObserver>(CzevStar::discoverers.name, JoinType.LEFT)
        root.fetch<CzevStar, StarIdentification>(CzevStar::crossIdentifications.name, JoinType.LEFT)
        root.fetch<CzevStar, FilterBand>(CzevStar::filterBand.name, JoinType.LEFT)
        val discovererJoin = root.join<CzevStar, StarObserver>(CzevStar::discoverers.name, JoinType.LEFT)
        query.distinct(true)
        query.orderBy(criteriaBuilder.asc(root.get<Long>(CzevStar::czevId.name)))
        spec.apply {
            czevIdFrom.ifPresent {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root[CzevStar::czevId.name], it))
            }
            czevIdTo.ifPresent {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root[CzevStar::czevId.name], it))
            }
            type.ifPresent {
                predicates.add(criteriaBuilder.like(root.get<String>(CzevStar::type.name), it))
            }
            yearFrom.ifPresent {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root[CzevStar::year.name], it))
            }
            yearTo.ifPresent {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root[CzevStar::year.name], it))
            }
            amplitudeFrom.ifPresent {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root[CzevStar::amplitude.name], it))
            }
            amplitudeTo.ifPresent {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root[CzevStar::amplitude.name], it))
            }
            constellation.ifPresent {
                predicates.add(criteriaBuilder.equal(root.get<Constellation>(CzevStar::constellation.name).get<Long>(Constellation::id.name), it))
            }
            filterBand.ifPresent {
                predicates.add(criteriaBuilder.equal(root.get<FilterBand>(CzevStar::filterBand.name).get<Long>(FilterBand::id.name), it))
            }
            discoverer.ifPresent {
                predicates.add(criteriaBuilder.equal(discovererJoin.get<Long>(StarObserver::id.name), it))
            }
        }
        return criteriaBuilder.and(*predicates.toTypedArray())
    }
}

//
//class CzevStarWithIdFrom(val from: Long): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        return criteriaBuilder.greaterThanOrEqualTo(root["czevId"], from)
//    }
//}
//
//class CzevStarWithIdTo(val to: Long): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        return criteriaBuilder.lessThanOrEqualTo(root["czevId"], to)
//    }
//}
//
//class CzevStarWithConstellationId(val constellationId: Long): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        val join = root.join<CzevStar, Constellation>("constellation")
//        return criteriaBuilder.equal(join.get<Long>("id"), constellationId)
//    }
//}
//
//class CzevStarWithTypeLike(val type: String): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        return criteriaBuilder.like(root.get<String>("type"), type)
//    }
//}
//
//class CzevStarWithAmplitudeFrom(val from: Double): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        return criteriaBuilder.greaterThanOrEqualTo(root["amplitude"], from)
//    }
//}
//
//class CzevStarWithAmplitudeTo(val to: Double): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        return criteriaBuilder.lessThanOrEqualTo(root["amplitude"], to)
//    }
//}
//
//class CzevStarWithYearFrom(val from: Int): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        return criteriaBuilder.greaterThanOrEqualTo(root["year"], from)
//    }
//}
//
//class CzevStarWithYearTo(val to: Int): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        return criteriaBuilder.lessThanOrEqualTo(root["year"], to)
//    }
//}
//
//class CzevStarWithDiscoverer(val discovererId: Long): Specification<CzevStar> {
//    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
//        val join = root.join<CzevStar, StarObserver>("discoverers")
//        return criteriaBuilder.equal(join.get<Long>("id"), discovererId)
//    }
//}
//
