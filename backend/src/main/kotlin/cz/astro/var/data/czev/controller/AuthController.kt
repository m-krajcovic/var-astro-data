package cz.astro.`var`.data.czev.controller

import com.google.protobuf.ServiceException
import cz.astro.`var`.data.czev.repository.RoleRepository
import cz.astro.`var`.data.czev.repository.User
import cz.astro.`var`.data.czev.repository.UserRepository
import cz.astro.`var`.data.security.JwtAuthRequest
import cz.astro.`var`.data.security.JwtAuthResponse
import cz.astro.`var`.data.security.JwtTokenProvider
import cz.astro.`var`.data.security.SecurityService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import javax.servlet.http.HttpServletResponse
import javax.transaction.Transactional
import javax.validation.Valid
import javax.validation.constraints.Email
import javax.validation.constraints.NotBlank


@RestController
@RequestMapping("api/auth")
class AuthController(
        private val securityService: SecurityService,
        private val authenticationManager: AuthenticationManager,
        private val userRepository: UserRepository,
        private val roleRepository: RoleRepository,
        private val passwordEncoder: PasswordEncoder,
        private val jwtTokenProvider: JwtTokenProvider
) {

    @PostMapping("signin")
    fun authenticateUser(@Valid @RequestBody jwtAuthRequest: JwtAuthRequest): ResponseEntity<JwtAuthResponse> {
        return ResponseEntity.ok(securityService.loginUser(jwtAuthRequest))
    }

    @Transactional
    @PostMapping("signup")
    fun registerUser(@Valid @RequestBody signUpRequest: SignUpRequest, response: HttpServletResponse): ResponseEntity<*> {
        if (userRepository.existsByEmail(signUpRequest.email)) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "User with the same email already exists")
            return ResponseEntity("User with the same email already exists", HttpStatus.BAD_REQUEST)
        }

        val user = User(signUpRequest.email, passwordEncoder.encode(signUpRequest.password),
                mutableSetOf(roleRepository.findByName("ROLE_USER").orElseThrow { ServiceException("role missing") }))
        val result = userRepository.save(user)

        val location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/api/users/{id}")
                .buildAndExpand(result.id).toUri()

        return ResponseEntity.created(location).body(true)
    }

}

data class SignUpRequest(
        @NotBlank
        @Email
        var email: String,
        @NotBlank
        var password: String,
        var firstName: String = "",
        var lastName: String = ""
)
