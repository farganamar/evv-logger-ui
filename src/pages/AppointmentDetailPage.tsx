import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, User, Activity, FileText, AlertTriangle } from 'lucide-react';
import { getAppointmentLogs, checkInAppointment, checkOutAppointment, getAppointmentById, reportActivity } from '../services/appointmentService';
import { Appointment, AppointmentLog, ReportActivityPayload } from '../types';
import moment from 'moment-timezone';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
interface IconDefaultPrototype extends L.Icon.Default {
  _getIconUrl?: string;
}
delete ((L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl);
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AppointmentDetailPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [logs, setLogs] = useState<AppointmentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [actionType, setActionType] = useState<'CHECK-IN' | 'CHECK-OUT' | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationError, setLocationError] = useState('');
  const [, setIsLoadingLocation] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');  
  
  

  // Get the user's timezone
  const userTimezone = moment.tz.guess();

  useEffect(() => {
    const fetchAppointmentLogs = async () => {
      if (!appointmentId) return;
      
      try {
        setIsLoading(true);
        setError(''); // Reset error state
        const appointmentResponse = await getAppointmentById(appointmentId);
        if (appointmentResponse.data === null) {
          setError('No appointment found');
          return;
        }

        setAppointment(appointmentResponse.data);
        const response = await getAppointmentLogs(appointmentId);
        setLogs(response.data || []);
      } catch (err) {
        console.error('Failed to fetch appointment logs', err);
        setError('Failed to load appointment logs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentLogs();
  }, [appointmentId]);


  const handleAction = async (type: 'CHECK-IN' | 'CHECK-OUT') => {
    setActionType(type);
    // Get current location before showing the modal
    setIsLoadingLocation(true);
    setLocationError('');
    
    try {
      const position = await getCurrentPosition();
      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      setShowVerificationModal(true);
    } catch (error) {
      setLocationError('Unable to get your current location. Please ensure location services are enabled.');
      console.error('Geolocation error:', error);
      // Still show the modal, but with a warning
      setShowVerificationModal(true);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  const handleSubmit = async () => {
    if (!appointmentId || !actionType) return;
  
    try {
      setIsSubmitting(true);
      // Clear any previous modal errors
      setLocationError('');
      
      // Use current location if available, otherwise fall back to client location
      const latitude = currentLocation?.latitude ?? appointment?.client_detail.latitude;
      const longitude = currentLocation?.longitude ?? appointment?.client_detail.longitude;
      
      // Verify we have location data
      if (!latitude || !longitude) {
        setLocationError('Location data is missing. Please enable location services and try again.');
        setIsSubmitting(false);
        return;
      }
  
      const payload = {
        appointment_id: appointmentId,
        latitude,
        longitude,
        note,
        verification_code: verificationCode
      };
  
      let response
      if (actionType === 'CHECK-IN') {
        response = await checkInAppointment(payload);
      } else {
        response = await checkOutAppointment(payload);
      }

      console.log('Response:', response);
      if (response.code !== 200) {
        setLocationError(response.message);
        return;
      } 
    
  
      // Refresh appointment and logs after action
      const appointmentResponse = await getAppointmentById(appointmentId);
      setAppointment(appointmentResponse.data);
      
      const appointmentLogReponse = await getAppointmentLogs(appointmentId);
      setLogs(appointmentLogReponse.data || []);
      
      setShowVerificationModal(false);
      setVerificationCode('');
      setNote('');
      setCurrentLocation(null); // Reset location
    } catch (err:any) {
      console.error('Action failed', err);
      let errorMessage = 'Failed to process the request. Please try again.';
      
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.status === 401) {
          errorMessage = 'Verification code is invalid or expired. Please try again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You are not authorized to perform this action.';
        } else if (err.response.status === 404) {
          errorMessage = 'Appointment not found. Please refresh the page and try again.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection and try again.';
      }
      
      // Display error in the modal
      setLocationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportType || !reportNote) {
      setReportError('Please fill in all required fields');
      return;
    }
  
    try {
      setIsSubmittingReport(true);
      setReportError('');
  
      const payload: ReportActivityPayload = {
        appointment_id: appointmentId!,
        type_of_note: reportType,
        note: reportNote
      };
  
      const response = await reportActivity(payload);
      
      if (response.code === 200) {
        // Refresh logs after successful report
        const logsResponse = await getAppointmentLogs(appointmentId!);
        setLogs(logsResponse.data || []);
        
        // Reset and close modal
        setShowReportModal(false);
        setReportType('');
        setReportNote('');
      } else {
        setReportError(response.message);
      }
    } catch (err: any) {
      console.error('Report submission failed', err);
      setReportError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };  

  // Format dates and times using moment-timezone
  const formatDates = () => {
    if (!appointment?.start_time) {
      return {
        dateFormatted: 'Not scheduled',
        timeRangeFormatted: 'Not available'
      };
    }
    
    try {
      const startMoment = moment(appointment.start_time).tz(userTimezone);
      const endMoment = appointment.end_time ? moment(appointment.end_time).tz(userTimezone) : null;
      
      if (!startMoment.isValid()) {
        return {
          dateFormatted: 'Invalid date',
          timeRangeFormatted: 'Invalid time'
        };
      }
      
      const dateFormatted = startMoment.format('dddd, MMMM D, YYYY');
      const timeRangeFormatted = endMoment && endMoment.isValid() 
        ? `${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')}`
        : startMoment.format('h:mm A');
        
      return { dateFormatted, timeRangeFormatted };
    } catch (error) {
      console.error('Error formatting dates:', error);
      return {
        dateFormatted: 'Date error',
        timeRangeFormatted: 'Time error'
      };
    }
  };
  
  const { dateFormatted, timeRangeFormatted } = formatDates();

  // Format timestamp for logs using moment-timezone
  const formatLogTimestamp = (timestamp: string) => {
    try {
      return moment(timestamp).tz(userTimezone).format('MMM D, YYYY h:mm A');
    } catch (error) {
      console.error('Error formatting log timestamp:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Appointment Details</h1>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-primary-light/20 rounded w-1/3"></div>
          <div className="h-64 bg-primary-light/20 rounded"></div>
          <div className="h-64 bg-primary-light/20 rounded"></div>
        </div>
      ) : appointment ? (
        <>
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
                    <p className="text-sm text-text-secondary">Time ({moment.tz(userTimezone).format('z')})</p>
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
                    <p className="font-medium">{appointment?.client_detail?.name}</p>
                    <p className="text-sm text-text-secondary">{appointment?.client_detail?.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-light/20 p-2 rounded-lg mr-3">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Location</p>
                    <p className="font-medium">{appointment?.client_detail.address}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {appointment?.notes && (
              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="font-medium mb-1">Notes</h3>
                <p className="text-text-secondary">{appointment.notes}</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium">Location</h3>
              </div>
              
              <div className="h-[400px] rounded-lg overflow-hidden">
                <MapContainer
                  center={[
                    appointment?.client_detail.latitude ?? 0, 
                    appointment?.client_detail.longitude ?? 0
                  ]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[appointment?.client_detail.latitude ?? 0, appointment?.client_detail.longitude ?? 0]}>
                    <Popup>
                      <div className="p-2">
                        <p className="font-medium">{appointment?.client_detail.name}</p>
                        <p className="text-sm">{appointment?.client_detail.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                  {logs.map((log, index) => (
                    <Marker key={index} position={[log.latitude, log.longitude]}>
                      <Popup>
                        <div className="p-2">
                          <p className="font-medium">{log.log_type}</p>
                          <p className="text-sm">{formatLogTimestamp(log.timestamp)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <button
                className="btn btn-outline"
                onClick={() => setShowReportModal(true)}
              >
                <FileText size={20} />
                Generate Report
              </button>
              
              <div className="space-x-4">
                {appointment?.status === 'SCHEDULED' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAction('CHECK-IN')}
                  >
                    Check In
                  </button>
                )}
                {appointment?.status === 'IN_PROGRESS' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAction('CHECK-OUT')}
                  >
                    Check Out
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity size={20} className="mr-2 text-primary" />
              Activity Log
            </h2>
            
            {appointment?.status === 'SCHEDULED' ? (
              <div className="text-center py-8 text-text-secondary">
                <Clock size={40} className="mx-auto mb-3 text-primary-light" />
                <p className="font-medium mb-1">Appointment Not Started</p>
                <p className="text-sm">Activity logs will appear here after check-in</p>
              </div>
            ) : logs.length === 0 ? (
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
                          <p className="text-sm text-text-secondary">{formatLogTimestamp(log.timestamp)}</p>
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
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary mb-4">Appointment not found</p>
          <button 
            onClick={() => navigate('/appointments')}
            className="btn btn-primary"
          >
            View All Appointments
          </button>
        </div>
      )}

    {/* Verification Modal */}
    {showVerificationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold mb-4">
            {actionType === 'CHECK-IN' ? 'Check In' : 'Check Out'} Verification
          </h3>
          
          {locationError && (
            <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-md text-warning text-sm flex items-start">
              <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
          
          {currentLocation && !locationError && (
            <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-md text-success text-sm">
              <p>Current location captured successfully</p>
              <p className="text-xs mt-1">Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {actionType === 'CHECK-IN' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Verification Code <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code or Type '0000' to bypass"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Note
              </label>
              <textarea
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowVerificationModal(false);
                setLocationError(''); // Clear errors when closing modal
                setVerificationCode(''); // Clear verification code
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={(actionType === 'CHECK-IN' && !verificationCode) || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Report Modal */}
    {showReportModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold mb-4">Generate Activity Report</h3>
          
          {reportError && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-md text-error text-sm flex items-start">
              <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{reportError}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Activity Type <span className="text-error">*</span>
              </label>
              <select
                className="input"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                required
              >
                <option value="">Select activity type</option>
                <option value="PERSONAL_CARE">Personal Care</option>
                <option value="MEDICATION">Medication</option>
                <option value="MOBILITY">Mobility Assistance</option>
                <option value="HOUSEKEEPING">Housekeeping</option>
                <option value="MEAL_PREP">Meal Preparation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Activity Details <span className="text-error">*</span>
              </label>
              <textarea
                className="input"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Describe the activity details"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowReportModal(false);
                setReportError('');
                setReportType('');
                setReportNote('');
              }}
              disabled={isSubmittingReport}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleReportSubmit}
              disabled={!reportType || !reportNote || isSubmittingReport}
            >
              {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    )}    
    </div>
  );
};

export default AppointmentDetailPage;