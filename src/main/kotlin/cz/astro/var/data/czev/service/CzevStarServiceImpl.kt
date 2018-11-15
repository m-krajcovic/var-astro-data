package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.controller.CzevCatalogFilter
import cz.astro.`var`.data.czev.cosmicDistance
import cz.astro.`var`.data.czev.repository.*
import org.springframework.data.jpa.domain.Specification
import org.springframework.security.access.prepost.PreAuthorize
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
    @PreAuthorize("hasRole('USER')")
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

    @PreAuthorize("hasRole('USER')")
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
    override fun getAllForList(filter: CzevCatalogFilter): List<CzevStarListModel> {
        return czevStarRepository.findAll(CzevStarFilterSpec(filter)).asSequence().map { it.toListModel() }.toList()
    }
}

class CzevStarFilterSpec(val spec: CzevCatalogFilter) : Specification<CzevStar> {
    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
        val predicates = ArrayList<Predicate>()
        root.fetch<CzevStar, Constellation>(CzevStar::constellation.name, JoinType.LEFT)
        root.fetch<CzevStar, StarObserver>(CzevStar::discoverers.name, JoinType.LEFT) as Join<*, *>
        root.fetch<CzevStar, StarIdentification>(CzevStar::crossIdentifications.name, JoinType.LEFT)
        root.fetch<CzevStar, FilterBand>(CzevStar::filterBand.name, JoinType.LEFT)
        query.distinct(true)
        query.orderBy(criteriaBuilder.asc(root.get<Long>(CzevStar::czevId.name)))
        spec.apply {
            predicates.addAll(between(criteriaBuilder, czevIdFrom, czevIdTo, root[CzevStar::czevId.name]))
            predicates.addAll(between(criteriaBuilder, yearFrom, yearTo, root[CzevStar::year.name]))
            predicates.addAll(between(criteriaBuilder, amplitudeFrom, amplitudeTo, root[CzevStar::amplitude.name]))

            type.ifPresent {
                predicates.add(criteriaBuilder.like(root.get<String>(CzevStar::type.name), it))
            }
            constellation.ifPresent {
                predicates.add(criteriaBuilder.equal(root.get<Constellation>(CzevStar::constellation.name).get<Long>(Constellation::id.name), it))
            }
            filterBand.ifPresent {
                if (it == -1L) {
                    predicates.add(criteriaBuilder.isNull(root.get<FilterBand>(CzevStar::filterBand.name)))
                } else {
                    predicates.add(criteriaBuilder.equal(root.get<FilterBand>(CzevStar::filterBand.name).get<Long>(FilterBand::id.name), it))
                }
            }
            discoverer.ifPresent {
                val subQuery: Subquery<Long> = query.subquery(Long::class.java)
                val subEntity = subQuery.from(CzevStar::class.java)
                val subJoin = subEntity.join<CzevStar, StarObserver>(CzevStar::discoverers.name)

                subQuery.select(criteriaBuilder.literal(1)).where(
                        criteriaBuilder.and(
                                criteriaBuilder.equal(root.get<Long>(CzevStar::czevId.name), subEntity.get<Long>(CzevStar::czevId.name)),
                                criteriaBuilder.equal(subJoin.get<Long>(StarObserver::id.name), it))
                )

                predicates.add(criteriaBuilder.exists(subQuery))
            }

            if (ra.isPresent && dec.isPresent) {
                val raMin = ra.get() - radius.toBigDecimal()
                val raMax = ra.get() + radius.toBigDecimal()
                val decMin = dec.get() - radius.toBigDecimal()
                val decMax = dec.get() + radius.toBigDecimal()
                predicates.add(criteriaBuilder.between(root.get<CosmicCoordinates>(CzevStar::coordinates.name).get<BigDecimal>(CosmicCoordinates::rightAscension.name), raMin, raMax))
                predicates.add(criteriaBuilder.between(root.get<CosmicCoordinates>(CzevStar::coordinates.name).get<BigDecimal>(CosmicCoordinates::declination.name), decMin, decMax))
            }
        }
        return criteriaBuilder.and(*predicates.toTypedArray())
    }

    private fun <T : Number> between(criteriaBuilder: CriteriaBuilder, from: Optional<T>, to: Optional<T>, attribute: Expression<out T>): List<Predicate> {
        val predicates = arrayListOf<Predicate>()
        from.ifPresent {
            predicates.add(criteriaBuilder.ge(attribute, it))
        }
        to.ifPresent {
            predicates.add(criteriaBuilder.le(attribute, it))
        }
        return predicates
    }
}
