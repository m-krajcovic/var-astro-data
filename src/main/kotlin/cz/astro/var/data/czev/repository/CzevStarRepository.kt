package cz.astro.`var`.data.czev.repository

import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.math.BigDecimal
import java.util.*

interface CzevStarRepository : JpaRepository<CzevStar, Long>, JpaSpecificationExecutor<CzevStar> {
}
interface ConstellationRepository : JpaRepository<Constellation, Long>
interface StarTypeRepository: JpaRepository<StarType, Long>
interface FilterBandRepository: JpaRepository<FilterBand, Long>
interface StarObserverRepository: JpaRepository<StarObserver, Long>
interface UserRepository: JpaRepository<User, Long> {
    fun findByEmail(email: String): Optional<User>
}
interface StarIdentificationRepository: JpaRepository<StarIdentification, Long>

fun isApproved(): Specification<CzevStar> =
        Specification { root, query, criteriaBuilder -> criteriaBuilder.isTrue(root["approved"]) }

fun hasCzevId(id: Long): Specification<CzevStar> =
        Specification { root, query, criteriaBuilder -> criteriaBuilder.equal(root.get<BigDecimal>("czevId"), id) }
