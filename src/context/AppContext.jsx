import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [queries, setQueries] = useState(() => {
    const saved = localStorage.getItem('health_queries_v3');
    if (saved) return JSON.parse(saved);

    // Rich dummy data to populate charts (100 items)
    const categories = ['Emergency', 'General Consultation', 'Pediatrician', 'Cardiologist', 'Dermatologist', 'Orthopedic'];
    const genders = ['Male', 'Female', 'Other'];
    const symptomsList = [
      'Severe chest pain and shortness of breath',
      'Mild headache and slightly elevated temperature',
      'Fever and rash on arms',
      'Severe allergic reaction, face swelling',
      'Irregular heartbeat during exercise',
      'Severe acne breakout and skin redness',
      'Persistent cough for 3 weeks',
      'Sharp pain in lower back',
      'Blurry vision in left eye',
      'Nausea and dizziness after eating'
    ];

    const defaultQueries = Array.from({ length: 100 }, (_, i) => ({
      id: `q_gen_${i}`,
      name: `Test Patient ${i + 1}`,
      age: Math.floor(Math.random() * 60) + 18,
      gender: genders[Math.floor(Math.random() * genders.length)],
      category: i < 15 ? 'Emergency' : categories[Math.floor(Math.random() * categories.length)], // Ensure a decent chunk of emergencies
      symptoms: symptomsList[Math.floor(Math.random() * symptomsList.length)],
      status: i % 4 === 0 ? 'Resolved' : 'Pending',
      date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)).toISOString() // Random date in past 7 days
    }));

    return defaultQueries;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('health_appointments_v3');
    if (saved) return JSON.parse(saved);

    const departments = ['General Physician', 'Cardiologist (Heart)', 'Dermatologist (Skin)', 'Orthopedic (Bones/Joints)', 'Pediatrician', 'Neurologist (Brain/Nerves)'];
    const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    const doctorsList = [
      'Dr. Sarah Smith', 'Dr. Mark Davis', 'Dr. Lisa Wong', // Cardio
      'Dr. James Wilson', 'Dr. Patricia Hall', // Dermatology
      'Dr. Emily Chen', 'Dr. Robert Garcia', // Orthopedic
      'Dr. Michael Brown', 'Dr. William Lee', 'Dr. Angela Martinez', // General
      'Dr. Kevin White', 'Dr. Mary Taylor', // Pediatrics
      'Dr. Christopher Moore' // Neurology
    ];

    const defaultAppointments = Array.from({ length: 100 }, (_, i) => {
      const isPast = Math.random() > 0.5;
      const daysOffset = Math.floor(Math.random() * 14); // 0 to 14 days
      const dateObj = new Date(Date.now() + (isPast ? -1 : 1) * daysOffset * 86400000);

      return {
        id: `a_gen_${i}`,
        patientName: `Test Patient ${i + 1}`,
        department: departments[Math.floor(Math.random() * departments.length)],
        date: dateObj.toISOString(),
        time: `${Math.floor(Math.random() * 8) + 9}:00`, // random hour 9-16
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignedDoctor: doctorsList[Math.floor(Math.random() * doctorsList.length)]
      };
    });

    return defaultAppointments;
  });

  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem('health_doctors_v2');
    if (saved) return JSON.parse(saved);

    // Pre-seed an expanded list of doctors for testing
    const defaultDoctors = [
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
    localStorage.setItem('health_doctors_v2', JSON.stringify(defaultDoctors));
    return defaultDoctors;
  });

  useEffect(() => {
    localStorage.setItem('health_queries_v3', JSON.stringify(queries));
  }, [queries]);

  useEffect(() => {
    localStorage.setItem('health_appointments_v3', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('health_doctors_v2', JSON.stringify(doctors));
  }, [doctors]);

  const addQuery = (query) => {
    setQueries([{ ...query, id: Date.now().toString(), status: 'Pending', date: new Date().toISOString() }, ...queries]);
  };

  const addAppointment = (appointment) => {
    setAppointments([{ ...appointment, id: Date.now().toString(), status: 'Pending', date: new Date().toISOString() }, ...appointments]);
  };

  const updateQueryStatus = (id, status) => {
    setQueries(queries.map(q => q.id === id ? { ...q, status } : q));
  };

  const updateAppointmentStatus = (id, status) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateAppointmentDoctor = (id, assignedDoctor) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, assignedDoctor } : a));
  };

  const addDoctor = (doctor) => {
    setDoctors([...doctors, { ...doctor, id: `d${Date.now()}`, status: 'Active' }]);
  };

  const updateDoctorProfile = (id, profile) => {
    setDoctors(doctors.map(d => d.id === id ? { ...d, ...profile } : d));
  };

  const updateDoctorStatus = (id, status) => {
    setDoctors(doctors.map(d => d.id === id ? { ...d, status } : d));
  };

  return (
    <AppContext.Provider value={{
      queries,
      appointments,
      doctors,
      addQuery,
      addAppointment,
      updateQueryStatus,
      updateAppointmentStatus,
      updateAppointmentDoctor,
      addDoctor,
      updateDoctorProfile,
      updateDoctorStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};
