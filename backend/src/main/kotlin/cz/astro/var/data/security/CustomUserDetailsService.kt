package cz.astro.`var`.data.security

import cz.astro.`var`.data.czev.repository.User
import cz.astro.`var`.data.czev.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

import java.util.stream.Collectors

@Service
class CustomUserDetailsService : UserDetailsService {

    @Autowired
    private val userRepository: UserRepository? = null

    @Transactional
    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(username: String): UserPrincipal {
        val user = userRepository!!.findByEmailFetched(username).orElseThrow { UsernameNotFoundException("User not found") }

        val userPrincipal = UserPrincipal()
        userPrincipal.email = user.email
        userPrincipal.password = user.password
        userPrincipal.id = user.id
        userPrincipal.authorities = user.roles.stream()
                .map { r -> SimpleGrantedAuthority(r.name) }.collect<List<SimpleGrantedAuthority>, Any>(Collectors.toList())

        return userPrincipal
    }

    @Transactional
    fun loadUserById(id: Long?): UserPrincipal {
        val user = userRepository!!.findByIdFetched(id!!).orElseThrow { UsernameNotFoundException("User not found") }

        val userPrincipal = UserPrincipal()
        userPrincipal.email = user.email
        userPrincipal.password = user.password
        userPrincipal.id = user.id
        userPrincipal.authorities = user.roles.stream()
                .map { r -> SimpleGrantedAuthority(r.name) }.collect<List<SimpleGrantedAuthority>, Any>(Collectors.toList())

        return userPrincipal
    }
}
