package cz.astro.var.data.security;

public interface SecurityService {
    UserPrincipal getCurrentUser();
    JwtAuthResponse loginUser(UserPrincipal user);
}
