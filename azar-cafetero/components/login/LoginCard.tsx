import SocialLogin from "./SocialLogin";
import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Log In</h1>
      <p className="text-gray-600 mb-8 font-medium">Welcome back, select method to login</p>
      <SocialLogin />
      <LoginForm />
    </div>
  );
}