import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

const BookAppointment = () => {
    const { addAppointment, doctors } = useAppContext();
    const { currentUser } = useAuthContext();

    const [formData, setFormData] = useState({
        department: 'General Physician',
        date: '',
        timeSlot: 'Morning'
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.date.trim()) newErrors.date = 'Preferred Date is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Logic 3: Appointment Auto-Check with Doctor Availability
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDayOfWeek = daysOfWeek[new Date(formData.date).getDay()];

        // Find available doctors passing the criteria
        const availableDoctors = doctors.filter(doc =>
            doc.department.startsWith(formData.department) &&
            doc.status === 'Active' &&
            doc.availableDays.includes(selectedDayOfWeek) &&
            doc.timeSlots.includes(formData.timeSlot)
        );

        // Auto-assign to the first available doctor if possible
        const assignedDoctor = availableDoctors.length > 0 ? availableDoctors[0].name : null;

        addAppointment({
            ...formData,
            userId: currentUser.id,
            name: currentUser.name,
            assignedDoctor
        });
        setSubmitted(true);

        setFormData({
            department: 'General Physician',
            date: '',
            timeSlot: 'Morning'
        });
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Book Appointment</h2>
            <p>Schedule a visit for <strong>{currentUser?.name}</strong> with one of our specialists. We will confirm your slot shortly.</p>

            {submitted && (
                <div className="alert alert-success fade-in" style={{ marginTop: '2rem' }}>
                    <div>
                        <strong>Success!</strong>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'inherit' }}>Your appointment request has been submitted successfully.</p>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginTop: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Patient Name</label>
                        <input
                            type="text"
                            value={currentUser?.name || ''}
                            className="form-control"
                            disabled
                            style={{ backgroundColor: 'var(--background)', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Department / Doctor Type *</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="General Physician">General Physician</option>
                            <option value="Cardiologist">Cardiologist (Heart)</option>
                            <option value="Dermatologist">Dermatologist (Skin)</option>
                            <option value="Orthopedic">Orthopedic (Bones/Joints)</option>
                            <option value="Pediatrician">Pediatrician (Children)</option>
                            <option value="Neurologist">Neurologist (Brain/Nerves)</option>
                            <option value="Psychiatrist">Psychiatrist (Mental Health)</option>
                            <option value="Gynecologist">Gynecologist (Women's Health)</option>
                            <option value="Ophthalmologist">Ophthalmologist (Eyes)</option>
                            <option value="Dentist">Dentist (Teeth/Mouth)</option>
                            <option value="ENT Specialist">ENT Specialist (Ear, Nose, Throat)</option>
                            <option value="Physiotherapist">Physiotherapist</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2">
                        <div className="form-group">
                            <label className="form-label">Preferred Date *</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="form-control"
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {errors.date && <span className="form-error">{errors.date}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Preferred Time Slot *</label>
                            <select
                                name="timeSlot"
                                value={formData.timeSlot}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="Morning">Morning (9 AM - 12 PM)</option>
                                <option value="Afternoon">Afternoon (1 PM - 4 PM)</option>
                                <option value="Evening">Evening (5 PM - 8 PM)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-large" style={{ width: '100%', marginTop: '1rem' }}>
                        Request Appointment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
