const config = {
  backendUrl: process.env.REACT_APP_BACKEND_URL || 'https://take-home-project-our-voice-our-rights-0ura.onrender.com',
  apiBase: process.env.REACT_APP_BACKEND_URL ? 
           `${process.env.REACT_APP_BACKEND_URL}/api` : 
           'https://take-home-project-our-voice-our-rights-0ura.onrender.com/api'
};

export default config;