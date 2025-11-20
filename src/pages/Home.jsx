import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Home() {
  // Smooth scroll function
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
   <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
  <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-20">
      <div className="flex items-center">
        <img src={logo} alt="TinyTrack" className="w-12 h-12 object-contain" />
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-gray-900">TinyTrack</h1>
          <p className="text-sm text-gray-600 font-medium">Child Development Center Management System</p>
        </div>
      </div>
      
      <nav className="hidden lg:flex space-x-10 absolute left-1/2 transform -translate-x-1/2">
        <button 
          onClick={(e) => handleNavClick(e, 'hero')}
          className="text-gray-700 hover:text-[#166534] font-semibold transition-colors duration-300"
        >
          Overview
        </button>
        <button 
          onClick={(e) => handleNavClick(e, 'features')}
          className="text-gray-700 hover:text-[#166534] font-semibold transition-colors duration-300"
        >
          Features
        </button>
        <button 
          onClick={(e) => handleNavClick(e, 'about')}
          className="text-gray-700 hover:text-[#166534] font-semibold transition-colors duration-300"
        >
          About
        </button>
      </nav>

      <div className="flex items-center space-x-4">
        <Link
          to="/login"
          className="bg-[#166534] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#14502d] transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Sign In
        </Link>
      </div>
    </div>
  </div>
</header>

      {/* Hero Section - This is the Overview section */}
      <section id="hero" className="relative bg-gradient-to-br from-[#166534] via-[#14502d] to-[#0f3d21] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-4xl">👶</div>
          <div className="absolute top-20 right-20 text-3xl">📚</div>
          <div className="absolute bottom-20 left-20 text-4xl">🎯</div>
          <div className="absolute bottom-10 right-10 text-3xl">📊</div>
          <div className="absolute top-1/3 left-1/4 text-2xl">🌟</div>
          <div className="absolute top-1/2 right-1/3 text-3xl">🔍</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img src={logo} alt="TinyTrack" className="w-24 h-24 object-contain" />
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              TinyTrack
            </h1>
            
            <p className="text-2xl lg:text-3xl text-white/90 mb-8 leading-relaxed font-light max-w-4xl mx-auto">
              A Management and Monitoring System for Child Development Centers
            </p>

            <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-3xl mx-auto">
              Empowering early childhood development through comprehensive digital solutions and innovative monitoring tools across Philippine communities.
            </p>

            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                to="/login"
                className="bg-white text-[#166534] font-bold px-12 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 text-lg"
              >
                Access Platform
              </Link>
              <button 
                onClick={(e) => handleNavClick(e, 'features')}
                className="border-2 border-white text-white font-bold px-12 py-4 rounded-xl hover:bg-white hover:text-[#166534] transition-all duration-300 hover:scale-105 text-lg"
              >
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </section>
{/* After Hero Section */}
<div className="border-t border-gray-200"></div>


      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Comprehensive System Features</h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Advanced functionality designed specifically for Child Development Center operational excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Child Management System",
                icon: "👦",
                features: ["Digital Registration", "Profile Management", "Development Tracking", "Health Records"]
              },
              {
                title: "Academic Planning",
                icon: "📚",
                features: ["Weekly Scheduling", "Activity Planning", "Curriculum Integration", "Lesson Plans"]
              },
              {
                title: "Assessment Framework",
                icon: "📊",
                features: ["Progress Monitoring", "Domain Assessment", "Quarterly Evaluations", "Milestone Tracking"]
              },
              {
                title: "Reporting System",
                icon: "📑",
                features: ["Automated Reports", "Government Compliance", "Analytics Dashboard", "Export Capabilities"]
              },
              {
                title: "Administrative Control",
                icon: "⚙️",
                features: ["User Management", "Multi-center Support", "Role-based Access", "System Configuration"]
              },
              {
                title: "Development Domains",
                icon: "🎯",
                features: ["7 Key Developmental Areas", "Individualized Support", "Progress Analytics", "Intervention Planning"]
              }
            ].map((category, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{category.title}</h3>
                <ul className="space-y-4">
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700 text-lg">
                      <span className="w-2 h-2 bg-[#166534] rounded-full mr-4"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
{/* Extra thick gray line divider */} 
<div className="border-t-10 border-gray-300"></div>
      {/* Impact Section */}
      <section id="impact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Supporting Sustainable Development Goals</h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
              Aligning with national priorities and global development frameworks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                number: "4",
                title: "Quality Education",
                desc: "Ensuring inclusive and equitable quality education through systematic monitoring and comprehensive assessment frameworks",
                icon: "🎓",
                color: "from-blue-500 to-blue-600"
              },
              {
                number: "3",
                title: "Health & Well-being",
                desc: "Promoting healthy development and comprehensive well-being through meticulous child monitoring systems",
                icon: "❤️",
                color: "from-green-500 to-green-600"
              },
              {
                number: "9",
                title: "Innovation & Infrastructure",
                desc: "Building resilient infrastructure and promoting technological innovation in early childhood education governance",
                icon: "💡",
                color: "from-purple-500 to-purple-600"
              }
            ].map((goal, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${goal.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                    {goal.number}
                  </div>
                  <div className="text-4xl">{goal.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{goal.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{goal.desc}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-[#166534] rounded-full mr=2"></span>
                  Aligned with Philippine Development Plan
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
<div className="border-t-10 border-gray-300"></div>
      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Transforming Child Development Centers</h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Modernizing early childhood education in Lian, Batangas through digital innovation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">Current Operational Challenges</h3>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Across the Philippines, Child Development Centers face significant operational inefficiencies due to manual processes and resource constraints. In the Municipality of Lian, encompassing 19 barangays and 30 Child Development Centers, these challenges directly impact the quality of early childhood education delivery.
              </p>
              <div className="bg-red-50 border-l-6 border-red-500 p-8 rounded-r-2xl shadow-lg">
                <h4 className="font-bold text-red-800 mb-4 text-xl">Manual Operational Processes:</h4>
                <ul className="text-red-700 space-y-3 text-lg">
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-4"></span>
                    Child registration utilizing physical logbook systems
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-4"></span>
                    Paper-based attendance monitoring and tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-4"></span>
                    Developmental progress tracking via Microsoft Excel
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-4"></span>
                    Activity planning and scheduling using Microsoft Word
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-4"></span>
                    Manual report generation for government compliance
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Our Digital Solution</h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-[#166534] p-4 rounded-xl mr-6 shadow-lg">
                    <span className="text-white font-bold text-xl">🌐</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-xl">Centralized Management Platform</h4>
                    <p className="text-gray-600 text-lg leading-relaxed">All Child Development Center operations consolidated within a secure, web-based governance system</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#166534] p-4 rounded-xl mr-6 shadow-lg">
                    <span className="text-white font-bold text-xl">📱</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-xl">Real-time Developmental Monitoring</h4>
                    <p className="text-gray-600 text-lg leading-relaxed">Comprehensive tracking of child development across seven essential developmental domains</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#166534] p-4 rounded-xl mr-6 shadow-lg">
                    <span className="text-white font-bold text-xl">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-xl">Automated Compliance Reporting</h4>
                    <p className="text-gray-600 text-lg leading-relaxed">Streamlined generation of mandatory government reports with automated compliance features</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1CAA52] to-[#166534] text-white">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Child Development Operations?</h2>
          <p className="text-xl text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join the digital transformation initiative for early childhood education governance in the Philippines
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              to="/login"
              className="bg-white text-[#166534] font-bold px-14 py-5 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
            >
              Access Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center mb-6">
                <img src={logo} alt="TinyTrack" className="w-14 h-14 object-contain" />
                <div className="ml-4">
                  <h3 className="font-bold text-xl">TinyTrack</h3>
                  <p className="text-gray-400 text-sm font-medium">Child Development Center Management System</p>
                </div>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                A comprehensive management and monitoring solution for Child Development Centers across the Philippines.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Navigation</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={(e) => handleNavClick(e, 'hero')} className="hover:text-white transition-colors duration-300 text-lg">Overview</button></li>
                <li><button onClick={(e) => handleNavClick(e, 'features')} className="hover:text-white transition-colors duration-300 text-lg">Features</button></li>
                
                <li><button onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white transition-colors duration-300 text-lg">About</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Legal Framework</h4>
              <ul className="space-y-3 text-gray-400 text-lg">
                <li>Republic Act No. 10914</li>

              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Implementation Scope</h4>
              <div className="text-gray-400 space-y-3 text-lg">
                <p>Municipality of Lian, Batangas</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2024 TinyTrack - Child Development Center Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}