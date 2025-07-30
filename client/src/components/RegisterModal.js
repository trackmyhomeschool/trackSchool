import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RegisterModal.css";

function RegisterModal({ show, handleClose, onOpenLogin }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    state: "",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/states`)
      .then((res) => setStateOptions(res.data || []))
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  const validatePassword = (pwd) => ({
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
    if (name === "password") setPasswordValid(validatePassword(value));
  };

  const sendOtp = async () => {
    try {
      setResendDisabled(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/send-otp`, {
        email: formData.email,
      });
      setIsOtpSent(true);
      setIsEditing(false);
      setSuccess("OTP sent to your email");
      setTimeout(() => setResendDisabled(false), 15000);
    } catch {
      setError("Failed to send OTP");
      setResendDisabled(false);
    }
  };

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Please enter a valid 6-digit OTP.");
    const valid = validatePassword(formData.password);
    if (!valid.length || !valid.upper || !valid.lower || !valid.special)
      return setError("Password does not meet all requirements.");

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/verify-otp`,
        { ...formData, otp },
        { withCredentials: true }
      );
      setSuccess("Registration successful!");
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          username: "",
          password: "",
          state: "",
        });
        setOtp("");
        setIsOtpSent(false);
        setPasswordValid({
          length: false,
          upper: false,
          lower: false,
          special: false,
        });
        setIsEditing(false);
        handleClose();
        onOpenLogin();
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed";
      setOtpAttempts((prev) => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setError("Too many incorrect attempts. Please try again.");
          setTimeout(() => handleTryAgain(), 3000);
        } else {
          setError(`${msg}. You have ${3 - newCount} attempt(s) left.`);
        }
        return newCount;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      return setError("Please enter a valid email address.");
    const valid = validatePassword(formData.password);
    if (!valid.length || !valid.upper || !valid.lower || !valid.special)
      return setError("Password does not meet all requirements.");
    await sendOtp();
  };

  const handleTryAgain = () => {
    setOtpAttempts(0);
    setOtp("");
    setError("");
    setSuccess("");
    setIsOtpSent(false);
    setIsEditing(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      state: "",
    });
    setPasswordValid({
      length: false,
      upper: false,
      lower: false,
      special: false,
    });
  };

  const handleEditDetails = () => {
    setIsEditing(true);
    setSuccess("");
    setError("");
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
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
                    <a
                      className="navbar-caption fs-4 text-primary ls-1 fw-bold"
                      href="#"
                    >
                      <img
                        src="images/logo.png"
                        className="img-fluid h-logo-50"
                        alt="Logo"
                      />
                    </a>
                  </div>
                  <div className="login-title">
                    <h5 className="text-primary fw-semibold">
                      Create your Account
                    </h5>
                    <p className="text-muted mb-0">
                      Welcome back! Please Register Your Account
                    </p>
                  </div>
                </div>

                <form
                  className="px-lg-4 px-2 mt-2"
                  onSubmit={
                    isOtpSent && !isEditing
                      ? verifyOtpAndRegister
                      : handleSubmit
                  }
                >
                  <div className="form-group input-group mb-3">
                    <span className="input-group-text">
                      <i className="ri-user-line"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={isOtpSent && !isEditing}
                    />
                    <input
                      type="text"
                      className="form-control ms-3"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={isOtpSent && !isEditing}
                    />
                  </div>

                  <div className="form-group input-group mb-3">
                    <span className="input-group-text">
                      <i className="ri-mail-line"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Enter Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isOtpSent && !isEditing}
                    />
                  </div>

                  <div className="form-group input-group mb-3">
                    <span className="input-group-text">
                      <i className="ri-user-3-line"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={isOtpSent && !isEditing}
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
                      disabled={isOtpSent && !isEditing}
                    />
                    <span
                      className="input-group-text"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{ cursor: "pointer" }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  </div>

                  {!isOtpSent && (
                    <div
                      className="mb-2"
                      style={{ fontSize: "0.9rem", color: "red" }}
                    >
                      {!passwordValid.upper && (
                        <div>• At least 1 uppercase letter</div>
                      )}
                      {!passwordValid.lower && (
                        <div>• At least 1 lowercase letter</div>
                      )}
                      {!passwordValid.special && (
                        <div>• At least 1 special character</div>
                      )}
                      {!passwordValid.length && (
                        <div>• Minimum 6 characters</div>
                      )}
                    </div>
                  )}

                  <div className="form-group input-group mb-3">
                    <span className="input-group-text">
                      <i className="ri-map-line"></i>
                    </span>
                    <select
                      className="form-select"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      disabled={isOtpSent && !isEditing}
                    >
                      <option value="">Select your state</option>
                      {stateOptions.map((state) => (
                        <option key={state._id} value={state._id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isOtpSent && !isEditing && (
                    <>
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={handleEditDetails}
                        >
                          Edit Details
                        </button>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={sendOtp}
                          disabled={otpAttempts >= 3 || resendDisabled}
                        >
                          Resend OTP
                        </button>
                      </div>
                      {otpAttempts >= 3 && (
                        <button
                          type="button"
                          className="btn btn-secondary mt-2"
                          onClick={handleTryAgain}
                        >
                          Try Again
                        </button>
                      )}
                    </>
                  )}

                  <div className="d-grid mt-3">
                    <button type="submit" className="btn btn-primary">
                      {isOtpSent && !isEditing
                        ? "Verify & Register"
                        : "Register Account"}
                    </button>
                  </div>

                  <p className="text-center my-3">
                    <small>
                      Already have an account?
                      <span
                        className="fs-6 text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          handleClose();
                          onOpenLogin();
                        }}
                      >
                        {" "}
                        Log in!
                      </span>
                    </small>
                  </p>

                  {error && (
                    <p className="text-danger text-center mt-2">{error}</p>
                  )}
                  {success && (
                    <p className="text-success text-center mt-2">{success}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterModal;
