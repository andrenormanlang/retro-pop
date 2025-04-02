import { useRouter } from 'next/navigation';

// Using a more generic type definition that matches the router's shape
type Router = ReturnType<typeof useRouter>;

export const redirectToLogin = (router: Router, fromPath?: string) => {
  const redirectPath = `/auth/login${fromPath ? `?redirectTo=${encodeURIComponent(fromPath)}` : ''}`;
  console.log(`Redirecting to: ${redirectPath}`);
  router.push(redirectPath);
};
