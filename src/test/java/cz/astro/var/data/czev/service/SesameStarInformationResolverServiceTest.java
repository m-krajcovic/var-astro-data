package cz.astro.var.data.czev.service;


import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;

import java.math.BigDecimal;

@RunWith(SpringRunner.class)
public class SesameStarInformationResolverServiceTest {

//    @Autowired
//    private SesameStarInformationResolverService sesameService;
//
//    @Test
//    public void findByName() {
//        Optional<StarInformationModel> sesameResult = sesameService.findByName("RW Com");
//        assertThat(sesameResult).isNotEmpty();
//    }

    @Test
    public void test() {
        CosmicCoordinatesModel c = new CosmicCoordinatesModel(new BigDecimal("127.4138"), new BigDecimal("17.2835"));
        System.out.println(c.toStringRa());
        System.out.println(c.toStringDec());
    }
}
