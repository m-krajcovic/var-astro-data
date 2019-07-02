package cz.astro.`var`.data.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class SecurityServiceImpl : SecurityService {

    @Autowired
    private val authenticationManager: AuthenticationManager? = null

    @Autowired
    private val tokenProvider: JwtTokenProvider? = null

    override fun getCurrentUser(): UserPrincipal? {
        return if (SecurityContextHolder.getContext().authentication != null) {
            SecurityContextHolder.getContext().authentication.principal as UserPrincipal
        } else null
    }

    override fun loginUser(user: JwtAuthRequest): JwtAuthResponse {
        val authentication = authenticationManager!!.authenticate(
                UsernamePasswordAuthenticationToken(
                        user.username,
                        user.password
                )
        )

        SecurityContextHolder.getContext().authentication = authentication

        val jwt = tokenProvider!!.generateToken(authentication)

        return JwtAuthResponse(jwt)
    }
}
