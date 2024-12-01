import React from 'react';
import { Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TwitterIntegration = () => {
  const handleConnect = async () => {
    try {
      window.location.href = '/api/auth/twitter';
    } catch (error) {
      console.error('Error initiating Twitter connection:', error);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-[#0077b5] hover:bg-[#006497] text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110 ml-4"
    >
      <Twitter className="h-5 w-5" />
      Connect Account
    </Button>
  );
};

export default TwitterIntegration;