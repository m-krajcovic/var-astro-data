package cz.astro.`var`.data.oc.repository

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
class StarMinima(
        @Id var id: Int,
        @Column(name = "NCONS") var constellationId: Int = -1,
        @Column(name = "NSTAR") var starId: Int = -1,
        @Column(name="JC") var julianDatePrefix: Int,
        @Column(name="JD") var julianDate: Double,
        @Column(name="OC") var oc: Double,
        @Column(name="OCS", columnDefinition = "char") var ocSign: String,
        @Column(name="COL", columnDefinition = "char") var color: String,
        @Column(name="KIND", columnDefinition = "char") var kind: String,
        @Column(name="Q", columnDefinition = "char") var quality: String
)
