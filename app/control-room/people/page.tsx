import { Metadata } from "next";

import { adminListPeople } from "@/app/actions/control-room";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { PromoteOperatorForm } from "./_components/promote-operator-form";
import { PeopleTable } from "./_components/people-table";

export const metadata: Metadata = {
  title: "People & roles • Control room",
};

export default async function ControlRoomPeoplePage() {
  const people = await adminListPeople();

  return (
    <div className="space-y-10">
      <section id="promote-operator" className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">People & roles</h1>
          <p className="text-sm text-muted-foreground">
            Promote trusted teammates into operator roles, manage elevated access, and keep the platform
            secure.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Promote an operator</CardTitle>
          </CardHeader>
          <CardContent>
            <PromoteOperatorForm />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section id="manage-operators" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold leading-tight">Operators</h2>
          <p className="text-sm text-muted-foreground">
            Toggle platform permissions or demote operators when access is no longer needed.
          </p>
        </div>
        <PeopleTable initialPeople={people} />
      </section>
    </div>
  );
}
