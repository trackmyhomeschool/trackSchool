import React, { useState, useEffect } from "react";

const Navbar = ({
  handleOpenLogin,
  handleOpenRegister,
  role,
  handleLogoClick,
}) => {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header>
      <nav
        className={`navbar navbar-expand-lg fixed-top navbar-custom sticky-light ${
          sticky ? "nav-sticky" : ""
        }`}
        id="navbar"
      >
        <div className="container">
          <div
            className="navbar-brand logo"
            style={{ cursor: role === "user" ? "pointer" : "default" }}
            onClick={handleLogoClick}
          >
            <a
              className="navbar-caption fs-4 text-primary ls-1 fw-bold"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <div className="d-flex align-items-end">
                <div className="pe-2">
                  <img
                    src="/images/logo.png"
                    className="img-fluid logo-h-inner"
                    alt="Logo"
                  />
                </div>
                <div className="logo-text">
                  TRACK MY <br />
                  HOMESCHOOL
                </div>
              </div>
            </a>
          </div>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="fw-bold fs-4">
              <i className="ri-menu-5-line"></i>
            </span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav mx-auto" id="navbar-navlist">
              <li className="nav-item">
                <a className="nav-link" href="#home">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  Student Progress
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services">
                  GPA Reports
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#price">
                  Daily Logs
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contacts">
                  State Requirements
                </a>
              </li>
            </ul>
            <ul className="navbar-nav nav-btn">
              <li className="nav-item">
                <button
                  className="btn btn-primary my-2"
                  onClick={handleOpenLogin}
                >
                  Login
                </button>
                <button
                  className="btn btn-outline-primary ms-2"
                  onClick={handleOpenRegister}
                >
                  Sign Up
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
