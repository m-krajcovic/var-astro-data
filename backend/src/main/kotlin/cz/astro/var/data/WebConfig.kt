package cz.astro.`var`.data

import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.ResourceResolver
import org.springframework.web.servlet.resource.ResourceResolverChain

import javax.servlet.http.HttpServletRequest
import java.io.IOException
import java.util.Arrays

/**
 * @author Michal
 * @version 1.0
 * @since 11/22/2018
 */
@Configuration
class WebConfig : WebMvcConfigurer {

    override fun addResourceHandlers(registry: ResourceHandlerRegistry?) {
        val resolver = ReactResourceResolver()
        registry!!.addResourceHandler("/**")
                .resourceChain(true)
                .addResolver(resolver)
    }

    inner class ReactResourceResolver : ResourceResolver {

        private val index = ClassPathResource(REACT_DIR + "index.html")
        private val rootStaticFiles = Arrays.asList("favicon.io",
                "asset-manifest.json", "manifest.json", "service-worker.js")

        override fun resolveResource(request: HttpServletRequest?, requestPath: String,
                                     locations: List<Resource>, chain: ResourceResolverChain): Resource? {
            return resolve(requestPath, locations)
        }

        override fun resolveUrlPath(resourcePath: String, locations: List<Resource>, chain: ResourceResolverChain): String? {
            val resolvedResource = resolve(resourcePath, locations) ?: return null
            try {
                return resolvedResource.url.toString()
            } catch (e: IOException) {
                return resolvedResource.filename
            }

        }

        private fun resolve(requestPath: String?, locations: List<Resource>): Resource? {
            println(requestPath)
            if (requestPath == null) return null

            return if (rootStaticFiles.contains(requestPath) || requestPath.startsWith(REACT_STATIC_DIR)) {
                ClassPathResource(REACT_DIR + requestPath)
            } else
                index
        }

        companion object {
            // this is the same directory you are using
            // in package.json "build-spring-linux",
            // example REACT_DIR/index.html
            private val REACT_DIR = "/static/"

            // this is directory inside REACT_DIR for react static files
            // example REACT_DIR/REACT_STATIC_DIR/js/
            // example REACT_DIR/REACT_STATIC_DIR/css/
            private val REACT_STATIC_DIR = "static"
        }

    }

}
