const audioOtpStore = new Map();

export const setAudioOtp = (email, otp) => {
  audioOtpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
};

export const verifyAudioOtp = (email, otp) => {

  const record = audioOtpStore.get(email);

  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    audioOtpStore.delete(email);
    return false;
  }

  if (record.otp !== otp) return false;

  audioOtpStore.delete(email);
  return true;
};