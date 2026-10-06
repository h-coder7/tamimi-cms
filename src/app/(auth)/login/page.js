"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publicPath } from "@/utils/publicPath";

export default function LoginPage() {
    const router = useRouter();
    const redirectedRef = useRef(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect if already logged in (once)
    useEffect(() => {
        if (redirectedRef.current) return;

        const token = localStorage.getItem("token");
        if (token) {
            redirectedRef.current = true;
            router.replace("/dashboard");
            return;
        }

        setCheckingAuth(false);
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simulate successful login for testing
        setTimeout(() => {
            localStorage.setItem("token", "dummy-token-" + Date.now());
            localStorage.setItem("user", JSON.stringify({
                name: email.split("@")[0].replace(".", " ") || "Guest User",
                email: email || "guest@example.com",
            }));
            redirectedRef.current = true;
            router.replace("/dashboard");
            setLoading(false);
        }, 800);

        /*
        // 🔜 Actual API integration when backend is ready:
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({
                    name: data.name || "Yasmin Ali",
                    email: data.email || "YasminAli@gmail.com"
                }));
                router.replace("/dashboard");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
        */
    };

    if (checkingAuth) {
        return (
            <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="text-muted">Loading...</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page position-relative znd-10 d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card border-0 overflow-hidden rounded-4">
                            <div className="row g-0">
                                {/* Left Side - Image/Branding */}
                                <div className="col-md-6 d-none d-md-block p-5 d-flex flex-column justify-content-center align-items-center position-relative border-end">
                                    <div className="z-1 text-center">
                                        <div className="logo icon-100 mx-auto mb-4 position-relative" style={{ width: "100px", height: "100px" }}>
                                            <Image
                                                src={publicPath("/images/logo.png")}
                                                alt="Logo"
                                                fill
                                                className="img-contain"
                                            />
                                        </div>
                                        <h2 className="fw-bold mb-2">Welcome Back!</h2>
                                        <p className="lead opacity-50 mt-20 col-lg-10 mx-auto">Manage your business with ease using Sky CRM.</p>
                                    </div>
                                </div>

                                {/* Right Side - Login Form */}
                                <div className="col-md-6 bg-white p-5">
                                    <div className="text-center mb-5 d-md-none position-relative mx-auto" style={{ width: "80px", height: "80px" }}>
                                        <Image
                                            src={publicPath("/images/logo.png")}
                                            alt="Logo"
                                            fill
                                            className="object-fit-contain"
                                        />
                                    </div>
                                    <h3 className="fw-bold mb-2 text-dark">Sign In</h3>
                                    <p className="text-muted mb-4">Enter your credentials to access your account.</p>

                                    {error && <div className="alert alert-danger py-2 fsz-12 mb-3">{error}</div>}

                                    <form onSubmit={handleSubmit}>
                                        <div className="form-floating mb-3">
                                            <input
                                                type="email"
                                                className="form-control border"
                                                id="floatingInput"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <label htmlFor="floatingInput" className="lh-6">Email address</label>
                                        </div>
                                        <div className="form-floating mb-4">
                                            <input
                                                type="password"
                                                className="form-control border"
                                                id="floatingPassword"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <label htmlFor="floatingPassword" className="lh-6">Password</label>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="rememberMe" />
                                                <label className="form-check-label text-muted ms-2" htmlFor="rememberMe">
                                                    Remember me
                                                </label>
                                            </div>
                                            <Link href="#" className="text-decoration-underline">Forgot Password?</Link>
                                        </div>

                                        <button
                                            type="submit"
                                            className="butn-st2 w-100"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Signing In...
                                                </>
                                            ) : (
                                                "Sign In"
                                            )}
                                        </button>
                                    </form>

                                    <div className="text-center mt-4">
                                        <small className="text-muted">
                                            Don&apos;t have an account? <Link href="/register" className="text-decoration-underline">Sign Up</Link>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
