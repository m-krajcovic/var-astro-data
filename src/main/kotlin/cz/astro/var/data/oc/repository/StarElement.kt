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
@Table(name = "element")
class StarElement(
    @Id var id: Int,
    var minimum0: Double,
    var minimum9: Double,
    var period: Double,
    @Column(name="KIND", columnDefinition = "char") var kind: String
)