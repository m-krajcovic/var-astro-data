package cz.astro.`var`.data.security

interface SecurityService {
    fun getCurrentUser(): UserPrincipal?
    fun loginUser(user: JwtAuthRequest): JwtAuthResponse
}
