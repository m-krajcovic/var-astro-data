package cz.astro.`var`.data.czev.repository

import cz.astro.`var`.data.czev.decStringToDegrees
import cz.astro.`var`.data.czev.raStringToDegrees
import cz.astro.`var`.data.czev.service.ServiceException
import org.hibernate.annotations.GenericGenerator
import org.hibernate.annotations.NaturalId
import org.hibernate.envers.Audited
import org.hibernate.envers.NotAudited
import org.springframework.util.StringUtils
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
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
    // TODO Rename to 'id'?
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

    @NotAudited
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "star", cascade = [CascadeType.ALL], orphanRemoval = true)
    var files: MutableSet<StarAdditionalFile> = HashSet()
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
        @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
        @NotAudited
        var files: MutableSet<StarAdditionalFile>,
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
) : IdEntity()


// TODO: add center coordinates
@Entity
@Table(name = "common_Constellation")
@Audited
class Constellation(
        @NaturalId
        @Column(nullable = false, unique = true)
        var name: String,
        @NaturalId
        @Column(nullable = false, unique = true)
        var abbreviation: String
) : IdEntity() {

    @NotAudited
    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true, mappedBy = "constellation")
    var bounds: MutableSet<ConstellationBoundaryPoint> = mutableSetOf()

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
@Table(name = "common_ConstellationBoundaryPoint")
class ConstellationBoundaryPoint(
        val orderNumber: Int,
        val coordinates: CosmicCoordinates
): IdEntity() {
    @ManyToOne
    var constellation: Constellation? = null
}

@Entity
@Table(name = "common_StarType")
class StarType(
        @NaturalId
        @Column(nullable = false, unique = true)
        var name: String
) : IdEntity() {
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
@Table(name = "common_FilterBand")
@Audited
class FilterBand(
        @NaturalId
        @Column(nullable = false, unique = true)
        var name: String
) : IdEntity() {
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
) : IdEntity() {
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
@Table(name = "common_User")
@Audited
class User(
        @NaturalId
        @Column(nullable = false, unique = true)
        var email: String = "",
        @NotAudited
        var password: String = "",
        @ManyToMany
        var roles: MutableSet<Role> = HashSet()
) : IdEntity() {

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
@Table(name = "common_Role")
@Audited
class Role(
        @NaturalId
        @Column(nullable = false, unique = true)
        val name: String
) : IdEntity()

@Entity
@Table(name = "czev_StarComment")
class StarComment(
        @ManyToOne(fetch = FetchType.LAZY)
        var user: User,
        @ManyToOne(fetch = FetchType.LAZY)
        var star: CzevStar,
        @Column(columnDefinition = "text") var text: String
) : IdEntity()

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
@Table(name = "czev_StarAdditionalFile")
class StarAdditionalFile(
        val fileName: String,
        val fileType: String,
        @Lob
        val data: ByteArray
) {
    companion object {
        fun fromMultipartFile(file: MultipartFile): StarAdditionalFile {
            // Normalize file name
            val fileName = StringUtils.cleanPath(file.originalFilename ?: throw ServiceException("File has no name"))

            try {
                // Check if the file's name contains invalid characters
                if (fileName.contains("..")) {
                    throw ServiceException("Sorry! Filename contains invalid path sequence $fileName")
                }

                return StarAdditionalFile(
                        fileName,
                        file.contentType ?: throw ServiceException("File has no type")
                        , file.bytes
                )
            } catch (ex: IOException) {
                throw ServiceException("Could not store file $fileName. Please try again!")
            }
        }
    }

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    var id: String = ""

    @ManyToOne(fetch = FetchType.LAZY)
    var star: CzevStar? = null

}

@Entity
@Table(name = "common_CdsFormat")
class CdsFormat(
        @NaturalId
        @Column(nullable = false, unique = true)
        var name: String,
        @ElementCollection
        @CollectionTable(name = "common_CdsFormat_Patterns", joinColumns = [JoinColumn(name = "format_id")])
        @Column(name = "pattern")
        var patterns: MutableSet<String>
) : IdEntity()

@Entity
@Table(name = "common_Publication")
@Audited
class Publication(
        @NaturalId
        @Column(nullable = false, unique = true)
        var title: String
) : IdEntity()

@MappedSuperclass
abstract class IdEntity(
        @Id
        @SequenceGenerator(name = "ID_SEQ", sequenceName = "ID_SEQ", allocationSize = 1000)
        @GeneratedValue(generator = "ID_SEQ", strategy = GenerationType.SEQUENCE)
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

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is CosmicCoordinates) return false

        if (rightAscension != other.rightAscension) return false
        if (declination != other.declination) return false

        return true
    }

    override fun hashCode(): Int {
        var result = rightAscension.hashCode()
        result = 31 * result + declination.hashCode()
        return result
    }


}
