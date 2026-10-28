require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const Tesseract = require('tesseract.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// OCR Helper: extract amounts from text
function extractAmountsFromOCR(text) {
    const amounts = [];
    // Normalize text: replace Urdu/Arabic numerals with western digits
    const normalized = text
        .replace(/[\u06F0-\u06F9]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 48))
        .replace(/[\u0660-\u0669]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48));

    // Match patterns for Pakistani payment apps (JazzCash, Easypaisa, NayaPay, bank transfers)
    const patterns = [
        /(?:rs\.?|pkr|rupees?|rp)\s*[:.\s]*(\d[\d,]*(?:\.\d{1,2})?)/gi,
        /(\d[\d,]*(?:\.\d{1,2})?)\s*(?:rs\.?|pkr|rupees?)/gi,
        /(?:amount|total|paid|received|sent|transfer|credited|debited|deducted)\s*[:.\s]*(?:rs\.?|pkr)?\s*(\d[\d,]*(?:\.\d{1,2})?)/gi,
        /(?:you\s+(?:have\s+)?(?:sent|paid|received|transferred))\s*(?:rs\.?|pkr)?\s*(\d[\d,]*(?:\.\d{1,2})?)/gi,
        /(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)/g,
        /(?:^|[\s:])(\d{3,7}(?:\.\d{1,2})?)(?:[\s.]|$)/gm,
        /(?:transaction|trx|txn|ref)\s*(?:amount)?\s*[:.\s]*(?:rs\.?|pkr)?\s*(\d[\d,]*(?:\.\d{1,2})?)/gi,
        /[-–]\s*(?:rs\.?|pkr)?\s*(\d[\d,]*(?:\.\d{1,2})?)/gi,
        /(\d[\d,]*(?:\.\d{1,2})?)\s*(?:has been|was|is)\s*(?:sent|paid|received|transferred|credited|debited)/gi,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(normalized)) !== null) {
            const num = parseFloat(match[1].replace(/,/g, ''));
            if (num >= 5 && num <= 10000000 && !amounts.includes(num)) {
                amounts.push(num);
            }
        }
    }
    return amounts.sort((a, b) => b - a);
}

// Background OCR processor
async function processOCR(filePath, donationId, claimedAmount) {
    try {
        console.log(`\ud83d\udd0d OCR: Processing screenshot for donation #${donationId}...`);
        const absolutePath = path.join(__dirname, filePath);
        const { data: { text } } = await Tesseract.recognize(absolutePath, 'eng', {
            logger: () => { } // suppress progress logs
        });
        console.log(`\ud83d\udcdd OCR Raw Text (Donation #${donationId}): ${text.substring(0, 200).replace(/\n/g, ' | ')}`);
        const extractedAmounts = extractAmountsFromOCR(text);
        console.log(`\ud83d\udcb0 OCR Amounts found: [${extractedAmounts.join(', ')}]`);
        const claimedNum = parseFloat(claimedAmount);

        // Pick the amount closest to the claimed amount
        let bestMatch = null;
        if (extractedAmounts.length > 0) {
            bestMatch = extractedAmounts.reduce((closest, amt) =>
                Math.abs(amt - claimedNum) < Math.abs(closest - claimedNum) ? amt : closest
                , extractedAmounts[0]);
        }

        const amountMatch = bestMatch ? (Math.abs(bestMatch - claimedNum) / claimedNum < 0.10 ? 'match' : 'mismatch') : 'no_amount_found';

        if (pool) {
            await pool.query(
                `UPDATE donations SET ocr_text = $1, ocr_amount = $2, ocr_status = $3 WHERE id = $4`,
                [text.substring(0, 2000), bestMatch, amountMatch, donationId]
            );
        }
        console.log(`✅ OCR: Donation #${donationId} - Extracted ₨${bestMatch || 'N/A'} vs Claimed ₨${claimedAmount} → ${amountMatch}`);
    } catch (err) {
        console.error(`❌ OCR failed for donation #${donationId}:`, err.message);
        if (pool) {
            await pool.query(
                `UPDATE donations SET ocr_status = 'error' WHERE id = $1`,
                [donationId]
            ).catch(() => { });
        }
    }
}

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true
}));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// MULTER - File Upload Configuration
// ============================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only image files are allowed!'));
    }
});

// ============================================================
// NODEMAILER - Email Configuration (supports SMTP or named service)
// Environment options:
// - Use a named service (e.g. Gmail): set EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS
// - Or use explicit SMTP: set EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE (true/false), EMAIL_USER, EMAIL_PASS
// If credentials are missing or verification fails, emails will be simulated (logged) instead of thrown.
// ============================================================
let transporter;
let emailEnabled = false;

// Sanitize credentials (common mistake: copying Gmail app password with spaces)
const _EMAIL_USER = process.env.EMAIL_USER || '';
const _EMAIL_PASS_RAW = process.env.EMAIL_PASS || '';
const _EMAIL_PASS = _EMAIL_PASS_RAW.replace(/\s+/g, '');
const _EMAIL_HOST = process.env.EMAIL_HOST;
const _EMAIL_PORT = process.env.EMAIL_PORT;
const _EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const _EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';

console.log('🔎 Email config:', {
    service: _EMAIL_SERVICE || null,
    host: _EMAIL_HOST || null,
    port: _EMAIL_PORT || null,
    user: _EMAIL_USER ? `${_EMAIL_USER}` : null,
    passLength: _EMAIL_PASS ? `${_EMAIL_PASS.length} chars` : 'none'
});

if (_EMAIL_HOST && _EMAIL_PORT && _EMAIL_USER && _EMAIL_PASS) {
    // Explicit SMTP settings
    transporter = nodemailer.createTransport({
        host: _EMAIL_HOST,
        port: parseInt(_EMAIL_PORT, 10) || 587,
        secure: _EMAIL_SECURE || (_EMAIL_PORT === '465'),
        auth: {
            user: _EMAIL_USER,
            pass: _EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
    });
} else if (_EMAIL_SERVICE && _EMAIL_USER && _EMAIL_PASS) {
    // Named service (e.g. gmail)
    transporter = nodemailer.createTransport({
        service: _EMAIL_SERVICE,
        auth: {
            user: _EMAIL_USER,
            pass: _EMAIL_PASS
        }
    });
} else {
    // No real SMTP configured — use a harmless JSON transport so app keeps working
    transporter = nodemailer.createTransport({ jsonTransport: true });
}

transporter.verify().then(() => {
    console.log('✅ Email server is ready to send messages.');
    emailEnabled = true;
}).catch((error) => {
    console.log('⚠️  Email setup warning:', error && error.message ? error.message : String(error));
    console.log('📧 Email sending will be simulated. Set EMAIL_HOST/EMAIL_SERVICE, EMAIL_USER and EMAIL_PASS in .env to enable real emails.');
    emailEnabled = false;
});

async function sendConfirmationEmail({ to, subject, html }) {
    try {
        if (!emailEnabled) {
            console.log(`📧 [SIMULATED EMAIL] To: ${to} | Subject: ${subject}`);
            return { simulated: true };
        }
        const info = await transporter.sendMail({
            from: `"Banto Zindagi - ABU-UL-QASIM Blood Donor Society" <${process.env.EMAIL_USER || 'bantozindagi0981@gmail.com'}>`,
            to,
            subject,
            html
        });
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ Email failed to ${to}:`, err.message);
        return null;
    }
}

// Ensure the HTML templates are included (same as before)
function bloodDonationEmailHTML(name, date, slot, bloodGroup, location) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Blood Donation Appointment Confirmed</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p>Thank you for your generous decision to donate blood! Your appointment has been confirmed.</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${slot}</p>
                <p style="margin: 5px 0;"><strong>Blood Group:</strong> ${bloodGroup}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
            </div>
            <p><strong>Important Reminders:</strong></p>
            <ul>
                <li>Please drink plenty of water before your appointment</li>
                <li>Eat a healthy meal 2-3 hours before donating</li>
                <li>Bring your CNIC for identity verification</li>
                <li>The donation process takes approximately 30-45 minutes</li>
            </ul>
            <p>Our team will contact you shortly to confirm your appointment details.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/923238723663?text=Assalam%20o%20Alaikum!%20I%20have%20a%20query%20about%20my%20recent%20blood%20donation%20appointment." style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Contact us on WhatsApp</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">Follow Us on Social Media</p>
            <div style="text-align: center;">
                <a href="https://www.facebook.com/share/17e4GYR57A/" style="display: inline-block; background: #1877F2; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Facebook</a>
                <a href="https://www.instagram.com/team_a_b_s_bdsoffical?igsh=MTZhbTFlbjlybWo3Yg==" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Instagram</a>
                <a href="https://youtube.com/@team_abs_bds_pakistan?si=JqjLNxjtFAMbKLJs" style="display: inline-block; background: #FF0000; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">YouTube</a>
            </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Abu-ul-Qasim Blood Donor Society</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 12px;">Muqam e hayyat road Sargodha, Pakistan 40100 | 0323-8723663</p>
        </div>
    </div>`;
}

function volunteerEmailHTML(name, occupation) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Volunteer Application Received</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p style="font-size: 14px;"><strong>Occupation:</strong> ${occupation || 'N/A'}</p>
            <p>Thank you for your interest in volunteering with Abu-ul-Qasim Blood Donor Society!</p>
            <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Your application has been received successfully.</strong></p>
            </div>
            <p>Our Volunteer Relations team will review your application and contact you within <strong>48 hours</strong> to discuss:</p>
            <ul>
                <li>Your availability and preferred volunteer roles</li>
                <li>Orientation and training schedule</li>
                <li>Background verification process (for clinical safety)</li>
                <li>Upcoming blood drives and events in Sargodha</li>
            </ul>
            <p>In the meantime, feel free to reach out to us with any questions.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/923238723663?text=Assalam%20o%20Alaikum!%20I%20have%20a%20query%20about%20my%20volunteer%20application." style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Contact us on WhatsApp</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">Follow Us on Social Media</p>
            <div style="text-align: center;">
                <a href="https://www.facebook.com/share/17e4GYR57A/" style="display: inline-block; background: #1877F2; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Facebook</a>
                <a href="https://www.instagram.com/team_a_b_s_bdsoffical?igsh=MTZhbTFlbjlybWo3Yg==" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Instagram</a>
                <a href="https://youtube.com/@team_abs_bds_pakistan?si=JqjLNxjtFAMbKLJs" style="display: inline-block; background: #FF0000; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">YouTube</a>
            </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Abu-ul-Qasim Blood Donor Society</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 12px;">Muqam e hayyat road Sargodha, Pakistan 40100 | 0323-8723663</p>
        </div>
    </div>`;
}

function donationEmailHTML(name, amount, method, purpose) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Donation Received - Thank You!</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p>JazakAllah! Your generous financial contribution has been received. Every rupee makes a difference.</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Amount:</strong> PKR ${amount}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${method}</p>
                <p style="margin: 5px 0;"><strong>Purpose:</strong> ${purpose}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Verification Pending</p>
            </div>
            <p>Our team will verify your payment screenshot and confirm the donation within <strong>24 hours</strong>.</p>
            <p>Your contribution will be used towards:</p>
            <ul>
                <li>Purchasing blood bags and medical equipment</li>
                <li>Supporting Thalassemia patients with medicines</li>
                <li>Organizing blood donation drives across Sargodha</li>
            </ul>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/923238723663?text=Assalam%20o%20Alaikum!%20I%20have%20a%20query%20regarding%20my%20recent%20donation." style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Contact us on WhatsApp</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">Follow Us on Social Media</p>
            <div style="text-align: center;">
                <a href="https://www.facebook.com/share/17e4GYR57A/" style="display: inline-block; background: #1877F2; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Facebook</a>
                <a href="https://www.instagram.com/team_a_b_s_bdsoffical?igsh=MTZhbTFlbjlybWo3Yg==" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Instagram</a>
                <a href="https://youtube.com/@team_abs_bds_pakistan?si=JqjLNxjtFAMbKLJs" style="display: inline-block; background: #FF0000; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">YouTube</a>
            </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Abu-ul-Qasim Blood Donor Society</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 12px;">Muqam e hayyat road Sargodha, Pakistan 40100 | 0323-8723663</p>
        </div>
    </div>`;
}


function rejectionEmailHTML(name) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Donation Verification Issue</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p>Our financial team audited your recent submission but was unfortunately unable to verify the claimed amount against our active bank ledgers.</p>
            <p>This typically happens if the uploaded receipt was illegible, a transaction bounced, or the transfer is still pending inter-bank clearance.</p>
            <p><strong>Please check your banking app to confirm the funds were heavily deducted or send us a clear screenshot of the successful receipt directly to our WhatsApp support line so we can assist you.</strong></p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/923238723663?text=Assalam%20o%20Alaikum!%20My%20donation%20verification%20failed.%20Here%20is%20my%20screenshot%20for%20clearance." style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Resolve via WhatsApp</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">Follow Us on Social Media</p>
            <div style="text-align: center;">
                <a href="https://www.facebook.com/share/17e4GYR57A/" style="display: inline-block; background: #1877F2; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Facebook</a>
                <a href="https://www.instagram.com/team_a_b_s_bdsoffical?igsh=MTZhbTFlbjlybWo3Yg==" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Instagram</a>
                <a href="https://youtube.com/@team_abs_bds_pakistan?si=JqjLNxjtFAMbKLJs" style="display: inline-block; background: #FF0000; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">YouTube</a>
            </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Abu-ul-Qasim Blood Donor Society</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 12px;">Muqam e hayyat road Sargodha, Pakistan 40100 | 0323-8723663</p>
        </div>
    </div>`;
}


function subscriberWelcomeEmailHTML(email) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7f1d1d, #991b1b); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to ABS Network!</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Assalam o Alaikum!</p>
            <p>You have officially joined the <strong>Abu-ul-Qasim Blood Donor Society Network</strong>. You will now receive priority alerts for:</p>
            <ul style="line-height: 2;">
                <li><strong>Critical blood shortage</strong> emergencies in Sargodha</li>
                <li>Upcoming <strong>blood donation drives</strong> and medicine campaigns</li>
                <li><strong>Fundraising updates</strong> for Thalassemia patient care</li>
                <li><strong>Volunteer opportunities</strong> with the foundation</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <p style="font-weight: bold; margin-bottom: 15px;">Manage Your Notifications:</p>
                <a href="mailto:bantozindagi0981@gmail.com?subject=ABS%20Notifications%20-%20Keep%20Active&body=I%20want%20to%20continue%20receiving%20ABS%20notifications.%20Email:%20${email}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px;">Keep Notifications Active</a>
                <a href="mailto:bantozindagi0981@gmail.com?subject=ABS%20Notifications%20-%20Unsubscribe&body=Please%20unsubscribe%20me%20from%20ABS%20notifications.%20Email:%20${email}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px;">Unsubscribe</a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

            <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">Follow Us on Social Media</p>
            <div style="text-align: center;">
                <a href="https://www.facebook.com/share/17e4GYR57A/" style="display: inline-block; background: #1877F2; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Facebook</a>
                <a href="https://www.instagram.com/team_a_b_s_bdsoffical?igsh=MTZhbTFlbjlybWo3Yg==" style="display: inline-block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">Instagram</a>
                <a href="https://youtube.com/@team_abs_bds_pakistan?si=JqjLNxjtFAMbKLJs" style="display: inline-block; background: #FF0000; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; font-size: 13px;">YouTube</a>
            </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Abu-ul-Qasim Blood Donor Society</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 12px;">Muqam e hayyat road Sargodha, Pakistan 40100 | 0323-8723663</p>
        </div>
    </div>`;
}

// ============================================================
// SUPABASE POSTGRES DATABASE CONNECTION
// ============================================================
let pool;
let dbConnected = false;

if (process.env.SUPABASE_DB_URL) {
    pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    pool.connect()
        .then(client => {
            console.log('✅ Connected to Supabase Database successfully.');
            dbConnected = true;
            client.release();
            initDatabase();
        })
        .catch(err => {
            console.error('❌ Supabase Connection Error:', err.message);
        });
} else {
    console.log('⚠️  SUPABASE_DB_URL not found in .env. Running entirely without a database.');
}

// Create tables if they don't exist
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS donations (
                id SERIAL PRIMARY KEY,
                amount DECIMAL NOT NULL,
                currency VARCHAR(10) DEFAULT 'PKR',
                method VARCHAR(50) NOT NULL,
                purpose VARCHAR(255),
                donor_name VARCHAR(255) NOT NULL,
                donor_email VARCHAR(255) NOT NULL,
                screenshot_path VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                email_sent BOOLEAN DEFAULT false,
                ocr_text TEXT,
                ocr_amount DECIMAL,
                ocr_status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50) NOT NULL,
                cnic VARCHAR(50),
                blood_group VARCHAR(10) NOT NULL,
                location VARCHAR(255),
                date VARCHAR(50) NOT NULL,
                slot VARCHAR(50),
                dob VARCHAR(50),
                status VARCHAR(50) DEFAULT 'confirmed',
                email_sent BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS volunteers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                occupation VARCHAR(255),
                blood_group VARCHAR(10),
                availability TEXT,
                reason TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                email_sent BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Ensure occupation column exists for older schemas
        try {
            await pool.query("ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS occupation VARCHAR(255);");
        } catch (e) {
            // ignore
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS medicine_funds (
                id SERIAL PRIMARY KEY,
                amount DECIMAL NOT NULL,
                donor_name VARCHAR(255),
                payment_intent_id VARCHAR(255),
                fund_type VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscribers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                notifications BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Supabase Tables initialized successfully.');
    } catch (err) {
        console.error('❌ Error initializing tables:', err);
    }
}

const mockDB = { donations: [], appointments: [], volunteers: [] };

// ============================================================
// ROUTES
// ============================================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Banto Zindagi API is running.',
        database: dbConnected ? 'Supabase Connected' : 'Simulated (In-Memory)',
        email: emailEnabled ? 'configured' : 'simulated'
    });
});

// 1. DONATION
app.post('/api/donate', upload.single('screenshot'), async (req, res) => {
    try {
        const { amount, currency, method, purpose, donorName, donorEmail } = req.body;

        if (!amount || !method || !donorName || !donorEmail) {
            return res.status(400).json({ success: false, error: 'Amount, method, name and email are required.' });
        }

        const screenshotPath = req.file ? `/uploads/${req.file.filename}` : null;
        let insertedId = null;

        if (dbConnected) {
            const result = await pool.query(
                `INSERT INTO donations (amount, currency, method, purpose, donor_name, donor_email, screenshot_path) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                [amount, currency || 'PKR', method, purpose || 'General Fund', donorName, donorEmail, screenshotPath]
            );
            insertedId = result.rows[0].id;
        } else {
            mockDB.donations.push({ id: Date.now(), amount, method, donorName, donorEmail, createdAt: new Date() });
        }

        sendConfirmationEmail({
            to: donorEmail,
            subject: `Donation Received - PKR ${amount} | Banto Zindagi`,
            html: donationEmailHTML(donorName, amount, method, purpose || 'General Fund')
        }).then(async () => {
            if (dbConnected && insertedId) {
                await pool.query(`UPDATE donations SET email_sent = TRUE WHERE id = $1`, [insertedId]).catch(() => { });
            }
        });

        // Trigger background OCR if screenshot uploaded
        if (req.file && insertedId) {
            processOCR(`/uploads/${req.file.filename}`, insertedId, amount);
        }

        res.json({ success: true, message: 'Donation recorded successfully. A confirmation email has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal server error while saving donation.' });
    }
});

// 2. APPOINTMENTS
app.post('/api/appointments', async (req, res) => {
    try {
        const { name, email, phone, cnic, bloodGroup, location, date, slot, dob } = req.body;

        if (!name || !phone || !bloodGroup || !date) {
            return res.status(400).json({ success: false, error: 'Name, phone, blood group and date are required.' });
        }

        let insertedId = null;

        if (dbConnected) {
            const result = await pool.query(
                `INSERT INTO appointments (name, email, phone, cnic, blood_group, location, date, slot, dob) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                [name, email, phone, cnic, bloodGroup, location, date, slot, dob]
            );
            insertedId = result.rows[0].id;
        } else {
            mockDB.appointments.push({ id: Date.now(), name, phone, email, date, createdAt: new Date() });
        }

        if (email) {
            sendConfirmationEmail({
                to: email,
                subject: `Blood Donation Appointment Confirmed | Banto Zindagi`,
                html: bloodDonationEmailHTML(name, date, slot || 'TBD', bloodGroup, location || 'Main Center')
            }).then(async () => {
                if (dbConnected && insertedId) {
                    await pool.query(`UPDATE appointments SET email_sent = TRUE WHERE id = $1`, [insertedId]).catch(() => { });
                }
            });
        }

        res.json({ success: true, message: 'Appointment Confirmed! A confirmation email has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal server error while saving appointment.' });
    }
});

// 3. VOLUNTEER
app.post('/api/volunteer', async (req, res) => {
    try {
        const { name, email, phone, bloodGroup, availability, reason, occupation } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, error: 'Name, email, and phone are required.' });
        }

        let insertedId = null;

        if (dbConnected) {
            const result = await pool.query(
                `INSERT INTO volunteers (name, email, phone, occupation, blood_group, availability, reason) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                [name, email, phone, occupation || '', bloodGroup, availability || [], reason || '']
            );
            insertedId = result.rows[0].id;
        } else {
            mockDB.volunteers.push({ id: Date.now(), name, email, phone, occupation: occupation || '', createdAt: new Date() });
        }

        sendConfirmationEmail({
            to: email,
            subject: `Volunteer Application Received | Banto Zindagi`,
            html: volunteerEmailHTML(name, occupation)
        }).then(async () => {
            if (dbConnected && insertedId) {
                await pool.query(`UPDATE volunteers SET email_sent = TRUE WHERE id = $1`, [insertedId]).catch(() => { });
            }
        });

        res.json({ success: true, message: 'Application received! A confirmation email has been sent. We will contact you within 48 hours.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal server error while saving volunteer.' });
    }
});

// 4. ADMIN GET ROUTES

app.get('/api/donations/live', async (req, res) => {
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
});

app.get('/api/donations', async (req, res) => {
    try {
        if (dbConnected) {
            const result = await pool.query('SELECT * FROM donations ORDER BY created_at DESC');
            res.json({ success: true, count: result.rowCount, data: result.rows });
        } else {
            res.json({ success: true, count: mockDB.donations.length, data: mockDB.donations });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/appointments', async (req, res) => {
    try {
        if (dbConnected) {
            const result = await pool.query('SELECT * FROM appointments ORDER BY created_at DESC');
            res.json({ success: true, count: result.rowCount, data: result.rows });
        } else {
            res.json({ success: true, count: mockDB.appointments.length, data: mockDB.appointments });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/volunteers', async (req, res) => {
    try {
        if (dbConnected) {
            const result = await pool.query('SELECT * FROM volunteers ORDER BY created_at DESC');
            res.json({ success: true, count: result.rowCount, data: result.rows });
        } else {
            res.json({ success: true, count: mockDB.volunteers.length, data: mockDB.volunteers });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/patients', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'VP-1024', name: 'Ayesha K.', age: 8, bg: 'O-', frequency: 'Every 14 days', raised: 45000, pending: 15000, disease: 'Thalassemia Major' },
            { id: 'VP-1025', name: 'Zohaib R.', age: 12, bg: 'B+', frequency: 'Every 21 days', raised: 20000, pending: 40000, disease: 'Thalassemia Major' }
        ]
    });
});

// ============================================================
// STRIPE PAYMENT INTEGRATION & FUNDS LOGIC
// ============================================================

app.post('/api/create-payment-intent', async (req, res) => {
    const { items, donorName, email } = req.body;
    let amount = 1000;
    let fundType = 'General Fund';

    if (items && items[0]) {
        amount = items[0].amount;
        if (items[0].fundName) {
            fundType = items[0].fundName;
        }
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'pkr',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                donorName: donorName || 'Anonymous',
                fundType: fundType
            }
        });

        // Temporarily log intention in the DB (can be confirmed via webhook in production)
        if (dbConnected) {
            await pool.query(
                'INSERT INTO medicine_funds (amount, donor_name, payment_intent_id, fund_type) VALUES ($1, $2, $3, $4)',
                [amount, donorName || 'Anonymous', paymentIntent.id, fundType]
            );
        }

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe Error:', error.message);
        res.status(400).send({
            error: { message: error.message }
        });
    }
});

app.get('/api/medicine-fund/stats', async (req, res) => {
    let baseRaised = 0;

    if (!dbConnected) {
        return res.json({ totalRaised: 14250, success: true });
    }

    try {
        // Stripe automatic payments
        const res1 = await pool.query("SELECT SUM(amount) as total FROM medicine_funds");
        // Manual verification payments
        const res2 = await pool.query("SELECT SUM(amount) as total FROM donations WHERE purpose='Medicine Drive' AND status='verified'");

        const dbTotal = (parseInt(res1.rows[0].total) || 0) + (parseInt(res2.rows[0].total) || 0);

        res.json({ totalRaised: dbTotal, success: true });
    } catch (err) {
        console.error('Error fetching stats:', err.message);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
    next();
});

const PORT = process.env.PORT || 5000;



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

// Simple test endpoint to verify email sending from the running server
app.get('/api/admin/test-email', async (req, res) => {
    const to = req.query.to || req.body?.to;
    if (!to) return res.status(400).json({ success: false, error: 'Query param `to` is required. Example: /api/admin/test-email?to=you@example.com' });
    try {
        const info = await sendConfirmationEmail({ to, subject: '[ABS TEST] Delivery Check', html: `<p>This is a delivery test from the Abu-ul-Qasim backend at ${new Date().toISOString()}.</p>` });
        if (!info) return res.status(500).json({ success: false, error: 'Email send failed (see server logs).' });
        return res.json({ success: true, info });
    } catch (err) {
        console.error('❌ Test email error:', err);
        return res.status(500).json({ success: false, error: err.message || 'Unknown error' });
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

// Admin: Re-trigger OCR scan on a donation
app.post('/api/admin/ocr-scan/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) return res.json({ success: false, error: 'No database' });
    try {
        const result = await pool.query("SELECT screenshot_path, amount FROM donations WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Donation not found' });
        const { screenshot_path, amount } = result.rows[0];
        if (!screenshot_path) return res.status(400).json({ success: false, error: 'No screenshot available for OCR' });

        await pool.query("UPDATE donations SET ocr_status = 'processing' WHERE id = $1", [id]);
        processOCR(screenshot_path, id, amount);
        res.json({ success: true, message: 'OCR scan initiated. Refresh in a few seconds to see results.' });
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
        if (result.rowCount > 0) {
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

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 View donations: http://localhost:${PORT}/api/donations`);
    console.log(`📋 View appointments: http://localhost:${PORT}/api/appointments`);
    console.log(`📋 View volunteers: http://localhost:${PORT}/api/volunteers\n`);
});
