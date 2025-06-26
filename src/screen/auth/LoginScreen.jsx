import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../api/service';
import logo from '../../assets/logo.png';

const LoginWithOtpScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = input phone, 2 = input OTP
  const [timer, setTimer] = useState(60);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('08')) return '+62' + cleaned.slice(1);
    if (cleaned.startsWith('62')) return '+62' + cleaned.slice(2);
    if (cleaned.startsWith('8')) return '+62' + cleaned;
    if (cleaned.startsWith('628')) return '+' + cleaned;
    if (cleaned.startsWith('+628')) return cleaned;
    return '+62' + cleaned;
  };

  useEffect(() => {
    if (step === 2 && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [step, timer]);

  const sendOtp = async () => {
    if (!phoneNumber.trim()) {
      alert("Nomor ponsel tidak boleh kosong.");
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const formData = { phonenumber: formattedPhone };

    setLoading(true);
    try {
      await postData('otp/sendWA', formData);
      localStorage.setItem('phonenumber', formattedPhone);
      setStep(2);
      setTimer(60);
    } catch (error) {
      alert("Gagal mengirim OTP.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      alert("OTP tidak boleh kosong.");
      return;
    }

    setLoading(true);
    try {
      const phonenumber = localStorage.getItem('phonenumber');
      const response = await postData('otp/validateWA', {
        phonenumber,
        code: otp
      });
      localStorage.setItem('accessTokens', response.message.accessToken);
      navigate('/HomeScreen/DashboardScreen');
    } catch (error) {
      alert(error?.response?.data?.message || "Verifikasi OTP gagal.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const phonenumber = localStorage.getItem('phonenumber');
      await postData('otp/sendWA', { phonenumber });
      setTimer(60);
    } catch (error) {
      alert("Gagal mengirim ulang OTP.");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-2/3 flex items-center justify-center bg-yellow-100">
        <img src={logo} alt="Logo" className="w-80 h-80 object-contain" />
      </div>

      <div className="w-1/3 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {step === 1 ? (
            <>
              <label className="block mb-2 text-gray-700 font-medium">
                Masukkan Nomor Ponsel
              </label>
              <input
                type="tel"
                placeholder="Cth 081234567890"
                className="w-full border border-gray-300 rounded-md p-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
              <button
                onClick={sendOtp}
                disabled={loading}
                className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-md transition duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Mengirim...' : 'Kirim OTP'}
              </button>
            </>
          ) : (
            <>
              <label className="block mb-2 text-gray-700 font-medium">
                Masukkan OTP dari WhatsApp
              </label>
              <input
                type="text"
                placeholder="Masukkan OTP"
                className="w-full border border-gray-300 rounded-md p-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-gray-600">
                  {timer > 0 ? `Kirim ulang dalam ${formatTime(timer)}` : ''}
                </span>
                <button
                  onClick={handleResend}
                  disabled={timer > 0}
                  className="text-blue-600 font-medium disabled:opacity-50"
                >
                  Kirim Ulang
                </button>
              </div>
              <button
                onClick={verifyOtp}
                disabled={loading}
                className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-md transition duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginWithOtpScreen;
