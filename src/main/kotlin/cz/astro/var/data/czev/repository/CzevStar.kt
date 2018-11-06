package cz.astro.`var`.data.czev.repository

import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.regex.Pattern
import javax.persistence.*

@Entity
@Table(name = "czev_CzevStar")
class CzevStar(
        @Column(unique = true)
        var czevId: Long,
        @Column(precision = 19, scale = 7) var m0: BigDecimal?,
        @Column(precision = 19, scale = 7) var period: BigDecimal?,
        var periodError: Double,
        var m0Error: Double,
        @Column(columnDefinition = "text") var publicNote: String,
        @Column(columnDefinition = "text") var privateNote: String,
        @ManyToOne(fetch = FetchType.LAZY)
        var constellation: Constellation,
        var type: String,
        @ManyToOne(fetch = FetchType.LAZY)
        var filterBand: FilterBand?,
        @ManyToMany
        var discoverers: MutableList<StarObserver>,
        @OneToMany(mappedBy = "star")
        var comments: MutableList<StarComment>,
        @OneToMany(mappedBy = "star")
        var logs: MutableList<StarChangeLog>,
        @ManyToMany
        var publications: MutableList<Publication>,
        @OneToMany(mappedBy = "star")
        var crossIdentifications: MutableList<StarIdentification>,
        var vsxId: Long?,
        var vsxName: String,
        var approved: Boolean,
        @ManyToOne(fetch = FetchType.LAZY)
        var approvedBy: User?,
        var approvedOn: LocalDateTime,
        var vMagnitude: Double,
        var jMagnitude: Double,
        var jk: Double,
        var amplitude: Double,
        var coordinates: CosmicCoordinates,
        var year: Int
) : CzevEntity()

@Entity
@Table(name = "czev_Constellation")
class Constellation(
        @Column(unique = true)
        var name: String
) : CzevEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Constellation

        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        return name.hashCode()
    }
}

@Entity
@Table(name = "czev_StarType")
class StarType(
        @Column(unique = true)
        var name: String
) : CzevEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as StarType

        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        return name.hashCode()
    }
}

@Entity
@Table(name = "czev_FilterBand")
class FilterBand(
        @Column(unique = true)
        var name: String
) : CzevEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as FilterBand

        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        return name.hashCode()
    }
}

@Entity
@Table(name = "czev_StarObserver")
class StarObserver(
        var firstName: String,
        var lastName: String,
        @Column(unique = true)
        var abbreviation: String,
        @Column(unique = true)
        var email: String,
        @OneToOne(fetch = FetchType.LAZY)
        var user: User? = null
) : CzevEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as StarObserver

        if (firstName != other.firstName) return false
        if (lastName != other.lastName) return false
        if (abbreviation != other.abbreviation) return false
        if (email != other.email) return false

        return true
    }

    override fun hashCode(): Int {
        var result = firstName.hashCode()
        result = 31 * result + lastName.hashCode()
        result = 31 * result + abbreviation.hashCode()
        result = 31 * result + email.hashCode()
        return result
    }
}

@Entity
@Table(name = "czev_User")
class User(
        var email: String,
        var password: String,
        @OneToOne(fetch = FetchType.LAZY)
        var observer: StarObserver? = null
) : CzevEntity()

@Entity
@Table(name = "czev_StarComment")
class StarComment(
        @ManyToOne(fetch = FetchType.LAZY)
        var user: User,
        @ManyToOne(fetch = FetchType.LAZY)
        var star: CzevStar,
        @Column(columnDefinition = "text") var text: String
) : CzevEntity()

@Entity
@Table(name = "czev_StarChangeLog")
class StarChangeLog(
        @ManyToOne(fetch = FetchType.LAZY)
        var star: CzevStar,
        @OneToMany(mappedBy = "changeLog")
        var entries: MutableList<StarChangeLogEntry>,
        @ManyToOne(fetch = FetchType.LAZY)
        var user: User
) : CzevEntity()

@Entity
@Table(name = "czev_StarChangeLogEntry")
class StarChangeLogEntry(
        @ManyToOne(fetch = FetchType.LAZY)
        var changeLog: StarChangeLog,
        var changedColumn: String,
        var newValue: String
) : CzevEntity()

@Entity
@Table(name = "czev_StarIdentification")
class StarIdentification(
        @ManyToOne(fetch = FetchType.LAZY)
        var star: CzevStar,
        @ManyToOne(fetch = FetchType.LAZY)
        var format: CdsFormat,
        var name: String
) : CzevEntity()

@Entity
@Table(name = "czev_CdsFormat")
class CdsFormat(
        var name: String,
        @OneToMany(mappedBy = "format")
        var patterns: MutableList<CdsFormatPattern>
) : CzevEntity()

@Entity
@Table(name = "czev_CdsFormatPattern")
class CdsFormatPattern(
        @ManyToOne(fetch = FetchType.LAZY)
        var format: CdsFormat,
        var value: String
) : CzevEntity()

@Entity
@Table(name = "czev_Publication")
class Publication(
        var title: String
) : CzevEntity()

@MappedSuperclass
class CzevEntity(
        @Id
        @GeneratedValue
        var id: Long = -1,
        @Version
        var lastChange: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        private val serialVersionUID: Long = 1L
    }
}

@Embeddable
class CosmicCoordinates(
        var rightAscension: Double,
        var declination: Double
) {
    constructor(raString: String, decString: String) : this(raStringToDegrees(raString), decStringToDegrees(decString))
}

fun raStringToDegrees(raString: String) : Double {
    val raSplit = raString.split(Pattern.compile("\\s|:"))
    if (raSplit.size != 3) {
        throw IllegalArgumentException("Given string doesn't have correct format")
    }
    val hours = raSplit[0].toInt()
    val minutes = raSplit[1].toInt()
    val seconds = raSplit[2].toDouble()

    return hours * 15 + minutes/4 + seconds/240
}

fun decStringToDegrees(decString: String) : Double {
    val decSplit = decString.split(Pattern.compile("\\s|:"))
    if (decSplit.size != 3) {
        throw IllegalArgumentException("Given string doesn't have correct format")
    }
    val degrees = decSplit[0].toDouble()
    val arcmin = decSplit[1].toDouble()
    val arcsec = decSplit[2].toDouble()

    val op: (Double, Double) -> Double = if (degrees > 0) { a,b -> a + b } else { a,b -> a - b }

    return op(degrees, op(arcmin/60, arcsec/3600))
}