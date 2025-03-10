// assignRole.js
import clerkClient from '@clerk/clerk-sdk-node';

async function assignAdminRole(email) {
  // Fetch users matching the email
  const users = await clerkClient.users.getUserList({ emailAddress: [email] });
  if (users.length === 0) {
    console.error('User not found');
    return;
  }
  const user = users[0];
  // Update the user's public metadata to set role to 'admin'
  await clerkClient.users.updateUser(user.id, {
    publicMetadata: { role: 'admin' },
  });
  console.log(`User ${email} has been updated to admin role.`);
}

assignAdminRole('mc230041024@iiti.ac.in').catch(console.error);
