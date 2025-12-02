import axios from 'axios';
import speakeasy from 'speakeasy';

const API_URL = 'http://localhost:5000/api';

// Helper to print steps
const step = (msg) => console.log(`\n[STEP] ${msg}`);
const success = (msg) => console.log(`  ✅ ${msg}`);
const error = (msg) => console.log(`  ❌ ${msg}`);

async function runVerification() {
    try {
        // 1. Register a new user (or login if exists)
        step('Registering/Logging in Test User...');
        let user;
        let accessToken;
        let refreshToken;
        const email = `test2fa_${Date.now()}@example.com`;
        const password = 'password123';

        try {
            const res = await axios.post(`${API_URL}/users`, {
                name: 'Test 2FA User',
                email,
                password,
            });
            user = res.data;
            accessToken = user.accessToken;
            refreshToken = user.refreshToken;
            success(`User registered: ${user.email}`);
        } catch (err) {
            error(`Registration failed: ${err.message}`);
            return;
        }

        // 2. Setup 2FA
        step('Setting up 2FA...');
        let secret;
        try {
            const res = await axios.post(
                `${API_URL}/users/profile/2fa/setup`,
                {},
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            secret = res.data.secret;
            success(`2FA Secret generated: ${secret}`);
        } catch (err) {
            error(`2FA Setup failed: ${err.message}`);
            return;
        }

        // 3. Verify 2FA Setup
        step('Verifying 2FA Setup...');
        const token = speakeasy.totp({
            secret: secret,
            encoding: 'base32',
        });

        try {
            await axios.post(
                `${API_URL}/users/profile/2fa/verify`,
                { token },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            success('2FA Verified and Enabled');
        } catch (err) {
            error(`2FA Verification failed: ${err.message}`);
            return;
        }

        // 4. Login with 2FA enabled
        step('Logging in with 2FA enabled...');
        try {
            const res = await axios.post(`${API_URL}/users/login`, {
                email,
                password,
            });

            if (res.data.message === '2FA required') {
                success('Login correctly required 2FA');
            } else {
                error('Login did NOT require 2FA when it should have');
                return;
            }
        } catch (err) {
            error(`Login failed: ${err.message}`);
            return;
        }

        // 5. Complete 2FA Login
        step('Completing 2FA Login...');
        const loginToken = speakeasy.totp({
            secret: secret,
            encoding: 'base32',
        });

        try {
            const res = await axios.post(`${API_URL}/users/auth/2fa/verify-login`, {
                userId: user._id,
                token: loginToken,
            });
            accessToken = res.data.accessToken;
            refreshToken = res.data.refreshToken;
            success('2FA Login Successful. New Tokens received.');
        } catch (err) {
            error(`2FA Login Verification failed: ${err.message}`);
            // console.log(err.response.data);
            return;
        }

        // 6. Test Refresh Token
        step('Testing Refresh Token...');
        try {
            const res = await axios.post(`${API_URL}/users/auth/refresh-token`, {
                refreshToken,
            });
            if (res.data.accessToken && res.data.refreshToken) {
                success('Token Refresh Successful');
            } else {
                error('Token Refresh failed to return new tokens');
            }
        } catch (err) {
            error(`Token Refresh failed: ${err.message}`);
            import axios from 'axios';
            import speakeasy from 'speakeasy';

            const API_URL = 'http://localhost:5000/api';

            // Helper to print steps
            const step = (msg) => console.log(`\n[STEP] ${msg}`);
            const success = (msg) => console.log(`  ✅ ${msg}`);
            const error = (msg) => console.log(`  ❌ ${msg}`);

            async function runVerification() {
                try {
                    // 1. Register a new user (or login if exists)
                    step('Registering/Logging in Test User...');
                    let user;
                    let accessToken;
                    let refreshToken;
                    const email = `test2fa_${Date.now()}@example.com`;
                    const password = 'password123';

                    try {
                        const res = await axios.post(`${API_URL}/users`, {
                            name: 'Test 2FA User',
                            email,
                            password,
                        });
                        user = res.data;
                        accessToken = user.accessToken;
                        refreshToken = user.refreshToken;
                        success(`User registered: ${user.email}`);
                    } catch (err) {
                        error(`Registration failed: ${err.message}`);
                        return;
                    }

                    // 2. Setup 2FA
                    step('Setting up 2FA...');
                    let secret;
                    try {
                        const res = await axios.post(
                            `${API_URL}/users/profile/2fa/setup`,
                            {},
                            { headers: { Authorization: `Bearer ${accessToken}` } }
                        );
                        secret = res.data.secret;
                        success(`2FA Secret generated: ${secret}`);
                    } catch (err) {
                        error(`2FA Setup failed: ${err.message}`);
                        return;
                    }

                    // 3. Verify 2FA Setup
                    step('Verifying 2FA Setup...');
                    const token = speakeasy.totp({
                        secret: secret,
                        encoding: 'base32',
                    });

                    try {
                        await axios.post(
                            `${API_URL}/users/profile/2fa/verify`,
                            { token },
                            { headers: { Authorization: `Bearer ${accessToken}` } }
                        );
                        success('2FA Verified and Enabled');
                    } catch (err) {
                        error(`2FA Verification failed: ${err.message}`);
                        return;
                    }

                    // 4. Login with 2FA enabled
                    step('Logging in with 2FA enabled...');
                    try {
                        const res = await axios.post(`${API_URL}/users/login`, {
                            email,
                            password,
                        });

                        if (res.data.message === '2FA required') {
                            success('Login correctly required 2FA');
                        } else {
                            error('Login did NOT require 2FA when it should have');
                            return;
                        }
                    } catch (err) {
                        error(`Login failed: ${err.message}`);
                        return;
                    }

                    // 5. Complete 2FA Login
                    step('Completing 2FA Login...');
                    const loginToken = speakeasy.totp({
                        secret: secret,
                        encoding: 'base32',
                    });

                    try {
                        const res = await axios.post(`${API_URL}/users/auth/2fa/verify-login`, {
                            userId: user._id,
                            token: loginToken,
                        });
                        accessToken = res.data.accessToken;
                        refreshToken = res.data.refreshToken;
                        success('2FA Login Successful. New Tokens received.');
                    } catch (err) {
                        error(`2FA Login Verification failed: ${err.message}`);
                        // console.log(err.response.data);
                        return;
                    }

                    // 6. Test Refresh Token
                    step('Testing Refresh Token...');
                    try {
                        const res = await axios.post(`${API_URL}/users/auth/refresh-token`, {
                            refreshToken,
                        });
                        if (res.data.accessToken && res.data.refreshToken) {
                            success('Token Refresh Successful');
                        } else {
                            error('Token Refresh failed to return new tokens');
                        }
                    } catch (err) {
                        error(`Token Refresh failed: ${err.message}`);
                        return;
                    }

                    console.log('\n🎉 ALL CHECKS PASSED!');

                } catch (err) {
                    console.error('Unexpected error:', err.message);
                    if (err.response) {
                        console.error('Response data:', err.response.data);
                    }
                }
            }

            runVerification();
