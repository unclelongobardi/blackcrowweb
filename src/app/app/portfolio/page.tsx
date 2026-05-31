import Placeholder from "@/components/app/Placeholder";
import { IconChart2 } from "@/components/icons";

export default function PortfolioPage() {
  return (
    <Placeholder
      title="Portfolio"
      subtitle="Track your positions, realized PnL and open exposure across every market you trade."
      icon={<IconChart2 className="h-6 w-6" />}
    />
  );
}
