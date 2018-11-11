package cz.astro.var.data.czev.service;


import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RunWith(SpringRunner.class)
public class SesameStarInformationResolverServiceTest {

//    @Autowired
//    private SesameStarInformationNameResolverService sesameService;
//
//    @Test
//    public void findByName() {
//        Optional<VariableStarInformationModel> sesameResult = sesameService.findByName("RW Com");
//        assertThat(sesameResult).isNotEmpty();
//    }

    @Test
    public void test() {
        CosmicCoordinatesModel c = new CosmicCoordinatesModel(new BigDecimal("127.4138000"), new BigDecimal("17.2834944444"));
        System.out.println(c.toStringRa());
        System.out.println(c.toStringDec());
    }

    @Test
    public void testVizier() {
        VsxVariableStarInformationResolverService vsxService = new VsxVariableStarInformationResolverService(new TAPVizierService(new RestTemplate()));
        Optional<VariableStarInformationModel> rw_com = vsxService.findByName("RW Com");
        CosmicCoordinatesModel coords = new CosmicCoordinatesModel(new BigDecimal("188.25117"), new BigDecimal("26.71622"));
        List<VariableStarInformationDistanceModel> byCoordinates = vsxService.findByCoordinates(coords, 0.1);
        Optional<VariableStarInformationDistanceModel> nearestByCoordinates = vsxService.findNearest(coords);
        System.out.println("hi");
    }
}
