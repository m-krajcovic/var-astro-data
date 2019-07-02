package cz.astro.var.data.czev.repository.sesame;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import java.util.ArrayList;
import java.util.List;

@XmlAccessorType(XmlAccessType.FIELD)
public class SesameResolver {
    @XmlElement(name = "otype")
    private String type = "";
    @XmlElement(name = "oname")
    private String originalName = "";
    @XmlElement(name = "alias")
    private List<String> aliases = new ArrayList<>();
    @XmlElement(name = "jradeg")
    private String raDegrees = null;
    @XmlElement(name = "jdedeg")
    private String decDegrees = null;
    @XmlElement(name = "jpos")
    private String coordinates = "";

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public List<String> getAliases() {
        return aliases;
    }

    public void setAliases(List<String> aliases) {
        this.aliases = aliases;
    }

    public String getRaDegrees() {
        return raDegrees;
    }

    public void setRaDegrees(String raDegrees) {
        this.raDegrees = raDegrees;
    }

    public String getDecDegrees() {
        return decDegrees;
    }

    public void setDecDegrees(String decDegrees) {
        this.decDegrees = decDegrees;
    }

    public String getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(String coordinates) {
        this.coordinates = coordinates;
    }
}
