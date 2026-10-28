const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const updatedLiveRoute = `app.get('/api/donations/live', async (req, res) => {
    if (!dbConnected) {
        return res.json({ success: true, liveTotal: 0, medicineRaised: 0, bloodRaised: 0 });
    }
    try {
        const res1 = await pool.query("SELECT SUM(amount) as total FROM donations WHERE status='verified'");
        const res2 = await pool.query("SELECT SUM(amount) as total FROM medicine_funds");
        const total = (parseInt(res1.rows[0].total) || 0) + (parseInt(res2.rows[0].total) || 0);

        const medRes = await pool.query("SELECT SUM(amount) as total FROM donations WHERE status='verified' AND purpose='Thalassemia Medicine'");
        const medicineRaised = (parseInt(medRes.rows[0].total) || 0) + (parseInt(res2.rows[0].total) || 0);

        const bloodRes = await pool.query("SELECT SUM(amount) as total FROM donations WHERE status='verified' AND purpose='Emergency Blood Drive'");
        const bloodRaised = parseInt(bloodRes.rows[0].total) || 0;

        res.json({ success: true, liveTotal: total, medicineRaised, bloodRaised });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});`;

server = server.replace(/app\.get\('\/api\/donations\/live', async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ success: false, error: err\.message \}\);\n    \}\n\}\);/, updatedLiveRoute);

fs.writeFileSync('server.js', server);
console.log('Server routes updated for distinct campaign tracking');
