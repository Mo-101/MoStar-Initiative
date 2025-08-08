'use client';
import { useState } from 'react';
import { registerUser, generateAI, getClimateData } from '../lib/apiService';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [climateData, setClimateData] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await registerUser({
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      tier: formData.get('tier')
    });
    if (!result.error) {
      setApiKey(result.apiKey);
      setIsAuthenticated(true);
    }
  };

  const handleGenerateAI = async (prompt, model) => {
    const result = await generateAI({prompt, model}, apiKey);
    setAiResponse(result.error || result.text);
  };

  const handleGetClimate = async () => {
    const result = await getClimateData(apiKey);
    setClimateData(JSON.stringify(result, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            MoStar Initiative
          </h1>
          {!isAuthenticated ? (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Register</h2>
              <form onSubmit={handleRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all">
                    <h3 className="text-xl font-medium mb-2">Username</h3>
                    <input type="text" name="username" className="bg-gray-700/50 p-2 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all w-full" />
                  </div>
                  <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all">
                    <h3 className="text-xl font-medium mb-2">Email</h3>
                    <input type="email" name="email" className="bg-gray-700/50 p-2 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all w-full" />
                  </div>
                  <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all">
                    <h3 className="text-xl font-medium mb-2">Password</h3>
                    <input type="password" name="password" className="bg-gray-700/50 p-2 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all w-full" />
                  </div>
                  <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all">
                    <h3 className="text-xl font-medium mb-2">Tier</h3>
                    <select name="tier" className="bg-gray-700/50 p-2 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all w-full">
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="bg-cyan-400 hover:bg-cyan-500 transition-all text-white font-bold py-2 px-4 rounded-lg">Register</button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">AI Service</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all">
                    <h3 className="text-xl font-medium mb-2">Prompt</h3>
                    <input type="text" name="prompt" className="bg-gray-700/50 p-2 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all w-full" />
                  </div>
                  <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all">
                    <h3 className="text-xl font-medium mb-2">Model</h3>
                    <select name="model" className="bg-gray-700/50 p-2 rounded-lg border border-gray-600 hover:border-cyan-400 transition-all w-full">
                      <option value="text-davinci-003">Text Davinci 003</option>
                      <option value="text-curie-001">Text Curie 001</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => handleGenerateAI(document.getElementsByName('prompt')[0].value, document.getElementsByName('model')[0].value)} className="bg-cyan-400 hover:bg-cyan-500 transition-all text-white font-bold py-2 px-4 rounded-lg">Generate AI Response</button>
                <p className="text-gray-300">{aiResponse}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Climate Service</h2>
                <button onClick={handleGetClimate} className="bg-cyan-400 hover:bg-cyan-500 transition-all text-white font-bold py-2 px-4 rounded-lg">Get Climate Data</button>
                <pre className="text-gray-300">{climateData}</pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
