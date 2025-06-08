import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import {
  Star,
  CheckCircle,
  Target,
  Award,
  Users,
  Clock,
  BarChart3,
  Dumbbell,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `https://silvergymupdated-production.up.railway.app`;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Check if admin token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload.is_admin || false);
        if (!payload.is_admin) {
          setUser(JSON.parse(localStorage.getItem("user") || "null"));
        }
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, [token]);

  const login = (tokenData, userData = null) => {
    localStorage.setItem("token", tokenData);
    setToken(tokenData);
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenData}`;

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// Components
const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent"
          >
            Silver Gym
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="nav-link text-gray-300 hover:text-white transition-all duration-300"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="nav-link text-gray-300 hover:text-white transition-all duration-300"
            >
              About
            </Link>
            <Link
              to="/membership"
              className="nav-link text-gray-300 hover:text-white transition-all duration-300"
            >
              Membership
            </Link>
            <Link
              to="/trainers"
              className="nav-link text-gray-300 hover:text-white transition-all duration-300"
            >
              Trainers
            </Link>
            <Link
              to="/services"
              className="nav-link text-gray-300 hover:text-white transition-all duration-300"
            >
              Services
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <BarChart3 size={18} />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="btn-gradient-green flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <Users size={18} />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/50 backdrop-blur-xl border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/membership"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Membership
              </Link>
              <Link
                to="/trainers"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Trainers
              </Link>
              <Link
                to="/services"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold w-fit"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className="btn-gradient-green flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold w-fit"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Users size={18} />
                    <span>Admin Panel</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold w-fit"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus size={18} />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <div className="pt-16">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="text-white">Transform Your Body at </span>
              <span className="bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                Silver Gym
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate destination for men who want to build strength,
              muscle, and confidence. Professional training, premium equipment,
              and a brotherhood that pushes you beyond limits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-gradient flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <UserPlus size={20} />
                <span>Join Silver Gym</span>
              </Link>
              <Link
                to="/membership"
                className="btn-secondary flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Target size={20} />
                <span>View Membership</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Silver Gym Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
              Why Choose Silver Gym?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Target className="icon-hover" size={32} />,
                  title: "Professional Training",
                  description:
                    "Expert trainers guide you through beginner to advanced levels with personalized workout plans.",
                },
                {
                  icon: <Award className="icon-hover" size={32} />,
                  title: "Achievement System",
                  description:
                    "Earn stars for every completed exercise and track your daily progress with our gamified system.",
                },
                {
                  icon: <Users className="icon-hover" size={32} />,
                  title: "Brotherhood Community",
                  description:
                    "Join a community of dedicated men committed to fitness excellence and mutual motivation.",
                },
                {
                  icon: <BarChart3 className="icon-hover" size={32} />,
                  title: "Digital Dashboard",
                  description:
                    "Access your personal training dashboard with guided exercises and progress tracking.",
                },
                {
                  icon: <Dumbbell className="icon-hover" size={32} />,
                  title: "Premium Equipment",
                  description:
                    "State-of-the-art fitness equipment and facilities designed for maximum performance and safety.",
                },
                {
                  icon: <Clock className="icon-hover" size={32} />,
                  title: "Flexible Scheduling",
                  description:
                    "Train on your schedule with 24/7 access and flexible workout timing that fits your lifestyle.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="feature-card glass-card p-6 hover:glass-card-hover transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-gray-300 mb-4 bg-gradient-to-br from-gray-700 to-gray-800 w-16 h-16 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sign Up Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-8 hover:glass-card-hover transition-all duration-300">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform?
              </h2>
              <p className="text-gray-300 mb-8">
                Join Silver Gym today and start your journey to becoming the
                strongest version of yourself.
              </p>
              <Link
                to="/signup"
                className="btn-gradient flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex"
              >
                <UserPlus size={20} />
                <span>Start Your Journey</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/50 backdrop-blur-xl border-t border-white/10 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
                  Silver Gym
                </h3>
                <p className="text-gray-400">
                  The ultimate destination for men's fitness and strength
                  training.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/about"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/membership"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Membership
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/trainers"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Trainers
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Services</h4>
                <ul className="space-y-2">
                  <li>
                    <span className="text-gray-400">Personal Training</span>
                  </li>
                  <li>
                    <span className="text-gray-400">Group Classes</span>
                  </li>
                  <li>
                    <span className="text-gray-400">Nutrition Guidance</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <p className="text-gray-400">Email: info@silvergym.com</p>
                <p className="text-gray-400">Phone: +880 1234 567890</p>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                &copy; 2024 Silver Gym. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const About = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16">
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
        About Silver Gym
      </h1>
      <div className="glass-card p-8">
        <p className="text-gray-300 text-lg leading-relaxed">
          Silver Gym is more than just a fitness center – it's a brotherhood
          dedicated to helping men achieve their peak physical potential.
          Founded with the vision of creating the ultimate training environment,
          we provide state-of-the-art equipment, expert guidance, and a
          supportive community that pushes you beyond your limits.
        </p>
      </div>
    </div>
  </div>
);

const Membership = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16">
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
        Membership
      </h1>
      <div className="glass-card p-8 hover:glass-card-hover transition-all duration-300">
        <h2 className="text-3xl font-bold text-white mb-4">
          Silver Membership
        </h2>
        <div className="text-6xl font-bold text-blue-400 mb-4">৳500</div>
        <p className="text-gray-300 text-xl mb-8">Per Month</p>
        <ul className="text-gray-300 space-y-3 mb-8">
          <li className="flex items-center justify-center space-x-2">
            <CheckCircle size={20} className="text-green-400" />
            <span>Access to all gym equipment</span>
          </li>
          <li className="flex items-center justify-center space-x-2">
            <CheckCircle size={20} className="text-green-400" />
            <span>Personal training dashboard</span>
          </li>
          <li className="flex items-center justify-center space-x-2">
            <CheckCircle size={20} className="text-green-400" />
            <span>Exercise tracking with star rewards</span>
          </li>
          <li className="flex items-center justify-center space-x-2">
            <CheckCircle size={20} className="text-green-400" />
            <span>Community access</span>
          </li>
          <li className="flex items-center justify-center space-x-2">
            <CheckCircle size={20} className="text-green-400" />
            <span>24/7 gym access</span>
          </li>
        </ul>
        <Link
          to="/signup"
          className="btn-gradient flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex"
        >
          <UserPlus size={20} />
          <span>Join Now</span>
        </Link>
      </div>
    </div>
  </div>
);

const Trainers = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16">
    <div className="max-w-6xl mx-auto px-4 py-20">
      <h1 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
        Our Trainers
      </h1>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            name: "Ahmed Khan",
            specialty: "Strength Training",
            experience: "8 years",
          },
          {
            name: "Rakib Hasan",
            specialty: "Bodybuilding",
            experience: "6 years",
          },
          {
            name: "Sabbir Ahmed",
            specialty: "Functional Fitness",
            experience: "5 years",
          },
        ].map((trainer, index) => (
          <div
            key={index}
            className="glass-card p-6 text-center hover:glass-card-hover transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Dumbbell size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {trainer.name}
            </h3>
            <p className="text-blue-400 mb-2">{trainer.specialty}</p>
            <p className="text-gray-400">{trainer.experience} experience</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Services = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16">
    <div className="max-w-6xl mx-auto px-4 py-20">
      <h1 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
        Our Services
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          "Personal Training",
          "Group Fitness Classes",
          "Nutrition Consulting",
          "Body Composition Analysis",
          "Functional Movement Assessment",
          "Recovery & Rehabilitation",
        ].map((service, index) => (
          <div
            key={index}
            className="glass-card p-6 hover:glass-card-hover transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <Target size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{service}</h3>
            <p className="text-gray-400">
              Professional {service.toLowerCase()} services tailored to your
              fitness goals.
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/signup`, formData);
      setMessage("Registration successful! Please wait for admin approval.");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16 flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
          Join Silver Gym
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="form-input w-full p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="form-input w-full p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="form-input w-full p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <UserPlus size={20} />
            <span>{loading ? "Signing Up..." : "Sign Up"}</span>
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes("successful") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isAdmin ? "/api/auth/admin/login" : "/api/auth/login";
      const response = await axios.post(`${API}${endpoint}`, formData);

      login(response.data.access_token, response.data.user);
      navigate(isAdmin ? "/admin" : "/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16 flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
          {isAdmin ? "Admin Login" : "Member Login"}
        </h2>

        <div className="flex mb-6">
          <button
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-2 rounded-l-lg transition-all duration-300 ${
              !isAdmin
                ? "btn-gradient"
                : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            Member
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-2 rounded-r-lg transition-all duration-300 ${
              isAdmin
                ? "btn-gradient-green"
                : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="form-input w-full p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="form-input w-full p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
              isAdmin ? "btn-gradient-green" : "btn-gradient"
            }`}
          >
            <LogIn size={20} />
            <span>{loading ? "Logging in..." : "Login"}</span>
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-400">{message}</p>}
        {!isAdmin && (
          <p className="mt-4 text-center text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Sign up here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchExercises();
  }, [selectedLevel]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/user/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data");
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API}/exercises/${selectedLevel}`);
      setExercises(response.data);
    } catch (error) {
      console.error("Failed to fetch exercises");
    }
  };

  const completeExercise = async (exerciseId) => {
    try {
      await axios.post(`${API}/exercises/${exerciseId}/complete`);
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 3000);
      fetchDashboardData();
      fetchExercises();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to complete exercise");
    }
  };

  if (!dashboardData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16">
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass-card p-8 text-center congrats-modal">
            <div className="text-6xl mb-4">
              <Star className="w-16 h-16 text-yellow-400 mx-auto star-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Congratulations!
            </h3>
            <p className="text-gray-300">
              You earned a star! Keep up the great work!
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
          Your Training Dashboard
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 text-center hover:glass-card-hover transition-all duration-300">
            <div className="text-4xl mb-2">
              <Star className="w-12 h-12 text-yellow-400 mx-auto" />
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {dashboardData.total_stars}
            </div>
            <div className="text-gray-300">Total Stars</div>
          </div>
          <div className="glass-card p-6 text-center hover:glass-card-hover transition-all duration-300">
            <div className="text-4xl mb-2">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            </div>
            <div className="text-3xl font-bold text-green-400">
              {dashboardData.completed_today}
            </div>
            <div className="text-gray-300">Completed Today</div>
          </div>
        </div>

        {/* Level Selection */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Choose Your Training Level
          </h2>
          <div className="flex justify-center space-x-4">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 capitalize transform hover:scale-105 ${
                  selectedLevel === level
                    ? "btn-gradient"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 capitalize">
            {selectedLevel} Exercises
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => {
              const isCompleted = dashboardData.today_exercises.includes(
                exercise.id
              );
              return (
                <div
                  key={exercise.id}
                  className="glass-card p-6 hover:glass-card-hover transition-all duration-300"
                >
                  <h4 className="text-xl font-semibold text-white mb-3">
                    {exercise.name}
                  </h4>
                  <p className="text-gray-300 mb-4 text-sm">
                    {exercise.description}
                  </p>
                  <button
                    onClick={() => completeExercise(exercise.id)}
                    disabled={isCompleted}
                    className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isCompleted
                        ? "bg-green-500/50 text-green-300 cursor-not-allowed"
                        : "btn-gradient hover:scale-105"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle size={18} />
                        <span>Completed ✓</span>
                      </>
                    ) : (
                      <>
                        <Target size={18} />
                        <span>Mark as Done</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  const updateUser = async (userId, updateData) => {
    try {
      await axios.put(`${API}/admin/users/${userId}`, updateData);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Failed to update user");
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API}/admin/users/${userId}`);
        fetchUsers();
        fetchStats();
      } catch (error) {
        console.error("Failed to delete user");
      }
    }
  };

  const resetPayments = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all payment statuses to unpaid?"
      )
    ) {
      setLoading(true);
      try {
        await axios.post(`${API}/admin/reset-payments`);
        fetchUsers();
        fetchStats();
        alert("All payment statuses have been reset to unpaid");
      } catch (error) {
        console.error("Failed to reset payments");
      } finally {
        setLoading(false);
      }
    }
  };

  const clearWorkoutData = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all workout data? This will reset all exercise progress but keep user accounts."
      )
    ) {
      setLoading(true);
      try {
        await axios.post(`${API}/admin/clear-workout-data`);
        alert("All workout data has been cleared");
      } catch (error) {
        console.error("Failed to clear workout data");
        alert("Failed to clear workout data");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!stats)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <button
            onClick={fetchUsers}
            className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <BarChart3 size={18} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 text-center hover:glass-card-hover transition-all duration-300">
            <div className="text-3xl font-bold text-white">
              {stats.total_users}
            </div>
            <div className="text-gray-300 flex items-center justify-center space-x-1">
              <Users size={16} />
              <span>Total Users</span>
            </div>
          </div>
          <div className="glass-card p-6 text-center hover:glass-card-hover transition-all duration-300">
            <div className="text-3xl font-bold text-yellow-400">
              {stats.pending_approval}
            </div>
            <div className="text-gray-300 flex items-center justify-center space-x-1">
              <Clock size={16} />
              <span>Pending Approval</span>
            </div>
          </div>
          <div className="glass-card p-6 text-center hover:glass-card-hover transition-all duration-300">
            <div className="text-3xl font-bold text-green-400">
              {stats.active_members}
            </div>
            <div className="text-gray-300 flex items-center justify-center space-x-1">
              <CheckCircle size={16} />
              <span>Active Members</span>
            </div>
          </div>
          <div className="glass-card p-6 text-center hover:glass-card-hover transition-all duration-300">
            <div className="text-3xl font-bold text-blue-400">
              {stats.paid_members}
            </div>
            <div className="text-gray-300 flex items-center justify-center space-x-1">
              <Award size={16} />
              <span>Paid Members</span>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            User Management
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Auto-refresh: Every 30 seconds | Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </p>

          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="glass-card border border-white/10 rounded-lg p-4 hover:glass-card-hover transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold">
                      {user.username}
                    </h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-400 text-sm">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : user.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {user.status.toUpperCase()}
                    </span>

                    {user.status === "approved" && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.payment_status === "paid"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {user.payment_status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.status === "pending" && (
                      <button
                        onClick={() =>
                          updateUser(user.id, { status: "approved" })
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-all duration-300 transform hover:scale-105"
                      >
                        Approve
                      </button>
                    )}

                    {user.status === "approved" &&
                      user.payment_status === "unpaid" && (
                        <button
                          onClick={() =>
                            updateUser(user.id, { payment_status: "paid" })
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-all duration-300 transform hover:scale-105"
                        >
                          Mark as Paid
                        </button>
                      )}

                    {user.status === "approved" &&
                      user.payment_status === "paid" && (
                        <button
                          onClick={() =>
                            updateUser(user.id, { payment_status: "unpaid" })
                          }
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-all duration-300 transform hover:scale-105"
                        >
                          Mark as Unpaid
                        </button>
                      )}

                    <button
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-all duration-300 transform hover:scale-105"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={resetPayments}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? "Processing..." : "Reset All Payments"}
            </button>
            <button
              onClick={clearWorkoutData}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? "Processing..." : "Clear All Workout Data"}
            </button>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-gray-400 text-sm">
              <strong>Reset Payments:</strong> Marks all users as unpaid. Use at
              the start of each month.
            </p>
            <p className="text-gray-400 text-sm">
              <strong>Clear Workout Data:</strong> Removes all exercise progress
              and stars. User accounts remain intact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (!requireAdmin && !user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/services" element={<Services />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
