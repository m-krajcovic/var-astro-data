package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.controller.CzevCatalogFilter
import cz.astro.`var`.data.czev.repository.*
import org.springframework.data.jpa.domain.Specification
import java.math.BigDecimal
import java.util.*
import javax.persistence.criteria.*

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
