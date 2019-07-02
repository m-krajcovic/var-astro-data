package cz.astro.var.data.czev.repository.sesame;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import java.util.List;

@XmlAccessorType(XmlAccessType.FIELD)
public class SesameTarget {
    @XmlElement(name = "Resolver")
    private List<SesameResolver> resolvers;

    public List<SesameResolver> getResolvers() {
        return resolvers;
    }

    public void setResolvers(List<SesameResolver> resolvers) {
        this.resolvers = resolvers;
    }
}
