package cz.astro.var.data;

import cz.astro.var.data.czev.controller.DownloadableTextMessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.transaction.ChainedTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.client.RestTemplate;

@Configuration
public class SpringConfig {

    @Bean
    @Primary
    public ChainedTransactionManager chainedTransactionManager(
            @Qualifier("czevTransactionManager") PlatformTransactionManager czevTransactionManager,
            @Qualifier("ocTransactionManager") PlatformTransactionManager ocTransactionManager
    ) {
        return new ChainedTransactionManager(ocTransactionManager, czevTransactionManager);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public HttpMessageConverters downloadableTextMessageConverter() {
        return new HttpMessageConverters(new DownloadableTextMessageConverter());
    }
}
