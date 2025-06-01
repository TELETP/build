// src/system/services/auth/recaptcha.ts
import { Auth, RecaptchaVerifier } from "firebase/auth";

export class RecaptchaService {
  private verifier: RecaptchaVerifier | null = null;

  constructor(private auth: Auth) {}

  initializeVerifier(containerId: string) {
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
      return await this.verifier.render();
    } catch (error) {
      console.error('RecaptchaVerifier render failed:', error);
      throw error;
    }
  }
}
