package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.conversion.DeclinationHolder
import cz.astro.`var`.data.czev.conversion.RightAscensionHolder
import cz.astro.`var`.data.czev.repository.sesame.SesameResult
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.convert.ConversionService
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import java.io.StringReader
import java.math.BigDecimal
import java.util.*
import java.util.concurrent.CompletableFuture
import javax.xml.bind.JAXBContext
import javax.xml.bind.JAXBException
import javax.xml.bind.UnmarshalException
import kotlin.collections.HashMap

interface VariableStarInformationCoordinatesResolverService {
    fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): CompletableFuture<List<DistanceModel<VariableStarInformationModel>>>
    fun findNearest(coordinates: CosmicCoordinatesModel): CompletableFuture<Optional<DistanceModel<VariableStarInformationModel>>>
}

interface VariableStarInformationNameResolverService {
    fun findByName(name: String): CompletableFuture<Optional<VariableStarInformationModel>>
}

interface StarInformationResolverService {
    fun findByIdentifier(identifier: String): CompletableFuture<Optional<StarInformationModel>>
    fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): CompletableFuture<List<DistanceModel<StarInformationModel>>>
    fun findNearest(coordinates: CosmicCoordinatesModel): CompletableFuture<Optional<DistanceModel<StarInformationModel>>>
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

interface SesameVariableStarInformationResolverService : VariableStarInformationNameResolverService

interface VsxVariableStarInformationResolverService : VariableStarInformationCoordinatesResolverService, VariableStarInformationNameResolverService


interface TAPVizierService {
    fun query(query: String): CompletableFuture<TAPVizierResult>

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
class Ucac4StarInformationResolverServiceImpl(
        private val tapVizierService: TAPVizierService
) : Ucac4StarInformationResolverService {
    companion object {
        const val UCAC4_CAT = "\"I/322A/out\""
        const val QUERY_FIELDS = "$UCAC4_CAT.UCAC4, $UCAC4_CAT.RAJ2000, $UCAC4_CAT.DEJ2000, $UCAC4_CAT.Kmag, $UCAC4_CAT.Jmag, $UCAC4_CAT.Vmag"

        val IDENTIFIER_PATTERN = Regex("\\s*(UCAC4.*?)?(\\d{3}-\\d{6})\\s*")

        val logger = LoggerFactory.getLogger(Ucac4StarInformationResolverService::class.java)
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

    @Async
    override fun findByIdentifier(identifier: String): CompletableFuture<Optional<StarInformationModel>> {
        return selectIdentifier(identifier).map {
            val query = "SELECT TOP 1 $QUERY_FIELDS FROM $UCAC4_CAT WHERE $UCAC4_CAT.UCAC4 = '${it.replace("'", "''")}'"
            tapVizierService.query(query)
                    .thenApplyAsync { result ->
                        if (result.data.isNotEmpty() && result.data[0].size == 6) {
                            Optional.of(result.toSingleModel())
                        } else {
                            Optional.empty<StarInformationModel>()
                        }
                    }
        }.orElse(CompletableFuture.completedFuture(Optional.empty()))
    }

    @Async
    override fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): CompletableFuture<List<DistanceModel<StarInformationModel>>> {
        return findByCoordinates(coordinates, 10, radiusDegrees)
    }

    @Async
    override fun findNearest(coordinates: CosmicCoordinatesModel): CompletableFuture<Optional<DistanceModel<StarInformationModel>>> {
        return findByCoordinates(coordinates, 1, 1.0).thenApplyAsync {
            Optional.ofNullable(it.firstOrNull())
        }
    }

    private fun findByCoordinates(coordinates: CosmicCoordinatesModel, limit: Int, radiusDegrees: Double): CompletableFuture<List<DistanceModel<StarInformationModel>>> {
        logger.debug("Searching by coordinates in UCAC4 ra: {} dec: {} radius: {}", coordinates.ra, coordinates.dec, radiusDegrees)
        return tapVizierService.query(TAPVizierService.buildDistanceQuery(
                UCAC4_CAT, QUERY_FIELDS, coordinates, radiusDegrees, limit
        )).thenApplyAsync {
            logger.debug("UCAC4 coords search finished")
            it.toDistanceModels()
        }
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

    private fun TAPVizierResult.toSingleModel(): StarInformationModel {
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
        throw IllegalArgumentException("Incorrect data")
    }
}

@Component
class SesameVariableStarInformationResolverServiceImpl(
        private val conversionService: ConversionService
) : SesameVariableStarInformationResolverService {

    companion object {
        val logger = LoggerFactory.getLogger(SesameVariableStarInformationResolverService::class.java)
    }

    @Async
    override fun findByName(name: String): CompletableFuture<Optional<VariableStarInformationModel>> {
        logger.debug("Start sesame query for '{}'", name)
        return WebClient.create().get()
                .uri {
                    it.scheme("http")
                            .host("cdsweb.u-strasbg.fr")
                            .path("cgi-bin/nph-sesame/-oxpI/S")
                            .queryParam(name, *emptyArray())
                            .build()
                }
                .retrieve().bodyToMono(String::class.java)
                .toFuture()
                .thenApplyAsync { rawResult ->
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
                    result
                }
//                .filter { it.targets != null && it.targets.isNotEmpty() && it.targets.first().resolvers != null && it.targets.first().resolvers.isNotEmpty() }
                .thenApplyAsync {
                    if (it.targets != null && it.targets.isNotEmpty() && it.targets.first().resolvers != null && it.targets.first().resolvers.isNotEmpty()) {
                        val resolver = it.targets.first().resolvers.first()
                        var coordinates: CosmicCoordinatesModel? = null
                        if (!resolver.raDegrees.isNullOrBlank() && !resolver.decDegrees.isNullOrBlank()) {
                            coordinates = CosmicCoordinatesModel(resolver.raDegrees.toBigDecimal(), resolver.decDegrees.toBigDecimal())
                        } else if (!resolver.coordinates.isNullOrBlank()) {
                            val coordsSplit = resolver.coordinates.split(" ")
                            if (coordsSplit.size == 2) {
                                val ra = conversionService.convert(coordsSplit[0], RightAscensionHolder::class.java)
                                val dec = conversionService.convert(coordsSplit[1], DeclinationHolder::class.java)
                                if (ra != null && dec != null) {
                                    coordinates = CosmicCoordinatesModel(ra.value, dec.value)
                                }
                            }

                        }
                        logger.debug("Finished querying for '{}'", name)
                        Optional.of(VariableStarInformationModel(
                                coordinates,
                                resolver.originalName,
                                resolver.aliases.toSet(),
                                resolver.type,
                                null, null, null
                        ))
                    } else {
                        Optional.empty<VariableStarInformationModel>()
                    }
                }
    }
}

@Component
class VsxVariableStarInformationResolverServiceImpl(
        private val tapVizierService: TAPVizierService
) : VsxVariableStarInformationResolverService {

    companion object {
        const val VSX_CAT: String = "\"B/vsx/vsx\""
        const val QUERY_FIELDS: String = "$VSX_CAT.OID,  $VSX_CAT.Name,  $VSX_CAT.Type, $VSX_CAT.Epoch, $VSX_CAT.Period, $VSX_CAT.RAJ2000,  $VSX_CAT.DEJ2000"
        val logger = LoggerFactory.getLogger(VsxVariableStarInformationResolverService::class.java)
    }

    @Async
    override fun findByName(name: String): CompletableFuture<Optional<VariableStarInformationModel>> {
        val query = "SELECT TOP 1 $QUERY_FIELDS FROM $VSX_CAT WHERE $VSX_CAT.Name = '${name.replace("'", "''")}'"
        logger.debug("Start vsx query for '{}'", name)
        return tapVizierService.query(query)
                .thenApplyAsync {
                    if (it.data.isNotEmpty() && it.data[0].size == 7) {
                        Optional.of(it.toSingleModel(0))
                    } else {
                        Optional.empty<VariableStarInformationModel>()
                    }
                }
    }


    @Async
    override fun findByCoordinates(coordinates: CosmicCoordinatesModel, radiusDegrees: Double): CompletableFuture<List<DistanceModel<VariableStarInformationModel>>> {
        return findByCoordinates(coordinates, 10, radiusDegrees)
    }

    private fun findByCoordinates(coordinates: CosmicCoordinatesModel, limit: Int, radiusDegrees: Double): CompletableFuture<List<DistanceModel<VariableStarInformationModel>>> {
        logger.debug("Searching by coordinates in vsx ra: {} dec: {} radius: {}", coordinates.ra, coordinates.dec, radiusDegrees)
        return tapVizierService.query(TAPVizierService.buildDistanceQuery(
                VSX_CAT, QUERY_FIELDS, coordinates, radiusDegrees, limit
        )).thenApplyAsync {
            logger.debug("VSX coords search finished")
            it.toDistanceModels()
        }
    }


    @Async
    override fun findNearest(coordinates: CosmicCoordinatesModel): CompletableFuture<Optional<DistanceModel<VariableStarInformationModel>>> {
        return findByCoordinates(coordinates, 1, 1.0).thenApplyAsync { Optional.ofNullable(it.firstOrNull()) }
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

    private fun TAPVizierResult.toSingleModel(index: Int): VariableStarInformationModel {
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
        throw IllegalArgumentException("Wrong data")
    }
}

@Component
class TAPVizierServiceImpl : TAPVizierService {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(TAPVizierServiceImpl::class.java)
    }

    @Async
    override fun query(query: String): CompletableFuture<TAPVizierResult> {
        logger.debug(query)
        val webClient = WebClient.create()
        return webClient.get()
                .uri {
                    it.scheme("http")
                            .host("tapvizier.u-strasbg.fr")
                            .path("TAPVizieR/tap/sync")
                            .queryParam("request", "doQuery")
                            .queryParam("lang", "adql")
                            .queryParam("format", "json")
                            .queryParam("query", query)
                            .build()
                }
                .retrieve().bodyToMono(TAPVizierResult::class.java).toFuture()
    }
}
