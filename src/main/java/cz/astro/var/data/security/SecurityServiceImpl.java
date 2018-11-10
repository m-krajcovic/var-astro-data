package cz.astro.var.data.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityServiceImpl implements SecurityService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public UserPrincipal getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        }
        return null;
    }

    @Override
    public JwtAuthResponse loginUser(JwtAuthRequest user) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        user.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        return new JwtAuthResponse(jwt);
    }
}
