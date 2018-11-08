package cz.astro.var.data.czev;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;

/**
 * @author Michal
 * @version 1.0
 * @since 10/17/2018
 */
@Configuration
@EnableJpaRepositories(
        basePackages = "cz.astro.var.data.czev",
        entityManagerFactoryRef = "czevEntityManager",
        transactionManagerRef = "czevTransactionManager"
)
@ComponentScan(basePackages = "cz.astro.var.data.czev")
@EntityScan(basePackages = "cz.astro.var.data.czev")
@EnableTransactionManagement
public class CzevJPAConfig {

    @Autowired
    private Environment env;

    @Bean
    public LocalContainerEntityManagerFactoryBean czevEntityManager() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(czevDataSource());
        em.setPackagesToScan("cz.astro.var.data.czev");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", env.getProperty("czev.hibernate.hbm2ddl.auto"));
        properties.put("hibernate.dialect", env.getProperty("hibernate.dialect"));
        em.setJpaPropertyMap(properties);

        return em;
    }

    @Bean
    @ConfigurationProperties("czev.jdbc")
    public DataSource czevDataSource() {
        return DataSourceBuilder.create().type(DriverManagerDataSource.class).build();
    }

    @Bean(name = "czevTransactionManager")
    public PlatformTransactionManager czevTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(czevEntityManager().getObject());
        transactionManager.setDataSource(czevDataSource());
        return transactionManager;
    }
}
