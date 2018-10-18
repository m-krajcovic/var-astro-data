package cz.astro.`var`.data.repository

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

/**
 * @author Michal
 * @version 1.0
 * @since 10/16/2018
 */
@Entity
@Table(name = "minima")
data class StarMinima(
//        @ManyToOne
//        var star: Star,
        @Id var id: Int,
        @Column (name="CONS", columnDefinition = "char") var constellation: String,
        @Column (name="STARNAME", columnDefinition = "char") var starName: String,
        @Column (name="COMP", columnDefinition = "char") var comp: String,
        @Column(name="JC") var julianDatePrefix: Int,
        @Column(name="JD") var julianDate: Double,
        @Column(name="OC") var oc: Double,
        @Column(name="OCS", columnDefinition = "char") var ocSign: String,
        @Column(name="COL", columnDefinition = "char") var color: String,
        @Column(name="KIND", columnDefinition = "char") var kind: String
)
