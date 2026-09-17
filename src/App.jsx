import { useState } from 'react';
import Login from './login/Login.jsx';
import Register from './register/Register.jsx';
import Home from './homepage/Home.jsx';

export default function App() {
  const [screen, setScreen] = useState('home');

  const handleSubmit = (values) => {
    console.log(`${screen === 'login' ? 'Login' : 'Register'} form submitted:`, values);
    setScreen('home');
  };

  if (screen === 'home') {
    return <Home onLogin={() => setScreen('login')} />;
  }

  if (screen === 'register') {
    return (
      <Register
        onClose={() => setScreen('login')}
        onSubmit={handleSubmit}
        onGoogle={() => setScreen('home')}
        onApple={() => setScreen('home')}
        onFacebook={() => setScreen('home')}
        onLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <Login
      onClose={() => console.log('Close login modal')}
      onSubmit={handleSubmit}
      onGoogle={() => setScreen('home')}
      onApple={() => setScreen('home')}
      onFacebook={() => setScreen('home')}
      onSignUp={() => setScreen('register')}
    />
  );
}
