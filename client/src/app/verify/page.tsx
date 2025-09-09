"use client";

import axios from "axios";
import { ArrowRight, ChevronLeft, Loader, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { USER_BASE_URL } from "@/lib/apiEndPoints";

const VerfifyPage = () => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendLoding, setResendLoding] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement>>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email: string = searchParams.get("email") || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement | null>
  ): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${USER_BASE_URL}/api/v1/verify`, {
        email,
        otp: otpStr,
      });
      alert(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  const handleResendOtp = async () => {
    setResendLoding(true);
    setError("");
    try {
      const { data } = await axios.post(`http://localhost:5000/api/v1/login`, {
        email,
      });
      alert(data.message);
      setTimer(60);
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setResendLoding(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8 relative">
            <button
              className="absolute top-0 left-0 p-2 text-gray-300 hover:text-white"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 ">
              Verify your email
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              A 6-digit verification code has been sent to your email address.
            </p>
            <div className="text-blue-600 font-medium">{email}</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                Please enter the 6-digit OTP sent to your email
              </label>
              <div className="flex justify-center in-checked:space-x-3">
                {otp.map((digit, index) => (
                  <input
                    type="text"
                    key={index}
                    ref={(el: HTMLInputElement) => {
                      inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center m-1 text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700 text-white"
                  />
                ))}
              </div>
            </div>
            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-3">
                <p className="text-red-300 text-center"> {error}</p>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 mt-2 rounded-lg font-semibold cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <Loader className="w-5 h-5" />
                  Verifying...
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2">
                  <span>Verify</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm- mb-4">
              Didn't receive the verification code?
            </p>
            {timer > 0 ? (
              <p className="text-gray-400 text-sm">
                You can request a new code in {timer} seconds.
              </p>
            ) : (
              <button
                className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50"
                disabled={resendLoding}
                onClick={handleResendOtp}
              >
                {resendLoding ? "Resending..." : "Request a new code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerfifyPage;
