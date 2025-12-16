package noYapDj.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import noYapDj.demo.config.SpotifyConfig;
import java.util.Base64;
import java.util.Map;
//handle spotify authentication when u click log in
@Service
public class SpotifyAuthService {
    private final RestTemplate restTemplate;
    private final SpotifyConfig spotifyConfig;
    
    @Value("${spotify.client-id}")
    private String clientId;
    
    @Value("${spotify.client-secret}")
    private String clientSecret;
    
    @Value("${spotify.redirect-uri}")
    private String redirectUri;
    
    @Autowired
    public SpotifyAuthService(RestTemplate restTemplate, SpotifyConfig spotifyConfig) {
        this.restTemplate = restTemplate;
        this.spotifyConfig = spotifyConfig;
    }
    //get the URL to go to Spotify's login
    public String getAuthorizationUrl() {
    String scope = "user-read-private user-read-email user-top-read";
    return "https://accounts.spotify.com/authorize" +
           "?response_type=code" +
           "&client_id=" + spotifyConfig.getClientId() +
           "&scope=" + scope.replace(" ", "%20") +
           "&redirect_uri=" + spotifyConfig.getRedirectUri();
}
    //give the code for the access token to Spotify
    public String getAccessToken(String code) {
        String url = "https://accounts.spotify.com/api/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String auth = spotifyConfig.getClientId() + ":" + spotifyConfig.getClientSecret();
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes());
        String authHeader = "Basic " + new String(encodedAuth);
        headers.set("Authorization", authHeader);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", spotifyConfig.getRedirectUri());
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        
        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            return (String) responseBody.get("access_token");
        } else {
            throw new RuntimeException("Failed to exchange code for token");
        }
    }
}