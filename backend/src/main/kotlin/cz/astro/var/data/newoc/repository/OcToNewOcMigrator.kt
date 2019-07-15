package cz.astro.`var`.data.newoc.repository

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.oc.repository.StarRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDateTime
import javax.transaction.Transactional


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
        private val publicationsRepository: MinimaPublicationsRepository,
        private val volumeRepository: MinimaPublicationVolumeRepository,
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

        // SOC, BULLETIN
        // S2, BUL2
        // OBSERVER
        // INSTRUMENT
        val socMapper = HashMap<String, String>()
        socMapper["A"] = "AAVSO"
        socMapper["B"] = "BBSAG"
        socMapper["C"] = "BRNO"
        socMapper["D"] = "BAV"
        socMapper["E"] = "OEJV"
        socMapper["F"] = "AFOEV"
        socMapper["G"] = "GEOS"
        socMapper["H"] = "AKV (Hartha)"
        socMapper["I"] = "IBVS"
        socMapper["J"] = "VSOLJ"
        socMapper["K"] = "Krakow"
        socMapper["M"] = "MVS"
        socMapper["N"] = "Astronom. Nachrichten"
        socMapper["O"] = "Astronom. Cirkular"
        socMapper["P"] = "Peremennye Zvezdy"
        socMapper["R"] = "BAAVSS"
        socMapper["V"] = "VSS Sonneberg"
        socMapper["W"] = "VSOLJ by email"

        val user = userRepository.findAll().first()
        val constellationsByName = constellationRepository.findAll().associateBy { it.abbreviation.toUpperCase() }
        val filtersByName = filterBandRepository.findAll().associateBy { it.name.toUpperCase() }.toMutableMap()
        val kindsByName = observationKindRepository.findAll().associateBy { it.name.toUpperCase() }.toMutableMap()
        val methodsByName = observationMethodRepository.findAll().associateBy { it.name.toUpperCase() }.toMutableMap()
        val publicationsByName = publicationsRepository.findAll().associateBy { it.name }.toMutableMap()

        val ogStars = starRepository.findStarsFetched()
//        val newStars = mutableListOf<Star>()
        val seen = mutableSetOf<String>()
        var batch = MinimaImportBatch(LocalDateTime.now(), user)
        batch = minimaBatchRepository.save(batch)
        for (ogStar in ogStars) {
            val key = ogStar.starId.toString() + "#" + ogStar.constellationId.toString()
            if (!seen.contains(key)) {
                val const = constellationsByName[ogStar.constellation.toUpperCase()]
                if (const != null) {
                    var star = Star(ogStar.starName, const, CosmicCoordinates(ogStar.coordinates.raValue(), ogStar.coordinates.decValue()),
                            if (ogStar.comp == ".") null else ogStar.comp, ogStar.type, null,
                            ogStar.brightness.map {
                                StarBrightness(it.minS, it.maxP, it.minP, getFilter(it.col, filtersByName))
                            }.toMutableSet(), mutableSetOf()
                    )
                    star.brightness.forEach {
                        it.star = star
                    }
//                    newStars.add(star)
                    seen.add(key)

                    star.elements = ogStar.elements.map {
                        StarElement(it.period, prepend24(it.minimum0), getKind(it.kind, kindsByName), mutableSetOf())
                    }.toMutableSet()

                    star.elements.forEach {
                        it.star = star
                    }

                    star = starsRepository.save(star)

                    star.elements.forEach {
                        val newMinimas = ogStar.minima.filter { m -> m.kind.toUpperCase() == it.kind.name.toUpperCase() }
                                .map { m -> StarMinima(batch, (m.julianDatePrefix.toString() + m.julianDate.toString()).toBigDecimal(), getMethod(m.color, methodsByName), getPublicationEntries(socMapper, publicationsByName, m), m.observer, m.instrument) }.toMutableSet()
                        newMinimas.forEach { m ->
                            m.publicationEntries.forEach { pe ->
                                pe.minima = m
                            }
                            m.element = it
                        }
                        it.minimas.addAll(newMinimas)
                    }

                }
            } else {
                println(ogStar.constellation)
            }
        }
    }

    private fun getPublicationEntries(socMapper: Map<String, String>, publications: MutableMap<String, MinimaPublication>, minima: cz.astro.`var`.data.oc.repository.StarMinima): MutableSet<MinimaPublicationEntry> {
        val result = HashSet<MinimaPublicationEntry>()
        getPublicationEntry(minima.soc, minima.bulletin, socMapper, publications)?.let {
            result.add(it)
        }
        getPublicationEntry(minima.soc2, minima.bulletin2, socMapper, publications)?.let {
            result.add(it)
        }
        // todo get publication from REMARK
        return result
    }

    private fun getPublicationEntry(pubShortName: String, volName: String, socMapper: Map<String, String>, publications: MutableMap<String, MinimaPublication>): MinimaPublicationEntry? {
        if (!pubShortName.isBlank() && !volName.isBlank()) {
            val pubName = socMapper[pubShortName]
            if (pubName != null) {
                if (!publications.containsKey(pubName)) {
                    val m = publicationsRepository.save(MinimaPublication(pubName, "", mutableSetOf()))
                    publications[pubName] = m
                }
                val pub = publications[pubName]
                var vol = pub!!.volumes.firstOrNull { it.name == volName }
                if (vol == null) {
                    vol = MinimaPublicationVolume(volName, null, null, mutableSetOf())
                    vol.publication = pub
                    vol = volumeRepository.save(vol)
                    pub.volumes.add(vol)
                }
                return MinimaPublicationEntry(vol!!, "")
            }
        }
        return null
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

    fun prepend24(value: BigDecimal): BigDecimal {
        return value + BigDecimal("2400000")
    }
}
