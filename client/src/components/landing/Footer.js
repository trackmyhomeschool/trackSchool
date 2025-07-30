import React from "react";

const Footer = () => {
  return (
    <footer className="section footer-part-3 py-5 footer-part">
      <div className="container">
        <div className="row my-5 justify-content-between">
          <div className="col-lg-4 align-self-start">
            <div className="footer-about">
              <div className="logo">
                <a
                  className="navbar-caption fs-4 text-light ls-1 fw-bold"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="d-flex align-items-end">
                    <div className="me-2 bg-white">
                      <img
                        src="/images/logo.png"
                        className="img-fluid logo-h"
                        alt="Logo"
                      />
                    </div>
                    <div className="logo-text text-white">
                      TRACK MY <br />
                      HOMESCHOOL
                    </div>
                  </div>
                </a>
              </div>
              <div className="d-flex mt-4">
                <p className="text-white-50">
                  The comprehensive platform for homeschool record-keeping,
                  planning, and reporting.
                </p>
              </div>
              <h5 className="text-white mt-3">Subscribe to our Site :</h5>
              <div className="form-button mt-4">
                <form
                  className="d-flex align-items-center"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                  />
                  <button
                    type="submit"
                    className="me-2 btn btn-link text-white foot-btn"
                  >
                    <i className="ri-send-plane-2-line"></i>
                  </button>
                </form>
              </div>
              <div className="copy-info text-white-50 mt-4 font-15">
                © {new Date().getFullYear()} TrackMyHomeSchool - Created By{" "}
                <a
                  href="https://dreamnextech.com/"
                  className="text-white text-decoration-underline font-15"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DreamNexTech
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-12">
            <h5 className="text-light">Features :</h5>
            <ul className="list-unstyled mt-4">
              <li>
                <a
                  href="#"
                  className="text-white-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Student Progress
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white-50"
                  onClick={(e) => e.preventDefault()}
                >
                  GPA Reports
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white-50"
                  onClick={(e) => e.preventDefault()}
                >
                  Daily Logs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white-50"
                  onClick={(e) => e.preventDefault()}
                >
                  State Compliance
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-4 col-12">
            <h5 className="text-light fs-5">Contact :</h5>
            <p>Have questions? Contact our support team.</p>
            <a className="btn btn-orange text-light mt-3" href="/login">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
