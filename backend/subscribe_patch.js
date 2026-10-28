const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// 1. Add subscribers table to initDatabase
const subscriberTable = `
        await pool.query(\`
            CREATE TABLE IF NOT EXISTS subscribers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                notifications BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        \`);`;

server = server.replace(
    "console.log('✅ Supabase Tables initialized successfully.');",
    subscriberTable + "\n        console.log('✅ Supabase Tables initialized successfully.');"
);

// 2. Add the welcome email HTML template
const welcomeEmailHTML = `
function subscriberWelcomeEmailHTML(email) {
    return \`
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7f1d1d, #991b1b); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🩸 Welcome to ABS Network!</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Assalam o Alaikum!</p>
            <p>You have officially joined the <strong>Abu-ul-Qasim Blood Donor Society Network</strong>. You will now receive priority alerts for:</p>
            <ul style="line-height: 2;">
                <li>🚨 <strong>Critical blood shortage</strong> emergencies in Sargodha</li>
                <li>📅 Upcoming <strong>blood donation drives</strong> and medicine campaigns</li>
                <li>💝 <strong>Fundraising updates</strong> for Thalassemia patient care</li>
                <li>🤝 <strong>Volunteer opportunities</strong> with the foundation</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <p style="font-weight: bold; margin-bottom: 15px;">Manage Your Notifications:</p>
                <a href="mailto:bantozindagi0981@gmail.com?subject=ABS%20Notifications%20-%20Keep%20Active&body=I%20want%20to%20continue%20receiving%20ABS%20notifications.%20Email:%20\${email}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px;">✅ Keep Notifications Active</a>
                <a href="mailto:bantozindagi0981@gmail.com?subject=ABS%20Notifications%20-%20Unsubscribe&body=Please%20unsubscribe%20me%20from%20ABS%20notifications.%20Email:%20\${email}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px;">❌ Unsubscribe</a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

            <p style="text-align: center; font-weight: bold; margin-bottom: 15px;">Follow Us on Social Media</p>
            <div style="text-align: center;">
                <a href="https://www.facebook.com/share/17e4GYR57A/" style="display: inline-block; background: #1877F2; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px;">📘 Facebook</a>
                <a href="https://www.instagram.com/abu_ul_qasim_foundation/" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px;">📸 Instagram</a>
            </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Abu-ul-Qasim Blood Donor Society</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 12px;">Muqam e hayyat road Sargodha, Pakistan 40100 | 0323-8723663</p>
        </div>
    </div>\`;
}
`;

server = server.replace(
    "// ============================================================\n// SUPABASE POSTGRES DATABASE CONNECTION",
    welcomeEmailHTML + "\n// ============================================================\n// SUPABASE POSTGRES DATABASE CONNECTION"
);

// 3. Add the /api/subscribe endpoint
const subscribeRoute = `
// 5. NEWSLETTER SUBSCRIPTION
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required.' });
        }

        if (dbConnected) {
            await pool.query(
                'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
                [email]
            );
        }

        sendConfirmationEmail({
            to: email,
            subject: 'Welcome to ABS Network! | Abu-ul-Qasim Foundation',
            html: subscriberWelcomeEmailHTML(email)
        });

        res.json({ success: true, message: 'Successfully subscribed! A welcome email has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to subscribe.' });
    }
});

app.get('/api/admin/subscribers', async (req, res) => {
    if (!dbConnected) return res.json({ success: true, data: [] });
    try {
        const result = await pool.query("SELECT * FROM subscribers ORDER BY created_at DESC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/admin/subscriber/:id', async (req, res) => {
    if (!dbConnected) return res.json({ success: true });
    try {
        await pool.query("DELETE FROM subscribers WHERE id = $1", [req.params.id]);
        res.json({ success: true, message: 'Subscriber removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
`;

server = server.replace(
    "// ============================================================\n// ADMIN PORTAL ROUTES",
    subscribeRoute + "\n// ============================================================\n// ADMIN PORTAL ROUTES"
);

fs.writeFileSync('server.js', server);
console.log('Server patched successfully');
