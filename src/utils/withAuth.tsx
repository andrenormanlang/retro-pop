import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { Center, Spinner } from '@chakra-ui/react';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthenticatedComponent = (props: any) => {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const router = useRouter();

    useEffect(() => {
      if (!accessToken) {
        router.push('/auth/login'); // Redirect to login page if not authenticated
      }
    }, [accessToken, router]);

    // Show a loading spinner while checking authentication
    if (!accessToken) {
      return (
        <Center height="100vh">
          <Spinner size="xl" />
        </Center>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;
