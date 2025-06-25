import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8800/api/login", { email, password }, { withCredentials: true });

      const data = response.data;

      sessionStorage.setItem("userRole", data.role);
      sessionStorage.setItem("userName", data.name);
      sessionStorage.setItem("isLoggedIn", "true");

      if (data.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Login gagal");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan jaringan");
      }
    }

    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary from-cyan-50 to-cyan-100">
      <Card className="w-full max-w-md shadow-lg">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <img src="/src/assets/logo-sd.png" alt="Logo Sekolah" className="w-35 h-35 mx-auto" />
            <CardTitle>Login</CardTitle>
            <CardDescription>Selamat Datang di Website Absensi</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

              <Label htmlFor="password" className="mt-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500" tabIndex={-1}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-cyan-500" />
                  Ingat saya
                </label>
                <a href="#" className="text-cyan-600 hover:underline">
                  Lupa password?
                </a>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full flex items-center justify-center gap-2 mt-5 bg-cyan-500 hover:bg-cyan-600" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Loading..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Login;
