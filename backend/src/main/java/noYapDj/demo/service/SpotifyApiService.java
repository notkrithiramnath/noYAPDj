package noYapDj.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SpotifyApiService {
    //make calls to spotify API
    
    @Autowired
    private RestTemplate restTemplate;
    //get the tracks from spotify
    public String searchTrack(String accessToken, String query) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        String url = "https://api.spotify.com/v1/search?q=" + query + "&type=track";
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            String.class
        );
        
        return response.getBody();
    }
    public String getTopTracks(String accessToken) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    
    String url = "https://api.spotify.com/v1/me/top/tracks?limit=10";
    HttpEntity<String> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        url,
        HttpMethod.GET,
        entity,
        String.class
    );
    
    return response.getBody();
}
public String getTrackFeatures(String accessToken, String trackId) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    
    String url = "https://api.spotify.com/v1/audio-features/" + trackId;
    HttpEntity<String> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        url,
        HttpMethod.GET,
        entity,
        String.class
    );
    
    return response.getBody();
}

public String getRecommendations(String accessToken, String seedTracks, String targetEnergy, String targetDanceability) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    
    String url = "https://api.spotify.com/v1/recommendations?seed_tracks=" + seedTracks 
                 + "&target_energy=" + targetEnergy 
                 + "&target_danceability=" + targetDanceability 
                 + "&limit=10";
    HttpEntity<String> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        url,
        HttpMethod.GET,
        entity,
        String.class
    );
    
    return response.getBody();
}
}