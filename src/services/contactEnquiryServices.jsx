import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

// GET /api/v1/contact-us/get-all-contact-enquiries
export const fetchContactEnquiries = async () => {
  const response = await axiosInstance.get('contact-us/get-all-contact-enquiries', { headers });
  return response.data.result;
};

// DELETE /api/v1/contact-us/delete/{Id}
export const deleteContactEnquiry = async (id) => {
  const response = await axiosInstance.delete(`contact-us/delete/${id}`, { headers });
  return response.data;
};
