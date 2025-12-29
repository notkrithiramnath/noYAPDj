from flask import Flask, request, jsonify
# Flask is web framework to create the python server
import requests
import sklearn
from sklearn.metrics.pairwise import cosine_similarity
import os
import numpy as np
app = Flask(__name__)

'''access_token = "BQBfh--1nAc6GpnEsRTS-qAbTZkzCbXNsW7OLW2u46P2HFpjgA2cletdm_7oJrfC0k-B1KQZH1q_yj54gIB0WA68DOgo0z9kyL2loh1zEX0EwVy5ZoRQ9O2zatE8JsaESQLpQCCAYUdP7ll8Td7LerlUz95JyXvUjrHuFuvsylcYYvIrjzcIAW2P0yIAB61sVjhnM2OqM6WrF2vBzZg0gJb0WWYa_q5BNvEiqTY_9HkNF9ua2xBRBRznX0R3aOv8DAYf21s"  # Paste the token from above
track_ids = "6Xom58OOXk2SoU711L2IXO,0JGTfiC4Z41GEEpMYLbWwO"

headers = {'Authorization': f'Bearer {access_token}'}
url = f"https://api.spotify.com/v1/audio-features?ids={track_ids}"

response = requests.get(url, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text})'''
SPOTIFY_API_URL = "https://api.spotify.com/v1"

#SPOTIFY_API_URL = "https://api.spotify.com/v1"
TOKEN_URL = "https://accounts.spotify.com/api/token"
# Audio features to analyze that spotify gives
AUDIO_FEATURES = [
    'energy',
    'danceability',
    'valence',
    'acousticness',
    'instrumentalness',
    'tempo',
    'loudness'
]
def refresh_access_token(refresh_token):
    #Refresh the Spotify access token
    url = "https://accounts.spotify.com/api/token"
    
    payload = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': os.getenv('SPOTIFY_CLIENT_ID'),
        'client_secret': os.getenv('SPOTIFY_CLIENT_SECRET')
    }
    
    response = requests.post(url, data=payload)
    
    if response.status_code == 200:
        data = response.json()
        return data['access_token']
    else:
        print(f"Error refreshing token: {response.status_code}")
        print(response.text)
        return None
def get_audio_features(track_ids, access_token):
    #get the features from tracks

    print("access token in get audio features:", access_token   )
    
    #list of dictioanaries to hold features
    features_list = []
    #cause spotify only allows 100 ids at a time
    for i in range(0, len(track_ids), 100):
        headers = {'Authorization': f'Bearer {access_token}'}
        batch = track_ids[i:i+100]
        print(f"Fetching audio features for track IDs: {batch}")
        url = f"{SPOTIFY_API_URL}/audio-features?ids={','.join(batch)}"
        #url = f"{SPOTIFY_API_URL}/audio-features?ids={','.join(batch)}"
        print(f"Audio features request URL: {url}")
        # join batch of ids with commas
        #get the features
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            #200 means success
            data = response.json()
            #get the features from the JSON 
            features_list.extend(data.get('audio_features', []))
        #these are the error handlers
        elif response.status_code == 401:
            print("Error 401: Access token expired or invalid.")
        elif response.status_code == 429:
            print("Error 429: Rate limit exceeded. Try again later.")
        else:
            print(f"Unexpected error: {response.status_code}")

    return features_list


#seeds are the mix songs
def get_recs(access_token, seed_tracks):
    headers = {'Authorization': f'Bearer {access_token}'}

    #limit to 5 seeds only, use comma to seperate
    seeds = seed_tracks.split(',')[:5]
    seed_string = ','.join(seeds)
    #print(f"Fetching recommendations for seed tracks: {seed_string}")
    url = f"{SPOTIFY_API_URL}/recommendations?seed_tracks={seed_string}&limit=20"
    response = requests.get(url, headers=headers)
    print(f"candidate recs response status: {response.status_code}")
   #if success, return the tracks
    if response.status_code == 200:
        return response.json().get('tracks', [])
    
    return []
def get_avg_feat_vector(seed_vecs):
    print("Calculating average feature vector for seed tracks...")
    print(f"Seed vectors: {seed_vecs}")
    if not seed_vecs:
        #ValueError("No seed vectors provided")
        return []

    num_feats =len(seed_vecs[0])

    avg_vec = [0] * num_feats

    for vec in seed_vecs:
        for i in range(num_feats):
            avg_vec[i] += vec[i]    

    num_seeds = len(seed_vecs)
    return [x/num_seeds for x in avg_vec]



def get_feat_sims(seed_features, candidate_tracks, access_token):
    print("Calculating feature similarities...")
    print(f"candidate tracks: {candidate_tracks}")
    candidate_ids = [track['id'] for track in candidate_tracks]
    print(f"Candidate IDs: {candidate_ids}")
    candidate_features = get_audio_features(candidate_ids, access_token)
    if not seed_features or not candidate_tracks:
        return candidate_tracks
    seed_vecs = []
    #remember the seeds r starting tracks
    for feat in seed_features:
        if feat:
            #create feature vector for the song to get all its feats
            vec = [feat.get(attr, 0) for attr in AUDIO_FEATURES]
            seed_vecs.append(vec)

    candidate_vecs = []
    for feat in candidate_features:
        if feat:
            vec = [feat.get(attr, 0) for attr in AUDIO_FEATURES]
            candidate_vecs.append(vec)

    #now data sciency stuff
    #find the average musical feature vector for the seeds
    avg_seed_vec = get_avg_feat_vector(seed_vecs)
    avg_seed_vec = np.array(avg_seed_vec).reshape(1, -1)
    #computes sims in a matrix
    sims = cosine_similarity(avg_seed_vec, candidate_vecs)[0]

    # Sort candidates by similarity
    ranked = sorted(
        #combines the tracks and their sim scores ex ({'id': '1', 'name': 'Fly eagles fly'}, 0.92) to rank them
        zip(candidate_tracks, sims),
        #sort by second item or x[1] which is the sim score
        key=lambda x: x[1],
        #highest first cause default is lowest first
        reverse=True
    )
    
    return [track for track, score in ranked]



@app.route('/recommend', methods=['POST'])
def recommend():
    #rec endpoint

    try:
        data = request.json
        access_token = data.get('access_token')
        print(f"Access token received: {access_token}")
        refresh_token = data.get('refresh_token')
        print(f"Refresh token received: {refresh_token}")
        #errors refreshing token
        
        if refresh_token:
            new_token = refresh_access_token(refresh_token)
            if new_token:
                access_token = new_token
        #checking if seed tracks are in
        print(f"seed tracks data: {data}")
        seed_tracks = data['seed_tracks']  #comma separated track ids

        

        #get the audio features of the seed tracks
        seed_ids = seed_tracks.split(',')
        print(f"Seed IDs: {seed_ids}")
        seed_feats = get_audio_features(seed_ids, access_token)
        #get recs from spotify based on seeds
        can_tracks = get_recs(access_token, seed_tracks)
        #get the ranked tracks based on feature similarity
        ranked_tracks = get_feat_sims(seed_feats, can_tracks, access_token)

        recs = []
        for track in ranked_tracks[:10]:
            recs.append({
                'id': track['id'],
                'name': track['name'],
                'artists': [artist['name'] for artist in track['artists']],
                'album': track['album']['name'],
                'image': track['album']['images'][0]['url'] if track['album']['images'] else None,
                'uri': track['uri']
            })

        return jsonify({'recommendations': recs})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(port=5000, debug=True)
   
    
