import EditPersonalAccountName from '@/components/basejump/edit-personal-account-name';
import { createClient } from '@/lib/supabase/server';
import MobileSidebarToggle from '@/components/layout/MobileSidebarToggle';

export default async function PersonalAccountSettingsPage() {
  const supabaseClient = await createClient();
  const { data: personalAccount } = await supabaseClient.rpc(
    'get_personal_account',
  );

  return (
    <div>
      <div className="relative">
        <div className="absolute -top-2 -left-2 md:hidden z-10">
          <MobileSidebarToggle />
        </div>
      </div>
      <EditPersonalAccountName account={personalAccount} />
    </div>
  );
}
