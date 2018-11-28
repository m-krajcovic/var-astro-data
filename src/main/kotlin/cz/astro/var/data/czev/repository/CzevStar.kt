package cz.astro.`var`.data.czev.repository

import cz.astro.`var`.data.czev.decStringToDegrees
import cz.astro.`var`.data.czev.raStringToDegrees
import org.hibernate.annotations.NaturalId
import org.hibernate.envers.Audited
import org.hibernate.envers.NotAudited
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "czev_CzevStar")
@Audited
class CzevStar(
        @Column(precision = 15, scale = 7, nullable = true) var m0: BigDecimal?,
        @Column(precision = 10, scale = 7, nullable = true) var period: BigDecimal?,
        var periodError: Double,
        var m0Error: Double,
        @Column(columnDefinition = "text") var publicNote: String,
        @NotAudited
        @Column(columnDefinition = "text") var privateNote: String,
        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        var constellation: Constellation,
        var type: String,
        @ManyToOne(fetch = FetchType.LAZY)
        var filterBand: FilterBand?,
        @ManyToMany(fetch = FetchType.LAZY)
        var discoverers: MutableSet<StarObserver>,
        @Embedded
        var coordinates: CosmicCoordinates,
        var year: Int,
        @ManyToMany(fetch = FetchType.LAZY)
        var publications: MutableSet<Publication>,
        @Column(nullable = true) var vsxId: Long?,
        var vsxName: String,
        @Column(nullable = true)
        var vmagnitude: Double?,
        @Column(nullable = true)
        var jmagnitude: Double?,
        @Column(nullable = true)
        var kmagnitude: Double?,
        @Column(nullable = true)
        var amplitude: Double?,
        @NotAudited
        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(updatable = false)
        var createdBy: User,
        @NotAudited
        var typeValid: Boolean = true
) {
    // TODO Rename to 'id'
    @Id
    @SequenceGenerator(name = "czev_CzevIdSequence", sequenceName = "czev_CzevIdSequence", allocationSize = 1)
    @GeneratedValue(generator = "czev_CzevIdSequence", strategy = GenerationType.SEQUENCE)
    var czevId: Long = -1

    @OneToMany(mappedBy = "star", cascade = [CascadeType.ALL], orphanRemoval = true)
    var crossIdentifications: MutableSet<StarIdentification> = HashSet()
        set(value) {
            value.forEach { it.star = this }
            field = value
        }

    @Version
    var lastChange: LocalDateTime = LocalDateTime.now()

    @NotAudited
    @Column(updatable = false)
    var createdOn: LocalDateTime = LocalDateTime.now()

}

@Entity
@Table(name = "czev_CzevStarDraft")
class CzevStarDraft(
        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        var constellation: Constellation,
        var type: String,
        @ManyToOne(fetch = FetchType.LAZY)
        var filterBand: FilterBand?,
        var amplitude: Double?,
        @Embedded
        var coordinates: CosmicCoordinates,
        @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true)
        var crossIdentifications: MutableSet<StarIdentification>,
        @Column(precision = 15, scale = 7, nullable = true) var m0: BigDecimal?,
        @Column(precision = 10, scale = 7, nullable = true) var period: BigDecimal?,
        @ManyToMany
        var discoverers: MutableSet<StarObserver>,
        var year: Int,
        @Column(columnDefinition = "text") var privateNote: String,
        @Column(columnDefinition = "text") var publicNote: String,
        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        var createdBy: User,
        var rejected: Boolean = false,
        var rejectedOn: LocalDateTime? = null,
        var rejectedNote: String = "",
        @ManyToOne(fetch = FetchType.LAZY)
        var rejectedBy: User? = null,
        @NotAudited
        var typeValid: Boolean = true,
        var jmagnitude: Double? = null,
        var vmagnitude: Double? = null,
        var kmagnitude: Double? = null
) : CzevEntity()

@Entity
@Table(name = "czev_Constellation")
@Audited
class Constellation(
        @NaturalId
        @Column(nullable = false, unique = true)
        var name: String,
        @NaturalId
        @Column(nullable = false, unique = true)
        var abbreviation: String
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
        @NaturalId
        @Column(nullable = false, unique = true)
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
@Audited
class FilterBand(
        @NaturalId
        @Column(nullable = false, unique = true)
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
@Audited
class StarObserver(
        var firstName: String,
        var lastName: String,
        @NaturalId
        @Column(nullable = false, unique = true)
        var abbreviation: String,
        @Column(unique = true)
        var email: String,
        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
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
@Audited
class User(
        @NaturalId
        @Column(nullable = false, unique = true)
        var email: String = "",
        @NotAudited
        var password: String = "",
        @ManyToMany
        var roles: MutableSet<Role> = HashSet()
) : CzevEntity() {

    constructor(id: Long) : this() {
        super.id = id
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is User) return false

        if (email != other.email) return false

        return true
    }

    override fun hashCode(): Int {
        return email.hashCode()
    }
}

@Entity
@Table(name = "czev_Role")
@Audited
class Role(
        @NaturalId
        @Column(nullable = false, unique = true)
        val name: String
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
@Table(name = "czev_StarIdentification")
@Audited
class StarIdentification(
        @Id
        var name: String,
        @NotAudited
        @ManyToOne(fetch = FetchType.LAZY)
        var format: CdsFormat?,
        var orderNumber: Int
) {
    @ManyToOne(fetch = FetchType.LAZY)
    var star: CzevStar? = null

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is StarIdentification) return false

        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        return name.hashCode()
    }
}

@Entity
@Table(name = "czev_CdsFormat")
class CdsFormat(
        @NaturalId
        @Column(nullable = false, unique = true)
        var name: String,
        @ElementCollection
        @CollectionTable(name = "czev_CdsFormat_Patterns", joinColumns = [JoinColumn(name = "format_id")])
        @Column(name = "pattern")
        var patterns: MutableSet<String>
) : CzevEntity()

@Entity
@Table(name = "czev_Publication")
@Audited
class Publication(
        @NaturalId
        @Column(nullable = false, unique = true)
        var title: String
) : CzevEntity()

@MappedSuperclass
abstract class CzevEntity(
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
        @Column(precision = 10, scale = 7) var rightAscension: BigDecimal,
        @Column(precision = 10, scale = 7) var declination: BigDecimal
) {
    constructor(raString: String, decString: String) : this(raStringToDegrees(raString), decStringToDegrees(decString))
}

@Entity
@Table(name = "predpovedi")
class Predpovedi(
        @Id
        val id: Int,
        val starName: String,
        val cons: String,
        @Column(name = "BODY_zanedbanost") val body: Int
)
