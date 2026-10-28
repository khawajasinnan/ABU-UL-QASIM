const fs = require('fs');

let content = fs.readFileSync('src/pages/MedicineDrive.jsx', 'utf8');

const oldHook = `    useEffect(() => {
        // Fetch current fund state from backend
        fetch('http://localhost:5000/api/medicine-fund/stats')
            .then(res => res.json())
            .then(data => {
                if (data.totalRaised) {
                    setRaised(data.totalRaised);
                }
            })
            .catch(err => console.error("Could not fetch stats:", err));
    }, []);`;

const newHook = `    useEffect(() => {
        const fetchStats = () => {
            fetch('http://localhost:5000/api/medicine-fund/stats')
                .then(res => res.json())
                .then(data => {
                    if (data.totalRaised !== undefined) {
                        setRaised(data.totalRaised);
                    }
                })
                .catch(err => console.error("Could not fetch stats:", err));
        };
        
        // Initial fetch
        fetchStats();

        // Setup real-time polling every 3 seconds to catch Admin verifications automatically
        const intervalId = setInterval(fetchStats, 3000);

        return () => clearInterval(intervalId);
    }, []);`;

content = content.replace(oldHook, newHook);
fs.writeFileSync('src/pages/MedicineDrive.jsx', content);
console.log('updated');
