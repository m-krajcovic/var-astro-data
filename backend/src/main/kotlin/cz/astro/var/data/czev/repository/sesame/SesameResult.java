package cz.astro.var.data.czev.repository.sesame;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.List;

@XmlRootElement(name="Sesame")
@XmlAccessorType(XmlAccessType.FIELD)
public class SesameResult {

    @XmlElement(name = "Target")
    private List<SesameTarget> targets;

    public List<SesameTarget> getTargets() {
        return targets;
    }

    public void setTargets(List<SesameTarget> targets) {
        this.targets = targets;
    }
}