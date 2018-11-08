package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.decStringToDegrees
import cz.astro.`var`.data.czev.repository.raStringToDegrees
import cz.astro.`var`.data.czev.repository.sesame.SesameResult
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.getForObject
import java.io.StringReader
import java.math.BigDecimal
import java.util.*
import javax.xml.bind.JAXBContext
import javax.xml.bind.JAXBException
import javax.xml.bind.UnmarshalException

interface StarInformationResolverService {
    fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusArcSec: Double): List<StarInformationDistanceModel>
    fun findNearestByCoordinates(coordinates: CosmicCoordinatesModel): Optional<StarInformationDistanceModel>
}

interface NameStarInformationResolverService {
    fun findByName(name: String): Optional<StarInformationModel>
}

data class StarInformationModel(
        val coordinates: CosmicCoordinatesModel?,
        val originalName: String,
        val names: Set<String>,
        val type: String,
        val m0: BigDecimal?,
        val period: BigDecimal?
)


data class StarInformationDistanceModel(
        val distance: Double,
        val model: StarInformationModel
)

@Component
class SesameStarInformationResolverService: NameStarInformationResolverService {
    override fun findByName(name: String): Optional<StarInformationModel> {
        val template = RestTemplate()
        val uriVariables = mapOf(Pair("name", name.toString()))
        val rawResult: String = template.getForObject("http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oxpI/S?{name}", uriVariables)
                ?: throw ServiceException("Sesame resolver failed")
        val context = JAXBContext.newInstance(SesameResult::class.java)
        val um = context.createUnmarshaller()
        val result: SesameResult
        try {
            result = um.unmarshal(StringReader(rawResult)) as SesameResult
        } catch (e: JAXBException) {
            throw ServiceException("Sesame resolver failed")
        } catch (e: UnmarshalException) {
            throw ServiceException("Sesame resolver failed")
        }

        if (result.targets == null || result.targets.isEmpty()) {
            return Optional.empty()
        }
        val target = result.targets.first()
        if (target.resolvers == null || target.resolvers.isEmpty()) {
            return Optional.empty()
        }
        val resolver = target.resolvers.first()
        var coordinates: CosmicCoordinatesModel? = null
        if (!resolver.raDegrees.isNullOrBlank() && !resolver.decDegrees.isNullOrBlank()) {
            coordinates = CosmicCoordinatesModel(resolver.raDegrees.toBigDecimal(), resolver.decDegrees.toBigDecimal())
        } else if (!resolver.coordinates.isNullOrBlank()) {
            val coordsSplit = resolver.coordinates.split(" ")
            if (coordsSplit.size == 2) {
                val ra = raStringToDegrees(coordsSplit[0])
                val dec = decStringToDegrees(coordsSplit[1])
                coordinates = CosmicCoordinatesModel(ra, dec)
            }

        }

        return Optional.of(StarInformationModel(
                coordinates,
                resolver.originalName,
                resolver.aliases.toSet(),
                resolver.type,
                null, null
        ))
    }
}
