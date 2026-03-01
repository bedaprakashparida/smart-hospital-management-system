require('dotenv').config();
const mongoose = require('mongoose');

// --- Models ---
const userSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Doctor', 'Patient'], default: 'Patient' }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const doctorSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    department: { type: String },
    experience: { type: String },
    availableDays: [{ type: String }],
    timeSlots: [{ type: String }],
    status: { type: String, default: 'Active' }
});
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

const appointmentSchema = new mongoose.Schema({
    id: { type: String },
    patientName: { type: String, required: true },
    department: { type: String },
    date: { type: Date },
    time: { type: String },
    status: { type: String, default: 'Pending' },
    assignedDoctor: { type: String }
});
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

const querySchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    category: { type: String },
    symptoms: { type: String },
    status: { type: String, default: 'Pending' },
    date: { type: Date }
});
const Query = mongoose.models.Query || mongoose.model('Query', querySchema);


// --- Data Generation ---
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Clearing existing collections...');

        // Clear collections
        await Promise.all([
            User.deleteMany({}),
            Doctor.deleteMany({}),
            Appointment.deleteMany({}),
            Query.deleteMany({})
        ]);

        console.log('Generating dummy data...');

        // 1. Users (Admin + Default Doctor + Default Patient + 100 generated Patients)
        const users = [
            { id: 'admin_1', name: 'Hospital Admin', email: 'admin@hospital.com', phone: '1234567890', password: 'admin', role: 'Admin' },
            { id: 'doc_1', name: 'Dr. Jane Smith', email: 'doctor1@hospital.com', phone: '0987654321', password: 'doctor', role: 'Doctor' },
            { id: 'pat_1', name: 'Test Patient', email: 'patient@hospital.com', phone: '1122334455', password: 'patient', role: 'Patient' }
        ];

        for (let i = 0; i < 100; i++) {
            const firstName = 'Test';
            users.push({
                id: `pat_gen_${i}`,
                name: `Test Patient ${i + 1}`,
                email: `patient${i + 1}@hospital.com`,
                phone: `1234567${String(i).padStart(3, '0')}`,
                password: `${firstName}@123`,
                role: 'Patient'
            });
        }

        // 2. Doctors
        const doctors = [
            { id: 'd1', name: 'Dr. Sarah Smith', department: 'Cardiologist (Heart)', experience: '12 Years', availableDays: ['Monday', 'Wednesday', 'Friday'], timeSlots: ['Morning', 'Afternoon'], status: 'Active' },
            { id: 'd2', name: 'Dr. Mark Davis', department: 'Cardiologist (Heart)', experience: '9 Years', availableDays: ['Tuesday', 'Thursday', 'Saturday'], timeSlots: ['Morning', 'Evening'], status: 'Active' },
            { id: 'd3', name: 'Dr. Lisa Wong', department: 'Cardiologist (Heart)', experience: '15 Years', availableDays: ['Monday', 'Tuesday', 'Wednesday'], timeSlots: ['Afternoon', 'Evening'], status: 'Active' },
            { id: 'd4', name: 'Dr. James Wilson', department: 'Dermatologist (Skin)', experience: '8 Years', availableDays: ['Tuesday', 'Thursday'], timeSlots: ['Morning', 'Evening'], status: 'Active' },
            { id: 'd5', name: 'Dr. Patricia Hall', department: 'Dermatologist (Skin)', experience: '5 Years', availableDays: ['Monday', 'Wednesday', 'Friday'], timeSlots: ['Afternoon'], status: 'Active' },
            { id: 'd6', name: 'Dr. Emily Chen', department: 'Orthopedic (Bones/Joints)', experience: '15 Years', availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], timeSlots: ['Afternoon', 'Evening'], status: 'Active' },
            { id: 'd7', name: 'Dr. Robert Garcia', department: 'Orthopedic (Bones/Joints)', experience: '11 Years', availableDays: ['Tuesday', 'Thursday', 'Saturday'], timeSlots: ['Morning'], status: 'Active' },
            { id: 'd8', name: 'Dr. Michael Brown', department: 'General Physician', experience: '5 Years', availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], timeSlots: ['Morning', 'Afternoon', 'Evening'], status: 'Active' },
            { id: 'd9', name: 'Dr. William Lee', department: 'General Physician', experience: '18 Years', availableDays: ['Monday', 'Wednesday', 'Friday'], timeSlots: ['Morning'], status: 'Active' },
            { id: 'd10', name: 'Dr. Angela Martinez', department: 'General Physician', experience: '2 Years', availableDays: ['Tuesday', 'Thursday', 'Saturday'], timeSlots: ['Evening'], status: 'Active' },
            { id: 'd11', name: 'Dr. Kevin White', department: 'Pediatrician', experience: '14 Years', availableDays: ['Monday', 'Wednesday', 'Friday'], timeSlots: ['Morning', 'Afternoon'], status: 'Active' },
            { id: 'd12', name: 'Dr. Mary Taylor', department: 'Pediatrician', experience: '7 Years', availableDays: ['Tuesday', 'Thursday'], timeSlots: ['Afternoon', 'Evening'], status: 'Active' },
            { id: 'd13', name: 'Dr. Christopher Moore', department: 'Neurologist (Brain/Nerves)', experience: '20 Years', availableDays: ['Monday', 'Tuesday', 'Thursday'], timeSlots: ['Morning', 'Evenining'], status: 'Active' }
        ];

        // 3. Appointments
        const departments = ['General Physician', 'Cardiologist (Heart)', 'Dermatologist (Skin)', 'Orthopedic (Bones/Joints)', 'Pediatrician', 'Neurologist (Brain/Nerves)'];
        const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

        const appointments = Array.from({ length: 100 }, (_, i) => {
            const isPast = Math.random() > 0.5;
            const daysOffset = Math.floor(Math.random() * 14);
            const dateObj = new Date(Date.now() + (isPast ? -1 : 1) * daysOffset * 86400000);
            return {
                id: `a_gen_${i}`,
                patientName: `Test Patient ${i + 1}`,
                department: departments[Math.floor(Math.random() * departments.length)],
                date: dateObj,
                time: `${Math.floor(Math.random() * 8) + 9}:00`,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                assignedDoctor: doctors[Math.floor(Math.random() * doctors.length)].name
            };
        });

        // 4. Queries (Symptoms)
        const categories = ['Emergency', 'General Consultation', 'Pediatrician', 'Cardiologist', 'Dermatologist', 'Orthopedic'];
        const genders = ['Male', 'Female', 'Other'];
        const symptomsList = [
            'Severe chest pain and shortness of breath', 'Mild headache and slightly elevated temperature',
            'Fever and rash on arms', 'Severe allergic reaction, face swelling',
            'Irregular heartbeat during exercise', 'Severe acne breakout and skin redness',
            'Persistent cough for 3 weeks', 'Sharp pain in lower back',
            'Blurry vision in left eye', 'Nausea and dizziness after eating'
        ];

        const queries = Array.from({ length: 100 }, (_, i) => ({
            id: `q_gen_${i}`,
            name: `Test Patient ${i + 1}`,
            age: Math.floor(Math.random() * 60) + 18,
            gender: genders[Math.floor(Math.random() * genders.length)],
            category: i < 15 ? 'Emergency' : categories[Math.floor(Math.random() * categories.length)],
            symptoms: symptomsList[Math.floor(Math.random() * symptomsList.length)],
            status: i % 4 === 0 ? 'Resolved' : 'Pending',
            date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7))
        }));

        console.log('Pushing to MongoDB Cluster...');
        await User.insertMany(users);
        await Doctor.insertMany(doctors);
        await Appointment.insertMany(appointments);
        await Query.insertMany(queries);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
