package cz.astro.`var`.data.security

import cz.astro.`var`.data.czev.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CustomUserDetailsService(
        private val userRepository: UserRepository
) : UserDetailsService {

    @Transactional
    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(username: String): UserPrincipal {
        val user = userRepository.findByEmailFetched(username).orElseThrow { UsernameNotFoundException("User not found") }

        val userPrincipal = UserPrincipal()
        userPrincipal.email = user.email
        userPrincipal.setPassword(user.password)
        userPrincipal.id = user.id
        userPrincipal.setAuthorities(user.roles
                .map { r -> SimpleGrantedAuthority(r.name) }.toList())

        return userPrincipal
    }

    @Transactional
    fun loadUserById(id: Long?): UserPrincipal {
        val user = userRepository.findByIdFetched(id!!).orElseThrow { UsernameNotFoundException("User not found") }

        val userPrincipal = UserPrincipal()
        userPrincipal.email = user.email
        userPrincipal.setPassword(user.password)
        userPrincipal.id = user.id
        userPrincipal.setAuthorities(user.roles
                .map { r -> SimpleGrantedAuthority(r.name) }.toList())

        return userPrincipal
    }
}
