package cz.astro.`var`.data.czev.conversion

import cz.astro.`var`.data.czev.decStringToDegrees
import cz.astro.`var`.data.czev.raStringToDegrees
import cz.astro.`var`.data.czev.validation.Declination
import cz.astro.`var`.data.czev.validation.RightAscension
import org.springframework.core.convert.TypeDescriptor
import org.springframework.core.convert.converter.ConditionalGenericConverter
import org.springframework.core.convert.converter.GenericConverter
import org.springframework.stereotype.Component
import java.math.BigDecimal


@Component
class RightAscensionConverter : ConditionalGenericConverter {
    override fun getConvertibleTypes(): MutableSet<GenericConverter.ConvertiblePair>? {
        return mutableSetOf(GenericConverter.ConvertiblePair(String::class.java, BigDecimal::class.java),
                GenericConverter.ConvertiblePair(String::class.java, RightAscensionHolder::class.java))
    }

    override fun convert(source: Any?, sourceType: TypeDescriptor, targetType: TypeDescriptor): Any? {
        if (source is String) {
            val raTrimmed = source.trim()
            val raDegrees = raTrimmed.toBigDecimalOrNull() ?: raStringToDegrees(raTrimmed)
            if (raDegrees >= BigDecimal.ZERO && raDegrees <= BigDecimal("360")) {
                when {
                    targetType.type == BigDecimal::class.java -> return raDegrees
                    targetType.type == RightAscensionHolder::class.java -> return RightAscensionHolder(raDegrees)
                }
            }
        }
        throw IllegalArgumentException("Source must be string")
    }

    override fun matches(sourceType: TypeDescriptor, targetType: TypeDescriptor): Boolean {
        return sourceType.type == String::class.java && ((
                targetType.type == BigDecimal::class.java && targetType.getAnnotation(RightAscension::class.java) != null)
                || targetType.type == RightAscensionHolder::class.java)
    }
}

@Component
class DeclinationConverter : ConditionalGenericConverter {
    override fun getConvertibleTypes(): MutableSet<GenericConverter.ConvertiblePair>? {
        return mutableSetOf(GenericConverter.ConvertiblePair(String::class.java, BigDecimal::class.java),
                GenericConverter.ConvertiblePair(String::class.java, DeclinationHolder::class.java))
    }

    override fun convert(source: Any?, sourceType: TypeDescriptor, targetType: TypeDescriptor): Any? {
        if (source is String) {
            val decTrimmed = source.trim()
            val decDegrees = decTrimmed.toBigDecimalOrNull() ?: decStringToDegrees(decTrimmed)
            if (decDegrees >= BigDecimal("-90") && decDegrees <= BigDecimal("90")) {
                when {
                    targetType.type == BigDecimal::class.java -> return decDegrees
                    targetType.type == DeclinationHolder::class.java -> return DeclinationHolder(decDegrees)
                }
            }
        }
        throw IllegalArgumentException("Source must be string")
    }

    override fun matches(sourceType: TypeDescriptor, targetType: TypeDescriptor): Boolean {
        return sourceType.type == String::class.java && (
                (targetType.type == BigDecimal::class.java && targetType.getAnnotation(Declination::class.java) != null)
                        || targetType.type == DeclinationHolder::class.java
                )
    }
}

data class RightAscensionHolder(
        val value: BigDecimal
)

data class DeclinationHolder(
        val value: BigDecimal
)
