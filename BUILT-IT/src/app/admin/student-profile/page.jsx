import { query } from "../../../lib/db";
import { AiOutlineArrowLeft } from 'react-icons/ai';
import Link from 'next/link'; // Import Link for client-side navigation

export default async function StudentProfile({ searchParams }) {
    const rollNo = searchParams.rollNo;
    if (!rollNo) {
        return <div>No roll number provided.</div>;
    }
    const result = await query("SELECT * FROM students WHERE roll_no = $1", [rollNo]);
    const student = result.rows[0];
    if (!student) {
        return <div>No student found with roll number: {rollNo}</div>;
    }

    return (
        <div style={{
            fontFamily: 'system-ui, sans-serif', // Improve font
            backgroundColor: '#f4f4f7', // Light background color
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.1)', // Light shadow for depth
                maxWidth: '800px', // Limit page width
                width: '100%'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <Link href="/admin/student-room-management" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#007bff', // Blue color for button
                        textDecoration: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #007bff',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.2s ease',
                    }}>
                        <AiOutlineArrowLeft style={{ marginRight: '0.5rem' }} />
                        Back
                    </Link>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.75rem',
                        fontWeight: 'bold',
                        color: '#333' // Darker heading color
                    }}>Student Profile</h1>
                    <div></div> {/* Empty div to balance space-between */}
                </div>


                <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '0.25rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'semibold',
                        marginBottom: '1rem',
                        color: '#555' // Slightly lighter section heading
                    }}>Profile</h2>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Roll No:</strong> {student.roll_no}</p>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Full Name:</strong> {student.full_name}</p>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Department:</strong> {student.department}</p>
                    <p><strong>Batch:</strong> {student.batch}</p>
                </section>

                <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '0.25rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'semibold',
                        marginBottom: '1rem',
                        color: '#555'
                    }}>Room Details</h2>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Room Number:</strong> {student.room_number || "Not Assigned"}</p>
                    <p><strong>Hostel Block:</strong> {student.hostel_block || "Not Assigned"}</p>
                </section>

                <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '0.25rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'semibold',
                        marginBottom: '1rem',
                        color: '#555'
                    }}>Fee Status</h2>
                    <p>{student.fees_paid ? "Paid" : "Due"}</p>
                </section>

                <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '0.25rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'semibold',
                        marginBottom: '1rem',
                        color: '#555'
                    }}>Emergency Contact</h2>
                    <p>{student.emergency_contact}</p>
                </section>
            </div>
        </div>
    );
}