package cz.astro.`var`.data.czev.validation

import java.math.BigDecimal
import javax.validation.Constraint
import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext
import javax.validation.Payload
import kotlin.reflect.KClass


@Target(AnnotationTarget.FUNCTION, AnnotationTarget.FIELD, AnnotationTarget.TYPE, AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
@Constraint(validatedBy = [RightAscensionStringValidator::class, RightAscensionBigDecimalValidator::class])
annotation class RightAscension(
        val message: String = "Invalid right ascension",
        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)

class RightAscensionStringValidator : ConstraintValidator<RightAscension, String> {

    private val regex: Regex = Regex("^(\\d*(\\.\\d+)?)|(\\d{1,2}[\\s:]\\d{1,2}[\\s:]\\d{0,2}(\\.\\d+)?)$")

    override fun isValid(value: String?, context: ConstraintValidatorContext?): Boolean {
        return value != null && value.matches(regex)
    }
}

class RightAscensionBigDecimalValidator : ConstraintValidator<RightAscension, BigDecimal> {

    override fun isValid(value: BigDecimal?, context: ConstraintValidatorContext?): Boolean {
        return value != null && value >= BigDecimal.ZERO && value <= BigDecimal("360")
    }
}

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.FIELD, AnnotationTarget.TYPE, AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
@Constraint(validatedBy = [DeclinationValidator::class, DeclinationBigDecimalValidator::class])
annotation class Declination(
        val message: String = "Invalid declination",
        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)


class DeclinationValidator : ConstraintValidator<Declination, String> {

    private val regex: Regex = Regex("^([+\\-]?\\d*(\\.\\d+)?)|([+\\-]?\\d{1,2}[\\s:]\\d{1,2}[\\s:]\\d{0,2}(\\.\\d+)?)$")

    override fun isValid(value: String?, context: ConstraintValidatorContext?): Boolean {
        return value != null && value.matches(regex)
    }
}

class DeclinationBigDecimalValidator : ConstraintValidator<Declination, BigDecimal> {

    override fun isValid(value: BigDecimal?, context: ConstraintValidatorContext?): Boolean {
        return value != null && value >= BigDecimal("-90") && value <= BigDecimal("90")
    }
}
