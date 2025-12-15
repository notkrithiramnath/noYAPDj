package noYapDj.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SpotifyConfig {
    @Value("${spotify.client-id}")
    private String clientId;
    
    @Value("${spotify.client-secret}")
    private String clientSecret;
    
    @Value("${spotify.redirect-uri}")
    private String redirectUri;
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://127.0.0.1:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowCredentials(true);
            }
        };
    }
    
    public String getClientId() { 
        return clientId; 
    }
    
    public String getClientSecret() { 
        return clientSecret; 
    }
    
    public String getRedirectUri() { 
        return redirectUri; 
    }
}