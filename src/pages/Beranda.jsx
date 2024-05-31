import { Link } from "react-router-dom";
import Navbar from "./navbar";
import Header from "../components/Header";
import Footer from "./Footer";

export default function Beranda() {
  return (
    <div>
      <Navbar />
      <Header />
      <div className="w-full h-screen flex items-center justify-center">
        <div className="relative">
          <button>
            <Link to="/Login" className="text-black hover:text-blue-500">
              Login
            </Link>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
