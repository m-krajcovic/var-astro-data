package cz.astro.`var`.data.security

import com.fasterxml.jackson.annotation.JsonIgnore
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.Objects

class UserPrincipal : UserDetails {

    var id: Long? = null

    var email: String? = null

    @JsonIgnore
    private var password: String? = null

    private var authorities: Collection<GrantedAuthority>? = null

    override fun getAuthorities(): Collection<GrantedAuthority>? {
        return authorities
    }

    override fun getPassword(): String? {
        return password
    }

    override fun getUsername(): String? {
        return email
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun isEnabled(): Boolean {
        return true
    }

    fun setPassword(password: String) {
        this.password = password
    }

    fun setAuthorities(authorities: Collection<GrantedAuthority>) {
        this.authorities = authorities
    }

    override fun equals(o: Any?): Boolean {
        if (this === o) return true
        if (o !is UserPrincipal) return false
        val that = o as UserPrincipal?
        return id == that!!.id
    }

    override fun hashCode(): Int {
        return Objects.hash(id)
    }
}
