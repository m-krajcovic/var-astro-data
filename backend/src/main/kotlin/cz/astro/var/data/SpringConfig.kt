package cz.astro.`var`.data

import cz.astro.`var`.data.czev.controller.DownloadableTextMessageConverter
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.boot.autoconfigure.http.HttpMessageConverters
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.data.transaction.ChainedTransactionManager
import org.springframework.format.FormatterRegistry
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
@EnableAsync
@EnableCaching
class SpringConfig {

    @Bean
    @Primary
    fun chainedTransactionManager(
            @Qualifier("czevTransactionManager") czevTransactionManager: PlatformTransactionManager,
            @Qualifier("ocTransactionManager") ocTransactionManager: PlatformTransactionManager
    ): ChainedTransactionManager {
        return ChainedTransactionManager(ocTransactionManager, czevTransactionManager)
    }

    @Bean
    fun downloadableTextMessageConverter(): HttpMessageConverters {
        return HttpMessageConverters(DownloadableTextMessageConverter())
    }

    @Bean
    fun webMvcConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addFormatters(registry: FormatterRegistry?) {}

            override fun addCorsMappings(registry: CorsRegistry?) {
                registry!!.addMapping("/api/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600)
            }
        }
    }

}
