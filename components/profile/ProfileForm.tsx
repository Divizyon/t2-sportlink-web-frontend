'use client';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = yup.object().shape({
  firstName: yup.string().required('Ad alanı zorunludur'),
  lastName: yup.string().required('Soyad alanı zorunludur'),
  username: yup.string().required('Kullanıcı adı zorunludur')
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .matches(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  email: yup.string().email('Geçerli bir e-posta adresi giriniz').required('E-posta alanı zorunludur'),
  phone: yup.string().matches(/^[0-9]+$/, 'Geçerli bir telefon numarası giriniz'),
  role: yup.string().required('Rol seçimi zorunludur'),
  password: yup.string()
    .test('password-validation', 'Şifre en az 6 karakter olmalıdır', function(value) {
      // Şifre alanı boşsa validasyon geçer, değilse en az 6 karakter kontrolü yapar
      return !value || value.length >= 6;
    })
    .test('password-letter', 'Şifre en az bir harf içermelidir', function(value) {
      // Şifre alanı boşsa validasyon geçer, değilse en az bir harf kontrolü yapar
      return !value || /[a-zA-Z]/.test(value);
    }),
  confirmPassword: yup.string()
    .test('passwords-match', 'Şifreler eşleşmiyor', function(value) {
      // Şifre veya şifre onayı boşsa validasyon geçer, değilse eşleşme kontrolü yapar
      const { password } = this.parent;
      return !password || !value || password === value;
    })
});

export type ProfileFormData = yup.InferType<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

export default function ProfileForm({ initialData, onSubmit }: ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      username: initialData?.username || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      role: initialData?.role || '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await onSubmit(data);
      form.reset(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                  <Input placeholder="Adınız" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soyad</FormLabel>
                <FormControl>
                  <Input placeholder="Soyadınız" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <FormControl>
                <Input placeholder="kullanici_adi" {...field} />
              </FormControl>
              <FormDescription>
                Kullanıcı adınız sadece harf, rakam ve alt çizgi içerebilir.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ornek@email.com" {...field} />
              </FormControl>
              <FormDescription>
                Bu e-posta adresi bildirimler için kullanılacaktır.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input placeholder="5XX XXX XX XX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="superadmin">Süperadmin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Üye</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4 mt-6">
          <h3 className="text-base font-medium mb-4">Şifre Değiştirme</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Şifrenizi değiştirmek istiyorsanız, aşağıdaki alanları doldurun. Değiştirmek istemiyorsanız boş bırakabilirsiniz.
          </p>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yeni Şifre</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Yeni şifre" {...field} />
                  </FormControl>
                  <FormDescription>
                    En az 6 karakter ve en az bir harf içermelidir.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre Onayı</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Şifrenizi tekrar girin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit">
            Kaydet
          </Button>
        </div>
      </form>
    </Form>
  );
} 