package cz.astro.`var`.data.newoc.repository

import cz.astro.`var`.data.czev.repository.*
import org.hibernate.annotations.NaturalId
import java.io.Serializable
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
        var minimaDuration: Int?,
        @OneToMany(mappedBy = "star", cascade = [CascadeType.ALL], orphanRemoval = true)
        var brightness: MutableSet<StarBrightness>,
        @OneToMany(mappedBy = "star", cascade = [CascadeType.ALL], orphanRemoval = true)
        var elements: MutableSet<StarElement>
) : IdEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Star) return false

        if (name != other.name) return false
        if (constellation != other.constellation) return false
        if (coordinates != other.coordinates) return false
        if (comp != other.comp) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + constellation.hashCode()
        result = 31 * result + coordinates.hashCode()
        result = 31 * result + (comp?.hashCode() ?: 0)
        return result
    }
}

@Entity
@Table(name = "oc_MinimaPublication")
class MinimaPublication(
        @NaturalId
        var name: String,
        var link: String?,
        @OneToMany(mappedBy = "publication", cascade = [CascadeType.ALL], orphanRemoval = true)
        var volumes: MutableSet<MinimaPublicationVolume>
) : IdEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MinimaPublication) return false

        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        return name.hashCode()
    }
}

@Entity
@Table(name = "oc_MinimaPublicationVolume")
class MinimaPublicationVolume(
        var name: String,
        var year: Int,
        var link: String?,
        @OneToMany(mappedBy = "volume", cascade = [CascadeType.ALL], orphanRemoval = true)
        var entries: MutableSet<MinimaPublicationEntry>
) : IdEntity() {
    @ManyToOne
    var publication: MinimaPublication? = null

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MinimaPublicationVolume) return false

        if (name != other.name) return false
        if (year != other.year) return false
        if (publication != other.publication) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + year
        result = 31 * result + (publication?.hashCode() ?: 0)
        return result
    }
}

@Entity
@Table(name = "oc_MinimaPublicationEntry")
class MinimaPublicationEntry(
        @ManyToOne
        @Id
        var volume: MinimaPublicationVolume,
        @Id
        var page: String?
): Serializable {
    @Id
    @ManyToOne
    var minima: StarMinima? = null

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MinimaPublicationEntry) return false

        if (volume != other.volume) return false
        if (page != other.page) return false
        if (minima != other.minima) return false

        return true
    }

    override fun hashCode(): Int {
        var result = volume.hashCode()
        result = 31 * result + (page?.hashCode() ?: 0)
        result = 31 * result + (minima?.hashCode() ?: 0)
        return result
    }
}

@Entity
@Table(name = "oc_StarMinima")
class StarMinima(
        @ManyToOne
        var batch: MinimaImportBatch,
        var julianDate: BigDecimal,
        @ManyToOne
        var method: ObservationMethod,
        @OneToMany(mappedBy = "minima", cascade = [CascadeType.ALL], orphanRemoval = true)
        var publicationEntries: MutableSet<MinimaPublicationEntry>,
        var observer: String = ""
) : IdEntity() {
    @ManyToOne
    var element: StarElement? = null

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is StarMinima) return false

        if (julianDate != other.julianDate) return false
        if (method != other.method) return false
        if (element != other.element) return false

        return true
    }

    override fun hashCode(): Int {
        var result = julianDate.hashCode()
        result = 31 * result + method.hashCode()
        result = 31 * result + (element?.hashCode() ?: 0)
        return result
    }
}

@Entity
@Table(name = "oc_MinimaObserver")
class MinimaObserver(
        name: String
) : IdNameEntity(name)

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

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is StarElement) return false

        if (period != other.period) return false
        if (minimum != other.minimum) return false
        if (kind != other.kind) return false
        if (star != other.star) return false

        return true
    }

    override fun hashCode(): Int {
        var result = period.hashCode()
        result = 31 * result + minimum.hashCode()
        result = 31 * result + kind.hashCode()
        result = 31 * result + (star?.hashCode() ?: 0)
        return result
    }


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
) : IdEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is IdNameEntity) return false

        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        return name.hashCode()
    }
}
