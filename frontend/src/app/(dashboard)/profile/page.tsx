import ProfileInner from './profile-inner';
import { Suspense } from 'react';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading profile...</div>}>
      <ProfileInner />
    </Suspense>
  );
}
