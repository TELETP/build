// src/components/PhoneVerification.tsx
import { useState, useEffect } from 'react';
import { auth } from '@/system/config/firebase';
import { RecaptchaService } from '@/system/services/auth/recaptcha';
import { signInWithPhoneNumber } from 'firebase/auth';

interface PhoneVerificationProps {
  onVerificationComplete: () => void;
}

export default function PhoneVerification({ onVerificationComplete }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaService] = useState(() => new RecaptchaService(auth));

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    try {
      recaptchaService.initializeVerifier('recaptcha-container');
      recaptchaService.render();
    } catch (error) {
      setError('Failed to initialize verification system');
      console.error(error);
    }
  }, []);

  const handleSendCode = async () => {
    try {
      const verifier = recaptchaService.getVerifier();
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      
      // Store confirmation result in window for now
      // In production, we'd handle this more securely
      (window as any).confirmationResult = confirmation;
      
      setShowCodeInput(true);
      setError(null);
    } catch (error) {
      setError('Failed to send verification code');
      console.error(error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const confirmation = (window as any).confirmationResult;
      if (!confirmation) {
        throw new Error('No confirmation result found');
      }

      await confirmation.confirm(verificationCode);
      onVerificationComplete();
    } catch (error) {
      setError('Invalid verification code');
      console.error(error);
    }
  };

  return (
    <div className="phone-verification">
      <div id="recaptcha-container"></div>
      
      {!showCodeInput ? (
        <div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            disabled
          />
          <button onClick={handleSendCode}>Send Code</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
          />
          <button onClick={handleVerifyCode}>Verify</button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
