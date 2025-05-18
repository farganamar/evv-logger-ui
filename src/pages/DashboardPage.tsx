import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Filter } from 'lucide-react';
import { getAppointments } from '../services/appointmentService';
import { Appointment } from '../types';
import AppointmentCard from '../components/AppointmentCard';
import { format } from 'date-fns';

type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const DashboardPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('SCHEDULED');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setError(''); // Reset error state
        setIsLoading(true);
        const response = await getAppointments(statusFilter);
        if (response.data === null)  {
          setError('No appointments found');
          return;
        }
        setAppointments(response.data);
      } catch (err) {
        console.error('Failed to fetch appointments', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [statusFilter]);

  // Get today's date
  const today = new Date();
  const todayFormatted = format(today, 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">
          <Calendar size={16} className="inline mr-2" />
          {todayFormatted}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary-light/20 flex items-center justify-center">
            <Calendar size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-text-secondary text-sm">Upcoming Appointments</p>
            <h3 className="text-2xl font-bold text-text-primary">{appointments.length}</h3>
          </div>
        </div>
        
        <div className="card flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <Clock size={24} className="text-secondary" />
          </div>
          <div>
            <p className="text-text-secondary text-sm">Hours This Week</p>
            <h3 className="text-2xl font-bold text-text-primary">24.5</h3>
          </div>
        </div>
        
        <div className="card flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
            <User size={24} className="text-accent" />
          </div>
          <div>
            <p className="text-text-secondary text-sm">Active Clients</p>
            <h3 className="text-2xl font-bold text-text-primary">3</h3>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-text-secondary" />
            <select 
              className="border border-border rounded-md p-1 text-sm bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus)}
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-4">
              <div className="h-12 w-12 bg-primary-light/20 rounded-full"></div>
              <div className="space-y-4 flex-1">
                <div className="h-4 bg-primary-light/20 rounded w-3/4"></div>
                <div className="h-4 bg-primary-light/20 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-error text-center py-8">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-text-secondary text-center py-8">No {statusFilter.toLowerCase().replace('_', ' ')} appointments</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;