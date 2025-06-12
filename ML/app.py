from flask import Flask, render_template, request, jsonify
from flask_cors import cross_origin
import pandas as pd
import numpy as np
import faiss
import joblib
import json
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

print("Loading FAISS index and supporting files...")
df = pd.read_csv("mobile_metadata.csv")
index = faiss.read_index("faiss_index.index")
scaler = joblib.load("scaler.pkl")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

FEATURES = ['RAM', 'Battery Capacity', 'Launched Price (Pakistan)', 'Processor', 'Screen Size']

@app.route('/')
def home():
    return render_template('index.html', metadata={"note": "Mobile Recommender Active"})

@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():
    try:
        data = request.get_json()

        user_input = {
            'RAM': float(data['RAM']),
            'Battery Capacity': float(data['Battery Capacity']),
            'Launched Price (Pakistan)': float(data['Launched Price (Pakistan)']),
            'Processor': data['Processor'],
            'Screen Size': float(data['Screen Size'])
        }

        processor_vec = embedding_model.encode([user_input['Processor']])

        numeric_input = scaler.transform([[user_input['RAM'], user_input['Battery Capacity'],
                                           user_input['Launched Price (Pakistan)'], user_input['Screen Size']]])

        final_input = np.hstack((numeric_input, processor_vec)).astype('float32')

        D, I = index.search(final_input, 5)

        recommendations = df.iloc[I[0]][['Model Name'] + FEATURES]
        result = recommendations.to_dict(orient='records')

        return jsonify({
            'success': True,
            'recommendations': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True,port=4000)
