import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function FeaturesPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Features</h1>
        <p className="mt-4 text-muted-foreground">
          Explore the powerful features of Invento Manager.
        </p>
        {/* Detailed feature content can be added here */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="gap-1.5 p-6 shadow-sm">
            <CardTitle className="text-base">Professional Invoicing</CardTitle>
            <CardDescription>
              Create beautiful invoices, auto-calculate taxes, and send them in seconds.
            </CardDescription>
          </Card>
          <Card className="gap-1.5 p-6 shadow-sm">
            <CardTitle className="text-base">Multi-User Access</CardTitle>
            <CardDescription>
              Add sub-users with granular permissions for your team.
            </CardDescription>
          </Card>
          <Card className="gap-1.5 p-6 shadow-sm">
            <CardTitle className="text-base">Inventory Management</CardTitle>
            <CardDescription>
              Track stock across multiple warehouses and set low-stock alerts.
            </CardDescription>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}