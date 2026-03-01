import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

const CheckStatus = () => {
    const { queries, appointments } = useAppContext();
    const { currentUser } = useAuthContext();

    // Filter only for the currently logged-in patient
    const userQueries = queries.filter(q => q.userId === currentUser?.id);
    const userAppointments = appointments.filter(a => a.userId === currentUser?.id);

    const getBadgeClass = (status) => {
        switch (status) {
            case 'Approved': return 'badge badge-approved';
            case 'Pending': return 'badge badge-pending';
            case 'Under Review': return 'badge badge-review';
            case 'Rejected': return 'badge badge-rejected';
            default: return 'badge';
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fade-in">
            <h2>Check Status</h2>
            <p>View the status of your submitted health queries and appointment requests.</p>

            <div className="grid grid-cols-2" style={{ marginTop: '2rem' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        My Health Queries
                        <span className="badge" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>{userQueries.length}</span>
                    </h3>
                    {userQueries.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            You haven't submitted any health queries yet.
                        </div>
                    ) : (
                        <div className="grid" style={{ gap: '1rem' }}>
                            {userQueries.map((q) => (
                                <div key={q.id} className="card" style={{ marginBottom: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {q.category}
                                                {q.urgency && (
                                                    <span className={`badge ${q.urgency === 'High' ? 'badge-rejected' : q.urgency === 'Medium' ? 'badge-review' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                                                        {q.urgency} Urgency
                                                    </span>
                                                )}
                                            </h4>
                                            <small style={{ color: 'var(--text-muted)' }}>{formatDate(q.date)}</small>
                                        </div>
                                        <span className={getBadgeClass(q.status)}>{q.status}</span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        "{q.symptoms}"
                                    </p>
                                    {q.aiGuidance && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                                            <strong>Guidance:</strong> {q.aiGuidance}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        My Appointments
                        <span className="badge" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>{userAppointments.length}</span>
                    </h3>
                    {userAppointments.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            You have no upcoming appointment requests.
                        </div>
                    ) : (
                        <div className="grid" style={{ gap: '1rem' }}>
                            {userAppointments.map((a) => (
                                <div key={a.id} className="card" style={{ marginBottom: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ margin: 0 }}>{a.department}</h4>
                                            <small style={{ color: 'var(--text-muted)' }}>Requested: {formatDate(a.date)}</small>
                                        </div>
                                        <span className={getBadgeClass(a.status)}>{a.status}</span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                                        <strong>Prefers:</strong> {a.date} ({a.timeSlot})
                                    </p>
                                    {a.status === 'Approved' && a.assignedDoctor && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#e6f4ea', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: '#137333', border: '1px solid #ceead6' }}>
                                            <strong>Assigned Doctor:</strong> {a.assignedDoctor}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckStatus;
