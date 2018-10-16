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
@Table(name = "bright")
data class StarBrightness(
    @Id var id: Int,
    var maxP: Double,
    var minP: Double,
    var minS: Double,
    @Column(name="COL", columnDefinition = "char") var col: String
)
