import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// GET /api/v1/contact-us/get-all-lp-enquiries
export const fetchLandingPageEnquiries = async () => {
  const response = await axiosInstance.get('contact-us/get-all-lp-enquiries', { headers });
  return response.data.result;
};

// DELETE /api/v1/contact-us/delete/{Id}
// NOTE: no separate delete endpoint was provided for landing page enquiries,
// so this assumes it shares the same delete endpoint as contact enquiries.
// Update the path here if a dedicated endpoint exists.
export const deleteLandingPageEnquiry = async (id) => {
  const response = await axiosInstance.delete(`contact-us/delete/${id}`, { headers });
  return response.data;
};