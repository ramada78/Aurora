import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Backendurl } from '../../App';
import { useTranslation } from 'react-i18next';

export default function useContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(`${Backendurl}/api/forms/submit`, {
          ...formData
        });
        
        if (response.data.success) {
          toast.success(t('form_success_message'));
          // Reset form
          setFormData({ name: '', email: '', phone: '', message: '' });
        } else {
          toast.error(t('form_error_message'));
        }
      } catch (error) {
        toast.error(t('form_error_message'));
        console.error('Error submitting form:', error);
      }
    }
  };

  return { formData, errors, handleChange, handleSubmit };
}