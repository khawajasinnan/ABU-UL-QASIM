const fs = require('fs');
let code = fs.readFileSync('src/pages/OurTeam.jsx', 'utf8');
code = code.replaceAll('image: null,', "image: '/dummy-avatar.svg',");
fs.writeFileSync('src/pages/OurTeam.jsx', code);
