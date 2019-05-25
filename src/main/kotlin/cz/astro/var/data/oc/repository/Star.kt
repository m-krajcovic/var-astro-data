package cz.astro.`var`.data.oc.repository

import cz.astro.`var`.data.CosmicCoordinates
import cz.astro.`var`.data.helper.BooleanToStringConverter
import java.io.Serializable
import java.time.LocalDate
import javax.persistence.*

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
@Entity
@Table(name="identif")
class Star(
        @Id var id: Int = -1,
        @Column(name = "MODIFIED") var lastModifiedDate: LocalDate = LocalDate.MIN,
        @Column(name = "CONS", columnDefinition = "char") var constellation: String = "",
        @Column(name = "STARNAME", columnDefinition = "char") var starName: String = "",
        @Column(name = "COMP", columnDefinition = "char") var comp: String = ".",
        @Column(name = "LOC", columnDefinition = "char") var loc: String = "",
        @Column(name = "NCONS") var constellationId: Int = -1,
        @Column(name = "NSTAR") var starId: Int = -1,
        @Embedded
        @AttributeOverrides(
            AttributeOverride(name = "raHours", column = Column(name = "RH1")),
            AttributeOverride(name = "raMinutes", column = Column(name = "RM1")),
            AttributeOverride(name = "raSeconds", column = Column(name = "RS1")),
            AttributeOverride(name = "decDegrees", column = Column(name = "DD1")),
            AttributeOverride(name = "decMinutes", column = Column(name = "DM1")),
            AttributeOverride(name = "decSeconds", column = Column(name = "DS1")),
            AttributeOverride(name = "decSign", column = Column(name = "DSI1", columnDefinition = "char"))
        )
        var coordinates: CosmicCoordinates,
//        var gcvsName: String,
        @Column(name = "COSOUR1", columnDefinition = "char") var cosour: String = "",
        @Column(name = "ORIG") var origin: Int = 0,
        @Column(name = "QUAL", columnDefinition = "char")
        @Convert(converter = BooleanToStringConverter::class)
        var quality: Boolean = true,
        @Column(name = "TYPE", columnDefinition = "char") var type: String = "",
        @Column(name = "NOTE_ID", columnDefinition = "char") var noteId: String = "",
        @Column(name = "user") var user: Int = -1,
        @OneToMany(targetEntity = StarElement::class)
        @JoinColumns(
                JoinColumn(updatable=false, insertable=false, name = "NCONS", referencedColumnName = "NCONS"),
                JoinColumn(updatable=false, insertable=false, name = "NSTAR", referencedColumnName = "NSTAR")
        )
        var elements: MutableSet<StarElement> = HashSet(),
        @OneToMany
        @JoinColumns(
                JoinColumn(updatable=false, insertable=false, name = "NCONS", referencedColumnName = "NCONS"),
                JoinColumn(updatable=false, insertable=false, name = "NSTAR", referencedColumnName = "NSTAR")
        )
        var brightness: MutableSet<StarBrightness> = HashSet(),
        @OneToMany
        @JoinColumns(
                JoinColumn(updatable=false, insertable=false, name = "NCONS", referencedColumnName = "NCONS"),
                JoinColumn(updatable=false, insertable=false, name = "NSTAR", referencedColumnName = "NSTAR")
        )
        var minima: MutableSet<StarMinima> = HashSet()
) : Serializable
