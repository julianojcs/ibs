// Script de teste para a rota de registro
// Executar com: npx tsx scripts/test-register.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

interface TestResult {
	name: string
	passed: boolean
	message: string
	response?: unknown
}

const results: TestResult[] = []

async function testRegister(
	name: string,
	data: Record<string, unknown>,
	expectedStatus: number
): Promise<void> {
	try {
		console.log(`\n🧪 Testing: ${name}`)

		const response = await fetch(`${BASE_URL}/api/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		const result = await response.json()
		const passed = response.status === expectedStatus

		results.push({
			name,
			passed,
			message: passed
				? `✅ Status ${response.status} as expected`
				: `❌ Expected ${expectedStatus}, got ${response.status}`,
			response: result,
		})

		console.log(`   Status: ${response.status}`)
		console.log(`   Response:`, JSON.stringify(result, null, 2))

		if (!passed) {
			console.log(`   ❌ FAILED: Expected status ${expectedStatus}`)
		} else {
			console.log(`   ✅ PASSED`)
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		results.push({
			name,
			passed: false,
			message: `❌ Request failed: ${errorMessage}`,
		})
		console.log(`   ❌ Request failed: ${errorMessage}`)
	}
}

async function runTests() {
	console.log('=' .repeat(60))
	console.log('🔬 TESTE DA ROTA DE REGISTRO - /api/auth/register')
	console.log('=' .repeat(60))
	console.log(`\n📍 Base URL: ${BASE_URL}`)

	// Test 1: Missing required fields
	await testRegister(
		'Missing required fields',
		{},
		400
	)

	// Test 2: Invalid email format
	await testRegister(
		'Invalid email format',
		{
			name: 'Test User',
			email: 'invalid-email',
			password: 'Test1234',
			confirmPassword: 'Test1234',
			courseNumber: '2026',
			city: 'London',
			country: 'UK',
		},
		400
	)

	// Test 3: Password too short
	await testRegister(
		'Password too short',
		{
			name: 'Test User',
			email: 'test@example.com',
			password: 'Ab1',
			confirmPassword: 'Ab1',
			courseNumber: '2026',
			city: 'London',
			country: 'UK',
		},
		400
	)

	// Test 4: Passwords don't match
	await testRegister(
		'Passwords do not match',
		{
			name: 'Test User',
			email: 'test@example.com',
			password: 'Test1234',
			confirmPassword: 'Test5678',
			courseNumber: '2026',
			city: 'London',
			country: 'UK',
		},
		400
	)

	// Test 5: Valid registration (may fail due to DB connection)
	const testEmail = `test_${Date.now()}@example.com`
	await testRegister(
		'Valid registration data',
		{
			name: 'Test User',
			email: testEmail,
			password: 'Test1234',
			confirmPassword: 'Test1234',
			courseNumber: '2026',
			city: 'London',
			country: 'UK',
		},
		201 // or 503 if DB is not connected
	)

	// Summary
	console.log('\n' + '=' .repeat(60))
	console.log('📊 RESUMO DOS TESTES')
	console.log('=' .repeat(60))

	const passed = results.filter(r => r.passed).length
	const failed = results.filter(r => !r.passed).length

	results.forEach(r => {
		console.log(`\n${r.passed ? '✅' : '❌'} ${r.name}`)
		console.log(`   ${r.message}`)
		if (r.response && !r.passed) {
			console.log(`   Response:`, r.response)
		}
	})

	console.log('\n' + '-' .repeat(60))
	console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`)

	if (failed > 0) {
		console.log('\n💡 Dicas para resolver os erros:')

		const dbErrors = results.filter(r =>
			JSON.stringify(r.response).includes('database') ||
			JSON.stringify(r.response).includes('connect')
		)

		if (dbErrors.length > 0) {
			console.log('   - Verifique se o MongoDB está acessível')
			console.log('   - Confirme que seu IP está na whitelist do MongoDB Atlas')
		}
	}
}

runTests().catch(console.error)
