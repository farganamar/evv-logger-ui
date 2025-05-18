import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, User, Activity } from 'lucide-react';
import { getAppointmentLogs, getAppointmentById } from '../services/appointmentService';
import { Appointment, AppointmentLog } from '../types';
import { format, parseISO } from 'date-fns';

const AppointmentDetailPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [logs, setLogs] = useState<AppointmentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (!appointmentId) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch appointment details
        const appointmentResponse = await getAppointmentById(appointmentId);
        if (appointmentResponse.data && ![null, 'undefined'].includes(appointmentResponse.data.appointment_id)) {
          setAppointment(appointmentResponse.data);
        } else {
          setError('Appointment not found');
        }
        
        // Fetch appointment logs
        const logsResponse = await getAppointmentLogs(appointmentId);
        setLogs(logsResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch appointment data', err);
        setError('Failed to load appointment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentData();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse space-y-4 w-full max-w-3xl">
          <div className="h-8 bg-primary-light/20 rounded w-1/3"></div>
          <div className="h-64 bg-primary-light/20 rounded"></div>
          <div className="h-64 bg-primary-light/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-error mb-4">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-text-secondary mb-4">Appointment not found</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Format dates and times
  const startTime = parseISO(appointment.start_time);
  const dateFormatted = format(startTime, 'EEEE, MMMM d, yyyy');
  const timeRangeFormatted = `${format(startTime, 'h:mm a')} - ${format(parseISO(appointment.end_time), 'h:mm a')}`;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Appointment Details</h1>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-light/20 p-2 rounded-lg mr-3">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Date</p>
                <p className="font-medium">{dateFormatted}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary-light/20 p-2 rounded-lg mr-3">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Time</p>
                <p className="font-medium">{timeRangeFormatted}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-light/20 p-2 rounded-lg mr-3">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Client</p>
                <p className="font-medium">Client #{appointment.client_detail.name}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary-light/20 p-2 rounded-lg mr-3">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Location</p>
                <p className="font-medium">{appointment.client_detail.address}</p>
              </div>
            </div>
          </div>
        </div>
        
        {appointment.notes && (
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="font-medium mb-1">Notes</h3>
            <p className="text-text-secondary">{appointment.notes}</p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-border">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Location</h3>
          </div>
          
          {logs.length > 0 && logs[0].latitude && logs[0].longitude ? (
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-primary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  Map view: {logs[0].latitude.toFixed(6)}, {logs[0].longitude.toFixed(6)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <p className="text-text-secondary">Map not available</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Activity size={20} className="mr-2 text-primary" />
          Activity Log
        </h2>
        
        {logs.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No activity logs available
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div key={index} className={`flex space-x-4 ${index !== logs.length - 1 ? 'border-b border-border pb-4' : ''}`}>
                <div className="relative">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    log.log_type === 'CHECK-IN' ? 'bg-success/20 text-success' :
                    log.log_type === 'CHECK-OUT' ? 'bg-error/20 text-error' :
                    'bg-primary-light/20 text-primary'
                  }`}>
                    {log.log_type === 'CHECK-IN' ? 'IN' :
                     log.log_type === 'CHECK-OUT' ? 'OUT' :
                     log.log_type === 'NOTE' ? 'N' : 'A'}
                  </div>
                  {index !== logs.length - 1 && (
                    <div className="absolute top-10 bottom-0 left-1/2 w-0.5 bg-border -translate-x-1/2"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{log.log_type}</h4>
                      <p className="text-sm text-text-secondary">{format(parseISO(log.timestamp), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                    {log.log_data && log.log_data.device && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-text-secondary">
                        {log.log_data.device}
                      </span>
                    )}
                  </div>
                  
                  {log.notes && (
                    <p className="mt-2 text-text-secondary">{log.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailPage;