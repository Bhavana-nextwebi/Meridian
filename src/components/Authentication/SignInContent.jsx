import React, { useState } from "react";
import Cookies from "js-cookie";
import allImages from "../../assets/images-import.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Interceptors/axiosInstance.jsx";


export const SignInContent = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogged, setKeepLogged] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    setError("");

    const loginData = {
      userName: username,
      password: password,
      keepLogged: keepLogged ? "true" : "false",
    };

    try {
      setIsButtonDisabled(true);
      const response = await axiosInstance.post("auth/login", loginData, {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });
      setIsButtonDisabled(false);

      if (!response.data) {
        throw new Error("Login failed");
      }

      const data = response.data;

      const payload = data.result || data.data || data;
      const accessToken = payload.accessToken;
      const refreshToken = payload.refreshToken;

      if (!accessToken) {
        console.error("Login response did not contain an accessToken:", data);
        setError("Login succeeded but no token was returned. Check API response shape.");
        return;
      }

      Cookies.set("accessToken", accessToken, { expires: 1 });
      Cookies.set("refreshToken", refreshToken, { expires: 7 });

      if (redirectAfterLogin) {
        navigate(redirectAfterLogin);
        localStorage.removeItem("redirectAfterLogin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setIsButtonDisabled(false);
      console.error("Error during login:", error);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className="meridian-page-bg auth-page-wrapper py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="auth-page-content overflow-hidden pt-lg-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="card meridian-card overflow-hidden">
                <div className="row g-0" style={{ minHeight: "580px" }}>
                  <div className="col-lg-6 d-none d-lg-block meridian-image-col">
                    <img src={allImages.DefaultsImage} alt="Meridian by the Lawns" />
                    <div className="meridian-image-overlay"></div>
                    <div className="meridian-image-caption">
                      {/* <span className="eyebrow">Meridian by the Lawns</span>
                      <h5>Where Unforgettable Memories Are Made</h5> */}
                    </div>
                  </div>

                  <div className="col-lg-6 d-flex align-items-center">
                    <div className="card-body p-md-5 p-4 mx-md-3 w-100">
                      <div className="text-center mb-2">
                        
                         <a href="https://www.jltcabz.com/Default.aspx"
                          className="d-inline-block auth-logo"
                          style={{ marginBottom: "24px" }}
                        >
                          <img src={allImages.logoMeridian} alt="Logo" height="54" />
                        </a>
                      </div>

                      <div className="text-center mb-4">
                        <span className="meridian-eyebrow">Welcome Back</span>
                        <h4 className="meridian-heading">Sign In to Your Account</h4>
                        <div className="meridian-divider"></div>
                        <p className="meridian-subtext mb-0">
                          Log in to continue to MeridianByLawns
                        </p>
                      </div>

                      <form onSubmit={handleSubmit}>
                        {error && (
                          <div className="alert alert-danger py-2" style={{ fontSize: "13.5px" }}>
                            {error}
                          </div>
                        )}

                        <div className="mb-3">
                          <label className="meridian-label" htmlFor="txtUserName">
                            Username
                          </label>
                          <input
                            type="text"
                            className="form-control meridian-input"
                            id="txtUserName"
                            style={{ minHeight: "48px" }}
                            placeholder="Enter user name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="meridian-label" htmlFor="txtPassword">
                            Password
                          </label>
                          <div className="position-relative">
                            <input
                              type={isPasswordVisible ? "text" : "password"}
                              className="form-control meridian-input pe-5"
                              id="txtPassword"
                              style={{ minHeight: "48px" }}
                              placeholder="Enter password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              style={{ boxShadow: "none" }}
                              className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted shadow-none password-addon mt-1"
                              onClick={togglePasswordVisibility}
                            >
                              <i
                                className={
                                  isPasswordVisible
                                    ? "mdi mdi-eye-off align-middle"
                                    : "mdi mdi-eye align-middle"
                                }
                              ></i>
                            </button>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-3 mb-1">
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input me-2"
                              type="checkbox"
                              checked={keepLogged}
                              onChange={(e) => setKeepLogged(e.target.checked)}
                              id="chkLogKeep"
                            />
                            <label className="form-check-label" style={{ fontSize: "13.5px" }} htmlFor="chkLogKeep">
                              Remember me
                            </label>
                          </div>
                         
                        </div>

                        <div className="text-center pt-2 mt-4">
                          <button
                            type="submit"
                            className="btn meridian-btn w-100"
                            disabled={isButtonDisabled}
                          >
                            {isButtonDisabled ? "Signing In..." : "Log In"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};