package cz.astro.var.data.security;

import cz.astro.var.data.czev.repository.User;
import cz.astro.var.data.czev.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserPrincipal userPrincipal = new UserPrincipal();
        userPrincipal.setEmail(user.getEmail());
        userPrincipal.setPassword(user.getPassword());
        userPrincipal.setId(user.getId());
        userPrincipal.setAuthorities(user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority(r.getName())).collect(Collectors.toList()));

        return userPrincipal;
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserPrincipal userPrincipal = new UserPrincipal();
        userPrincipal.setEmail(user.getEmail());
        userPrincipal.setPassword(user.getPassword());
        userPrincipal.setId(user.getId());
        userPrincipal.setAuthorities(user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority(r.getName())).collect(Collectors.toList()));

        return userPrincipal;
    }
}
