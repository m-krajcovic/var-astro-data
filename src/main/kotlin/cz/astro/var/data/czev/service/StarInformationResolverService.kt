package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.decStringToDegrees
import cz.astro.`var`.data.czev.repository.raStringToDegrees
import cz.astro.`var`.data.czev.repository.sesame.SesameResult
import org.slf4j.Logger
import org.slf4j.LoggerFactory
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
import kotlin.collections.HashMap

interface VariableStarInformationCoordinatesResolverService {
    fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): List<DistanceModel<VariableStarInformationModel>>
    fun findNearest(coordinates: CosmicCoordinatesModel): Optional<DistanceModel<VariableStarInformationModel>>
}

interface VariableStarInformationNameResolverService {
    fun findByName(name: String): Optional<VariableStarInformationModel>
}

interface StarInformationResolverService {
    fun findByIdentifier(identifier: String): Optional<StarInformationModel>
    fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): List<DistanceModel<StarInformationModel>>
    fun findNearest(coordinates: CosmicCoordinatesModel): Optional<DistanceModel<StarInformationModel>>
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

data class DistanceModel<T>(
        val distance: Double,
        val model: T
)

data class StarInformationModel(
        val coordinates: CosmicCoordinatesModel?,
        val identifier: String,
        val magnitudes: Map<String, Double>
)


interface Ucac4StarInformationResolverService : StarInformationResolverService {
    fun isValidIdentifier(identifier: String): Boolean
    fun selectIdentifier(identifier: String): Optional<String>
}

@Component
class Ucac4StarInformationResolverServiceImpl(
        private val tapVizierService: TAPVizierService
) : Ucac4StarInformationResolverService {
    companion object {
        const val UCAC4_CAT = "\"I/322A/out\""
        const val QUERY_FIELDS = "$UCAC4_CAT.UCAC4, $UCAC4_CAT.RAJ2000, $UCAC4_CAT.DEJ2000, $UCAC4_CAT.Kmag, $UCAC4_CAT.Jmag, $UCAC4_CAT.Vmag"

        val IDENTIFIER_PATTERN = Regex("\\s*(UCAC4.*?)?(\\d{3}-\\d{6})\\s*")
    }

    override fun selectIdentifier(identifier: String): Optional<String> {
        val match = IDENTIFIER_PATTERN.matchEntire(identifier)
        if (match != null) {
            return Optional.of(match.groups[2]!!.value)
        }
        return Optional.empty()
    }

    override fun isValidIdentifier(identifier: String): Boolean {
        return IDENTIFIER_PATTERN.matches(identifier)
    }

    override fun findByIdentifier(identifier: String): Optional<StarInformationModel> {
        return selectIdentifier(identifier).map {
            val query = "SELECT TOP 1 $QUERY_FIELDS FROM $UCAC4_CAT WHERE $UCAC4_CAT.UCAC4 = '${it.replace("'", "''")}'"
            tapVizierService.query(query).map { it.toSingleModel() }.orElse(null)
        }
    }

    override fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): List<DistanceModel<StarInformationModel>> {
        return findByCoordinates(coordinates, 10, radiusDegrees)
    }

    override fun findNearest(coordinates: CosmicCoordinatesModel): Optional<DistanceModel<StarInformationModel>> {
        return Optional.ofNullable(findByCoordinates(coordinates, 1, 1.0).firstOrNull())
    }

    private fun findByCoordinates(coordinates: CosmicCoordinatesModel, limit: Int, radiusDegrees: Double): List<DistanceModel<StarInformationModel>> {
        return tapVizierService.query(TAPVizierService.buildDistanceQuery(
                UCAC4_CAT, QUERY_FIELDS, coordinates, radiusDegrees, limit
        )).map { it.toDistanceModels() }.orElse(ArrayList())
    }

    private fun TAPVizierResult.toDistanceModels(): List<DistanceModel<StarInformationModel>> {
        val output = ArrayList<DistanceModel<StarInformationModel>>()
        data.forEach { result ->
            val ucacId = result[0] ?: ""
            val ra = result[1]?.toBigDecimalOrNull()
            val dec = result[2]?.toBigDecimalOrNull()
            val magnitudes = HashMap<String, Double>()
            result[3]?.toDoubleOrNull()?.let {
                magnitudes.put("K", it)
            }
            result[4]?.toDoubleOrNull()?.let {
                magnitudes.put("V", it)
            }
            result[5]?.toDoubleOrNull()?.let {
                magnitudes.put("J", it)
            }
            result[6]?.toDoubleOrNull()?.let {
                var coordinates: CosmicCoordinatesModel? = null
                if (ra != null && dec != null) {
                    coordinates = CosmicCoordinatesModel(ra, dec)
                }
                output.add(DistanceModel(it, StarInformationModel(coordinates, ucacId, magnitudes)))
            }
        }
        return output
    }

    private fun TAPVizierResult.toSingleModel(): StarInformationModel? {
        if (data.isNotEmpty() && data[0].size == 6) {
            // vsxId, name, type, epoch, period, ra, dec
            val result = data[0]
            val ucacId = result[0] ?: ""
            val ra = result[1]?.toBigDecimalOrNull()
            val dec = result[2]?.toBigDecimalOrNull()
            val magnitudes = HashMap<String, Double>()
            result[3]?.toDoubleOrNull()?.let {
                magnitudes.put("K", it)
            }
            result[4]?.toDoubleOrNull()?.let {
                magnitudes.put("V", it)
            }
            result[5]?.toDoubleOrNull()?.let {
                magnitudes.put("J", it)
            }
            var coordinates: CosmicCoordinatesModel? = null
            if (ra != null && dec != null) {
                coordinates = CosmicCoordinatesModel(ra, dec)
            }
            return StarInformationModel(coordinates, ucacId, magnitudes)
        }
        return null
    }
}

interface SesameVariableStarInformationResolverService : VariableStarInformationNameResolverService

@Component
class SesameVariableStarInformationResolverServiceImpl(
        private val restTemplate: RestTemplate
) : SesameVariableStarInformationResolverService {

    companion object {
        val logger = LoggerFactory.getLogger(SesameVariableStarInformationResolverService::class.java)
    }

    override fun findByName(name: String): Optional<VariableStarInformationModel> {
        logger.debug(name)
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

interface VsxVariableStarInformationResolverService : VariableStarInformationCoordinatesResolverService, VariableStarInformationNameResolverService

@Component
class VsxVariableStarInformationResolverServiceImpl(
        private val tapVizierService: TAPVizierService
) : VsxVariableStarInformationResolverService {

    companion object {
        const val VSX_CAT: String = "\"B/vsx/vsx\""
        const val QUERY_FIELDS: String = "$VSX_CAT.OID,  $VSX_CAT.Name,  $VSX_CAT.Type, $VSX_CAT.Epoch, $VSX_CAT.Period, $VSX_CAT.RAJ2000,  $VSX_CAT.DEJ2000"
    }

    override fun findByName(name: String): Optional<VariableStarInformationModel> {
        val query = "SELECT TOP 1 $QUERY_FIELDS FROM $VSX_CAT WHERE $VSX_CAT.Name = '${name.replace("'", "''")}'"
        return tapVizierService.query(query).map { it.toSingleModel(0) }
    }

    override fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): List<DistanceModel<VariableStarInformationModel>> {
        return findByCoordinates(coordinates, 10, radiusDegrees)
    }

    private fun findByCoordinates(coordinates: CosmicCoordinatesModel, limit: Int, radiusDegrees: Double): List<DistanceModel<VariableStarInformationModel>> {
        return tapVizierService.query(TAPVizierService.buildDistanceQuery(
                VSX_CAT, QUERY_FIELDS, coordinates, radiusDegrees, limit
        )).map { it.toDistanceModels() }.orElse(ArrayList())
    }

    override fun findNearest(coordinates: CosmicCoordinatesModel): Optional<DistanceModel<VariableStarInformationModel>> {
        return Optional.ofNullable(findByCoordinates(coordinates, 1, 1.0).firstOrNull())
    }

    private fun TAPVizierResult.toDistanceModels(): List<DistanceModel<VariableStarInformationModel>> {
        val result = ArrayList<DistanceModel<VariableStarInformationModel>>()
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
                    result.add(DistanceModel<VariableStarInformationModel>(
                            distance,
                            VariableStarInformationModel(
                                    coordinates, name, setOf(name), type, epoch, period, vsxId
                            )
                    ))
                }
            }
        }
        return result
    }

    private fun TAPVizierResult.toSingleModel(index: Int): VariableStarInformationModel? {
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
            return VariableStarInformationModel(coordinates, name, setOf(name), type, epoch, period, vsxId)
        }
        return null
    }
}

interface TAPVizierService {
    fun query(query: String): Optional<TAPVizierResult>

    companion object {
        fun buildDistanceQuery(catalogue: String, queryFields: String, coordinates: CosmicCoordinatesModel, radiusDegrees: Double, limit: Int): String {
            val distanceField = "DISTANCE(POINT('ICRS',${coordinates.ra}, ${coordinates.dec}), POINT('ICRS',$catalogue.RAJ2000, $catalogue.DEJ2000)) as \"DISTANCE\""
            return "SELECT TOP $limit $queryFields, $distanceField FROM $catalogue WHERE 1=CONTAINS(POINT('ICRS',$catalogue.RAJ2000,$catalogue.DEJ2000), CIRCLE('ICRS', ${coordinates.ra}, ${coordinates.dec}, $radiusDegrees)) ORDER BY \"DISTANCE\""
        }
    }
}

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

@Component
class TAPVizierServiceImpl(
        private val restTemplate: RestTemplate
) : TAPVizierService {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(TAPVizierServiceImpl::class.java)
    }

    override fun query(query: String): Optional<TAPVizierResult> {
        logger.debug(query)
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
