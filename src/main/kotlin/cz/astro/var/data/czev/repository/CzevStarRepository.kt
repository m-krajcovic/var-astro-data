package cz.astro.`var`.data.czev.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.*

interface CzevStarRepository : JpaRepository<CzevStar, Long>, JpaSpecificationExecutor<CzevStar> {
    @Query("SELECT DISTINCT s FROM CzevStar s LEFT JOIN FETCH s.constellation LEFT JOIN FETCH s.discoverers")
    fun findAllApproved(): List<CzevStar>

    @Query("SELECT DISTINCT s FROM CzevStar s LEFT JOIN FETCH s.constellation LEFT JOIN FETCH s.discoverers LEFT JOIN FETCH s.filterBand WHERE s.id = :id")
    fun findFetchedById(@Param("id") id: Long): Optional<CzevStar>
}

interface UserRepository: JpaRepository<User, Long> {
    fun findByEmail(email: String): Optional<User>
}

interface RoleRepository: JpaRepository<Role, Long> {
    fun findByName(name: String): Optional<Role>
}

interface ConstellationRepository : JpaRepository<Constellation, Long>
interface StarTypeRepository: JpaRepository<StarType, Long>
interface FilterBandRepository: JpaRepository<FilterBand, Long>
interface StarObserverRepository: JpaRepository<StarObserver, Long>
interface StarIdentificationRepository: JpaRepository<StarIdentification, Long>
interface CzevIdSequenceIdentifierRepository: JpaRepository<CzevIdSequenceIdentifier, Long>
//interface StarChangeLogRepository: JpaRepository<StarChangeLog, Long>
