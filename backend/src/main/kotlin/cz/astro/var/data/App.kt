/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
package cz.astro.`var`.data

import cz.astro.`var`.data.czev.repository.CzevInit
import cz.astro.`var`.data.newoc.repository.OcMigrator
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class App : CommandLineRunner {

    @Autowired
    private val czevInit: CzevInit? = null

    @Autowired
    private val ocGateMigrator: OcMigrator? = null

    @Value("\${czev.hibernate.hbm2ddl.auto}")
    private val czevhbm2ddl: String? = null

    @Throws(Exception::class)
    override fun run(vararg args: String) {
        if (czevhbm2ddl!!.startsWith("create")) {
            czevInit!!.initialize()
            ocGateMigrator!!.migrate()
        }
        //        czevInit.test();
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            SpringApplication.run(App::class.java, *args)
        }
    }
}
