// Script de teste completo para diagnóstico de autenticação
// Executar com: npx tsx scripts/test-auth.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO - IBS London\n')
console.log('=' .repeat(50))

// 1. Verificar variáveis de ambiente
console.log('\n📋 1. VARIÁVEIS DE AMBIENTE\n')

const envVars = {
	'MONGODB_URI': process.env.MONGODB_URI ? '✅ Definida' : '❌ Faltando',
	'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET ? '✅ Definida' : '❌ Faltando',
	'NEXTAUTH_URL': process.env.NEXTAUTH_URL || '❌ Faltando',
	'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID ? '✅ Definida' : '❌ Faltando',
	'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET ? '✅ Definida' : '❌ Faltando',
}

Object.entries(envVars).forEach(([key, value]) => {
	console.log(`   ${key}: ${value}`)
})

// 2. Validar formato da URI do MongoDB
console.log('\n📋 2. VALIDAÇÃO DA URI MONGODB\n')

const mongoUri = process.env.MONGODB_URI || ''
const uriPattern = /^mongodb(\+srv)?:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/

if (mongoUri) {
	const match = mongoUri.match(uriPattern)
	if (match) {
		console.log('   ✅ Formato da URI válido')
		console.log(`   📍 Protocolo: mongodb${match[1] || ''}`)
		console.log(`   👤 Usuário: ${match[2]}`)
		console.log(`   🔑 Senha: ${'*'.repeat(match[3].length)}`)
		console.log(`   🌐 Host: ${match[4]}`)
		console.log(`   📁 Database: ${match[5]}`)

		// Verificar caracteres especiais na senha
		const password = match[3]
		if (password.includes('@') && !password.includes('%40')) {
			console.log('\n   ⚠️  PROBLEMA: Senha contém @ não codificado!')
			console.log('   💡 Substitua @ por %40 na senha')
		}
	} else {
		console.log('   ❌ Formato da URI inválido')
		console.log('   📝 Formato esperado: mongodb+srv://user:pass@host/db')
	}
} else {
	console.log('   ❌ MONGODB_URI não definida')
}

// 3. Teste de DNS do MongoDB Atlas
console.log('\n📋 3. TESTE DE DNS\n')

import dns from 'dns/promises'

async function testDns() {
	try {
		const host = mongoUri.match(/@([^\/]+)\//)?.[1]
		if (host) {
			console.log(`   🔍 Resolvendo: ${host}`)
			const addresses = await dns.resolveSrv(`_mongodb._tcp.${host}`)
			console.log('   ✅ DNS resolvido com sucesso')
			console.log(`   📍 Servidores encontrados: ${addresses.length}`)
		}
	} catch (error: any) {
		console.log(`   ❌ Erro de DNS: ${error.code}`)
		if (error.code === 'ENOTFOUND') {
			console.log('   💡 Verifique se o hostname está correto')
		}
	}
}

// 4. Teste de conexão MongoDB
console.log('\n📋 4. TESTE DE CONEXÃO MONGODB\n')

import mongoose from 'mongoose'

async function testMongo() {
	try {
		console.log('   🔄 Conectando ao MongoDB...')
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 10000,
		})
		console.log('   ✅ Conexão estabelecida com sucesso!')

		const db = mongoose.connection.db
		if (db) {
			console.log(`   📊 Database: ${db.databaseName}`)
			const collections = await db.listCollections().toArray()
			console.log(`   📁 Collections: ${collections.map(c => c.name).join(', ') || 'nenhuma'}`)
		}

		await mongoose.disconnect()
	} catch (error: any) {
		console.log(`   ❌ Erro: ${error.message}`)

		if (error.message.includes('whitelist')) {
			console.log('\n   💡 SOLUÇÃO:')
			console.log('   1. Acesse: https://cloud.mongodb.com')
			console.log('   2. Vá em: Security > Network Access')
			console.log('   3. Clique em "Add IP Address"')
			console.log('   4. Adicione seu IP atual ou 0.0.0.0/0 (para todos)')
		}

		if (error.message.includes('Authentication failed')) {
			console.log('\n   💡 SOLUÇÃO:')
			console.log('   1. Verifique usuário e senha no MongoDB Atlas')
			console.log('   2. Certifique-se que @ na senha está como %40')
		}
	}
}

// 5. Verificar NextAuth
console.log('\n📋 5. CONFIGURAÇÃO NEXTAUTH\n')

if (process.env.NEXTAUTH_SECRET) {
	const secret = process.env.NEXTAUTH_SECRET
	if (secret.length >= 32) {
		console.log('   ✅ NEXTAUTH_SECRET tem tamanho adequado')
	} else {
		console.log('   ⚠️  NEXTAUTH_SECRET muito curta (mín 32 caracteres)')
	}
}

if (process.env.NEXTAUTH_URL) {
	console.log(`   ✅ NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
}

// Executar testes
async function runTests() {
	await testDns()
	await testMongo()

	console.log('\n' + '='.repeat(50))
	console.log('📋 RESUMO')
	console.log('='.repeat(50))

	const issues: string[] = []

	if (!process.env.MONGODB_URI) issues.push('MONGODB_URI não configurada')
	if (!process.env.NEXTAUTH_SECRET) issues.push('NEXTAUTH_SECRET não configurada')
	if (!process.env.GOOGLE_CLIENT_ID) issues.push('GOOGLE_CLIENT_ID não configurada')

	if (issues.length === 0) {
		console.log('\n✅ Todas as variáveis de ambiente estão configuradas')
		console.log('💡 Se o login ainda não funciona, verifique:')
		console.log('   - IP na whitelist do MongoDB Atlas')
		console.log('   - Credenciais do banco corretas')
	} else {
		console.log('\n❌ Problemas encontrados:')
		issues.forEach(i => console.log(`   - ${i}`))
	}
}

runTests()
