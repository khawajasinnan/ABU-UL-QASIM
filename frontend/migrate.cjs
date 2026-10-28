const fs = require('fs');

const donations = fs.readFileSync('src/pages/Donations.jsx', 'utf8');
const home = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// 1. Extract hooks and states
const hooksStartIdx = donations.indexOf('const [amount');
const hooksEndIdx = donations.indexOf('return (');
const hooksCode = donations.slice(hooksStartIdx, hooksEndIdx);

// 2. Extract JSX section
const jsxStartMarker = '<section className="bg-surface-container-low py-24">';
const jsxEndMarker = '<section className="py-24 bg-surface" >';
const jsxStartIdx = donations.indexOf(jsxStartMarker);
const jsxEndIdx = donations.indexOf(jsxEndMarker);
let jsxCode = '';
if (jsxStartIdx !== -1 && jsxEndIdx !== -1) {
    jsxCode = donations.slice(jsxStartIdx, jsxEndIdx);
}

// 3. Update Home.jsx to include React, useRef and APIs
let updatedHome = home.replace(
    "import React, { useState } from 'react';", 
    "import React, { useState, useRef } from 'react';\nconst API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';"
);

// 4. Inject Hooks
const homeReturnIdx = updatedHome.indexOf('return (');
updatedHome = updatedHome.slice(0, homeReturnIdx) + hooksCode + '    ' + updatedHome.slice(homeReturnIdx);

// 5. Inject JSX
const insertAfter = '</section>\n\n            {/* CTA Banner */}';
updatedHome = updatedHome.replace(insertAfter, '\n            {/* Financial Contribution Section */}\n            ' + jsxCode + '\n            {/* CTA Banner */}');

fs.writeFileSync('src/pages/Home.jsx', updatedHome);
console.log('Migration successful');
