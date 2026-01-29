// Test script to verify folder creation
import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testFolderCreation() {
    try {
        // First, login to get a token
        console.log('🔐 Logging in...');
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'test@example.com', // Replace with your test user
            password: 'password123'     // Replace with your test password
        });

        const token = loginRes.data.token;
        console.log('✅ Logged in successfully');

        // Try to create a folder
        console.log('\n📁 Creating folder...');
        const folderRes = await axios.post(
            `${API_URL}/api/folders`,
            {
                name: 'Test Folder',
                description: 'This is a test folder',
                parentId: ''
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('✅ Folder created successfully:');
        console.log(JSON.stringify(folderRes.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('Full error:', error);
    }
}

testFolderCreation();
