'use client';

import ProfileForm from "@/components/profile/ProfileForm";

    
export default function ProfilePage() {
  const handleSubmit = async (data: any) => {
    // API çağrısı burada yapılacak
    console.log('Form data:', data);
  };

  const initialData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '5551234567',
    bio: 'Frontend Developer',
    role: 'developer',
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Profil Bilgileri</h1>
      <ProfileForm initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
} 