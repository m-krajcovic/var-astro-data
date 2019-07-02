package cz.astro.`var`.data.oc.repository

import java.math.BigDecimal
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
    @Column(name="MINIMUM0", columnDefinition = "double")var minimum0: BigDecimal,
    @Column(name="MINIMUM9", columnDefinition = "double") var minimum9: BigDecimal,
    @Column(name="PERIOD", columnDefinition = "double")var period: BigDecimal,
    @Column(name="KIND", columnDefinition = "char") var kind: String
)
