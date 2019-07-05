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

    @Query("SELECT DISTINCT s FROM CzevStar s LEFT JOIN FETCH s.constellation LEFT JOIN FETCH s.discoverers LEFT JOIN FETCH s.crossIdentifications i WHERE UPPER(i.name) LIKE UPPER(:identification)")
    fun findByStarIdentificationPartlyFetched(@Param("identification") identification: String): List<CzevStar>
}

interface UserRepository: JpaRepository<User, Long> {
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
    fun findByIdFetched(@Param("id") id: Long): Optional<User>
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    fun findByEmailFetched(@Param("email") email: String): Optional<User>

    fun existsByEmail(email: String): Boolean
}

interface RoleRepository: JpaRepository<Role, Long> {
    fun findByName(name: String): Optional<Role>
}

interface CzevStarDraftRepository : JpaRepository<CzevStarDraft, Long> {
    @Query("SELECT DISTINCT d FROM CzevStarDraft d LEFT JOIN FETCH d.constellation LEFT JOIN FETCH d.crossIdentifications LEFT JOIN FETCH d.discoverers LEFT JOIN FETCH d.filterBand WHERE d.createdBy = :user")
    fun findForUserFetched(@Param("user") user: User): List<CzevStarDraft>
    @Query("SELECT DISTINCT d FROM CzevStarDraft d LEFT JOIN FETCH d.constellation LEFT JOIN FETCH d.crossIdentifications LEFT JOIN FETCH d.discoverers LEFT JOIN FETCH d.filterBand")
    fun findAllFetched(): List<CzevStarDraft>
    @Query("SELECT DISTINCT d FROM CzevStarDraft d LEFT JOIN FETCH d.constellation LEFT JOIN FETCH d.crossIdentifications LEFT JOIN FETCH d.discoverers LEFT JOIN FETCH d.filterBand WHERE d.id = :id")
    fun findByIdFetched(@Param("id") id: Long): Optional<CzevStarDraft>
}

interface StarObserverRepository: JpaRepository<StarObserver, Long> {

    fun findByAbbreviationIn(abbreviations: Collection<String>): List<StarObserver>
}

interface StarIdentificationRepository: JpaRepository<StarIdentification, Long> {
    fun existsByNameIn(@Param("names") names: Collection<String>): Boolean
}

interface ConstellationRepository : JpaRepository<Constellation, Long> {
    @Query("SELECT DISTINCT c FROM Constellation c LEFT JOIN FETCH c.bounds")
    fun findAllWithBounds(): List<Constellation>

    @Query("select cs FROM ConstellationSummary cs LEFT JOIN FETCH cs.constellation")
    fun findAllWithOcStarCounts(): List<ConstellationSummary>

}
interface StarTypeRepository: JpaRepository<StarType, Long>
interface FilterBandRepository: JpaRepository<FilterBand, Long>
interface StarAdditionalFileRepository: JpaRepository<StarAdditionalFile, String>
