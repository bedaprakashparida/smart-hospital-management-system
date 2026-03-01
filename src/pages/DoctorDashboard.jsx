import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

const DoctorDashboard = () => {
    const { doctors, appointments, updateDoctorProfile, addDoctor } = useAppContext();
    const { currentUser } = useAuthContext();

    const [doctorProfile, setDoctorProfile] = useState(null);

    const [doctorForm, setDoctorForm] = useState({
        department: 'General Physician',
        experience: '',
        availableDays: [],
        timeSlots: [],
        status: 'Active'
    });

    const [docErrors, setDocErrors] = useState({});
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const existingDoc = doctors.find(d => d.name === currentUser.name || d.email === currentUser.email);
        if (existingDoc) {
            setDoctorProfile(existingDoc);
            setDoctorForm({
                department: existingDoc.department || 'General Physician',
                experience: existingDoc.experience || '',
                availableDays: existingDoc.availableDays || [],
                timeSlots: existingDoc.timeSlots || [],
                status: existingDoc.status || 'Active'
            });
        }
    }, [doctors, currentUser]);

    // Format utility
    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // My Appointments
    const myAppointments = appointments.filter(a => a.assignedDoctor === currentUser.name);

    const handleDocCheckbox = (e, arrayName) => {
        const value = e.target.value;
        setDoctorForm(prev => {
            const currentList = prev[arrayName];
            if (currentList.includes(value)) {
                return { ...prev, [arrayName]: currentList.filter(item => item !== value) };
            } else {
                return { ...prev, [arrayName]: [...currentList, value] };
            }
        });
        setSaved(false);
    };

    const handleFormChange = (e) => {
        setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleDoctorSubmit = (e) => {
        e.preventDefault();
        const errors = {};
        if (doctorForm.availableDays.length === 0) errors.days = 'Select at least one day';
        if (doctorForm.timeSlots.length === 0) errors.slots = 'Select at least one slot';

        if (Object.keys(errors).length > 0) {
            setDocErrors(errors);
            return;
        }

        if (doctorProfile) {
            // Update existing
            updateDoctorProfile(doctorProfile.id, doctorForm);
        } else {
            // Create new
            addDoctor({
                name: currentUser.name,
                email: currentUser.email,
                ...doctorForm
            });
        }

        setSaved(true);
        setDocErrors({});
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Doctor Dashboard</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome, {currentUser.name}</p>
                </div>
                <span className="badge badge-approved" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>Doctor Access</span>
            </div>

            <div className="grid">
                {/* Profile & Availability Settings */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>My Profile & Availability</h3>

                    {saved && (
                        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                            Profile updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleDoctorSubmit}>
                        <div className="grid grid-cols-2">
                            <div className="form-group">
                                <label className="form-label">Doctor Name</label>
                                <input type="text" value={currentUser.name} className="form-control" disabled style={{ backgroundColor: 'var(--background)' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department *</label>
                                <select name="department" value={doctorForm.department} onChange={handleFormChange} className="form-control">
                                    <option value="General Physician">General Physician</option>
                                    <option value="Cardiologist (Heart)">Cardiologist (Heart)</option>
                                    <option value="Dermatologist (Skin)">Dermatologist (Skin)</option>
                                    <option value="Orthopedic (Bones/Joints)">Orthopedic (Bones/Joints)</option>
                                    <option value="Pediatrician (Children)">Pediatrician (Children)</option>
                                    <option value="Neurologist (Brain/Nerves)">Neurologist (Brain/Nerves)</option>
                                    <option value="Psychiatrist (Mental Health)">Psychiatrist (Mental Health)</option>
                                    <option value="Gynecologist (Women's Health)">Gynecologist (Women's Health)</option>
                                    <option value="Ophthalmologist (Eyes)">Ophthalmologist (Eyes)</option>
                                    <option value="Dentist (Teeth/Mouth)">Dentist (Teeth/Mouth)</option>
                                    <option value="ENT Specialist (Ear, Nose, Throat)">ENT Specialist (Ear, Nose, Throat)</option>
                                    <option value="Physiotherapist">Physiotherapist</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2">
                            <div className="form-group">
                                <label className="form-label">Experience (Optional)</label>
                                <input type="text" name="experience" value={doctorForm.experience} onChange={handleFormChange} className="form-control" placeholder="e.g. 10 Years" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Current Status</label>
                                <select name="status" value={doctorForm.status} onChange={handleFormChange} className="form-control">
                                    <option value="Active">Active (Taking Appointments)</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Available Days *</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem' }}>
                                        <input type="checkbox" value={day} checked={doctorForm.availableDays.includes(day)} onChange={e => handleDocCheckbox(e, 'availableDays')} />
                                        {day.substring(0, 3)}
                                    </label>
                                ))}
                            </div>
                            {docErrors.days && <span className="form-error">{docErrors.days}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Time Slots *</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {['Morning', 'Afternoon', 'Evening'].map(slot => (
                                    <label key={slot} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem' }}>
                                        <input type="checkbox" value={slot} checked={doctorForm.timeSlots.includes(slot)} onChange={e => handleDocCheckbox(e, 'timeSlots')} />
                                        {slot}
                                    </label>
                                ))}
                            </div>
                            {docErrors.slots && <span className="form-error">{docErrors.slots}</span>}
                        </div>

                        <button type="submit" className="btn" style={{ marginTop: '1rem' }}>Save Profile</button>
                    </form>
                </div>

                {/* Assigned Appointments */}
                <div>
                    <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>My Appointments</h3>

                    {!doctorProfile ? (
                        <div className="alert alert-warning">Please save your profile availability first to start receiving appointments.</div>
                    ) : myAppointments.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>You have no assigned appointments.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {myAppointments.map(a => (
                                <div key={a.id} className="card" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ margin: 0 }}>{a.name}</h4>
                                        <span className={`badge ${a.status === 'Approved' ? 'badge-approved' : a.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                                            {a.status}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                                        <strong>Date:</strong> {a.date} ({a.timeSlot})
                                    </p>
                                    <small style={{ color: 'var(--text-muted)' }}>Booked On: {formatDate(a.date)}</small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
