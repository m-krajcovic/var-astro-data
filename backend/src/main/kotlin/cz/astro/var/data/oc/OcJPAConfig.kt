package cz.astro.`var`.data.oc

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.jdbc.DataSourceBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.core.env.Environment
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.orm.jpa.JpaTransactionManager
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.annotation.EnableTransactionManagement

import javax.sql.DataSource
import java.util.HashMap

/**
 * @author Michal
 * @version 1.0
 * @since 10/17/2018
 */
@Configuration
@EnableJpaRepositories(basePackages = arrayOf("cz.astro.var.data.oc"), entityManagerFactoryRef = "ocEntityManager", transactionManagerRef = "ocTransactionManager")
@ComponentScan(basePackages = arrayOf("cz.astro.var.data.oc"))
@EntityScan(basePackages = arrayOf("cz.astro.var.data.oc"))
@EnableTransactionManagement
class OcJPAConfig {

    @Autowired
    private val env: Environment? = null

    @Primary
    @Bean
    fun ocEntityManager(): LocalContainerEntityManagerFactoryBean {
        val em = LocalContainerEntityManagerFactoryBean()
        em.dataSource = ocDataSource()
        em.setPackagesToScan("cz.astro.var.data.oc")

        val vendorAdapter = HibernateJpaVendorAdapter()
        em.jpaVendorAdapter = vendorAdapter
        val properties = HashMap<String, Any>()
        properties["hibernate.hbm2ddl.auto"] = env!!.getProperty("oc.hibernate.hbm2ddl.auto")
        properties["hibernate.dialect"] = env.getProperty("hibernate.dialect")
        em.jpaPropertyMap = properties

        return em
    }

    @Primary
    @Bean
    @ConfigurationProperties("oc.jdbc")
    fun ocDataSource(): DataSource {
        return DataSourceBuilder.create().type(DriverManagerDataSource::class.java).build()
    }

    @Bean(name = arrayOf("ocTransactionManager"))
    fun ocTransactionManager(): PlatformTransactionManager {
        val transactionManager = JpaTransactionManager()
        transactionManager.entityManagerFactory = ocEntityManager().getObject()
        transactionManager.dataSource = ocDataSource()
        return transactionManager
    }

}
