package cz.astro.`var`.data.helper

import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.stereotype.Service

@Service
class BeanUtil: ApplicationContextAware {

    companion object {
        private lateinit var context: ApplicationContext

        fun <T> getBean(beanClass: Class<T>): T {
            return context.getBean(beanClass)
        }
    }

    override fun setApplicationContext(applicationContext: ApplicationContext) {
        context = applicationContext
    }
}