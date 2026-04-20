import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CampaignsTab from "@/components/distribution/CampaignsTab";
import BuyersTab from "@/components/distribution/BuyersTab";
import SuppliersTab from "@/components/distribution/SuppliersTab";
import DeliveriesTab from "@/components/distribution/DeliveriesTab";

export default function Distribution() {
  useEffect(() => { document.title = "Lead Distribution — HomeFixr Admin"; }, []);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Lead Distribution</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage campaigns, buyers, suppliers and delivery rules</p>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="campaigns" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white text-white/50">Campaigns</TabsTrigger>
          <TabsTrigger value="buyers" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white text-white/50">Buyers</TabsTrigger>
          <TabsTrigger value="suppliers" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white text-white/50">Suppliers</TabsTrigger>
          <TabsTrigger value="deliveries" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white text-white/50">Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6"><CampaignsTab /></TabsContent>
        <TabsContent value="buyers" className="mt-6"><BuyersTab /></TabsContent>
        <TabsContent value="suppliers" className="mt-6"><SuppliersTab /></TabsContent>
        <TabsContent value="deliveries" className="mt-6"><DeliveriesTab /></TabsContent>
      </Tabs>
    </div>
  );
}