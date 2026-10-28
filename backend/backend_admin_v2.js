const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// 1. Add rejectionEmailHTML
const rejectEmailStr = `
function rejectionEmailHTML(name) {
    return \`
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Donation Verification Issue</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear <strong>\${name}</strong>,</p>
            <p>Our financial team audited your recent submission but was unfortunately unable to verify the claimed amount against our active bank ledgers.</p>
            <p>This typically happens if the uploaded receipt was illegible, a transaction bounced, or the transfer is still pending inter-bank clearance.</p>
            <p><strong>Please check your banking app to confirm the funds were heavily deducted or send us a clear screenshot of the successful receipt directly to our WhatsApp support line so we can assist you.</strong></p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/923238723663?text=Assalam%20o%20Alaikum!%20My%20donation%20verification%20failed.%20Here%20is%20my%20screenshot%20for%20clearance." style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">💬 Resolve via WhatsApp</a>
            </div>
        </div>
    </div>\`;
}
`;
server = server.replace("// ============================================================\n// SUPABASE POSTGRES DATABASE CONNECTION", rejectEmailStr + "\n// ============================================================\n// SUPABASE POSTGRES DATABASE CONNECTION");

// 2. Expand Admin Routes
const expandedRoutes = `
// ============================================================
// ADMIN PORTAL ROUTES
// ============================================================

app.get('/api/admin/donations', async (req, res) => {
    if (!dbConnected) {
        return res.json({ success: true, data: mockDB.donations });
    }
    try {
        const result = await pool.query("SELECT * FROM donations ORDER BY created_at DESC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/admin/volunteers', async (req, res) => {
    if (!dbConnected) {
        return res.json({ success: true, data: mockDB.volunteers });
    }
    try {
        const result = await pool.query("SELECT * FROM volunteers ORDER BY created_at DESC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.patch('/api/admin/verify-donation/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
        return res.json({ success: true, message: 'Simulated verification' });
    }
    try {
        await pool.query("UPDATE donations SET status='verified' WHERE id = $1", [id]);
        res.json({ success: true, message: 'Donation verified successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.patch('/api/admin/reject-donation/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
        return res.json({ success: true, message: 'Simulated rejection' });
    }
    try {
        const result = await pool.query("UPDATE donations SET status='rejected' WHERE id = $1 RETURNING donor_name, donor_email", [id]);
        if(result.rowCount > 0) {
            const { donor_name, donor_email } = result.rows[0];
            await sendConfirmationEmail({
                to: donor_email,
                subject: 'Donation Verification Issue | ABS Foundation',
                html: rejectionEmailHTML(donor_name)
            });
        }
        res.json({ success: true, message: 'Donation rejected and email dispatched' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.patch('/api/admin/verify-volunteer/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
        return res.json({ success: true, message: 'Simulated verification' });
    }
    try {
        await pool.query("UPDATE volunteers SET status='verified' WHERE id = $1", [id]);
        res.json({ success: true, message: 'Volunteer verified successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/admin/volunteer/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) return res.json({ success: true });
    try {
        await pool.query("DELETE FROM volunteers WHERE id = $1", [id]);
        res.json({ success: true, message: 'Volunteer deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
`;

// Remove the old ADMIN PORTAL ROUTES completely
server = server.replace(/\/\/ ============================================================\n\/\/ ADMIN PORTAL ROUTES\n\/\/ ============================================================\n[\s\S]*?app\.listen\(PORT/, expandedRoutes + "\napp.listen(PORT");

fs.writeFileSync('server.js', server);
console.log('Server updated');
