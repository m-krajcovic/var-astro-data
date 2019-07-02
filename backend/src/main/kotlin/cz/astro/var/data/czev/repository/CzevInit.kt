package cz.astro.`var`.data.czev.repository

import cz.astro.`var`.data.czev.service.ConstellationServiceImpl
import cz.astro.`var`.data.czev.service.CosmicCoordinatesModel
import cz.astro.`var`.data.czev.service.StarTypeValidator
import cz.astro.`var`.data.czev.service.StarTypeValidatorImpl
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVParser
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.File
import java.io.FileReader
import java.math.BigDecimal
import java.util.*

@Service
class CzevInit(val czevStarRepository: CzevStarRepository,
               val filterBandRepository: FilterBandRepository,
               val starTypeRepository: StarTypeRepository,
               val userRepository: UserRepository,
               val observerRepository: StarObserverRepository,
               val constellationRepository: ConstellationRepository,
               val roleRepository: RoleRepository,

               val constellationService: ConstellationServiceImpl
               ) {

    private lateinit var constellationsMap: Map<String, Constellation>
    private lateinit var observersMap: Map<String, StarObserver>
    private lateinit var user: User
    private lateinit var bandsMap: Map<String, FilterBand>
    private lateinit var typesMap: Map<String, StarType>

    private lateinit var typesValidator: StarTypeValidator

    @Transactional
    fun initialize() {
        user = getUsers()
        var constellations = getConstellations()
        var bands = getFilterBands()
        var types = getTypes()
        var observers = getObservers()
        var roles = getRoles()

        roles = roleRepository.saveAll(roles)
        user.roles = HashSet(roles)
        user = userRepository.save(user)

        observers = observerRepository.saveAll(observers)
        observersMap = observers.toMap { it.abbreviation }
        constellations = constellationRepository.saveAll(constellations)
        constellationsMap = constellations.toMap { it.abbreviation }
        bands = filterBandRepository.saveAll(bands)
        bandsMap = bands.toMap { it.name }
        types = starTypeRepository.saveAll(types)
        typesMap = types.toMap { it.name }

        typesValidator = StarTypeValidatorImpl(types.map { it.name }.toSet())
        var stars = getStars()
        czevStarRepository.saveAll(stars)
    }

    private fun getRoles(): List<Role> {
        return listOf(Role("ROLE_ADMIN"), Role("ROLE_USER"))
    }

    @Transactional
    fun test() {
//        var one = czevStarRepository.findAll().first()
//
//        one.privateNote = "ahoj"
//        one.publicNote = "ahoj"
//
//        czevStarRepository.saveAndFlush(one)
//
//        one.publicNote = "fedor!"
//        czevStarRepository.saveAndFlush(one)




    }

    fun getStars(): List<CzevStar> {
        val output = ArrayList<CzevStar>()
        output.addAll(Arrays.asList(
                getStar("1", "UCAC4 537-046686", "FF Cnc", "08 29 39.312", "+17 17 00.58", "Cnc", "EA", "10.77", "9.384", "0.531", "0.57", "C", "2452500.939", "1.469331", "PeP", "1993"),
                getStar("2", "UCAC4 797-019460", "ES UMa", "09 54 28.620", "+69 13 22.28", "UMa", "EW", "11", "10.194", "0.251", "0.39", "V", "2454829.6982", "0.528847", "KaH, JK", "1993"),
                getStar("3", "UCAC4 655-102227", "", "21 36 09.916", "+40 52 39.07", "Cyg", "", "10.7", "7.978", "0.936", "", "", "", "", "MZ", "1998"),
                getStar("4", "UCAC4 638-091827", "V2240 Cyg", "20 15 55.943", "+37 27 15.53", "Cyg", "EW", "11.94", "11.185", "0.236", "", "", "2456518.9723", "0.404161", "JS", "1999"),
                getStar("5", "UCAC4 638-091516", "V2239 Cyg", "20 15 17.569", "+37 31 43.92", "Cyg", "EA", "11.95", "10.845", "0.318", "", "", "2451427.4063", "0.610595", "JS", "1999"),
                getStar("6", "UCAC4 450-086568", "", "18 55 45.481", "-00 00 44.33", "Aql", "", "11.97", "9.698", "0.387", "", "", "", "", "MZ", "1999"),
                getStar("7", "UCAC4 629-008536", "V0680 Per", "02 41 41.016", "+35 42 54.87", "Per", "EW", "13.58", "12.591", "0.293", "0.58", "C", "2452996.6731", "0.373973", "MZ", "2000"),
                getStar("8", "UCAC4 504-106930", "", "19 31 30.415", "+10 47 08.69", "Aql", "", "12.32", "11.278", "0.356", "", "", "", "", "MZ", "2000"),
                getStar("9", "UCAC4 511-104980", "", "19 35 42.319", "+12 04 32.49", "Aql", "", "16.18", "7.513", "1.503", "", "", "", "", "MZ", "2000"),
                getStar("10", "UCAC4 545-132078", "", "20 41 29.487", "+18 54 41.56", "Del", "", "", "13.257", "0.746", "", "", "", "", "MZ", "2000"),
                getStar("11", "UCAC4 652-014187", "", "03 21 40.199", "+40 18 29.19", "Per", "", "15.8", "14.449", "0.472", "", "", "", "", "MZ", "2000"),
                getStar("12", "UCAC4 646-088726", "V2422 Cyg", "20 16 58.829", "+39 05 23.88", "Cyg", "EB", "13.26", "12.05", "0.29", "0.55", "V", "2452122.459", "0.506166", "KK,PH,DM", "2000"),
                getStar("13", "UCAC4 607-106328", "V2546 Cyg", "20 28 04.912", "+31 17 09.72", "Cyg", "EW", "10.96", "10.637", "0.172", "0.56", "R", "2451358.748", "0.62279", "MZ", "2003"),
                getStar("14", "UCAC4 726-104478", "V1188 Cas", "23 29 42.222", "+55 03 47.15", "Cas", "EW", "15.21", "14.047", "0.327", "0.5", "V", "2452859.3088", "0.662505", "KK, PH, DM", "2003"),
                getStar("15", "UCAC4 661-000894", "V0469 And", "00 11 22.047", "+42 05 39.04", "And", "EW", "", "14.162", "0.481", "0.8", "R", "2452859.5092", "0.328177", "KK, PH, DM", "2003"),
                getStar("16", "UCAC4 712-113372", "V1186 Cas", "23 27 02.360", "+52 14 47.51", "Cas", "EW:", "13.11", "12.113", "0.203", "0.3", "V", "2452857.4245", "0.6152", "KK, PH, DM", "2003"),
                getStar("17", "UCAC4 576-123244", "V0516 Vul", "21 30 09.220", "+25 10 42.45", "Vul", "EW", "", "12.663", "0.4", "0.6", "R", "", "", "KK, PH, DM", "2003"),
                getStar("18", "UCAC4 748-081665", "V1184 Cas", "23 03 49.476", "+59 30 03.61", "Cas", "EW", "14.89", "12.985", "0.546", "0.2", "R", "2452879.449", "0.577032", "KK, PH, DM", "2003"),
                getStar("19", "UCAC4 555-066517", "V1107 Her", "18 14 23.135", "+20 54 28.35", "Her", "SR", "15.37", "8.057", "1.325", "", "", "2452116", "95.8", "OP", "2002"),
                getStar("20", "UCAC4 533-087594", "V1684 Aql", "19 03 33.398", "+16 31 19.54", "Aql", "SRB", "12.73", "5.158", "1.157", "1.1", "V", "2454388", "110.3", "OP", "2003"),
                getStar("21", "USNO-B1.0 0921-0514273", "Pej 003", "19 01 39.333", "+02 06 43.91", "Aql", "SR", "", "7.572", "2.256", "", "", "", "", "OP", "2003"),
                getStar("22", "UCAC4 465-091770", "Pej 004", "19 11 00.675", "+02 52 41.98", "Aql", "", "11.75", "9.948", "0.362", "0.2", "V", "", "", "OP", "2003"),
                getStar("23", "UCAC4 465-091730", "Pej 005", "19 10 57.705", "+02 52 08.93", "Aql", "SR", "", "7.009", "1.744", "0.7", "Rc", "", "", "OP", "2003"),
                getStar("24", "UCAC4 435-088535", "Pej 006", "19 04 01.207", "-03 05 11.94", "Aql", "SR", "14.84", "6.133", "1.747", "1.8", "V", "", "132.2", "OP", "2003"),
                getStar("25", "UCAC4 435-088109", "Pej 007", "19 03 27.810", "-03 01 43.30", "Aql", "M:", "", "11.15", "1.621", "1", "Ic", "", "", "OP", "2003"),
                getStar("26", "UCAC4 417-097364", "Pej 008", "18 48 31.092", "-06 42 49.48", "Sct", "SR", "13.53", "6.948", "1.438", "0.4", "V", "", "", "OP", "2003"),
                getStar("27", "UCAC4 417-097082", "Pej 009", "18 48 22.526", "-06 43 12.43", "Sct", "SR", "", "8.41", "1.525", "0.7", "Rc", "", "", "OP", "2003"),
                getStar("28", "UCAC4 417-096910", "Pej 010", "18 48 16.430", "-06 40 03.60", "Sct", "SR", "14.45", "8.283", "1.488", "0.6", "Rc", "", "", "OP", "2003"),
                getStar("29", "USNO-B1.0 0853-0436795", "Pej 011", "18 54 04.135", "-04 38 32.46", "Sct", "SR", "", "8.988", "1.685", "", "", "", "", "OP", "2003")
        ))
        return output
    }

    fun getStar(czev: String, crossId: String, vsxName: String, ra: String, dec: String, cons: String, type: String, v: String, j: String, jk: String, amp: String, band: String, m0: String, per: String, disc: String, year: String): CzevStar {
        val crossIdentifications = getCrossIds(crossId)
        val jMag = j.toDoubleOrNull()
        var kMag: Double? = null
        if (jMag != null) {
            val jkVal = jk.toDoubleOrNull()
            if (jkVal != null) {
                kMag = jMag - jkVal
            }
        }
        val czevStar = CzevStar(
                m0.toBigDecimalOrNull(),
                per.toBigDecimalOrNull(),
                .0, .0,
                "", "",
                getConstellation(cons), type, getBand(band), getDiscoverers(disc), CosmicCoordinates(ra, dec), year.toInt(), mutableSetOf(), null, vsxName, v.toDoubleOrNull(), jMag, kMag, amp.toDoubleOrNull(), user
        )
        czevStar.czevId = czev.toLong()
        czevStar.crossIdentifications = crossIdentifications
        czevStar.typeValid = typesValidator.validate(type)

        return czevStar
    }

    fun getCrossIds(crossId: String): MutableSet<StarIdentification> {
        return hashSetOf(StarIdentification(crossId, null, 0))
    }

    fun getDiscoverers(key: String): MutableSet<StarObserver> {
        val output = HashSet<StarObserver>()
        key.split(",").forEach {
            val starObserver = observersMap[it.trim()]
            if (starObserver != null) {
                output.add(starObserver)
            } else {
                println("ERROR OBSERVER $it")
            }
        }
        return output
    }

    fun getBand(key: String): FilterBand? {
        return bandsMap[key]
    }

    fun getConstellation(key: String): Constellation {
        return constellationsMap.getValue(key)
    }

    fun getUsers(): User {
        // password = "heslo"
        val user = User("mich.krajcovic@gmail.com", "\$2a\$10\$SL18Zb8wOtLMJx1oaFzhxuUve2poa3POHCvytccdZi4FA.9PVQrn2", mutableSetOf(Role("ROLE_ADMIN"), Role("ROLE_USER")))
        return user
    }

    fun getFilterBands(): List<FilterBand> {
        val output = ArrayList<FilterBand>()
        output.add(FilterBand("C"))
        output.add(FilterBand("V"))
        output.add(FilterBand("R"))
        output.add(FilterBand("Rc"))
        output.add(FilterBand("Ic"))
        output.add(FilterBand("p"))
        output.add(FilterBand("B"))
        return output
    }

    fun getObservers(): List<StarObserver> {
        val output = ArrayList<StarObserver>()
        output.add(StarObserver("Reinhold F.", "Auer", "RFA", "auer.reinhold@gmail.com"))
        output.add(StarObserver("Martin", "Mašek", "MM", "cassi@astronomie.cz"))
        output.add(StarObserver("František", "Bílek", "FB", "frantabilek@gmail.com"))
        output.add(StarObserver("David", "Motl", "DM", "dmotl@volny.cz"))
        output.add(StarObserver("Michal", "Bílek", "MiB", "michal.bilek@asu.cas.cz"))
        output.add(StarObserver("Milada", "Moudrá", "MiM", "moudra@fzu.cz"))
        output.add(StarObserver("Jan", "Beránek", "JB", ""))
        output.add(StarObserver("Petr", "Mrňák", "PM", "mrnak.petr@email.cz"))
        output.add(StarObserver("Fabián", "Bodnár", "FaB", "fabian.bodnar@seznam.cz"))
        output.add(StarObserver("Denis", "Műller", "DeM", "topkvark@seznam.cz"))
        output.add(StarObserver("Luboš", "Brát", "LB", "brat@pod.snezkou.cz"))
        output.add(StarObserver("Filip", "Novotný", "FN", "fildanovo@gmail.com"))
        output.add(StarObserver("Miroslav", "Brož", "MB", "mira@sirrah.troja.mff.cuni.cz"))
        output.add(StarObserver("Kateřina", "Onderková", "KO", "katka.onderkova@centrum.cz"))
        output.add(StarObserver("Pavel", "Cagaš", "PC", "pavel.cagas@gmail.com"))
        output.add(StarObserver("Martin", "Oršulák", "MO", "martas.orsulak@gmail.com"))
        output.add(StarObserver("Petr", "Cagaš", "PeC", "pcagas@vt.edu"))
        output.add(StarObserver("Václav", "Přibík", "VP", "vaclav.pribik@gmail.com"))
        output.add(StarObserver("Hedvika", "Čapková", "HC", "hedvika.capkova@gmail.com"))
        output.add(StarObserver("Ondřej", "Pejcha", "OP", "pejcha@astro.princeton.edu"))
        output.add(StarObserver("Ladislav", "Červinka", "LC", "mail@ladislavcervinka.cz"))
        output.add(StarObserver("Michal", "Pintr", "MP", "M.Pirati@seznam.cz"))
        output.add(StarObserver("Radek", "Dřevěný", "RD", "radek.dreveny@volny.cz"))
        output.add(StarObserver("Pavel", "Pintr", "PP", "pintr@ipp.cas.cz"))
        output.add(StarObserver("Roman", "Ehrenberger", "RE", "ehrenbergerr@opp.cz"))
        output.add(StarObserver("Jiří", "Polák", "JiP", "jiri.polak@centrum.cz"))
        output.add(StarObserver("Adam", "Greš", "AG", "adam.gres1@gmail.com"))
        output.add(StarObserver("Jan", "Polster", "JP", "jpolster@email.cz"))
        output.add(StarObserver("Petr", "Hájek", "PH", "hv.hajek@seznam.cz"))
        output.add(StarObserver("Petr", "Pravec", "PeP", "petr.pravec@asu.cas.cz"))
        output.add(StarObserver("Dalibor", "Hanžl", "DH", "hanzl@sci.muni.cz"))
        output.add(StarObserver("Jaroslava", "Secká", "JaS", "451559@mail.muni.cz"))
        output.add(StarObserver("Bohuslav", "Hladík", "BH", "bohuslav.hladik@email.cz"))
        output.add(StarObserver("Miroslav", "Smolka", "MS", "miroslav.smolka@gmail.com"))
        output.add(StarObserver("Kateřina", "Hoňková", "KH", "katerina.honkova@astronomie.cz"))
        output.add(StarObserver("Petr", "Sobotka", "PeS", "sobotka@astro.cz"))
        output.add(StarObserver("Kamil", "Hornoch", "KaH", "k.hornoch@centrum.cz"))
        output.add(StarObserver("Petr", "Svoboda", "PS", "tribase.net@volny.cz"))
        output.add(StarObserver("Jan", "Janík", "JaJ", "honza@physics.muni.cz"))
        output.add(StarObserver("Jan", "Šafář", "JS", "jan@livephotography.net"))
        output.add(StarObserver("Martin", "Jelínek", "MJ", "mates@asu.cas.cz"))
        output.add(StarObserver("Pavel", "Šebela", "PaS", "pavel.seb@centrum.cz"))
        output.add(StarObserver("Anna", "Juráňová", "AJ", "juranova@physics.muni.cz"))
        output.add(StarObserver("Ladislav", "Šmelcer", "LS", "lsmelcer@astrovm.cz"))
        output.add(StarObserver("Jakub", "Juryšek", "JJ", "jurysek@fzu.cz"))
        output.add(StarObserver("Lukáš", "Timko", "LT", "timkolukas@seznam.cz"))
        output.add(StarObserver("Radek", "Kocián", "RK", "koca@astronomie.cz"))
        output.add(StarObserver("Jaroslav", "Trnka", "JT", "hvezdarna@volny.cz"))
        output.add(StarObserver("Karel", "Koss", "KK", "karel.koss@tiscali.cz"))
        output.add(StarObserver("Kamila", "Truparová", "KT", "kamila.truparova@vsb.cz"))
        output.add(StarObserver("Hana", "Kučáková", "HK", "Hana.Kucakova@centrum.cz"))
        output.add(StarObserver("Martin", "Tylšar", "MT", "mtylsar@astronomie.cz"))
        output.add(StarObserver("Jan", "Kyselý", "JK", "kysely@ufa.cas.cz"))
        output.add(StarObserver("Filip", "Walter", "FW", "edmund.squirrel@seznam.cz"))
        output.add(StarObserver("Martin", "Lehký", "ML", "makalaki@astro.sci.muni.cz"))
        output.add(StarObserver("Petr", "Zasche", "PZ", "zasche@sirrah.troja.mff.cuni.cz"))
        output.add(StarObserver("Jiří", "Liška", "JL", "jiriliska@post.cz"))
        output.add(StarObserver("Miloslav", "Zejda", "MZ", "zejda@physics.muni.cz"))
        output.add(StarObserver("František", "Lomoz", "FL", "hvezdarna@tiscali.cz"))
        output.add(StarObserver("Eva", "Žampachová", "EZ", "eva.zampachova@seznam.cz"))
        return output
    }

    fun getTypes(): List<StarType> {
        val output = ArrayList<StarType>()
        output.add(StarType("SN IIb"))
        output.add(StarType("SN IIa"))
        output.add(StarType("RRC"))
        output.add(StarType("SN IId"))
        output.add(StarType("RRD"))
        output.add(StarType("LMXB"))
        output.add(StarType("UGZ"))
        output.add(StarType("INSA"))
        output.add(StarType("INSB"))
        output.add(StarType("SN II-L"))
        output.add(StarType("cPNB[e]"))
        output.add(StarType("PVTELIII"))
        output.add(StarType("*"))
        output.add(StarType("AM"))
        output.add(StarType("SN II-P"))
        output.add(StarType("CEP"))
        output.add(StarType("GCAS"))
        output.add(StarType("RCB"))
        output.add(StarType("AR"))
        output.add(StarType("WTTS"))
        output.add(StarType("INAT"))
        output.add(StarType("RR"))
        output.add(StarType("RS"))
        output.add(StarType("BE"))
        output.add(StarType("D"))
        output.add(StarType("RV"))
        output.add(StarType("E"))
        output.add(StarType("RRAB"))
        output.add(StarType("I"))
        output.add(StarType("BL"))
        output.add(StarType("K"))
        output.add(StarType("CWA"))
        output.add(StarType("L"))
        output.add(StarType("M"))
        output.add(StarType("N"))
        output.add(StarType("CWB"))
        output.add(StarType("PPN"))
        output.add(StarType("(B)"))
        output.add(StarType("O"))
        output.add(StarType("SD"))
        output.add(StarType("R"))
        output.add(StarType("ACEP"))
        output.add(StarType("UGSU"))
        output.add(StarType("S"))
        output.add(StarType("WTTS/ROT"))
        output.add(StarType("UGSS"))
        output.add(StarType("ISA"))
        output.add(StarType("V"))
        output.add(StarType("BY"))
        output.add(StarType("X"))
        output.add(StarType("ISB"))
        output.add(StarType("SN"))
        output.add(StarType("XPR"))
        output.add(StarType("Transient"))
        output.add(StarType("SR"))
        output.add(StarType("INST"))
        output.add(StarType("PULS"))
        output.add(StarType("DIP"))
        output.add(StarType("QSO"))
        output.add(StarType("SXPHE"))
        output.add(StarType("Microlens"))
        output.add(StarType("CV"))
        output.add(StarType("ACV"))
        output.add(StarType("CW"))
        output.add(StarType("YSO"))
        output.add(StarType("RVA"))
        output.add(StarType("RVB"))
        output.add(StarType("ELL"))
        output.add(StarType("AHB1"))
        output.add(StarType("DM"))
        output.add(StarType("DQ"))
        output.add(StarType("HMXB"))
        output.add(StarType("DS"))
        output.add(StarType("UG"))
        output.add(StarType("DW"))
        output.add(StarType("UGER"))
        output.add(StarType("EA"))
        output.add(StarType("EB"))
        output.add(StarType("EC"))
        output.add(StarType("ED"))
        output.add(StarType("SN-pec"))
        output.add(StarType("CTTS/ROT"))
        output.add(StarType("UV"))
        output.add(StarType("EL"))
        output.add(StarType("XBR"))
        output.add(StarType("EP"))
        output.add(StarType("PSR"))
        output.add(StarType("ACYG"))
        output.add(StarType("CTTS"))
        output.add(StarType("EW"))
        output.add(StarType("BCEP"))
        output.add(StarType("GRB"))
        output.add(StarType("SIN"))
        output.add(StarType("PVTEL"))
        output.add(StarType("FF"))
        output.add(StarType("VY"))
        output.add(StarType("MISC"))
        output.add(StarType("WD"))
        output.add(StarType("UGWZ"))
        output.add(StarType("FUOR"))
        output.add(StarType("V838MON"))
        output.add(StarType("DSCTr"))
        output.add(StarType("NL/VY"))
        output.add(StarType("WR"))
        output.add(StarType("CBSS"))
        output.add(StarType("BCEPS"))
        output.add(StarType("DSCTC"))
        output.add(StarType("AGN"))
        output.add(StarType("XB"))
        output.add(StarType("GS"))
        output.add(StarType("TTS/ROT"))
        output.add(StarType("XJ"))
        output.add(StarType("XN"))
        output.add(StarType("XP"))
        output.add(StarType("HB"))
        output.add(StarType("PER"))
        output.add(StarType("ZZA"))
        output.add(StarType("APER"))
        output.add(StarType("ZZB"))
        output.add(StarType("SN Iax"))
        output.add(StarType("VAR"))
        output.add(StarType("DWLYN"))
        output.add(StarType("SXARI"))
        output.add(StarType("ZZO"))
        output.add(StarType("HW"))
        output.add(StarType("CW-FU"))
        output.add(StarType("IA"))
        output.add(StarType("IB"))
        output.add(StarType("VBD"))
        output.add(StarType("CW-FO"))
        output.add(StarType("V1093HER"))
        output.add(StarType("BLLAC"))
        output.add(StarType("NSIN ELL"))
        output.add(StarType("IN"))
        output.add(StarType("IS"))
        output.add(StarType("IMXB"))
        output.add(StarType("ZAND"))
        output.add(StarType("ZZ"))
        output.add(StarType("SXPHE(B)"))
        output.add(StarType("DPV"))
        output.add(StarType("FSCMa"))
        output.add(StarType("SN Ic-BL"))
        output.add(StarType("LERI"))
        output.add(StarType("LPV"))
        output.add(StarType("ESD"))
        output.add(StarType("V361HYA"))
        output.add(StarType("KE"))
        output.add(StarType("CBSS/V"))
        output.add(StarType("BXCIR"))
        output.add(StarType("DSCT"))
        output.add(StarType("DCEP-FO"))
        output.add(StarType("GWLIB"))
        output.add(StarType("PVTELII"))
        output.add(StarType("HADS"))
        output.add(StarType("KW"))
        output.add(StarType("non-cv"))
        output.add(StarType("DCEP"))
        output.add(StarType("LB"))
        output.add(StarType("LC"))
        output.add(StarType("roAp"))
        output.add(StarType("roAm"))
        output.add(StarType("DCEP-FU"))
        output.add(StarType("FKCOM"))
        output.add(StarType("SPB"))
        output.add(StarType("IBWD"))
        output.add(StarType("NSIN"))
        output.add(StarType("HADS(B)"))
        output.add(StarType("GDOR"))
        output.add(StarType("SN Ia"))
        output.add(StarType("ZZLep"))
        output.add(StarType("SN Ic"))
        output.add(StarType("SN Ib"))
        output.add(StarType("DYPer"))
        output.add(StarType("BHXB"))
        output.add(StarType("SN II"))
        output.add(StarType("NA"))
        output.add(StarType("NB"))
        output.add(StarType("NC"))
        output.add(StarType("ROT"))
        output.add(StarType("ZZ/GWLIB"))
        output.add(StarType("INB"))
        output.add(StarType("INA"))
        output.add(StarType("NL"))
        output.add(StarType("SRB"))
        output.add(StarType("SRA"))
        output.add(StarType("SRD"))
        output.add(StarType("NR"))
        output.add(StarType("SRC"))
        output.add(StarType("DCEP(B)"))
        output.add(StarType("UVN"))
        output.add(StarType("INT"))
        output.add(StarType("INS"))
        output.add(StarType("PVTELI"))
        output.add(StarType("SDOR"))
        output.add(StarType("TTS"))
        output.add(StarType("SRS"))
        output.add(StarType("DCEPS(B)"))
        output.add(StarType("ZZA/O"))
        output.add(StarType("UXOR"))
        output.add(StarType("SN I"))
        output.add(StarType("CST"))
        output.add(StarType("BLAP"))
        output.add(StarType("(YY)"))
        output.add(StarType("DCEPS"))
        output.add(StarType("SN IIn"))
        output.add(StarType("EXOR"))
        output.add(StarType("PN"))
        return output
    }

    fun getConstellations(): List<Constellation> {
        val output = ArrayList<Constellation>()
        output.add(Constellation("Andromeda", "And"))
        output.add(Constellation("Antlia", "Ant"))
        output.add(Constellation("Apus", "Aps"))
        output.add(Constellation("Aquarius", "Aqr"))
        output.add(Constellation("Aquila", "Aql"))
        output.add(Constellation("Ara", "Ara"))
        output.add(Constellation("Aries", "Ari"))
        output.add(Constellation("Auriga", "Aur"))
        output.add(Constellation("Boötes", "Boo"))
        output.add(Constellation("Caelum", "Cae"))
        output.add(Constellation("Camelopardalis", "Cam"))
        output.add(Constellation("Cancer", "Cnc"))
        output.add(Constellation("Canes Venatici", "CVn"))
        output.add(Constellation("Canis Major", "CMa"))
        output.add(Constellation("Canis Minor", "CMi"))
        output.add(Constellation("Capricornus", "Cap"))
        output.add(Constellation("Carina", "Car"))
        output.add(Constellation("Cassiopeia", "Cas"))
        output.add(Constellation("Centaurus", "Cen"))
        output.add(Constellation("Cepheus", "Cep"))
        output.add(Constellation("Cetus", "Cet"))
        output.add(Constellation("Chamaeleon", "Cha"))
        output.add(Constellation("Circinus", "Cir"))
        output.add(Constellation("Columba", "Col"))
        output.add(Constellation("Coma Berenices", "Com"))
        output.add(Constellation("Corona Australis", "CrA"))
        output.add(Constellation("Corona Borealis", "CrB"))
        output.add(Constellation("Corvus", "Crv"))
        output.add(Constellation("Crater", "Crt"))
        output.add(Constellation("Crux", "Cru"))
        output.add(Constellation("Cygnus", "Cyg"))
        output.add(Constellation("Delphinus", "Del"))
        output.add(Constellation("Dorado", "Dor"))
        output.add(Constellation("Draco", "Dra"))
        output.add(Constellation("Equuleus", "Equ"))
        output.add(Constellation("Eridanus", "Eri"))
        output.add(Constellation("Fornax", "For"))
        output.add(Constellation("Gemini", "Gem"))
        output.add(Constellation("Grus", "Gru"))
        output.add(Constellation("Hercules", "Her"))
        output.add(Constellation("Horologium", "Hor"))
        output.add(Constellation("Hydra", "Hya"))
        output.add(Constellation("Hydrus", "Hyi"))
        output.add(Constellation("Indus", "Ind"))
        output.add(Constellation("Lacerta", "Lac"))
        output.add(Constellation("Leo", "Leo"))
        output.add(Constellation("Leo Minor", "LMi"))
        output.add(Constellation("Lepus", "Lep"))
        output.add(Constellation("Libra", "Lib"))
        output.add(Constellation("Lupus", "Lup"))
        output.add(Constellation("Lynx", "Lyn"))
        output.add(Constellation("Lyra", "Lyr"))
        output.add(Constellation("Mensa", "Men"))
        output.add(Constellation("Microscopium", "Mic"))
        output.add(Constellation("Monoceros", "Mon"))
        output.add(Constellation("Musca", "Mus"))
        output.add(Constellation("Norma", "Nor"))
        output.add(Constellation("Octans", "Oct"))
        output.add(Constellation("Ophiuchus", "Oph"))
        output.add(Constellation("Orion", "Ori"))
        output.add(Constellation("Pavo", "Pav"))
        output.add(Constellation("Pegasus", "Peg"))
        output.add(Constellation("Perseus", "Per"))
        output.add(Constellation("Phoenix", "Phe"))
        output.add(Constellation("Pictor", "Pic"))
        output.add(Constellation("Pisces", "Psc"))
        output.add(Constellation("Piscis Austrinus", "PsA"))
        output.add(Constellation("Puppis", "Pup"))
        output.add(Constellation("Pyxis", "Pyx"))
        output.add(Constellation("Reticulum", "Ret"))
        output.add(Constellation("Sagitta", "Sge"))
        output.add(Constellation("Sagittarius", "Sgr"))
        output.add(Constellation("Scorpius", "Sco"))
        output.add(Constellation("Sculptor", "Scl"))
        output.add(Constellation("Scutum", "Sct"))
        output.add(Constellation("Serpens", "Ser"))
        output.add(Constellation("Sextans", "Sex"))
        output.add(Constellation("Taurus", "Tau"))
        output.add(Constellation("Telescopium", "Tel"))
        output.add(Constellation("Triangulum", "Tri"))
        output.add(Constellation("Triangulum Australe", "TrA"))
        output.add(Constellation("Tucana", "Tuc"))
        output.add(Constellation("Ursa Major", "UMa"))
        output.add(Constellation("Ursa Minor", "UMi"))
        output.add(Constellation("Vela", "Vel"))
        output.add(Constellation("Virgo", "Vir"))
        output.add(Constellation("Volans", "Vol"))
        output.add(Constellation("Vulpecula", "Vul"))

        val constsByName = output.toMap { it.abbreviation.toUpperCase() }
        CzevInitData().getConstBoundaries().forEach {
            constsByName[it.first]?.let { cnst ->
                val bound = ConstellationBoundaryPoint(cnst.bounds.size, it.second)
                bound.constellation = cnst
                cnst.bounds.add(bound)
            }
        }

        return output
    }
}

fun <T> List<T>.toMap(keyMapper: (T) -> String): Map<String, T> {
    val output = HashMap<String, T>()
    this.forEach {
        output[keyMapper(it)] = it
    }
    return output
}

class CzevInitData {
    fun getConstBoundaries(): List<Pair<String, CosmicCoordinates>> {
        val result = ArrayList<Pair<String, CosmicCoordinates>>()
        CSVParser(FileReader(File("constellation_boundaries.csv")), CSVFormat.DEFAULT).use {
            for (csvRecord in it) {
                result.add(Pair(csvRecord[2], CosmicCoordinates(BigDecimal(csvRecord[0]) * BigDecimal("15"), BigDecimal(csvRecord[1]))))
            }
        }
        return result
    }
}
