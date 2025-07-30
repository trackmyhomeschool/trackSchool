import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginModal({ show, handleClose, onOpenRegister }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden"; // Disable scroll
    } else {
      document.body.style.overflow = ""; // Re-enable scroll
    }

    return () => {
      document.body.style.overflow = ""; // Clean up on unmount
    };
  }, [show]);

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState(0);
  const [resetUsername, setResetUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetPasswordShown, setResetPasswordShown] = useState(false);
  const [resetPasswordValid, setResetPasswordValid] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false,
  });
  const [otpSuccess, setOtpSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        formData,
        {
          withCredentials: true,
        }
      );
      setSuccess("Login successful!");
      setFormData({ emailOrUsername: "", password: "" });
      handleClose();
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  };

  const handleResetStep0 = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const trimmed = resetUsername.trim();
    if (!trimmed) return setError("Enter your username or email");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/find-user-email`,
        {
          usernameOrEmail: trimmed,
        }
      );
      if (!res.data?.email) return setError("User not found");
      setResetEmail(res.data.email);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/send-reset-otp`,
        {
          email: res.data.email,
        }
      );
      setSuccess("OTP sent to your email!");
      setResetStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleResetStep2 = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/verify-reset-otp`,
        {
          email: resetEmail,
          otp: resetOtp,
        }
      );
      setSuccess("OTP verified!");
      setResetStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  const validatePassword = (pwd) => ({
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const handleResetPasswordChange = (e) => {
    const val = e.target.value;
    setResetNewPassword(val);
    setResetPasswordValid(validatePassword(val));
    setError("");
    setSuccess("");
  };

  const handleResetStep3 = async (e) => {
    e.preventDefault();
    const valid = validatePassword(resetNewPassword);
    if (!valid.length || !valid.upper || !valid.lower || !valid.special) {
      return setError("Password does not meet all requirements");
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/reset-password`,
        {
          email: resetEmail,
          newPassword: resetNewPassword,
        }
      );
      setSuccess("Password reset successful!");
      setTimeout(() => {
        setResetStep(0);
        setResetUsername("");
        setResetEmail("");
        setResetOtp("");
        setResetNewPassword("");
        setResetPasswordValid({
          length: false,
          upper: false,
          lower: false,
          special: false,
        });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop first (lower z-index) */}
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="card border-0 rounded-4">
                <div className="card-body p-lg-4 p-3">
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={handleClose}
                  ></button>

                  <div className="text-start mt-3 px-lg-4 px-2">
                    <div className="navbar-brand logo mb-4">
                      <img
                        src="images/logo.png"
                        alt="Logo"
                        className="img-fluid h-logo-50"
                      />
                    </div>
                    <div className="login-title">
                      <h5 className="text-primary fw-semibold">
                        {resetStep === 0
                          ? "Login to your Account"
                          : "Reset Password"}
                      </h5>
                    </div>
                  </div>

                  <div className="px-lg-4 px-2">
                    <form
                      onSubmit={
                        resetStep === 0
                          ? handleSubmit
                          : resetStep === 1
                          ? handleResetStep0
                          : resetStep === 2
                          ? handleResetStep2
                          : handleResetStep3
                      }
                    >
                      {resetStep === 0 && (
                        <>
                          <div className="form-group input-group mb-3">
                            <span className="input-group-text">
                              <i className="ri-mail-line"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              name="emailOrUsername"
                              placeholder="Enter Email or Username"
                              value={formData.emailOrUsername}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="form-group input-group mb-3">
                            <span className="input-group-text">
                              <i className="ri-lock-line"></i>
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              className="form-control"
                              name="password"
                              placeholder="Enter password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                            />
                            <span
                              className="input-group-text"
                              style={{ cursor: "pointer" }}
                              onClick={() => setShowPassword((p) => !p)}
                            >
                              {showPassword ? "🙈" : "👁️"}
                            </span>
                          </div>
                          <div className="form-check mt-3 d-flex justify-content-between">
                            <div>
                              <input
                                className="form-check-input"
                                type="checkbox"
                              />
                              <label className="form-check-label ms-1">
                                Remember me
                              </label>
                            </div>
                            <a
                              href="#"
                              className="text-dark"
                              onClick={() => setResetStep(1)}
                            >
                              Forgot Password?
                            </a>
                          </div>
                          <div className="d-grid mt-3">
                            <button type="submit" className="btn btn-primary">
                              Log In
                            </button>
                          </div>
                          <p className="text-center my-3">
                            <small>
                              Don't have an account?
                              <span
                                className="fs-6 text-primary"
                                onClick={() => {
                                  handleClose();
                                  onOpenRegister();
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                {" "}
                                Sign Up!
                              </span>
                            </small>
                          </p>
                        </>
                      )}

                      {resetStep === 1 && (
                        <>
                          <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Enter your username or email"
                            value={resetUsername}
                            onChange={(e) => setResetUsername(e.target.value)}
                            required
                          />
                          <div className="d-flex justify-content-end">
                            <button
                              className="btn btn-secondary me-2"
                              onClick={() => setResetStep(0)}
                            >
                              Back
                            </button>
                            <button type="submit" className="btn btn-primary">
                              Send OTP
                            </button>
                          </div>
                        </>
                      )}

                      {resetStep === 2 && (
                        <>
                          <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Enter OTP"
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value)}
                            required
                          />
                          <div className="d-flex justify-content-end">
                            <button
                              className="btn btn-secondary me-2"
                              onClick={() => setResetStep(0)}
                            >
                              Back
                            </button>
                            <button type="submit" className="btn btn-primary">
                              Verify OTP
                            </button>
                          </div>
                        </>
                      )}

                      {resetStep === 3 && (
                        <>
                          <div className="form-group input-group mb-2">
                            <input
                              type={resetPasswordShown ? "text" : "password"}
                              className="form-control"
                              placeholder="Enter new password"
                              value={resetNewPassword}
                              onChange={handleResetPasswordChange}
                              required
                            />
                            <span
                              className="input-group-text"
                              style={{ cursor: "pointer" }}
                              onClick={() => setResetPasswordShown((p) => !p)}
                            >
                              {resetPasswordShown ? "🙈" : "👁️"}
                            </span>
                          </div>
                          <div className="mb-2 small">
                            <span
                              style={{
                                color: resetPasswordValid.upper
                                  ? "green"
                                  : "red",
                              }}
                            >
                              • 1 uppercase
                            </span>
                            <br />
                            <span
                              style={{
                                color: resetPasswordValid.lower
                                  ? "green"
                                  : "red",
                              }}
                            >
                              • 1 lowercase
                            </span>
                            <br />
                            <span
                              style={{
                                color: resetPasswordValid.special
                                  ? "green"
                                  : "red",
                              }}
                            >
                              • 1 special character
                            </span>
                            <br />
                            <span
                              style={{
                                color: resetPasswordValid.length
                                  ? "green"
                                  : "red",
                              }}
                            >
                              • Min 6 characters
                            </span>
                          </div>
                          <div className="d-flex justify-content-end">
                            <button
                              className="btn btn-secondary me-2"
                              onClick={() => setResetStep(0)}
                            >
                              Back
                            </button>
                            <button type="submit" className="btn btn-primary">
                              Set Password
                            </button>
                          </div>
                        </>
                      )}

                      {error && (
                        <div className="text-danger mt-2 text-center">
                          {error}
                        </div>
                      )}
                      {(success || otpSuccess) && (
                        <div className="text-success mt-2 text-center">
                          {success || otpSuccess}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginModal;