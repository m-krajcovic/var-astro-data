package cz.astro.`var`.data.newoc.repository

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.oc.controller.prepend24
import cz.astro.`var`.data.oc.repository.StarRepository
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import javax.transaction.Transactional

interface StarsRepository : JpaRepository<Star, Long> {
    @Query("select distinct s from Star s LEFT JOIN FETCH s.constellation")
    fun findAllPartlyFetched(): List<Star>
}

interface StarElementRepository : JpaRepository<StarElement, Long>
interface StarBrightnessRepository : JpaRepository<StarBrightness, Long>
interface PublicationsRepository : JpaRepository<MinimaPublication, Long>
interface MinimaRepository : JpaRepository<StarMinima, Long>
interface ObservationMethodRepository : JpaRepository<ObservationMethod, Long>
interface ObservationKindRepository : JpaRepository<ObservationKind, Long>
interface MinimaBatchRepository : JpaRepository<MinimaImportBatch, Long>
interface MinimaPublicationVolumeRepository : JpaRepository<MinimaPublicationVolume, Long>

interface OcMigrator {
    fun migrate()
}

@Service
class OcToNewOcMigrator(
        private val starsRepository: StarsRepository,
        private val constellationRepository: ConstellationRepository,
        private val observationKindRepository: ObservationKindRepository,
        private val observationMethodRepository: ObservationMethodRepository,
        private val starElementRepository: StarElementRepository,
        private val filterBandRepository: FilterBandRepository,
        private val publicationsRepository: PublicationsRepository,
        private val minimaRepository: MinimaRepository,
        private val minimaBatchRepository: MinimaBatchRepository,
        private val starBrightnessRepository: StarBrightnessRepository,
        private val userRepository: UserRepository,


        private val starRepository: StarRepository


) : OcMigrator {

    @Transactional
    override fun migrate() {
        // 1st stage = MIGRATE STARS, BRIGHT, ELEMENTS
        // 2nd stage = MIGRATE MINIMAS
        // 3rd stage = MIGRATE PUBLICATIONS

        val user = userRepository.findAll().first()
        val constellationsByName = constellationRepository.findAll().toMap { it.abbreviation.toUpperCase() }
        val filtersByName = filterBandRepository.findAll().toMap { it.name.toUpperCase() }.toMutableMap()
        val kindsByName = observationKindRepository.findAll().toMap { it.name.toUpperCase() }.toMutableMap()
        val methodsByName = observationMethodRepository.findAll().toMap { it.name.toUpperCase() }.toMutableMap()

        val ogStars = starRepository.findStarsFetched()
        val newStars = mutableListOf<Star>()
        val seen = mutableSetOf<String>()
        var batch = MinimaImportBatch(LocalDateTime.now(), user)
        batch = minimaBatchRepository.save(batch)
        for (ogStar in ogStars.take(100)) {
            val key = ogStar.starId.toString() + "#" + ogStar.constellationId.toString()
            if (!seen.contains(key)) {
                val const = constellationsByName[ogStar.constellation.toUpperCase()]
                if (const != null) {
                    val star = Star(ogStar.starName, const, CosmicCoordinates(ogStar.coordinates.raValue(), ogStar.coordinates.decValue()),
                            if (ogStar.comp == ".") null else ogStar.comp, ogStar.type, null,
                            ogStar.brightness.map {
                                StarBrightness(it.minS, it.maxP, it.minP, getFilter(it.col, filtersByName))
                            }.toMutableSet(),
                            ogStar.elements.map {
                                val el = StarElement(it.period, prepend24(it.minimum0), getKind(it.kind, kindsByName),
                                        ogStar.minima.filter { m -> m.kind.toUpperCase() == it.kind.toUpperCase() }
                                                .map { m -> StarMinima(batch, (m.julianDatePrefix.toString() + m.julianDate.toString()).toBigDecimal(), getMethod(m.color, methodsByName), mutableSetOf()) }.toMutableSet())
                                el.minimas.forEach { m ->
                                    m.element = el
                                }
                                el
                            }.toMutableSet()
                    )
                    star.elements.forEach {
                        it.star = star
                    }
                    star.brightness.forEach {
                        it.star = star
                    }
                    newStars.add(star)
                    seen.add(key)
                }
            } else {
                println(ogStar.constellation)
            }
        }
        println(newStars.size)
        starsRepository.saveAll(newStars)
    }

    private fun getMethodValue(name: String): String {
        if (name == "pg") {
            return "Photographic"
        } else if (name == "vis") {
            return "Visual"
        }
        return "CCD/Photoelectric"
    }

    private fun getMethod(name: String, methods: MutableMap<String, ObservationMethod>): ObservationMethod {
        val value = getMethodValue(name)
        if (methods.containsKey(value)) {
            return methods[value]!!
        }
        val m = observationMethodRepository.save(ObservationMethod(value))
        methods[value] = m
        return m
    }

    fun getKind(name: String, kinds: MutableMap<String, ObservationKind>): ObservationKind {
        if (kinds.containsKey(name.toUpperCase())) {
            return kinds[name.toUpperCase()]!!
        }
        val kind = observationKindRepository.save(ObservationKind(name.toUpperCase()))
        kinds[name.toUpperCase()] = kind
        return kind
    }

    fun getFilter(name: String, filters: MutableMap<String, FilterBand>): FilterBand {
        if (filters.containsKey(name.toUpperCase())) {
            return filters[name.toUpperCase()]!!
        }
        val filterBand = filterBandRepository.save(FilterBand(name.toUpperCase()))
        filters[name.toUpperCase()] = filterBand
        return filterBand
    }
}

fun main(args: Array<String>) {
    val list = ArrayList<String>()
    val list2 = ArrayList<String>()
    println(list.toMutableSet() === list.toMutableSet())
    println(list.toMutableSet() === list2.toMutableSet())
    println(list.toMutableSet() === mutableSetOf<String>())
    println(list.toMutableSet() === HashSet<String>())
}
