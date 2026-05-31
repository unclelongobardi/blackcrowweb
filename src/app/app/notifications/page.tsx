import Placeholder from "@/components/app/Placeholder";
import { IconBell } from "@/components/icons";

export default function NotificationsPage() {
  return (
    <Placeholder
      title="Notifications"
      subtitle="Mentions, follows, market resolutions and signals from the operatives you track will surface here."
      icon={<IconBell className="h-6 w-6" />}
    />
  );
}
