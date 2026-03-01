require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Cluster'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose Schema and Model
const appointmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

const PORT = process.env.PORT || 3001;
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

app.post('/api/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    try {
        const verification = await client.verify.v2.services(serviceSid)
            .verifications.create({ to: phoneNumber, channel: 'sms' });

        res.json({ success: true, status: verification.status });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { phoneNumber, code, name } = req.body;
    if (!phoneNumber || !code || !name) {
        return res.status(400).json({ success: false, error: 'Name, phone number, and code are required' });
    }

    try {
        const verificationCheck = await client.verify.v2.services(serviceSid)
            .verificationChecks.create({ to: phoneNumber, code: code });

        if (verificationCheck.status === 'approved') {
            // Save to MongoDB
            const newAppointment = new Appointment({
                name,
                phone: phoneNumber
            });
            await newAppointment.save();
            console.log('Successfully saved appointment for:', name);

            res.json({ success: true, message: 'OTP verified and appointment saved successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error verifying OTP or saving to DB:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Twilio OTP Server running on port ${PORT}`);
});
