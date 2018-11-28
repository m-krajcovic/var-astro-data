package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.controller.CzevCatalogFilter
import cz.astro.`var`.data.czev.cosmicDistance
import cz.astro.`var`.data.czev.repository.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
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
        private val starIdentificationRepository: StarIdentificationRepository,
        private val typeRepository: StarTypeRepository
) : CzevStarService {
    @PreAuthorize("hasRole('USER')")
    override fun update(model: CzevStarUpdateModel): CzevStarDetailsModel {
        val updatedEntity = czevStarRepository.findById(model.czevId).orElseThrow { ServiceException("Star not found") }
        val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { type -> type.name }.toSet())

        updatedEntity.apply {

            val observers = observerRepository.findAllById(model.discoverers).toMutableSet()
            if (observers.size == 0 || observers.size != model.discoverers.size) {
                throw ServiceException("Some of discoverers don't exist")
            }
            val newConstellation = constellationRepository.findById(model.constellation).orElseThrow { ServiceException("Constellation does not exist") }
            val newFilterBand = model.filterBand?.let { filterBandRepository.findById(it).orElseThrow { ServiceException("Filter band does not exist") } }

            val newIds = model.crossIdentifications.toMutableSet()
            newIds.removeIf { crossIdentifications.contains(StarIdentification(it, null, 0)) }
            if (starIdentificationRepository.existsByNameIn(newIds)) {
                throw ServiceException("Star with same cross-id already exists")
            }

            crossIdentifications.clear()
            crossIdentifications.addAll(model.crossIdentifications.mapIndexed {i, it -> StarIdentification(it, null, i)}.toMutableSet())
            crossIdentifications.forEach { it.star = this }

            typeValid = typeValidator.validate(model.type)
            if (!typeValid) {
                type = typeValidator.tryFixCase(type)
            }
            publicNote = model.publicNote
            amplitude = model.amplitude
            m0 = model.m0
            period = model.period
            jmagnitude = model.jmagnitude
            kmagnitude = model.kmagnitude
            vmagnitude = model.vmagnitude
            constellation = newConstellation
            filterBand = newFilterBand
            year = model.year
            discoverers = observers
            coordinates = CosmicCoordinates(model.coordinates.ra, model.coordinates.dec)
            // TODO allow vsx change
//            vsxId = model.vsxId
//            vsxName = model.vsxName
        }
        return czevStarRepository.save(updatedEntity).toDetailsModel()
    }

    override fun getByIdentification(identification: String): Optional<CzevStarListModel> {
        return Optional.ofNullable(czevStarRepository.findByStarIdentificationPartlyFetched(identification.trim()).firstOrNull()?.toListModel())
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
    override fun getAllForList(filter: CzevCatalogFilter, page: Pageable): Page<CzevStarListModel> {
        return czevStarRepository.findAll(CzevStarFilterSpec(filter), page).map { it.toListModel() }
    }
}

class CzevStarFilterSpec(val spec: CzevCatalogFilter) : Specification<CzevStar> {
    override fun toPredicate(root: Root<CzevStar>, query: CriteriaQuery<*>, criteriaBuilder: CriteriaBuilder): Predicate? {
        val predicates = ArrayList<Predicate>()

        val clazz = query.resultType
        if (clazz == Long::class.java || clazz == Long::class.javaPrimitiveType || clazz == Long::class.javaObjectType) {
        } else {
            root.fetch<CzevStar, Constellation>(CzevStar::constellation.name, JoinType.LEFT)
            root.fetch<CzevStar, StarObserver>(CzevStar::discoverers.name, JoinType.LEFT) as Join<*, *>
            root.fetch<CzevStar, StarIdentification>(CzevStar::crossIdentifications.name, JoinType.LEFT)
            root.fetch<CzevStar, FilterBand>(CzevStar::filterBand.name, JoinType.LEFT)
        }

        query.distinct(true)
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
        if (predicates.isNotEmpty()) {
            return criteriaBuilder.and(*predicates.toTypedArray())
        }
        return null
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
