import React from 'react';
import { Linkedin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const LinkedInIntegration = () => {
  const handleConnect = async () => {
    try {
      window.location.href = '/api/auth/linkedin';
    } catch (error) {
      console.error('Error initiating LinkedIn connection:', error);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-[#0077b5] hover:bg-[#006497] text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110 ml-4"
    >
      <Linkedin className="h-5 w-5" />
      Connect Account
    </Button>
  );
};

export default LinkedInIntegration;