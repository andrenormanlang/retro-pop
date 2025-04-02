import { AppRouterInstance } from 'next/navigation';

export const redirectToLogin = (router: AppRouterInstance, fromPath?: string) => {
  const redirectPath = `/auth/login${fromPath ? `?redirectTo=${encodeURIComponent(fromPath)}` : ''}`;
  console.log(`Redirecting to: ${redirectPath}`);
  router.push(redirectPath);
};
