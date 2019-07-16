package cz.astro.`var`.data.newoc.repository

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.math.BigDecimal
import java.util.*

interface StarsRepository : JpaRepository<Star, Long> {
    @Query("select distinct s from Star s LEFT JOIN FETCH s.constellation")
    fun findAllPartlyFetched(): List<Star>

    @Query("select distinct s from Star s left join fetch s.constellation c where c.id = :constellationId")
    fun findAllByConstellationId(constellationId: Long): List<Star>

    @Query("SELECT DISTINCT s FROM Star s LEFT JOIN FETCH s.constellation LEFT JOIN FETCH s.brightness b LEFT JOIN FETCH b.filter LEFT JOIN FETCH s.elements e LEFT JOIN FETCH e.kind LEFT JOIN FETCH e.minimas m LEFT JOIN FETCH m.publicationEntries pe LEFT JOIN FETCH m.batch LEFT JOIN FETCH m.method LEFT JOIN FETCH pe.volume v LEFT JOIN FETCH v.publication WHERE s.id = :id")
    fun findByIdFetched(id: Long): Optional<Star>

    @Query("select distinct s from Star s LEFT JOIN FETCH s.elements e LEFT JOIN FETCH e.kind LEFT JOIN FETCH s.brightness b LEFT JOIN FETCH b.filter LEFT JOIN FETCH s.constellation")
    fun findAllFetchedForPredictions(): List<Star>



    @EntityGraph(attributePaths = ["constellation", "elements", "brightness", "elements.kind", "brightness.filter", "elements.minimas", "elements.minimas.batch", "elements.minimas.method", "elements.minimas.publicationEntries", "elements.minimas.publicationEntries.volume", "elements.minimas.publicationEntries.volume.publication"])
    fun readById(id: Long): Optional<Star>
}

interface StarElementRepository : JpaRepository<StarElement, Long> {
    @Query("select e from ElementMinimaCount e")
    fun findAllElementMinimaCountsSince(jd: BigDecimal): List<ElementMinimaCount>

    @EntityGraph(attributePaths = ["kind", "minimas", "minimas.method", "minimas.publicationEntries", "minimas.batch", "minimas.publicationEntries.volume", "minimas.publicationEntries.volume.publication"])
    fun readById(id: Long): Optional<StarElement>
}
interface StarBrightnessRepository : JpaRepository<StarBrightness, Long>
interface MinimaPublicationsRepository : JpaRepository<MinimaPublication, Long>
interface MinimaRepository : JpaRepository<StarMinima, Long>
interface ObservationMethodRepository : JpaRepository<ObservationMethod, Long>
interface ObservationKindRepository : JpaRepository<ObservationKind, Long>
interface MinimaBatchRepository : JpaRepository<MinimaImportBatch, Long>
interface MinimaPublicationVolumeRepository : JpaRepository<MinimaPublicationVolume, Long>
