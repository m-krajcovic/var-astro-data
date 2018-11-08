package cz.astro.var.data;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.transaction.ChainedTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

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
}
