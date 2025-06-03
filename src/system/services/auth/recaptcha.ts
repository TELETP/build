// src/system/services/auth/recaptcha.ts
import { Auth, RecaptchaVerifier } from "firebase/auth";

// Declare global grecaptcha type
declare global {
  interface Window {
    grecaptcha: {
      reset: (id: number) => void;
    };
  }
}

export class RecaptchaService {
  private verifier: RecaptchaVerifier | null = null;
  private widgetId: number | null = null;

  constructor(private auth: Auth) {}

  async initializeVerifier(containerId: string) {
    try {
      this.verifier = new RecaptchaVerifier(
        this.auth,
        containerId,
        {
          size: 'normal',
          callback: () => {
            // reCAPTCHA solved, enable phone input
            const phoneInput = document.getElementById('phone-input');
            if (phoneInput) {
              (phoneInput as HTMLInputElement).disabled = false;
            }
          },
          'expired-callback': () => {
            // Reset the process
            this.cleanup();
            this.initializeVerifier(containerId);
          }
        }
      );
      return this.verifier;
    } catch (error) {
      console.error('RecaptchaVerifier initialization failed:', error);
      throw error;
    }
  }

  getVerifier() {
    if (!this.verifier) {
      throw new Error('RecaptchaVerifier not initialized');
    }
    return this.verifier;
  }

  async render() {
    if (!this.verifier) {
      throw new Error('RecaptchaVerifier not initialized');
    }
    try {
      this.widgetId = await this.verifier.render();
      return this.widgetId;
    } catch (error) {
      console.error('RecaptchaVerifier render failed:', error);
      throw error;
    }
  }

  cleanup() {
    if (this.widgetId !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(this.widgetId);
        this.widgetId = null;
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error);
      }
    }
    this.verifier = null;
  }
}
