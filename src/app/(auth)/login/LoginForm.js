"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { publicPath } from "@/utils/publicPath";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const redirectedRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (redirectedRef.current || authLoading) return;
    if (isAuthenticated) {
      redirectedRef.current = true;
      const next = searchParams.get("next") || "/dashboard";
      router.replace(next);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email.trim(), password);
      redirectedRef.current = true;
      const next = searchParams.get("next") || "/dashboard";
      router.replace(next);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page position-relative znd-10 d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 overflow-hidden rounded-4">
              <div className="row g-0">
                <div className="col-md-6 d-none d-md-block p-5 d-flex flex-column justify-content-center align-items-center position-relative border-end">
                  <div className="z-1 text-center">
                    <div
                      className="logo icon-100 mx-auto mb-4 position-relative"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <Image
                        src={publicPath("/images/logo.png")}
                        alt="Logo"
                        fill
                        className="img-contain"
                      />
                    </div>
                    <h2 className="fw-bold mb-2">Welcome Back!</h2>
                    <p className="lead opacity-50 mt-20 col-lg-10 mx-auto">
                      Tamimi Energy CMS Admin
                    </p>
                  </div>
                </div>

                <div className="col-md-6 bg-white p-5">
                  <div
                    className="text-center mb-5 d-md-none position-relative mx-auto"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <Image
                      src={publicPath("/images/logo.png")}
                      alt="Logo"
                      fill
                      className="object-fit-contain"
                    />
                  </div>
                  <h3 className="fw-bold mb-2 text-dark">Sign In</h3>
                  <p className="text-muted mb-4">
                    Enter your credentials to access your account.
                  </p>

                  {error && (
                    <div className="alert alert-danger py-2 fsz-12 mb-3">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control border"
                        id="floatingInput"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                      />
                      <label htmlFor="floatingInput" className="lh-6">
                        Email address
                      </label>
                    </div>

                    <div className="form-floating mb-4 position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border pe-5"
                        id="floatingPassword"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <label htmlFor="floatingPassword" className="lh-6">
                        Password
                      </label>
                      <button
                        type="button"
                        className="btn border-0 position-absolute top-50 end-0 translate-middle-y me-2 p-2 text-muted"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        <i
                          className={`fal ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                        />
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="butn-st2 w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
