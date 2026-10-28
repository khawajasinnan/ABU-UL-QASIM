const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// 1. Import useEffect
home = home.replace("import React, { useState, useRef } from 'react';", "import React, { useState, useRef, useEffect } from 'react';");

// 2. Add state for live totals
const hookInjection = `
    const [liveTotal, setLiveTotal] = useState(0);

    const fetchDonationTotals = async () => {
        try {
            const res = await fetch(\`\${API_URL}/api/donations\`);
            const data = await res.json();
            if (data.success && data.data) {
                const total = data.data.reduce((sum, don) => sum + (Number(don.amount) || 0), 0);
                // Base amount of 2.45M + new database entries
                setLiveTotal(2450000 + total);
            }
        } catch (e) {
            console.error('Failed to fetch live totals', e);
            setLiveTotal(2450000); 
        }
    };

    useEffect(() => {
        fetchDonationTotals();
    }, []);
`;

const homeReturnIdx = home.indexOf('const handleSubscribe = (e) => {');
home = home.slice(0, homeReturnIdx) + hookInjection + '\n    ' + home.slice(homeReturnIdx);

// 3. Update the submit handler to refresh the totals after successful donation
home = home.replace('if (fileInputRef.current) fileInputRef.current.value = \'\';', 'if (fileInputRef.current) fileInputRef.current.value = \'\';\n                fetchDonationTotals();');

// 4. Inject a beautiful live tracker widget at the top of the form
const liveWidget = `
                        {/* Live Total Showcase */}
                        <div className="mb-10 text-center space-y-2 pb-8 border-b border-outline-variant/30">
                            <p className="text-xl font-bold text-on-surface-variant flex items-center justify-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                Real-Time Foundation Treasury
                            </p>
                            <p className="text-5xl md:text-6xl font-black text-primary plus-jakarta-sans tracking-tight">
                                PKR {liveTotal.toLocaleString()}
                            </p>
                            <p className="text-sm text-on-surface-variant font-medium">All database transactions synchronized instantly</p>
                        </div>
`;

home = home.replace('<div className="flex items-center gap-3 mb-8">', liveWidget + '\n                        <div className="flex items-center gap-3 mb-8">');

fs.writeFileSync('src/pages/Home.jsx', home);
console.log('Update Successful');
