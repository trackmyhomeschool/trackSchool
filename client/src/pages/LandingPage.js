import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- add this import
import RegisterModal from "../components/RegisterModal";
import LoginModal from "../components/LoginModal";
import homeschoolLogo from "../data/logo.png";
import dashboardPreview from "../data/preview.png";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
// Use SVG or PNG icons in feature cards as before
// import "./LandingPage.css";

function LandingPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [role, setRole] = useState(null); // track user role
  const navigate = useNavigate();

  // Auth check (calls /api/auth/me, expects token cookie)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((user) => setRole(user.role))
      .catch(() => setRole(null));
  }, []);

  // Redirect if authenticated as user (not admin)
  useEffect(() => {
    if (role === "user") {
      navigate("/dashboard");
    }
    // To redirect admins to admin page, uncomment below:
    // if (role === 'admin') navigate('/admin/users');
  }, [role, navigate]);

  const handleOpenRegister = () => setShowRegister(true);
  const handleOpenLogin = () => setShowLogin(true);

  // Only go to dashboard if logged in as user
  const handleLogoClick = () => {
    if (role === "user") {
      window.location.href = "/dashboard";
    }
    // For admin redirect on logo click, uncomment:
    // else if (role === 'admin') window.location.href = '/admin/users';
  };

  return (
    <div className="landing-wrapper">
      {/* NAVBAR */}
      <Navbar
        role={role}
        handleOpenLogin={handleOpenLogin}
        handleOpenRegister={handleOpenRegister}
        handleLogoClick={handleLogoClick}
      />

      {/* HERO SECTION */}
      <section className="hero-section bg-img-1 bg-home-1 pb-0" id="home">
        <div className="container">
          <div className="row align-items-center justify-content-center text-center">
            <div className="col-lg-10">
              <h1 className="display-3 fw-semibold lh-base text-primary">
                Welcome to
                <span className="text-orange text-line">
                  {" "}
                  Track My Homeschool
                </span>
              </h1>
              <p className="mt-4">
                Empowering parents to streamline homeschooling with ease. Say
                goodbye to complicated spreadsheets and scattered records—
                <br />
                Track My Homeschool gives you the tools to monitor progress, log
                learning hours, and generate transcripts all in one place.
              </p>
              <div className="main-btn my-5">
                <button
                  className="btn btn-primary my-2"
                  onClick={handleOpenRegister}
                >
                  Try 4-Days Trial
                </button>
              </div>
              <img
                src="images/preview.png"
                className="img-fluid mt-5 rounded-4"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="position-relative">
        <div className="shape">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            width="1440"
            height="150"
            preserveAspectRatio="none"
            viewBox="0 0 1440 150"
          >
            <g mask="url(#SvgjsMask1022)" fill="none">
              <path
                d="M 0,58 C 144,73 432,131.8 720,133 C 1008,134.2 1296,77.8 1440,64L1440 250L0 250z"
                fill="rgba(255, 255, 255, 1)"
              />
            </g>
            <defs>
              <mask id="SvgjsMask1022">
                <rect width="1440" height="250" fill="#ffffff" />
              </mask>
            </defs>
          </svg>
        </div>
      </div>

      {/* FEATURE SECTION */}
      <section className="section about-section pt-5 z-1" id="about">
        <div className="container">
          <div className="row align-items-center justify-content-center g-lg-4 g-3">
            <div className="col-xl-12">
              <div className="title-sm text-center">
                <span> SIMPLE HOMESCHOOL MANAGEMENT </span>
              </div>
              <div className="about-title main-title mt-3 text-center">
                <h2 className="text-primary">
                  Discover Smart Tools To Boost
                  <span className="text-orange text-line p-0">
                    {" "}
                    Homeschooling
                  </span>
                </h2>
              </div>
            </div>

            <div className="col-xl-12">
              <div className="row g-lg-4 g-3">
                <div className="col-xl-4 col-lg-6 col-md-6">
                  <div className="about-style-two h-100">
                    <div className="icon">
                      <img src="images/creativity.png" alt="Icon" />
                    </div>
                    <h3 className="h3-s">Track academic progress</h3>
                    <div className="bottom">
                      <span>
                        Monitor student performance through easy-to-read charts,
                        analytics, and performance summaries.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-xl-4 col-lg-6 col-md-6">
                  <div className="about-style-two h-100">
                    <div className="icon">
                      <img src="images/users.png" alt="Icon" />
                    </div>
                    <h3 className="h3-s">Log homeschool hours</h3>
                    <div className="bottom">
                      <span>
                        Record daily learning activities and ensure you meet all
                        state requirements without hassle.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-xl-4 col-lg-6 col-md-6">
                  <div className="about-style-two h-100">
                    <div className="icon">
                      <img src="images/appoinment.png" alt="Icon" />
                    </div>
                    <h3 className="h3-s">Generate GPA Reports</h3>
                    <div className="bottom">
                      <span>
                        Automatically create professional transcripts and GPA
                        summaries for college applications.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRUCTURE SECTION */}
      <section className="section feature-section bg-light">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-5">
              <div className="title-sm">
                <span> STRUCTURE </span>
              </div>
              <div className="feature-title main-title mt-3">
                <h2 className="text-primary">
                  Discover All
                  <span className="text-orange text-line">Our Features</span>
                </h2>
                <p className="my-3">
                  Keep homeschooling simple and stress-free with tools designed
                  to manage every aspect of your child’s learning journey.
                </p>
              </div>
              <div className="row mt-4 g-lg-4 g-3">
                <div className="col-lg-6">
                  <h6 className="text-primary fw-semibold">
                    <i className="ri-checkbox-blank-circle-fill text-orange me-3"></i>
                    Progress Tracking
                  </h6>
                </div>
                <div className="col-lg-6">
                  <h6 className="text-primary fw-semibold">
                    <i className="ri-checkbox-blank-circle-fill text-orange me-3"></i>
                    Activity Logging
                  </h6>
                </div>
                <div className="col-lg-6">
                  <h6 className="text-primary fw-semibold">
                    <i className="ri-checkbox-blank-circle-fill text-orange me-3"></i>
                    GPA & Transcripts
                  </h6>
                </div>
                <div className="col-lg-6">
                  <h6 className="text-primary fw-semibold">
                    <i className="ri-checkbox-blank-circle-fill text-orange me-3"></i>
                    Easy Management
                  </h6>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <img src="images/graph.png" className="img-fluid" />
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY INFO SECTION */}
      <section className="counter-part pt-0 bg-primary">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-3">
              <div className="counter-no mt-5 text-center p-4">
                <div className="icon mb-5">
                  <i className="ri-team-line fs-1 p-3 bg-success-subtle rounded-3 text-primary"></i>
                </div>
                <div className="number">
                  <h2 className="text-white fw-bold">100,000+</h2>
                </div>
                <div className="content">
                  <p className="text-white-50">No. of People Join</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="counter-no mt-5 text-center shadow-none">
                <div className="icon mb-5">
                  <i className="ri-checkbox-line fs-1 p-3 bg-success-subtle rounded-3 text-primary"></i>
                </div>
                <div className="number">
                  <h2 className="text-white fw-bold">120+</h2>
                </div>
                <div className="content">
                  <p className="text-white-50">Countries Reached</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="counter-no mt-5 text-center p-4">
                <div className="icon mb-5">
                  <i className="ri-vidicon-line fs-1 p-3 bg-success-subtle rounded-3 text-primary"></i>
                </div>
                <div className="number">
                  <h2 className="text-white fw-bold">425,000+</h2>
                </div>
                <div className="content">
                  <p className="text-white-50">No. of Sessions Given</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="counter-no mt-5 text-center p-4">
                <div className="icon mb-5">
                  <i className="ri-hourglass-fill fs-1 p-3 bg-success-subtle rounded-3 text-primary"></i>
                </div>
                <div className="number">
                  <h2 className="text-white fw-bold">500K</h2>
                </div>
                <div className="content">
                  <p className="text-white-50">Hour of work</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="section price-section bg-light" id="price">
        <div className="container">
          <div className="row align-items-center text-center justify-content-center">
            <div className="col-lg-6">
              <div className="title-sm">
                <span> OUR PRICING </span>
              </div>
              <div className="price-title main-title mt-3">
                <h2 className="text-primary">
                  Choose the Plan That Fits Your
                  <span className="text-orange text-line">
                    Homeschooling
                  </span>{" "}
                  Needs
                </h2>
              </div>
            </div>
          </div>
          <div className="row mt-4 g-4">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0 rounded-2">
                <div className="card-body text-start p-3">
                  <div className="p-4 bg-light rounded-2">
                    <h4 className="card-title text-primary fw-bold">Free</h4>
                    <p className="mt-4 m-0">
                      All plans include a 4-day free trial – no credit card
                      required. Cancel anytime.
                    </p>
                  </div>
                  <div className="price-info text-start p-4">
                    <h1 className="fw-bold text-primary my-3">
                      $ 0<span className="fs-6 text-muted"> / Month</span>
                    </h1>
                    <p className="text-dark mb-4">Includes :</p>
                    <ul>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        Unlimited students
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        Unlimited Daily Logs
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        GPA Reports
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        State requirement tracking
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-footer border-0 p-4">
                  <div className="price-btn text-center">
                    <button
                      onClick={handleOpenLogin}
                      className="btn btn-outline-primary w-50"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0 rounded-2">
                <div className="card-body text-start p-3">
                  <div className="p-4 bg-light rounded-2">
                    <h4 className="card-title text-primary fw-bold">
                      Monthly Subscription
                    </h4>
                    <p className="mt-4 m-0">
                      Enjoy full access to all features with the best value
                      monthly plan.
                    </p>
                  </div>
                  <div className="price-info text-start p-4">
                    <h1 className="fw-bold text-primary my-3">
                      $ 2.99<span className="fs-6 text-muted"> / Month</span>
                    </h1>
                    <p className="text-dark mb-4">Includes :</p>
                    <ul>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        Unlimited students
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        Full transcript generation
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        Diploma creation
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        State requirement tracking
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-footer border-0 p-4">
                  <div className="price-btn text-center">
                    <button
                      onClick={handleOpenLogin}
                      className="btn btn-outline-primary w-50"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card shadow h-100 border-0 rounded-2">
                <div className="card-body text-start">
                  <div className="p-4 bg-primary rounded-2">
                    <h4 className="card-title text-light fw-bold">
                      Annual Subscription
                    </h4>
                    <p className="mt-4 m-0 text-white">
                      Run production apps with full functionality in best price.
                      Save over 33%
                    </p>
                  </div>
                  <div className="price-info text-start p-4">
                    <h1 className="fw-bold text-primary my-3">
                      $ 20<span className="fs-6 text-muted"> / Year</span>
                    </h1>
                    <p className="text-dark mb-4">Includes :</p>
                    <ul>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        Unlimited students
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        Full transcript generation
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        Diploma creation
                      </li>
                      <li className="mt-3 text-muted">
                        <i className="ri-checkbox-circle-line text-primary me-4 fs-5 align-middle"></i>
                        State requirement tracking
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-footer border-0 p-4">
                  <div className="price-btn text-center">
                    <button
                      onClick={handleOpenLogin}
                      className="btn btn-primary text-light w-50"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="section faq-section">
        <div className="container">
          <div className="row align-items-center justify-content-center text-center">
            <div className="col-lg-7">
              <div className="title-sm">
                <span> NEED SUPPORT </span>
              </div>
              <div className="price-title main-title mt-3">
                <h2 className="text-primary">
                  Frequently asked
                  <span className="text-orange text-line">Questions</span>
                </h2>
              </div>
            </div>
          </div>
          <div className="row align-items-center justify-content-between mt-5">
            <div className="col-lg-5 mt-5">
              <div className="faq-all">
                <h5 className="lh-base">
                  <i className="ri-number-1 me-3 p-2 bg-success-subtle text-primary rounded-circle align-middle"></i>
                  What is Track My Homeschool?
                </h5>
                <p className="ms-5">
                  Track My Homeschool is an online platform designed to help
                  parents manage and track their child’s homeschooling progress,
                  hours, and GPA with ease.
                </p>
              </div>
              <div className="faq-all">
                <h5 className="mt-5">
                  <i className="ri-number-2 me-3 p-2 bg-success-subtle text-primary rounded-circle align-middle"></i>
                  Do I need to install any software?
                </h5>
                <p className="ms-5">
                  No installation is required. Track My Homeschool is a
                  web-based platform that you can access from any device with an
                  internet connection.
                </p>
              </div>
              <div className="faq-all">
                <h5 className="mt-5 d-flex">
                  <div>
                    <i className="ri-number-3 me-3 p-2 bg-success-subtle text-primary rounded-circle align-middle"></i>
                  </div>
                  <div>
                    Is Track My Homeschool compliant with US state regulations?
                  </div>
                </h5>
                <p className="ms-5">
                  Yes, our platform is designed to help parents meet
                  state-specific homeschooling requirements, including accurate
                  activity logs and reporting.
                </p>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="faq-all">
                <h5 className="lh-base">
                  <i className="ri-number-4 me-3 p-2 bg-success-subtle text-primary rounded-circle align-middle"></i>
                  Can I generate transcripts and GPA reports?
                </h5>
                <p className="ms-5">
                  Yes! You can easily generate professional transcripts and GPA
                  reports ready for college applications or personal records
                  with one of the paid subscriptions. (Added: with one of the
                  paid subscriptions) or something to that effect.
                </p>
              </div>
              <div className="faq-all">
                <h5 className="mt-5">
                  <i className="ri-number-5 me-3 p-2 bg-success-subtle text-primary rounded-circle align-middle"></i>
                  Do you offer a free trial?
                </h5>
                <p className="ms-5">
                  Yes, all our plans come with a 4-day free trial—no credit card
                  required. You can explore all features before committing to a
                  plan.
                </p>
              </div>
              <div className="faq-all">
                <h5 className="mt-5 lh-base">
                  <i className="ri-number-6 me-3 p-2 bg-success-subtle text-primary rounded-circle align-middle"></i>
                  Can I cancel my subscription anytime?
                </h5>
                <p className="ms-5">
                  Absolutely. You have full control of your subscription and can
                  cancel anytime without any hidden fees.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="faq-back">
          <h1 className="fw-bold">FaQ's</h1>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="section cta-section bg-light" id="contacts">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-6">
              <div className="d-flex bg-white p-3 shadow-sm">
                <lord-icon
                  src="https://cdn.lordicon.com/mhhpoybt.json"
                  trigger="loop"
                  colors="primary:#121331,secondary:#ee8f66,tertiary:#ebe6ef"
                  style={{ width: "80px", height: "80px" }}
                />
                <div className="d-block align-self-center ms-4">
                  <h4 className="fw-semibold text-primary">Phone number</h4>
                  <span>1 (540) 846-1729</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="d-flex bg-white p-3 shadow-sm">
                <lord-icon
                  src="https://cdn.lordicon.com/nqisoomz.json"
                  trigger="loop"
                  colors="primary:#121331,secondary:#ebe6ef,tertiary:#ee8f66,quaternary:#3a3347"
                  style={{ width: "80px", height: "80px" }}
                />
                <div className="d-block ms-4 align-self-center">
                  <h4 className="fw-semibold text-primary">Mail address</h4>
                  <span>chanelle@trackmyhomeschool.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

      {/* AUTH MODALS */}
      <RegisterModal
        show={showRegister}
        handleClose={() => setShowRegister(false)}
        onOpenLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
      <LoginModal
        show={showLogin}
        handleClose={() => setShowLogin(false)}
        onOpenRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
    </div>
  );
}

export default LandingPage;
