const fs = require('fs');

// Layout.jsx update
let layout = fs.readFileSync('src/components/Layout.jsx', 'utf8');
layout = layout.replace('<Link to="/donations" className="hover:text-red-600 transition-colors">Financial Donations</Link>', '<a href="/#donate-section" className="hover:text-red-600 transition-colors">Financial Donations</a>');
fs.writeFileSync('src/components/Layout.jsx', layout);

// Home.jsx update
let home = fs.readFileSync('src/pages/Home.jsx', 'utf8');
home = home.replace('<section className="bg-surface-container-low py-24">', '<section id="donate-section" className="bg-surface-container-low py-24">');
home = home.replace('to="/donations"', 'onClick={(e) => { e.preventDefault(); document.getElementById("donate-section")?.scrollIntoView({ behavior: "smooth" }); }}');
fs.writeFileSync('src/pages/Home.jsx', home);

