// app/complaints/page.jsx
import { auth } from "@clerk/nextjs/server";

export default async function ComplaintsPage() {
  const { userId } = auth();
  if (!userId) return <div>Please sign in to view and file complaints.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Complaints</h1>
      <section>
        <h2>File a Complaint</h2>
        <p>Submit a new complaint regarding infrastructure, cleanliness, or other issues.</p>
        {/* Form component goes here */}
      </section>
      <section>
        <h2>Your Complaint Status</h2>
        <p>Track the status of your submitted complaints.</p>
      </section>
    </div>
  );
}
