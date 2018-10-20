package cz.astro.var.data.repository.helper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * @author Michal
 * @version 1.0
 * @since 10/17/2018
 */
@Configuration
@EnableTransactionManagement
public class PersistanceJPAConfig {

    @Value("${CLEARDB_DATABASE_URL}")
    private String envVar;

    @Bean(name = "dataSource")
    @ConfigurationProperties(prefix="app.datasource")
    public DriverManagerDataSource dataSource() throws URISyntaxException {
        DriverManagerDataSource driverManagerDataSource = new DriverManagerDataSource();
        driverManagerDataSource.setDriverClassName("com.mysql.jdbc.Driver");
        URI dbUri = new URI(envVar);
        String[] userInfo = dbUri.getUserInfo().split(":");
        driverManagerDataSource.setUrl("jdbc:mysql://" + dbUri.getHost() + dbUri.getPath());
        driverManagerDataSource.setUsername(userInfo[0]);
        driverManagerDataSource.setPassword(userInfo[1]);
        return driverManagerDataSource;
    }
}
