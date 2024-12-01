export class OTPService {
    private static otpStore: Map<string, { otp: string, expiry: Date }> = new Map();

    private static generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static formatPhoneNumber(phone: string): string {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        
        // Remove leading 91 if present
        const withoutCountryCode = cleaned.replace(/^91/, '');
        
        // Add +91 prefix
        return `+91${withoutCountryCode}`;
    }

    static async sendOTP(phone: string): Promise<string> {
        try {
            const formattedPhone = this.formatPhoneNumber(phone);
            
            // Generate OTP
            const otp = this.generateOTP();
            const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
            
            // Store OTP
            this.otpStore.set(formattedPhone, { otp, expiry });

            // Log OTP (for development)
            console.log('==================================');
            console.log(`Phone: ${formattedPhone}`);
            console.log(`OTP: ${otp}`);
            console.log(`Expires: ${expiry}`);
            console.log('==================================');

            return otp;
        } catch (error) {
            console.error('Error generating OTP:', error);
            throw new Error('Failed to generate OTP');
        }
    }

    static async verifyOTP(phone: string, code: string): Promise<boolean> {
        const formattedPhone = this.formatPhoneNumber(phone);
        const storedData = this.otpStore.get(formattedPhone);

        if (!storedData) {
            console.log('No OTP found for this number');
            return false;
        }

        if (new Date() > storedData.expiry) {
            console.log('OTP has expired');
            this.otpStore.delete(formattedPhone); // Clean up expired OTP
            return false;
        }

        const isValid = storedData.otp === code;
        if (isValid) {
            this.otpStore.delete(formattedPhone); // Clean up used OTP
        }

        return isValid;
    }
} 