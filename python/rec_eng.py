from flask import Flask, request, jsonify
# Flask is web framework to create the python server
import requests
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)

SPOTIFY_API_URL = "https://api.spotify.com/v1"

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

def get_audio_features(track_ids, access_token):
    #get the features from tracks


    headers = {'Authorization': f'Bearer {access_token}'}
    #list of dictioanaries to hold features
    features_list = []
    #cause spotify only allows 100 ids at a time
    for i in range(0, len(track_ids), 100):
        batch = track_ids[i:i+100]
        url = f"{SPOTIFY_API_BASE}/audio-features?ids={','.join(batch)}"
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

