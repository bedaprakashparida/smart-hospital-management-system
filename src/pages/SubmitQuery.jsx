import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

const SubmitQuery = () => {
    const { addQuery, doctors } = useAppContext();
    const { currentUser } = useAuthContext();

    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        category: 'General Consultation',
        symptoms: ''
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const analyzeSymptoms = (symptomsText) => {
        const text = symptomsText.toLowerCase();
        let urgency = 'Normal';
        let type = 'success';
        let baseText = 'Your query has been recorded. A doctor will review your symptoms soon.';
        let targetPattern = null;

        if (text.includes('chest pain') || text.includes('heart')) {
            urgency = 'High';
            type = 'danger';
            baseText = 'URGENT: Based on your symptoms of chest pain, please seek emergency medical attention or call emergency services immediately.';
            targetPattern = 'Cardiologist';
        } else if (text.includes('skin') || text.includes('rash')) {
            targetPattern = 'Dermatologist';
            baseText = 'Based on your symptoms, we recommend a consultation with a skin specialist.';
        } else if (text.includes('bone') || text.includes('joint') || text.includes('fracture')) {
            targetPattern = 'Orthopedic';
            baseText = 'We suggest consulting an Orthopedic specialist for this issue.';
        } else if (text.includes('child') || text.includes('baby') || text.includes('toddler')) {
            targetPattern = 'Pediatrician';
        } else if (text.includes('injury')) {
            urgency = 'Medium';
            type = 'warning';
            baseText = 'Based on your symptoms, we recommend a doctor consultation to properly assess the injury.';
        } else if (text.includes('fever')) {
            urgency = 'Low';
            type = 'info';
            baseText = 'We noticed you have a fever. Ensure you get plenty of rest and stay hydrated.';
        } else if (text.includes('headache')) {
            urgency = 'Low';
            type = 'info';
            baseText = 'For your headache, we suggest resting in a quiet, dark room and staying hydrated.';
        } else if (text.includes('cough')) {
            urgency = 'Low';
            type = 'info';
            baseText = 'Since you mentioned a cough, we suggest monitoring it and staying hydrated.';
        }

        // Smart Assignment Logic
        let suggestedDoctor = null;
        let suggestionText = '';

        if (doctors && doctors.length > 0) {
            // Priority 1: Match target pattern
            if (targetPattern) {
                suggestedDoctor = doctors.find(d => d.department.includes(targetPattern) && d.status === 'Active');
            }
            // Priority 2: Fallback to General Physician if no match or pattern 
            if (!suggestedDoctor) {
                suggestedDoctor = doctors.find(d => d.department.includes('General') && d.status === 'Active');
            }

            if (suggestedDoctor && suggestedDoctor.availableDays.length > 0 && suggestedDoctor.timeSlots.length > 0) {
                const nextDay = suggestedDoctor.availableDays[0];
                const nextSlot = suggestedDoctor.timeSlots[0];
                suggestionText = ` Dr. ${suggestedDoctor.name} (${suggestedDoctor.department}) is available on ${nextDay} at ${nextSlot}.`;

                if (urgency === 'High') {
                    suggestionText = ` EMERGENCY OVERRIDE: Dr. ${suggestedDoctor.name} (${suggestedDoctor.department}) has been automatically flagged to review your case immediately.`;
                }
            }
        }

        return {
            type,
            text: baseText + suggestionText,
            urgency,
            suggestedDoctor: suggestedDoctor ? suggestedDoctor.name : null
        };
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.age.trim()) newErrors.age = 'Age is required';
        if (!formData.symptoms.trim()) newErrors.symptoms = 'Symptoms are required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const aiGuidance = analyzeSymptoms(formData.symptoms);

        addQuery({
            ...formData,
            userId: currentUser.id,
            name: currentUser.name,
            aiGuidance: aiGuidance.text,
            assignedDoctor: aiGuidance.suggestedDoctor
        });

        setAiResponse(aiGuidance);
        setSubmitted(true);

        setFormData({
            age: '',
            gender: '',
            category: 'General Consultation',
            symptoms: ''
        });
    };

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Submit Health Query</h2>
            <p>Please enter your details and symptoms for user <strong>{currentUser?.name}</strong>. Our system will provide basic guidance.</p>

            {submitted && aiResponse && (
                <div className={`alert alert-${aiResponse.type} fade-in`} style={{ marginTop: '2rem' }}>
                    <div>
                        <strong>Submission Successful!</strong>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'inherit' }}>{aiResponse.text}</p>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginTop: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2">
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
                            <label className="form-label">Age *</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="30"
                                min="0"
                                max="120"
                            />
                            {errors.age && <span className="form-error">{errors.age}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2">
                        <div className="form-group">
                            <label className="form-label">Gender (Optional)</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="General Consultation">General Consultation</option>
                                <option value="Emergency">Emergency</option>
                                <option value="Specialist Required">Specialist Required</option>
                                <option value="Prescription Refill">Prescription Refill</option>
                                <option value="Routine Checkup">Routine Checkup</option>
                                <option value="Lab Results Follow-up">Lab Results Follow-up</option>
                                <option value="Mental Health">Mental Health / Therapy</option>
                                <option value="Physical Therapy">Physical Therapy</option>
                                <option value="Diet & Nutrition">Diet & Nutrition</option>
                                <option value="Other">Other Category</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Symptoms / Problem *</label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Describe your symptoms (e.g., I have had a fever and cough for 3 days...)"
                        ></textarea>
                        {errors.symptoms && <span className="form-error">{errors.symptoms}</span>}
                    </div>

                    <button type="submit" className="btn btn-large" style={{ width: '100%', marginTop: '1rem' }}>
                        Submit Query
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitQuery;
