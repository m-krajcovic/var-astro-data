package cz.astro.`var`.data.oc.repository.new

import cz.astro.`var`.data.czev.repository.CosmicCoordinates
import cz.astro.`var`.data.czev.repository.User
import java.math.BigDecimal
import java.time.LocalDateTime


data class Star(
        val id: Long,
        val name: String,
        val constellation: Constellation,
        val coordinates: CosmicCoordinates,
        val comp: String,
        val type: String,
        val lastChange: LocalDateTime,
        val minimas: MutableList<StarMinima>,
        val brightness: MutableList<StarBrightness>,
        val elements: MutableList<StarElement>
)

data class Constellation(
        val id: Long,
        val name: String
)

data class StarPublication(
        val id: Long,
        val name: String,
        val link: String
)

data class StarMinima(
        val id: Long,
        val batch: OCImportBatch,
        val julianDate: BigDecimal,
        val method: ObservationMethod,
        val kind: ObservationKind,
        val publications: MutableList<StarPublication>
)

data class StarBrightness(
        val id: Long,
        val minS: Double,
        val maxP: Double,
        val minP: Double,
        val filter: ObservationFilter
)
data class StarElement(
        val id: Long,
        val period: BigDecimal,
        val minimum: BigDecimal,
        val kind: ObservationKind
)

data class OCImportBatch(
        val id: Long,
        val createdOn: LocalDateTime,
        val createdBy: User
)


data class ObservationKind(
        val id: Long,
        val name: String
)

data class ObservationMethod(
        val id: Long,
        val name: String
)

data class ObservationFilter(
        val id: Long,
        val name: String
)
