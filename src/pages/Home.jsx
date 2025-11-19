import React from "react";
import { Link } from "react-router-dom";
import bgImage from "../assets/bg1.jpg";
import logo from "../assets/logo.png";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white text-center px-6"
      style={{
        backgroundImage: `linear-gradient(rgba(9, 20, 40, 0.8), rgba(9, 20, 40, 0.8)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="Tiny Steps" className="w-24 h-24 object-contain" />
          <p className="uppercase tracking-[0.4em] text-xs text-blue-200">Tiny Steps</p>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Empowering Early Childhood Learning Across Communities
        </h1>

        <p className="text-lg text-blue-100">
          Monitor child development, collaborate with stakeholders, and manage CDC operations all in one platform.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link
            to="/login"
            className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-xl transition-shadow"
          >
            Log In
          </Link>
          <a
            href="https://www.dswdbatangas.ph/"
            target="_blank"
            rel="noreferrer"
            className="border border-white/70 text-white px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}

