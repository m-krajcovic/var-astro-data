package cz.astro.`var`.data.czev.repository

import org.springframework.data.jpa.repository.JpaRepository

interface CzevStarRepository : JpaRepository<CzevStar, Long>
interface ConstellationRepository : JpaRepository<Constellation, Long>
interface StarTypeRepository: JpaRepository<StarType, Long>
interface FilterBandRepository: JpaRepository<FilterBand, Long>
interface StarObserverRepository: JpaRepository<StarObserver, Long>
interface UserRepository: JpaRepository<User, Long>