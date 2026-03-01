import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
    const { queries, appointments, doctors, updateQueryStatus, updateAppointmentStatus, updateAppointmentDoctor, updateDoctorStatus } = useAppContext();
    const [filterEmergency, setFilterEmergency] = useState(false);
    const [activeTab, setActiveTab] = useState('requests');

    // Doctor Search State
    const [searchDepartment, setSearchDepartment] = useState('All Departments');
    const [searchDay, setSearchDay] = useState('Monday');

    // Doctor Form State
    const [doctorForm, setDoctorForm] = useState({
        name: '',
        department: 'General Physician',
        experience: '',
        availableDays: [],
        timeSlots: [],
        status: 'Active'
    });

    const [docErrors, setDocErrors] = useState({});

    const handleStatusChange = (type, id, newStatus) => {
        if (type === 'query') {
            updateQueryStatus(id, newStatus);
        } else if (type === 'appointment') {
            updateAppointmentStatus(id, newStatus);
        } else if (type === 'doctor') {
            updateDoctorStatus(id, newStatus);
        }
    };

    const statusOptions = ['Pending', 'Under Review', 'Approved', 'Rejected'];
    const docStatusOptions = ['Active', 'On Leave'];

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const filteredQueries = filterEmergency ? queries.filter(q => q.category === 'Emergency') : queries;

    // Metric Calculations
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysOfWeek[new Date().getDay()];
    const doctorsOnDutyToday = doctors ? doctors.filter(d => d.availableDays?.includes(currentDay) && d.status === 'Active') : [];
    const appointmentsToday = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]);

    const searchedDoctors = doctors?.filter(d =>
        (searchDepartment === 'All Departments' || d.department === searchDepartment) &&
        d.availableDays?.includes(searchDay) &&
        d.status === 'Active'
    ) || [];

    // --- Chart Data Calculations --- //

    // 1. Urgency Distribution (Based on Category)
    const categoryDistribution = useMemo(() => {
        const counts = { Emergency: 0, General: 0, Specialist: 0, Other: 0 };
        queries.forEach(q => {
            if (q.category === 'Emergency') counts.Emergency++;
            else if (q.category === 'General Consultation') counts.General++;
            else if (['Pediatrician', 'Cardiologist', 'Dermatologist', 'Orthopedic'].some(spec => q.category.includes(spec)) || q.category === 'Specialist Required') counts.Specialist++;
            else counts.Other++;
        });
        return Object.entries(counts).filter(([_, count]) => count > 0).map(([name, value]) => ({ name, value }));
    }, [queries]);

    const PIE_COLORS = {
        Emergency: 'var(--danger)',
        General: 'var(--success)',
        Specialist: 'var(--warning)',
        Other: 'var(--primary)'
    };

    // 2. Appointments by Department (Support Graph)
    const appointmentsByDept = useMemo(() => {
        const counts = {};
        appointments.forEach(a => {
            const dept = a.department.split(' ')[0]; // Keep labels short
            counts[dept] = (counts[dept] || 0) + 1;
        });
        // Convert to array and sort descending by count
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Show top 5 to keep chart clean
    }, [appointments]);

    // 3. Appointments per Day (Trend Graph)
    const appointmentsTrend = useMemo(() => {
        const dateCounts = {};

        // Count appointments per date
        appointments.forEach(a => {
            // Strip off any time data if present, just use YYYY-MM-DD
            const dateStr = a.date.split('T')[0];
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        });

        // Convert object to array, sort by date chronologically
        const sortedData = Object.entries(dateCounts)
            .map(([date, count]) => {
                // Formatting date to 'Feb 27' style for cleaner XAxis
                const dateObj = new Date(date);
                const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
                return {
                    rawDate: date,
                    displayDate: formatter.format(dateObj),
                    count
                };
            })
            .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

        return sortedData;
    }, [appointments]);


    // Doctor Form Handlers
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
    };

    const handleDoctorSubmit = (e) => {
        e.preventDefault();
        const errors = {};
        if (!doctorForm.name.trim()) errors.name = 'Name is required';
        if (doctorForm.availableDays.length === 0) errors.days = 'Select at least one day';
        if (doctorForm.timeSlots.length === 0) errors.slots = 'Select at least one slot';

        if (Object.keys(errors).length > 0) {
            setDocErrors(errors);
            return;
        }

        addDoctor(doctorForm);
        setDoctorForm({ name: '', department: 'General Physician', experience: '', availableDays: [], timeSlots: [], status: 'Active' });
        setDocErrors({});
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Admin Dashboard</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Enterprise Management System.</p>
                </div>
                <span className="badge badge-review">Admin Access</span>
            </div>

            {/* Analytics Overview */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h4 style={{ margin: 0 }}>Analytics Overview</h4>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{queries.length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Queries</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{appointmentsToday.length > 0 ? appointmentsToday.length : appointments.length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Appointments Today</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{queries.filter(q => q.category === 'Emergency').length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency Cases</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{doctors?.length || 0}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Doctors</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{doctorsOnDutyToday.length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On Duty Today ({currentDay})</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', marginBottom: '2rem' }}>

                {/* Main Focus: Urgency Distribution */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Urgency Distribution</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Current triage breakdown.</p>
                    <div style={{ flex: 1, minHeight: '250px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || 'var(--primary)'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [value, 'Queries']} cursor={{ fill: 'transparent' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend Graph: Appointments over Time */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Appointments Trend</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Bookings per day.</p>
                    <div style={{ flex: 1, minHeight: '250px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={appointmentsTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <Tooltip cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Area type="monotone" dataKey="count" name="Appointments" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Support Graph Container */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Appointments by Department</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Most requested specializations.</p>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={appointmentsByDept}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                            <XAxis type="number" allowDecimals={false} hide />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: 'var(--text-main)' }} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'var(--background)' }} formatter={(value) => [value, 'Appointments']} />
                            <Bar dataKey="count" fill="var(--success)" radius={[0, 4, 4, 0]} name="Appointments" barSize={32}>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('requests')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'requests' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                >
                    Patient Requests
                </button>
                <button
                    onClick={() => setActiveTab('doctors')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'doctors' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'doctors' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                >
                    Manage Doctors
                </button>
            </div>

            {/* Tab: Patient Requests */}
            {activeTab === 'requests' && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>
                            Health Queries ({filteredQueries.length})
                        </h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={filterEmergency}
                                onChange={() => setFilterEmergency(!filterEmergency)}
                            />
                            Show Emergencies / High Urgency Only
                        </label>
                    </div>

                    {filteredQueries.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No queries found matching the criteria.</p>
                    ) : (
                        <div className="grid">
                            {filteredQueries.map(q => (
                                <div key={q.id} className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '0.5rem', borderLeft: q.category === 'Emergency' ? '4px solid var(--danger)' : '1px solid var(--border)' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0 }}>{q.name} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.9rem' }}>({q.age} yrs, {q.gender || 'N/A'})</span></h4>

                                            {q.category === 'Emergency' ? (
                                                <span className="badge badge-rejected" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>{q.category}</span>
                                            ) : (
                                                <span className="badge badge-approved" style={{ backgroundColor: 'var(--success)', color: 'white' }}>{q.category}</span>
                                            )}
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}><strong>Symptoms:</strong> {q.symptoms}</p>
                                        <small style={{ color: 'var(--text-muted)' }}>Submitted: {formatDate(q.date)}</small>
                                    </div>

                                    <div style={{ minWidth: '150px' }}>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Update Status</label>
                                        <select
                                            className="form-control"
                                            value={q.status}
                                            onChange={(e) => handleStatusChange('query', q.id, e.target.value)}
                                            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                        >
                                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                            Appointment Requests ({appointments.length})
                        </h3>
                        {appointments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No appointments found.</p>
                        ) : (
                            <div className="grid">
                                {appointments.map(a => (
                                    <div key={a.id} className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                <h4 style={{ margin: 0 }}>{a.name}</h4>
                                                <span className="badge badge-pending" style={{ backgroundColor: 'var(--secondary)', color: 'var(--text-muted)' }}>{a.department}</span>
                                                {a.assignedDoctor && (
                                                    <span className="badge badge-approved" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>Assigned: {a.assignedDoctor}</span>
                                                )}
                                            </div>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
                                                <strong>Requested Slot:</strong> {a.date} - {a.timeSlot}
                                            </p>
                                            <small style={{ color: 'var(--text-muted)' }}>Submitted: {formatDate(a.date)}</small>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                                            <div>
                                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Update Status</label>
                                                <select
                                                    className="form-control"
                                                    value={a.status}
                                                    onChange={(e) => handleStatusChange('appointment', a.id, e.target.value)}
                                                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                                >
                                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Assign Doctor</label>
                                                <select
                                                    className="form-control"
                                                    value={a.assignedDoctor || ''}
                                                    onChange={(e) => updateAppointmentDoctor(a.id, e.target.value)}
                                                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {doctors.filter(d => d.department.startsWith(a.department) && d.status === 'Active').map(doc => (
                                                        <option key={doc.id} value={doc.name}>{doc.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab: Doctor Management */}
            {activeTab === 'doctors' && (
                <div className="fade-in">
                    {/* Doctor Availability Search */}
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label className="form-label">Check Availability by Department</label>
                                <select className="form-control" value={searchDepartment} onChange={e => setSearchDepartment(e.target.value)}>
                                    <option value="All Departments">All Departments</option>
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
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label className="form-label">Day of Week</label>
                                <select className="form-control" value={searchDay} onChange={e => setSearchDay(e.target.value)}>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--background)', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center', minWidth: '150px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {searchedDoctors.length}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doctors Present</div>
                            </div>
                        </div>

                        {searchedDoctors.length > 0 && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Available Doctors:</span>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {searchedDoctors.map(doc => (
                                        <span key={doc.id} className="badge badge-approved" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 0.75rem' }}>
                                            {doc.name} - {doc.timeSlots?.join(', ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Doctor Timetable View */}
                    <div className="card" style={{ marginBottom: '2rem', overflowX: 'auto' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Doctor Timetable</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--secondary)' }}>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Doctor</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Department</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Mon</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Tue</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Wed</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Thu</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Fri</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Sat</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Sun</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors?.map(d => (
                                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{d.name}</td>
                                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{d.department}</td>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <td key={day} style={{ padding: '0.75rem' }}>
                                                {d.availableDays?.includes(day) ? (
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 500 }}>
                                                        {d.timeSlots?.map(t => t.substring(0, 3)).join(', ')}
                                                    </div>
                                                ) : <span style={{ color: 'var(--border)' }}>-</span>}
                                            </td>
                                        ))}
                                        <td style={{ padding: '0.75rem' }}>
                                            <select
                                                value={d.status}
                                                onChange={(e) => handleStatusChange('doctor', d.id, e.target.value)}
                                                style={{ padding: '0.25rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: d.status === 'Active' ? '#e6f4ea' : '#fce8e6', color: d.status === 'Active' ? '#137333' : '#c5221f' }}
                                            >
                                                {docStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
