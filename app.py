from flask import Flask, request, jsonify, send_file
import librosa
import librosa.effects
import numpy as np
import soundfile as sf
import tempfile
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Define key names (ensure consistency with your code)
key_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

@app.route('/process', methods=['POST'])
def process_audio():

    print("Received files:", list(request.files.keys()))
    print("Received form data:", list(request.form.keys()))
    # Check if file is in request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided.'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400
    
    print("Error Not here")

    # Get the desired target key from the form data
    desired_key = request.form.get('desired_key', None)
    if desired_key is None or desired_key.upper() not in key_names:
        return jsonify({'error': 'Invalid or missing desired key.'}), 400
    print("Error isnt here either")
    # Save uploaded file to a temporary file
    temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    file.save(temp_input.name)
    temp_input.close()

    print("file saved to a temp")

    # Load the audio file using librosa
    y, sr = librosa.load(temp_input.name, sr=None)

    # Estimate the current key using chroma_cens
    key_estimation = librosa.feature.chroma_cens(y=y, sr=sr)
    key_index = np.argmax(np.mean(key_estimation, axis=1))
    detected_key = key_names[key_index]

    # Estimate tuning offset in cents
    tuning_offset = librosa.estimate_tuning(y=y, sr=sr) * 100

    print("Detected key:", detected_key)
    print("Tuning offset:", tuning_offset)

    # Calculate semitones to shift based on tuning offset and desired key difference
    semitones_shift = - (tuning_offset / 100)
    extra_shift = key_names.index(desired_key.upper()) - key_names.index(detected_key)
    semitones_shift += extra_shift

    # Apply pitch shift
    y_fixed = librosa.effects.pitch_shift(y=y, sr=sr, n_steps=semitones_shift, res_type='kaiser_best')

    # Save the processed audio to a temporary file
    temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    sf.write(temp_output.name, y_fixed, sr)
    temp_output.close()
    print("Dude the output closed as well")
    # Return the file to the client as an attachment
    return send_file(temp_output.name, as_attachment=True, download_name="fixed.wav", mimetype="audio/wav")

if __name__ == "__main__":
    app.run(debug=True)
