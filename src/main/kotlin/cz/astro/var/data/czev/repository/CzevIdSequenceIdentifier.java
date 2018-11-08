package cz.astro.var.data.czev.repository;

import javax.persistence.*;

@Entity
public class CzevIdSequenceIdentifier {
    @Id
    @SequenceGenerator(name = "czev_CzevIdSequence", sequenceName = "czev_CzevIdSequence", allocationSize = 1)
    @GeneratedValue(generator = "czev_CzevIdSequence", strategy = GenerationType.SEQUENCE)
    private Long id;

    public Long getId() {
        return id;
    }
}
