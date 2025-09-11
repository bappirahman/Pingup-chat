"use client";
import { useAppData } from "@/context/AppContext";
import { USER_LOGIN } from "@/lib/apiEndPoints";
import axios from "axios";
import { ArrowRight, Loader, Mail } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { isAuth, loading: userLoading } = useAppData();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (
    e: React.FormEvent<HTMLElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(USER_LOGIN, {
        email,
      });
      toast.success(data.message);
      router.push(`/verify?email=${email}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  if (userLoading) return <Loading />;
  if (isAuth) return redirect("/");
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Mail size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 ">
              Welcome to PingUp
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Enter your email below to get started
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="py-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <Loader className="w-5 h-5" />
                  Sending OTP to your email
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2">
                  <span>Send verification code</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
