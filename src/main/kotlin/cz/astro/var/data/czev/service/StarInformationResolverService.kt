package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.decStringToDegrees
import cz.astro.`var`.data.czev.repository.raStringToDegrees
import cz.astro.`var`.data.czev.repository.sesame.SesameResult
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.getForObject
import java.io.StringReader
import java.math.BigDecimal
import java.util.*
import javax.xml.bind.JAXBContext
import javax.xml.bind.JAXBException
import javax.xml.bind.UnmarshalException

interface CoordinatesStarInformationResolverService {
    fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): List<VariableStarInformationDistanceModel>
    fun findNearestByCoordinates(coordinates: CosmicCoordinatesModel): Optional<VariableStarInformationDistanceModel>
}

interface NameStarInformationResolverService {
    fun findByName(name: String): Optional<VariableStarInformationModel>
}

data class VariableStarInformationModel(
        val coordinates: CosmicCoordinatesModel?,
        val originalName: String,
        val names: Set<String>,
        val type: String,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val vsxId: Long?
)


data class VariableStarInformationDistanceModel(
        val distance: Double,
        val model: VariableStarInformationModel
)

@Component
class SesameStarInformationResolverService(
        private val restTemplate: RestTemplate
) : NameStarInformationResolverService {
    override fun findByName(name: String): Optional<VariableStarInformationModel> {
        val uriVariables = mapOf(Pair("name", name))
        val rawResult: String = restTemplate.getForObject("http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oxpI/S?{name}", uriVariables)
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

        return Optional.of(VariableStarInformationModel(
                coordinates,
                resolver.originalName,
                resolver.aliases.toSet(),
                resolver.type,
                null, null, null
        ))
    }
}

@Component
class VsxStarInformationResolverService(
        private val tapVizierService: TAPVizierService
) : CoordinatesStarInformationResolverService, NameStarInformationResolverService {
    
    companion object {
        const val VSX_CAT: String = "\"B/vsx/vsx\""
        const val QUERY_FIELDS: String = "$VSX_CAT.OID,  $VSX_CAT.Name,  $VSX_CAT.Type, $VSX_CAT.Epoch, $VSX_CAT.Period, $VSX_CAT.RAJ2000,  $VSX_CAT.DEJ2000"
    }
    
    override fun findByName(name: String): Optional<VariableStarInformationModel> {
        val query = "SELECT TOP 1 $QUERY_FIELDS FROM $VSX_CAT WHERE $VSX_CAT.Name = '${name.replace("'", "''")}'"
        return tapVizierService.query(query).map { it.toSingleModel(0) }
    }

    override fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): List<VariableStarInformationDistanceModel> {
        return findByCoordinates(coordinates, 10, radiusDegrees)
    }

    private fun findByCoordinates(coordinates: CosmicCoordinatesModel, limit: Int, radiusDegrees: Double): List<VariableStarInformationDistanceModel> {
        val distanceField = "DISTANCE(POINT('ICRS',${coordinates.ra}, ${coordinates.dec}), POINT('ICRS',$VSX_CAT.RAJ2000, $VSX_CAT.DEJ2000)) as \"DISTANCE\""
        val query = "SELECT TOP $limit $QUERY_FIELDS, $distanceField FROM $VSX_CAT WHERE 1=CONTAINS(POINT('ICRS',$VSX_CAT.RAJ2000,$VSX_CAT.DEJ2000), CIRCLE('ICRS', ${coordinates.ra}, ${coordinates.dec}, $radiusDegrees)) ORDER BY \"DISTANCE\""
        return tapVizierService.query(query).map { it.toDistanceModels() }.orElse(ArrayList())
    }

    override fun findNearestByCoordinates(coordinates: CosmicCoordinatesModel): Optional<VariableStarInformationDistanceModel> {
        return Optional.ofNullable(findByCoordinates(coordinates, 1, 1.0).firstOrNull())
    }

    private fun TAPVizierService.TAPVizierResult.toDistanceModels(): List<VariableStarInformationDistanceModel> {
        val result = ArrayList<VariableStarInformationDistanceModel>()
        data.forEach {
            if (it.size == 8) {
                val vsxId = it[0]?.toLongOrNull()
                val name = it[1] ?: ""
                val type = it[2] ?: ""
                val epoch = it[3]?.toBigDecimalOrNull()
                val period = it[4]?.toBigDecimalOrNull()
                val ra = it[5]?.toBigDecimalOrNull()
                val dec = it[6]?.toBigDecimalOrNull()
                var coordinates: CosmicCoordinatesModel? = null
                if (ra != null && dec != null) {
                    coordinates = CosmicCoordinatesModel(ra, dec)
                }
                val distance = it[7]?.toDoubleOrNull()
                if (distance != null) {
                    result.add(VariableStarInformationDistanceModel(
                            distance,
                            VariableStarInformationModel(
                                    coordinates, name, emptySet(), type, epoch, period, vsxId
                            )
                    ))
                }
            }
        }
        return result
    }

    private fun TAPVizierService.TAPVizierResult.toSingleModel(index: Int): VariableStarInformationModel? {
        if (data.size > index && data[index].size == 7) {
            // vsxId, name, type, epoch, period, ra, dec
            val result = data[index]
            val vsxId = result[0]?.toLongOrNull()
            val name = result[1] ?: ""
            val type = result[2] ?: ""
            val epoch = result[3]?.toBigDecimalOrNull()
            val period = result[4]?.toBigDecimalOrNull()
            val ra = result[5]?.toBigDecimalOrNull()
            val dec = result[6]?.toBigDecimalOrNull()
            var coordinates: CosmicCoordinatesModel? = null
            if (ra != null && dec != null) {
                coordinates = CosmicCoordinatesModel(ra, dec)
            }
            return VariableStarInformationModel(coordinates, name, emptySet(), type, epoch, period, vsxId)
        }
        return null
    }
}

@Component
class TAPVizierService(
        private val restTemplate: RestTemplate
) {

    class TAPVizierResult(
            var metadata: List<TAPVizierMetadata> = ArrayList(),
            var data: List<List<String?>> = ArrayList()
    )

    class TAPVizierMetadata(
            var name: String = "",
            var description: String = "",
            var datatype: String = "",
            var unit: String = "",
            var ucd: String = ""
    )

    fun query(query: String): Optional<TAPVizierResult> {
        val url = "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync?request=doQuery&lang=adql&format=json&query={query}"

        try {
            val tapVizierResult: TAPVizierResult = restTemplate.getForObject(url, query) ?: return Optional.empty()
            return Optional.of(tapVizierResult)
        } catch (e: RestClientException) {
            // TODO log
            return Optional.empty()
        }
    }
}

/*
SELECT TOP 100 "I/322A/out".UCAC4,  "I/322A/out".RAJ2000,  "I/322A/out".DEJ2000, "I/322A/out".Kmag, "I/322A/out".Jmag, "I/322A/out".Vmag
FROM "I/322A/out"
*/