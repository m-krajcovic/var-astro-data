package cz.astro.`var`.data.newoc.repository

import cz.astro.`var`.data.czev.repository.*
import java.math.BigDecimal
import java.time.LocalDateTime
import javax.persistence.*


// TODO: unique field combinations (name + constellation), (coordinates)

@Entity
@Table(name = "oc_Star")
class Star(
        var name: String,
        @ManyToOne
        var constellation: Constellation,
        @Embedded
        var coordinates: CosmicCoordinates,
        @Column(nullable = true)
        var comp: String?,
        var type: String,
        @OneToMany(mappedBy = "star", cascade = [CascadeType.ALL], orphanRemoval = true)
        var brightness: MutableSet<StarBrightness>,
        @OneToMany(mappedBy = "star", cascade = [CascadeType.ALL], orphanRemoval = true)
        var elements: MutableSet<StarElement>
) : IdEntity()

@Entity
@Table(name = "oc_MinimaPublication")
class MinimaPublication(
        var name: String,
        var year: Int?,
        var volume: String?,
        var page: String?,
        var link: String?
) : IdEntity() {
    @ManyToMany
    var minimas: MutableSet<StarMinima> = mutableSetOf()
}

@Entity
@Table(name = "oc_StarMinima")
class StarMinima(
        @ManyToOne
        var batch: MinimaImportBatch,
        var julianDate: BigDecimal,
        @ManyToOne
        var method: ObservationMethod,
        @ManyToMany
        var publications: MutableSet<MinimaPublication>,
        @ManyToOne
        var observer: MinimaObserver? = null
) : IdEntity() {
    @ManyToOne
    var element: StarElement? = null
}

@Entity
@Table(name = "oc_MinimaObserver")
class MinimaObserver(
        name: String
): IdNameEntity(name)

@Entity
@Table(name = "oc_StarBrightness")
class StarBrightness(
        var minS: Double,
        var maxP: Double,
        var minP: Double,
        @ManyToOne
        var filter: FilterBand
) : IdEntity() {
    @ManyToOne
    var star: Star? = null
}

@Entity
@Table(name = "oc_StarElement")
class StarElement(
        var period: BigDecimal,
        var minimum: BigDecimal,
        @ManyToOne
        var kind: ObservationKind,
        @OneToMany(mappedBy = "element", cascade = [CascadeType.ALL], orphanRemoval = true)
        var minimas: MutableSet<StarMinima>
) : IdEntity() {
    @ManyToOne
    var star: Star? = null
}

@Entity
@Table(name = "oc_MinimaImportBatch")
class MinimaImportBatch(
        var createdOn: LocalDateTime,
        @ManyToOne
        var createdBy: User
) : IdEntity() {
    @OneToMany(mappedBy = "batch", cascade = [CascadeType.ALL], orphanRemoval = true)
    var minimas: MutableSet<StarMinima> = mutableSetOf()
}

@Entity
@Table(name = "oc_ObservationKind")
class ObservationKind(name: String) : IdNameEntity(name)

@Entity
@Table(name = "oc_ObservationMethod")
class ObservationMethod(name: String) : IdNameEntity(name)

@MappedSuperclass
class IdNameEntity(
        var name: String
) : IdEntity()
