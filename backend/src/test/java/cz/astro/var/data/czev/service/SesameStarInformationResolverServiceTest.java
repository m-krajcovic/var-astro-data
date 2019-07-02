package cz.astro.var.data.czev.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;

import java.math.BigDecimal;
import java.util.concurrent.ExecutionException;

import static cz.astro.var.data.czev.HelperKt.JD_MINUTE;
import static cz.astro.var.data.czev.HelperKt.getSunCoordinates;

@RunWith(SpringRunner.class)
public class SesameStarInformationResolverServiceTest {

//    @Autowired
//    private ConstellationService constellationService = new ConstellationServiceImpl();
//    @Autowired
//    private SesameStarInformationNameResolverService sesameService;
//
//    @Test
//    public void findByName() {
//        Optional<VariableStarInformationModel> sesameResult = sesameService.findByName("RW Com");
//        assertThat(sesameResult).isNotEmpty();
//    }

//    @Test
//    public void constTest() {
//        constellationService.getConstellation(new CosmicCoordinatesModel(new BigDecimal(60), new BigDecimal(60)));
//    }

    @Test
    public void test() {
        CosmicCoordinatesModel c = new CosmicCoordinatesModel(new BigDecimal("127.4138000"), new BigDecimal("17.2834944444"));
        System.out.println(c.toStringRa());
        System.out.println(c.toStringDec());
    }

    @Test
    public void testVizier() throws ExecutionException, InterruptedException {
//        VsxVariableStarInformationResolverService vsxService = new VsxVariableStarInformationResolverServiceImpl(new TAPVizierServiceImpl());
//        Optional<VariableStarInformationModel> rw_com = vsxService.findByName("RW Com").get();
//        CosmicCoordinatesModel coords = new CosmicCoordinatesModel(new BigDecimal("188.25117"), new BigDecimal("26.71622"));
//        List<DistanceModel<VariableStarInformationModel>> byCoordinates = vsxService.findByCoordinates(coords, 0.1).get();
//        Optional<DistanceModel<VariableStarInformationModel>> nearest = vsxService.findNearest(coords).get();
//        System.out.println("hi");
    }

    @Test
    public void testSunCoordinates() {
        for (double i = 2458447; i < 2458448; i+=JD_MINUTE) {
            System.out.println(getSunCoordinates(i));
        }
    }
}
