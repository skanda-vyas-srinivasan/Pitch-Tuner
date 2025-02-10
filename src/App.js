import React, { useState } from 'react';

import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [desiredKey, setDesiredKey] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [mess2, setMess2] = useState('');
  const [mess3, setMess3] = useState('');
  const[mess4, setMess4] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file and enter a desired key.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setMessage("Processing audio file...");
      // Adjust the URL if your backend is hosted elsewhere.
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        body: formData,
      });
      setMessage("Hello??")
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
        return;
      }
      const data = await response.json();
      setMessage("Processing complete!");
      setMess2("Closest Detected KeY: " + data.tuning_offset);
      setMess3("Detected Key: " + data.key);
      setStep(2);    
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while processing the file.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!desiredKey) {
      alert("Please enter a desired key.");
      return;
    }
    const newfomr = new FormData();
    newfomr.append('desired_key', desiredKey);
    try {
      setMessage("Processing audio file...");
      // Adjust the URL if your backend is hosted elsewhere.
      const response = await fetch('http://127.0.0.1:5000/key_switch',{
        method: 'POST',
        body: newfomr,
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setMess4("Processing complete! Download your fixed audio file below.");
    }
    catch (error) {
      console.error(error);
      setMessage("An error occurred while processing the file.");
    }
  }

  return (
    <div className="App">
      <h1>Skanda's Pitch Tuner</h1>
      <form onSubmit={handleSubmit}>
        { (<div>
          <label>Audio File:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>)}
        <button type="submit">Process Audio</button>
      </form>

      {message && <p>{message}</p>}

      {mess2 && <p>{mess2}</p>}

      {mess3 && <p>{mess3}</p>}

      <form onSubmit={submit}>
        {step === 2 && (
          <div>
            <label>Desired Key:</label>
            <input
              type="text"
              value={desiredKey}
              onChange={(e) => setDesiredKey(e.target.value)}
            />
          </div>
        )}
        {step === 2 && (
          <button type="submit">Fix Audio</button>
        )}

      </form>

      {mess4 && <p>{mess4}</p>}


      {downloadUrl && (
        <div>
          <a href={downloadUrl} download="fixed.wav">
            Download Processed Audio
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
