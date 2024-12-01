"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
class OTPService {
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    static formatPhoneNumber(phone) {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        // Remove leading 91 if present
        const withoutCountryCode = cleaned.replace(/^91/, '');
        // Add +91 prefix
        return `+91${withoutCountryCode}`;
    }
    static sendOTP(phone) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (error) {
                console.error('Error generating OTP:', error);
                throw new Error('Failed to generate OTP');
            }
        });
    }
    static verifyOTP(phone, code) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.OTPService = OTPService;
OTPService.otpStore = new Map();
