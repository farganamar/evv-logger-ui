import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Appointment } from '../types';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  // Format dates and times
  const dateFormatted = moment(appointment.start_time).format('ddd, MMM D, YYYY');
  const startTimeFormatted = moment(appointment.start_time).format('h:mm A');
  const endTimeFormatted = moment(appointment.end_time).format('h:mm A');
  
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-300 slide-up">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-text-primary">Client #{appointment.client_detail.name}</h3>
          <p className="text-text-secondary text-sm flex items-center">
            <MapPin size={14} className="mr-1 text-text-muted" />
            {appointment.client_detail?.address || 'No address provided'}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
      
      <div className="mt-4 flex items-center text-text-secondary">
        <Clock size={16} className="mr-2" />
        <span>{dateFormatted}</span>
        <span className="mx-2">•</span>
        <span>{startTimeFormatted} - {endTimeFormatted}</span>
      </div>
      
      {appointment.notes && (
        <div className="mt-3 text-sm text-text-secondary">
          <p className="line-clamp-2">{appointment.notes}</p>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-end">
        <Link 
          to={`/appointments/${appointment.appointment_id}`}
          className="flex items-center text-primary font-medium text-sm hover:underline"
        >
          View Details
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default AppointmentCard;