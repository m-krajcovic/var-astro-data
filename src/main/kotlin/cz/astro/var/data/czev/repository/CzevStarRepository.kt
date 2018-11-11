package cz.astro.`var`.data.czev.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.math.BigDecimal
import java.util.*

interface CzevStarRepository : JpaRepository<CzevStar, Long>, JpaSpecificationExecutor<CzevStar> {
    @Query("SELECT DISTINCT s FROM CzevStar s LEFT JOIN FETCH s.constellation LEFT JOIN FETCH s.discoverers")
    fun findAllPartlyFetched(): List<CzevStar>

    @Query("SELECT DISTINCT s FROM CzevStar s LEFT JOIN FETCH s.constellation LEFT JOIN FETCH s.discoverers LEFT JOIN FETCH s.filterBand LEFT JOIN FETCH s.crossIdentifications WHERE s.czevId = :id")
    fun findByIdFetched(@Param("id") id: Long): Optional<CzevStar>

    @Query("SELECT DISTINCT s FROM CzevStar s LEFT JOIN FETCH s.constellation LEFT JOIN FETCH s.discoverers WHERE s.coordinates.rightAscension >= :raMin AND s.coordinates.rightAscension <= :raMax AND s.coordinates.declination >= :decMin AND s.coordinates.declination <= :decMax")
    fun findAllByCoordinatesPartlyFetched(
            @Param("raMin") raMin: BigDecimal,
            @Param("raMax") raMax: BigDecimal,
            @Param("decMin") decMin: BigDecimal,
            @Param("decMax") decMax: BigDecimal
    ): List<CzevStar>

    @Query("SELECT DISTINCT s FROM CzevStar s LEFT JOIN FETCH s.constellation LEFT JOIN FETCH s.filterBand LEFT JOIN FETCH s.crossIdentifications LEFT JOIN FETCH s.discoverers")
    fun findAllFetched(): List<CzevStar>
}

interface UserRepository: JpaRepository<User, Long> {
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean
}

interface RoleRepository: JpaRepository<Role, Long> {
    fun findByName(name: String): Optional<Role>
}

interface CzevStarDraftRepository : JpaRepository<CzevStarDraft, Long> {
    fun findByCreatedBy(user: User): List<CzevStarDraft>
}

interface ConstellationRepository : JpaRepository<Constellation, Long>
interface StarTypeRepository: JpaRepository<StarType, Long>
interface FilterBandRepository: JpaRepository<FilterBand, Long>
interface StarObserverRepository: JpaRepository<StarObserver, Long>
interface StarIdentificationRepository: JpaRepository<StarIdentification, Long>
