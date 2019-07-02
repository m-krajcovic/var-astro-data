package cz.astro.`var`.data.security

import javax.validation.constraints.NotBlank

class JwtAuthRequest {

    @NotBlank
    var username: String? = null
    @NotBlank
    var password: String? = null
}
