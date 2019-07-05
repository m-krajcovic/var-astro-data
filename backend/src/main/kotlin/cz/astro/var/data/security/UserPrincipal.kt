package cz.astro.`var`.data.security

import com.fasterxml.jackson.annotation.JsonIgnore
import org.bouncycastle.asn1.x500.style.RFC4519Style.o
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.*

class UserPrincipal : UserDetails {

    var id: Long = -1

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

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is UserPrincipal) return false
        val that = other as UserPrincipal?
        return id == that!!.id
    }

    override fun hashCode(): Int {
        return Objects.hash(id)
    }
}
