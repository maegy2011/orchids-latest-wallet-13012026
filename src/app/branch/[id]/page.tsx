import { BranchDetailsClient } from "@/components/branch-details-client";

export default function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  return <BranchDetailsClient params={params} />;
}
