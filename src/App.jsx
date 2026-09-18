import { useState } from 'react';
import Login from './login/Login.jsx';
import Register from './register/Register.jsx';
import Home from './homepage/Home.jsx';
import Payment from './payment/Payment.jsx';

export default function App() {
  const [screen, setScreen] = useState('home');

  const handleSubmit = (values) => {
    console.log(
      `${screen === 'login' ? 'Login' : 'Register'} form submitted:`,
      values
    );
    setScreen('home');
  };

  // PAYMENT
  if (screen === 'payment') {
    return (
      <Payment
        onBack={() => setScreen('home')}
      />
    );
  }

  // HOME
  if (screen === 'home') {
    return (
      <div>
        <Home onLogin={() => setScreen('login')} />

        <button
          onClick={() => setScreen('payment')}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            padding: '14px 24px',
            borderRadius: '10px',
            border: 'none',
            background: '#111827',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px',
          }}
        >
          WAYVEE Premium
        </button>
      </div>
    );
  }

  // REGISTER
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

  // LOGIN
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