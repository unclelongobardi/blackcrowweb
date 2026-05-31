import Placeholder from "@/components/app/Placeholder";
import { IconPlus } from "@/components/icons";

export default function CreateMarketPage() {
  return (
    <Placeholder
      title="Create Market"
      subtitle="Spin up a new prediction market and let the network trade your thesis. Launch flows are available today from any target market."
      icon={<IconPlus className="h-6 w-6" />}
    />
  );
}
